import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    email: { type: String, require: true },
    name: { type: String },
    desc: { type: String },
    joinedOn: { type: Date, default: Date.now },
    points: { type: Number, default: 0 },
    lastWatched: { type: Date,default: null },
    contacts: [{
        name: { type: String, required: true },
        phoneNumber: { type: String, required: true }
    }]
})

export default mongoose.model("User", userSchema)