const Comment = require("../models/comment");
const Post = require("../models/post");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.comment_create_post = [
    body("comment", "Your comment cannot be empty").trim().escape().notEmpty(),

    asyncHandler(async (req, res, next) => {
        // safe guard incase someone somehow tries to post a comment if they're not a user
        if (!req.user) {
            res.status(401).json({
                error: "You are not authorized to do that",
            });
        }

        // check the post exists
        const post = await Post.findById(req.body.id).exec();
        if (post === null) {
            res.status(404).json({ error: "Post not found" });
        }

        const errors = validationResult(req);

        const comment = new Comment({
            user: req.user._id,
            text: req.body.comment,
            postId: req.body.id,
            timestamp: new Date(),
        });

        // if there is an error in the validation, then send an array of error messages
        if (!errors.isEmpty()) {
            res.status(401).json({
                errors: errors.array({ onlyFirstError: true }),
            });
        } else {
            // try to save. if it goes through then send success msg
            const save = await comment.save();
            if (save) {
                res.status(200).json({
                    message: "Comment was successfully made!",
                });
            } else {
                res.status(422).json({ error: "Something went wrong" });
            }
        }
    }),
];

// gets all comments from the post ID
exports.comments_get = asyncHandler(async (req, res, next) => {
    // check the post exists
    const post = await Post.findById(req.body.id).exec();
    if (post === null) {
        res.status(404).json({ error: "Post not found" });
    }

    // find comments by the post Id
    const allComments = await Comment.find({ postId: req.params.id })
        .populate("user")
        .exec();
    res.json({ allComments });
});

exports.comment_remove_delete = asyncHandler(async (req, res, next) => {
    // safe guard incase someone somehow tries to post a comment if they're not a user
    if (!req.user.isAuthor) {
        res.status(401).json({ error: "You are not authorized to do that" });
    }

    // check the post exists
    const post = await Post.findById(req.body.id).exec();
    if (post === null) {
        res.status(404).json({ error: "Post not found" });
    }

    // check that comment exists first. if it does, then find and delete it.
    const comment = await Comment.find({
        _id: req.params.commentId,
        postId: req.params.postId,
    });

    if (comment === null) {
        res.status(404).json({ error: "Comment not found" });
    } else {
        const deletePost = await Comment.findOneAndDelete({
            _id: req.params.commentId,
            postId: req.params.id,
        });

        if (deletePost) {
            res.json({ message: "Post successfully deleted" });
        } else {
            res.status(422).json({ error: "Something went wrong" });
        }
    }
});
