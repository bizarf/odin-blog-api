const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: { type: String, required: true },
    textContent: { type: String, required: true },
    timestamp: { type: Date },
    published: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

PostSchema.virtual("timestamp_converted").get(() => {
    return DateTime.fromJSDate(this.timestamp).toLocaleString(
        DateTime.DATETIME_MED_WITH_SECONDS
    );
});

module.exports = mongoose.model("Post", PostSchema);
