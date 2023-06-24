const Post = require("../models/post");
const Comment = require("../models/comment");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// blog post create POST method
exports.post_create_post = [
    body("title", "The title must not be empty").trim().escape().notEmpty(),
    body("textContent").trim().escape(),

    asyncHandler(async (req, res, next) => {}),
];

// blog post edit PUT method
exports.post_edit_put = [
    body("title", "The title must not be empty").trim().escape().notEmpty(),
    body("textContent", "The title must not be empty")
        .trim()
        .escape()
        .notEmpty(),

    asyncHandler(async (req, res, next) => {
        const post = await Post.findById(req.params.id).exec();

        if (post === null) {
            const err = new Error("Post not found");
            err.status = 404;
            return next(err);
        } else {
        }
    }),
];

// blog post remove DELETE method
exports.post_remove_delete = asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.id).exec();

    if (post === null) {
        const err = new Error("Post not found");
        err.status = 404;
        return next(err);
    } else {
        await Comment.deleteMany({ postId: req.params.id });
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: "Post successfully deleted" });
    }
});

// blog post GET method
exports.post_single_get = asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.id).exec();

    if (post === null) {
        return next(err);
    }

    res.json(post);
});

// blog posts GET method
exports.posts_get = asyncHandler(async (req, res, next) => {
    const allPosts = await Post.find().exec();
    res.json({ allPosts });
});
