import * as Mongoose from 'mongoose';
import {Schemas} from "./schemas";
import {UserSchema, default as UserModel} from "./user.schema";

const EmotionTypes = {
    SAD: "sad",
    HAPPY: "happy",
    BORED: "bored",
    NEUTRAL: "neutral",
    EXCITED: "excited",
    DEPRESSED: "depressed"
};

export let MoodSchema: any = new Mongoose.Schema({
    resourceType: {
        type: String,
        default: 'Mood'
    },
    id: String,
    title: {
        type: String,
        required: [true, "Title can't be null"]
    },
    body: {
        type: String,
        required: [true, "Body can't be null"]
    },

    user: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: Schemas.User,
        required: true
    },

    likes: {
        type: [Mongoose.Schema.Types.ObjectId],
        ref: Schemas.User,
        default: []
    },

    emotion: {
        type: String,
        required: true,
        default: EmotionTypes.NEUTRAL,
        trim: true,
        validate: {
            validator: function (v: string): boolean {
                return v == EmotionTypes.SAD || v == EmotionTypes.HAPPY ||
                    v == EmotionTypes.BORED || v == EmotionTypes.EXCITED
                    || v == EmotionTypes.DEPRESSED || v == EmotionTypes.NEUTRAL;
            },
            message: '{VALUE} is not a valid string!'
        },
    },

    timestamp: Date
});

MoodSchema.pre('save', async function (next: any) {
    console.log('pre', this);
    this.id = this._id;
    next();
});

const MoodModel = Mongoose.model(Schemas.Mood, MoodSchema);
export default MoodModel
