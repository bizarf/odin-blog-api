const Comment = require("../models/comment");
const Post = require("../models/post");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.comment_create_post = [
    body("comment")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Your comment cannot be empty")
        .isLength({ max: 250 })
        .withMessage("Only 250 characters are allowed"),

    asyncHandler(async (req, res, next) => {
        // safe guard incase someone somehow tries to post a comment if they're not a user
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: "You are not authorized to do that",
            });
        }

        // check the post exists
        const post = await Post.findById(req.params.id).exec();
        if (post === null) {
            return res
                .status(404)
                .json({ success: false, error: "Post not found" });
        }

        const errors = validationResult(req);

        const comment = new Comment({
            user: req.user._id,
            text: req.body.comment,
            postId: req.params.id,
            timestamp: new Date(),
        });

        // if there is an error in the validation, then send an array of error messages
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array({ onlyFirstError: true }),
            });
        } else {
            // try to save. if it goes through then send success msg
            const save = await comment.save();
            if (save) {
                return res.status(200).json({
                    success: true,
                    message: "Comment was successfully made!",
                });
            } else {
                return res.status(422).json({
                    success: false,
                    error: "Something went wrong",
                });
            }
        }
    }),
];

// gets all comments from the post ID
exports.comments_get = asyncHandler(async (req, res, next) => {
    // check the post exists
    const post = await Post.findById(req.params.id).exec();
    if (post === null) {
        res.status(404).json({ success: false, error: "Post not found" });
    }

    // find comments by the post Id
    const allComments = await Comment.find({ postId: req.params.id })
        .populate("user")
        .exec();
    res.json({ success: true, allComments });
});

exports.comment_remove_delete = asyncHandler(async (req, res, next) => {
    // safe guard incase someone somehow tries to post a comment if they're not a user
    if (!req.user.isAuthor) {
        res.status(401).json({
            success: false,
            error: "You are not authorized to do that",
        });
    }

    // check the post exists
    const post = await Post.findById(req.params.id).exec();
    if (post === null) {
        res.status(404).json({ success: false, error: "Post not found" });
    }

    // check that comment exists first. if it does, then find and delete it.
    const comment = await Comment.find({
        _id: req.params.commentId,
        postId: req.params.postId,
    });

    if (comment === null) {
        res.status(404).json({ success: false, error: "Comment not found" });
    } else {
        const deletePost = await Comment.findOneAndDelete({
            _id: req.params.commentId,
            postId: req.params.id,
        });

        if (deletePost) {
            res.json({ success: true, message: "Post successfully deleted" });
        } else {
            res.status(422).json({
                success: false,
                error: "Something went wrong",
            });
        }
    }
});
