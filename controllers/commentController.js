const Comment = require("../models/comment");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.comment_create_post = [
    body(""),

    asyncHandler(async (req, res, next) => {}),
];

exports.comments_get = asyncHandler(async (req, res, next) => {});

exports.comment_remove_delete = asyncHandler(async (req, res, next) => {});
