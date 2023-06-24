const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, maxLength: 200 },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    timestamp: { type: Date },
});

CommentSchema.virtual("timestamp_converted").get(() => {
    return DateTime.fromJSDate(this.timestamp).toLocaleString(
        DateTime.DATETIME_MED_WITH_SECONDS
    );
});

module.exports = mongoose.model("Comment", CommentSchema);
