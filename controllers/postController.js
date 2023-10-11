const Post = require("../models/post");
const Comment = require("../models/comment");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// blog post create POST method
exports.post_create_post = [
    body("title", "The title must not be empty").trim().escape().notEmpty(),
    body("textContent", "The text content must not be empty")
        .trim()
        .escape()
        .notEmpty(),
    body("publish", "Please choose whether the post is published")
        .trim()
        .escape()
        .notEmpty(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        // safe guard incase someone somehow tries to submit a post if they're not an author
        if (!req.user.isAuthor) {
            return res.status(401).json({
                success: false,
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
            return res.status(400).json({
                success: false,
                errors: errors.array({ onlyFirstError: true }),
            });
        } else {
            const save = await post.save();
            if (save) {
                return res.status(200).json({
                    success: true,
                    message: "Post was successfully made!",
                });
            } else {
                return res
                    .status(422)
                    .json({ success: false, error: "Something went wrong" });
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
    body("publish", "Please choose whether the post is published")
        .trim()
        .escape()
        .notEmpty(),

    asyncHandler(async (req, res, next) => {
        if (!req.user.isAuthor) {
            res.status(401).json({
                success: false,
                error: "You are not authorized to do that",
            });
        }

        // get the original post object, so that we can later pass the original timestamp to the updated post object
        const post = await Post.findById(req.params.id).exec();

        // make sure the post exists first
        if (!post) {
            res.status(400).json({
                success: false,
                error: "The post does not exist",
            });
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

        const errors = validationResult(req);

        // use findByIdAndUpdate to update the database document
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
        } else {
            const save = await Post.findByIdAndUpdate(
                req.params.id,
                updatedPost,
                {}
            );
            if (save) {
                res.status(200).json({
                    success: true,
                    message: "Post was successfully updated!",
                });
            } else {
                res.status(422).json({
                    success: false,
                    error: "Something went wrong",
                });
            }
        }
    }),
];

// blog post remove DELETE method
exports.post_remove_delete = asyncHandler(async (req, res, next) => {
    if (!req.user.isAuthor) {
        res.status(401).json({
            success: false,
            error: "You are not authorized to do that",
        });
    }

    // check that the post exists. if it does then we need to delete all comments that are on that post. after that is done, we can finally delete the blog post itself.
    const post = await Post.findById(req.params.id).exec();

    if (post === null) {
        res.status(404).json({ success: false, error: "Post not found" });
    } else {
        const comments = Comment.find({ postId: req.params.id });
        if (comments) {
            await Comment.deleteMany({ postId: req.params.id });
        }
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (deletedPost) {
            res.json({ success: true, message: "Post successfully deleted" });
        } else {
            res.status(422).json({
                success: false,
                error: "Something went wrong",
            });
        }
    }
});

// blog post GET method
exports.post_single_get = asyncHandler(async (req, res, next) => {
    // if the blog post exists, then send it as a json object
    const post = await Post.findById(req.params.id)
        .populate({ path: "user", select: "-password" })
        .exec();

    if (post === null) {
        res.status(404).json({ success: false, error: "Post not found" });
    } else {
        res.json({ success: true, post });
    }
});

// all blog posts GET method for only if the article is published
exports.posts_get = asyncHandler(async (req, res, next) => {
    // if no page is specified, then set the page to 1
    let page = req.query.page || 1;
    const postsPerPage = 10;

    // if the page search query is entered as a 0 or a number below that, then set it to 1.
    if (page <= 0) {
        page = 1;
    }

    // count number of published posts for pagination buttons
    const totalPublishedPostsCount = await Post.countDocuments({
        published: "yes",
    }).exec();
    // pagination feature: skip tells mongoose how many documents to skip, and limit will limit the number of documents that are returned
    const allPosts = await Post.find({ published: "yes" })
        .sort({ timestamp: -1 })
        .skip((page - 1) * postsPerPage)
        .limit(postsPerPage)
        .exec();

    res.json({ success: true, totalPublishedPostsCount, allPosts });
});

// all blog posts GET for the author CMS
exports.author_all_posts_get = asyncHandler(async (req, res, next) => {
    // if no page is specified, then set the page to 1
    let page = req.query.page || 1;
    const postsPerPage = 10;

    // if the page search query is entered as a 0 or a number below that, then set it to 1.
    if (page <= 0) {
        page = 1;
    }

    // safeguard just incase someone gains access to cms
    if (!req.user.isAuthor) {
        res.status(401).json({
            success: false,
            error: "You are not authorized to do that",
        });
    }

    // count total posts for pagination buttons?
    const totalPostsCount = await Post.countDocuments().exec();
    // pagination feature: skip tells mongoose how many documents to skip, and limit will limit the number of documents that are returned
    const allPosts = await Post.find()
        .sort({ timestamp: -1 })
        .skip((page - 1) * postsPerPage)
        .limit(postsPerPage)
        .exec();
    res.json({ success: true, totalPostsCount, allPosts });
});

exports.post_publish_put = asyncHandler(async (req, res, next) => {
    // safe guard incase someone somehow tries to submit a post if they're not an author
    if (!req.user.isAuthor) {
        res.status(401).json({
            success: false,
            error: "You are not authorized to do that",
        });
    }

    // get the original post object, so that we can later pass the original timestamp to the updated post object
    const post = await Post.findById(req.params.id).exec();

    // make sure the post exists first
    if (!post) {
        res.status(400).json({
            success: false,
            error: "The post does not exist",
        });
    }

    if (post.published === "yes") {
        // if the blog post is published, then toggle to no
        const updatePublish = await Post.findByIdAndUpdate(req.params.id, {
            published: "no",
        });
        if (updatePublish) {
            res.json({ success: true, message: "Post successfully updated" });
        } else {
            res.status(422).json({
                success: false,
                error: "Something went wrong",
            });
        }
    } else {
        // if blog post is not published, then toggle to yes
        const updatePublish = await Post.findByIdAndUpdate(req.params.id, {
            published: "yes",
        });
        if (updatePublish) {
            res.json({ success: true, message: "Post successfully updated" });
        } else {
            res.status(422).json({
                success: false,
                error: "Something went wrong",
            });
        }
    }
});
