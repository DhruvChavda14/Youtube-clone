// history.js

import mongoose from "mongoose";

const HistorySchema = mongoose.Schema({
    videoId: { type: String, require: true },
    Viewer: { type: String, require: true },
    LikedOn: { type: Date, default: Date.now },
    watchedAt: { type: Date, default: Date.now },
});

export default mongoose.models.History || mongoose.model('History', HistorySchema);