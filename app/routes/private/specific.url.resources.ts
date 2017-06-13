import Router = require("koa-router");
import {HTTP_STATUS} from "../../utils/http.utils";
import {Schemas} from "../../resources/schemas";
import UserModel from "../../resources/user.schema";
import MoodModel from "../../resources/mood.schema";
import CommentModel from "../../resources/comment.schema";
import {isNullOrUndefined} from "util";
import {predict} from "../../api/sentiment-prediction";
import {DB} from "../../resources/ensure.schemas";
import {speechToText} from "../../api/speech-to-text";
import {authJwt} from "../../utils/authenticate";

const fsextra = require("fs-extra");

export class SpecificResourceRouter extends Router {
    constructor(args?: any) {
        super(args);

        this.get(`/${Schemas.Mood}`, async(ctx: any, next: ()=>void) => {
            let userId = ctx.query.user;
            let query = {};
            // let include = ctx.query.include;
            if (userId)
                query = {user: userId};
            let moodIds = [];
            let moods = await MoodModel.find(query)
                .populate('user', 'username id', UserModel)
                .sort({timestamp: -1})
                .exec((err, res) => {
                    moodIds = res.map(mood => mood._id);
                });
            let commentIds = await CommentModel.find({
                mood: {$in: moodIds}
            });
            ctx.body = moods.map((mood: any) => {
                mood._doc.comments = commentIds
                    .filter((comment: any) => mood.id == comment.mood)
                    .map(comment => comment.id);
                return mood;
            });
            ctx.status = HTTP_STATUS.OK;

        });

        this.get(`/${Schemas.Comment}`, async(ctx: any, next: ()=>void) => {
            let moodId = ctx.query.mood;
            let query = {};
            if (!isNullOrUndefined(moodId))
                query = {mood: moodId};
            ctx.body = await CommentModel.find(query)
                .populate('user', 'username id', UserModel)
                .sort({timestamp: -1});
            ctx.status = HTTP_STATUS.OK;
            // await next()
        });

        this.put(`/${Schemas.User}/:id`, async(ctx: any, next: ()=>void) => {
            if (ctx.params.id == ctx.state.user._id) {
                await next();
            } else {
                ctx.status = HTTP_STATUS.FORBIDDEN;
                ctx.body = {message: 'You are not authorized to do this!'};
            }
        });

        this.post(`/${Schemas.Mood}`, async(ctx: any, next: ()=>void) => {
            try {
                let Model = DB.model(Schemas.Mood);
                let request = ctx.request;
                let mood = await new Model(request.fields).save();
                let response = await new Promise((resolve, reject) => {
                    predict([request.fields.title, request.fields.body], (error, result) => {
                        if (result) {
                            console.log('YEY', result);
                            resolve({body: result, status: HTTP_STATUS.OK});
                        }
                        if (error) {
                            console.log('NOT YEY', error);
                            reject({body: result, status: HTTP_STATUS.BAD_REQUEST});
                        }
                    });
                }).then((response) => {
                    return response
                }).catch((err) => err);
                // console.log('response!', response);
                ctx.body = {sentiment: response.body, mood};
                ctx.status = response.status;//HTTP_STATUS.OK;
            }
            catch (error) {
                ctx.status = HTTP_STATUS.BAD_REQUEST;
                ctx.body = {message: error}
            }
        });

        this.delete(`/${Schemas.Mood}/:id`, async(ctx: any, next: ()=>void) => {
            let mood: any = await MoodModel.findOne({id: ctx.params.id});
            if (mood.user == ctx.state.user._id) {
                await CommentModel.remove({mood: mood._id});
                await next();
            } else {
                ctx.status = HTTP_STATUS.FORBIDDEN;
                ctx.body = {message: 'You are not authorized to do this!'};
            }
        });

        this.post('/analyze', async(ctx: any) => {
            let request = ctx.request;
            let response = await new Promise((resolve, reject) => {
                predict([request.fields.title, request.fields.body], (error, result) => {
                    if (result) {
                        console.log('YEY', result);
                        resolve({body: result, status: HTTP_STATUS.OK});
                    }
                    if (error) {
                        console.log('NOT YEY', error);
                        reject({body: result, status: HTTP_STATUS.BAD_REQUEST});
                    }
                });
            }).then((response) => {
                return response
            }).catch((err) => err);
            // console.log('response!', response);
            ctx.body = response.body;
            ctx.status = response.status;//HTTP_STATUS.OK;
        });

        this.post('/Speech', async(ctx: any)=> {
            let files = ctx.request.files;
            if (!files) {
                ctx.status = HTTP_STATUS.BAD_REQUEST;
                ctx.body = {message: 'Sorry, you should send a file!'};
                return;
            }
            files.forEach(async(file) => {
                console.log('file', file);
                console.log('file path!', file.path);
                // let filepath = "./resources/"+file.name;
                let filepath = "./resources/title.flac";
                // fsextra.copySync(file.path, filepath);
                fsextra.removeSync(file.path);
                speechToText(filepath);
            });
            ctx.status = 200;
            ctx.body = {};
        });
    }
}
