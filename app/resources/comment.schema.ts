import * as Mongoose from 'mongoose';
import {Schemas} from "./schemas";
import {UserSchema} from "./user.schema";
import {MoodSchema} from "./mood.schema";

export let CommentSchema: any = new Mongoose.Schema({
    resourceType: {
        type: String,
        default: 'Comment'
    },
    id: String,
    text: String,

    user: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: Schemas.User,
        required: true
    },
    mood: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: Schemas.Mood,
        required: true
    },

    timestamp: {
        type: Date,
        default: new Date()
    }
});

CommentSchema.pre('save', function(next:any) {
    this.id = this._id;
    next();
});

const CommentModel = Mongoose.model(Schemas.Comment, CommentSchema);
export default CommentModel
