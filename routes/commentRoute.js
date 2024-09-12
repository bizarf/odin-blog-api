const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const passport = require("passport");

// user comment stuff
//
// comment POST method
router.post(
    "/:id/comment",
    passport.authenticate("jwt", { session: false }),
    commentController.comment_create_post
);

// comment delete method
router.delete(
    "/:id/:commentId",
    passport.authenticate("jwt", { session: false }),
    commentController.comment_remove_delete
);

// comments GET method
router.get("/:id/comments", commentController.comments_get);

module.exports = router;
