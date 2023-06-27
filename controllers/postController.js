const Post = require("../models/post");
const Comment = require("../models/comment");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const myValidationResult = validationResult.withDefaults({
    formatter: (error) => error.msg,
});

// blog post create POST method
exports.post_create_post = [
    body("title", "The title must not be empty").trim().escape().notEmpty(),
    body("textContent", "The text content must not be empty")
        .trim()
        .escape()
        .notEmpty(),
    body("publish", "Please choose whether the post is published").isBoolean(),

    asyncHandler(async (req, res, next) => {
        const errors = myValidationResult(req);

        // safe guard incase someone somehow tries to submit a post if they're not an author
        if (!req.user.isAuthor) {
            res.status(401).json({
                error: "You are not authorized to do that",
            });
        }

        const post = new Post({
            title: req.body.title,
            textContent: req.body.textContent,
            timestamp: new Date(),
            user: req.user._id,
            published: req.body.publish,
        });

        // if there is an error, then send an errors in an array. if not then save the post. once it's successfully saved, we pass a success message
        if (!errors.isEmpty()) {
            res.status(401).json({
                errors: errors.array({ onlyFirstError: true }),
            });
        } else {
            const save = await post.save();
            if (save) {
                res.status(200).json({
                    message: "Post was successfully made!",
                });
            } else {
                res.status(422).json({ error: "Something went wrong" });
            }
        }
    }),
];

// blog post edit PUT method
exports.post_edit_put = [
    body("title", "The title must not be empty").trim().escape().notEmpty(),
    body("textContent", "The text content must not be empty")
        .trim()
        .escape()
        .notEmpty(),
    body("publish", "Please choose whether the post is published").isBoolean(),

    asyncHandler(async (req, res, next) => {
        if (!req.user.isAuthor) {
            res.status(401).json({
                error: "You are not authorized to do that",
            });
        }

        // get the original post object, so that we can later pass the original timestamp to the updated post object
        const post = await Post.findById(req.params.id).exec();

        // make sure the post exists first
        if (!post) {
            res.status(401).json({ error: "The post does not exist" });
        }

        // the original _id is important or else a new post is created instead
        const updatedPost = new Post({
            title: req.body.title,
            textContent: req.body.textContent,
            timestamp: post.timestamp,
            user: post.user._id,
            published: req.body.publish,
            _id: req.params.id,
        });

        const errors = myValidationResult(req);

        // use findByIdAndUpdate to update the database document
        if (!errors.isEmpty()) {
            res.status(401).json({ errors: errors.array() });
        } else {
            const save = await Post.findByIdAndUpdate(
                req.params.id,
                updatedPost,
                {}
            );
            if (save) {
                res.status(200).json({
                    message: "Post was successfully updated!",
                });
            } else {
                res.status(422).json({ error: "Something went wrong" });
            }
        }
    }),
];

// blog post remove DELETE method
exports.post_remove_delete = asyncHandler(async (req, res, next) => {
    if (!req.user.isAuthor) {
        res.status(401).json({ error: "You are not authorized to do that" });
    }

    // check that the post exists. if it does then we need to delete all comments that are on that post. after that is done, we can finally delete the blog post itself.
    const post = await Post.findById(req.params.id).exec();

    if (post === null) {
        res.status(404).json({ error: "Post not found" });
    } else {
        const comments = Comment.find({ postId: req.params.id });
        if (comments) {
            await Comment.deleteMany({ postId: req.params.id });
        }
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (deletedPost) {
            res.json({ message: "Post successfully deleted" });
        } else {
            res.status(422).json({ error: "Something went wrong" });
        }
    }
});

// blog post GET method
exports.post_single_get = asyncHandler(async (req, res, next) => {
    // if the blog post exists, then send it as a json object
    const post = await Post.findById(req.params.id).exec();

    if (post === null) {
        res.status(404).json({ error: "Post not found" });
    } else {
        res.json(post);
    }
});

// all blog posts GET method for only if the article is published
exports.posts_get = asyncHandler(async (req, res, next) => {
    const allPosts = await Post.find({ published: true }).exec();

    res.json({ allPosts });
});

// all blog posts GET for the author CMS
exports.author_all_posts_get = asyncHandler(async (req, res, next) => {
    // safeguard just incase someone gains access to cms
    if (!req.user.isAuthor) {
        res.status(401).json({ error: "You are not authorized to do that" });
    }

    const allPosts = await Post.find().exec();
    res.json({ allPosts });
});
