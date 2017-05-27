import Router = require("koa-router");
import {HTTP_STATUS} from "../../utils/http.utils";
import {Schemas} from "../../resources/schemas";
import UserModel from "../../resources/user.schema";
import MoodModel from "../../resources/mood.schema";
import CommentModel from "../../resources/comment.schema";
import {isNullOrUndefined} from "util";

export class SpecificResourceRouter extends Router {
    constructor(args?: any) {
        super(args);

        this.get(`/${Schemas.Mood}`, async(ctx: any, next: ()=>void) => {
            let userId = ctx.query.user;
            let query = {}
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

        this.post(`/VoiceRequest`, async(ctx: any) => {
            let request = ctx.request;
            console.log('request',request)
            console.log('fields', request.fields);
            ctx.body = {};
            ctx.status = HTTP_STATUS.OK;
        })

    }
}
