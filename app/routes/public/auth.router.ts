import Router = require("koa-router");
import {ROUTES} from "../routes";
import {authJwt} from "../../utils/authenticate";
import {HTTP_STATUS} from "../../utils/http.utils";
import {DB} from "../../resources/ensure.schemas";
import {Schemas} from "../../resources/schemas";
import {ResourceRouter} from "../private/resource.router";

export class AuthRouter extends Router {
    constructor(args: any) {
        super(args);
        /*
         Login on server.
         full Url: localhost:3000/auth/login
         required: username, password.
         */
        this.post(ROUTES.LOGIN_URL, async(ctx: any) => {
            let reqBody = ctx.request.fields;

            if (!reqBody.username || !reqBody.password) {
                throw {status: HTTP_STATUS.BAD_REQUEST, message: "You must send the username and the password"};
            }

            let user: any = await DB.model(Schemas.User).findOne({username: reqBody.username});
            let password = reqBody.password;

            if (user && user.password === password) {
                ctx.status = HTTP_STATUS.OK;
                delete user.password;
                ctx.body = {token: authJwt.createToken(user, ctx), id: user._id, user: user}
            } else {
                ctx.status = HTTP_STATUS.UNAUTHORIZED;
                ctx.body = {status: HTTP_STATUS.UNAUTHORIZED, message: "The username or password don't match"};
            }
        });

        /*
         Logout on server.
         full Url: localhost:3000/auth/logout
         */
        // Useless function
        this.post(ROUTES.LOGOUT_URL, async(ctx: Router.IRouterContext) => {
            ctx.status = HTTP_STATUS.OK;
            ctx.body = {message: "Logout: success"};
        });

        this.post(ROUTES.SIGNUP_URL, async(ctx:any) => {
            let reqBody = ctx.request.fields;

            if (!reqBody.username || !reqBody.password) {
                throw {status: HTTP_STATUS.BAD_REQUEST, message: "You must send the username and the password"};
            }

            let user: any = await DB.model(Schemas.User).findOne({username: reqBody.username});
            if (user) {
                ctx.status = HTTP_STATUS.NOT_ACCEPTABLE;
                ctx.body = {message: "There is already an user with that username!"};
            } else {
                let User = DB.model(Schemas.User);
                user = await new User(reqBody).save();
                ctx.status = HTTP_STATUS.CREATED;
                delete user.password;
                ctx.body = {token: authJwt.createToken(user, ctx), id: user._id, user: user};
                console.log(ctx.body )
            }
        });
    }
}
