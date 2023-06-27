const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const passport = require("passport");

// blog post stuff
//
// single post GET
router.get("/post/:id", postController.post_single_get);

// new blog post POST
router.post(
    "/create-post",
    passport.authenticate("jwt", { session: false }),
    postController.post_create_post
);

// blog post edit PUT
router.put(
    "/post/:id",
    passport.authenticate("jwt", { session: false }),
    postController.post_edit_put
);

// blog post delete DELETE method
router.delete(
    "/post/:id",
    passport.authenticate("jwt", { session: false }),
    postController.post_remove_delete
);

// gather all posts GET
router.get("/posts", postController.posts_get);

// gather all posts for author GET
router.get(
    "/author/posts",
    passport.authenticate("jwt", { session: false }),
    postController.author_all_posts_get
);

module.exports = router;
