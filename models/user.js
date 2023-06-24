const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true, minLength: 8 },
    isAuthor: { type: Boolean, default: false },
});

UserSchema.virtual("fullname").get(() => {
    return this.firstName + " " + this.lastName;
});

module.exports = mongoose.model("User", UserSchema);
