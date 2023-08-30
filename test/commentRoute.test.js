const supertest = require("supertest");
const app = require("../app");
const request = supertest(app);
const User = require("../models/user");
const Comment = require("../models/comment");
const Post = require("../models/post");
const { expect } = require("chai");
const {
    connectToDatabase,
    disconnectDatabase,
} = require("../middleware/mongoConfig");

describe("user route tests", () => {
    let jerryJWT;
    let postId;
    let commentId;

    before(async () => {
        await disconnectDatabase();
        process.env.NODE_ENV = "test";
        await connectToDatabase();

        await request
            .post("/api/sign-up")
            .set("Content-Type", "application/json")
            .send({
                firstname: "Jerry",
                lastname: "Lane",
                username: "jerrylane@test.com",
                password: "gdkfljgdlfgjld",
                confirmPassword: "gdkfljgdlfgjld",
            })
            .expect(201);

        const jerryIsAuthor = await User.findOneAndUpdate(
            { username: "jerrylane@test.com" },
            { isAuthor: true }
        );

        await jerryIsAuthor.save();

        await request
            .post("/api/login")
            .set("Content-Type", "application/json")
            .send({
                username: "jerrylane@test.com",
                password: "gdkfljgdlfgjld",
            })
            .expect(200)
            .expect((res) => {
                jerryJWT = res.body.token;
            });

        await request
            .post("/api/create-post")
            .set("Authorization", "Bearer " + jerryJWT)
            .send({
                title: "This is a test",
                textContent: "Test goes here",
                publish: "yes",
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.success).to.be.a("boolean");
                expect(res.body.success).to.equal(true);
            });

        const post = await Post.findOne({
            title: "This is a test",
            textContent: "Test goes here",
        });

        postId = post._id;
    });

    // disconnects and removes the memory server after test
    after(async () => {
        await disconnectDatabase();
    });

    it("user fails to make a comment", async () => {
        await request
            .post(`/api/post/${postId}/comment`)
            .set("Authorization", "Bearer " + jerryJWT)
            .send({
                comment: "",
            })
            .expect(400)
            .expect((res) => {
                expect(res.body.success).to.be.a("boolean");
                expect(res.body.success).to.equal(false);
                expect(res.body.errors).to.be.an("array");
            });
    });

    it("user makes a comment on a post", async () => {
        await request
            .post(`/api/post/${postId}/comment`)
            .set("Authorization", "Bearer " + jerryJWT)
            .send({
                comment: "This is a test comment",
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.success).to.be.a("boolean");
                expect(res.body.success).to.equal(true);
            });

        const comment = await Comment.findOne({
            text: "This is a test comment",
        });
        expect(comment).to.be.an("object");
        commentId = comment._id;
    });

    it("comments are fetched on a post", async () => {
        await request
            .get(`/api/post/${postId}/comments`)
            .expect(200)
            .expect((res) => {
                expect(res.body.success).to.be.a("boolean");
                expect(res.body.success).to.equal(true);
                expect(res.body.allComments).to.be.an("array");
                expect(res.body.allComments.length).to.equal(1);
            });
    });

    it("a comment is deleted from a post", async () => {
        await request
            .delete(`/api/post/${postId}/${commentId}`)
            .set("Authorization", "Bearer " + jerryJWT)
            .expect(200)
            .expect((res) => {
                expect(res.body.success).to.be.a("boolean");
                expect(res.body.success).to.equal(true);
            });

        const comments = await Comment.find();
        expect(comments.length).to.equal(0);
    });
});
