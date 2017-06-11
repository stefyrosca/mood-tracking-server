import * as Mongoose from 'mongoose';
import {Schemas} from "./schemas";

export var UserSchema: any = new Mongoose.Schema({
    resourceType: {
        type: String,
        default: 'User'
    },
    id: String,

    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },

    name: String,
    // lastname: String,
    email: String,
    phone: String,
    preferences: {
        theme: {
            type: String,
            default: "red-theme",
            required: true
        },
        allowThemeChange: {
            type: Boolean,
            default: true,
            required: true
        }
    }
});

UserSchema.pre('save', function(next:any) {
    this.id = this._id;
    next();
});

const UserModel = Mongoose.model(Schemas.User, UserSchema);
export default UserModel
