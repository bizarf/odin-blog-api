const supertest = require("supertest");
const app = require("../app");
const request = supertest(app);
const User = require("../models/user");
const Post = require("../models/post");
const { expect } = require("chai");
const {
    connectToDatabase,
    disconnectDatabase,
} = require("../middleware/mongoConfig");

describe("user route tests", () => {
    let jerryJWT;
    let postId;

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
    });

    // disconnects and removes the memory server after test
    after(async () => {
        await disconnectDatabase();
    });

    it("user fails to make a post", async () => {
        await request
            .post("/api/create-post")
            .set("Authorization", "Bearer " + jerryJWT)
            .send({
                title: "",
                textContent: "",
                publish: "no",
            })
            .expect(400)
            .expect((res) => {
                expect(res.body.errors).to.be.an("array");
                expect(res.body.errors.length).to.equal(2);
                expect(res.body.success).to.be.a("boolean");
                expect(res.body.success).to.equal(false);
            });
    });

    it("user makes a post", async () => {
        await request
            .post("/api/create-post")
            .set("Authorization", "Bearer " + jerryJWT)
            .send({
                title: "This is a test",
                textContent: "Test goes here",
                publish: "no",
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.success).to.be.a("boolean");
                expect(res.body.success).to.equal(true);
            });
    });

    it("post is fetched with it's ID", async () => {
        const post = await Post.findOne({
            title: "This is a test",
            textContent: "Test goes here",
        });

        postId = post._id;

        await request
            .get(`/api/post/${postId}`)
            .set("Content-Type", "application/json")
            .expect(200)
            .expect((res) => {
                expect(res.body.success).to.equal(true);
                expect(res.body.post).to.be.an("object");
                expect(res.body.post.title).to.equal("This is a test");
                expect(res.body.post.textContent).to.equal("Test goes here");
            });
    });

    it("user fails to edit the post", async () => {
        await request
            .put(`/api/post/${postId}`)
            .set("Authorization", "Bearer " + jerryJWT)
            .set("Content-Type", "application/json")
            .send({
                title: "",
                textContent: "Edited test goes here",
                publish: "no",
            })
            .expect(400)
            .expect((res) => {
                expect(res.body.success).to.equal(false);
                expect(res.body.errors).to.be.an("array");
            });
    });

    it("user edits the post", async () => {
        await request
            .put(`/api/post/${postId}`)
            .set("Authorization", "Bearer " + jerryJWT)
            .set("Content-Type", "application/json")
            .send({
                title: "This is a test",
                textContent: "Edited test goes here",
                publish: "no",
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.success).to.equal(true);
                expect(res.body.message).to.equal(
                    "Post was successfully updated!"
                );
            });
    });

    it("user toggles the post so that it is published", async () => {
        await request
            .put(`/api/author/post/${postId}/publish`)
            .set("Authorization", "Bearer " + jerryJWT)
            .set("Content-Type", "application/json")
            .expect(200)
            .expect((res) => {
                expect(res.body.success).to.equal(true);
                expect(res.body.message).to.equal("Post successfully updated");
            });

        const post = await Post.findOne({ _id: postId });
        expect(post.published).to.equal("yes");
    });

    it("user toggles the post so that it is not published", async () => {
        await request
            .put(`/api/author/post/${postId}/publish`)
            .set("Authorization", "Bearer " + jerryJWT)
            .set("Content-Type", "application/json")
            .expect(200)
            .expect((res) => {
                expect(res.body.success).to.equal(true);
                expect(res.body.message).to.equal("Post successfully updated");
            });

        const post = await Post.findOne({ _id: postId });
        expect(post.published).to.equal("no");
    });

    it("all published posts are fetched", async () => {
        await request
            .post("/api/create-post")
            .set("Authorization", "Bearer " + jerryJWT)
            .send({
                title: "This is a published test",
                textContent: "Test goes here",
                publish: "yes",
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.success).to.be.a("boolean");
                expect(res.body.success).to.equal(true);
            });

        await request
            .get("/api/posts")
            .expect(200)
            .expect((res) => {
                expect(res.body.success).to.be.a("boolean");
                expect(res.body.success).to.equal(true);
                expect(res.body.allPosts).to.be.an("array");
                expect(res.body.allPosts.length).to.equal(1);
            });
    });

    it("every single of the author's posts are fetched", async () => {
        await request
            .get("/api//author/posts")
            .set("Authorization", "Bearer " + jerryJWT)
            .expect(200)
            .expect((res) => {
                expect(res.body.success).to.be.a("boolean");
                expect(res.body.success).to.equal(true);
                expect(res.body.allPosts).to.be.an("array");
                expect(res.body.allPosts.length).to.equal(2);
            });
    });

    it("user deletes a post", async () => {
        await request
            .delete(`/api/post/${postId}`)
            .set("Authorization", "Bearer " + jerryJWT)
            .expect(200)
            .expect((res) => {
                expect(res.body.success).to.be.a("boolean");
                expect(res.body.success).to.equal(true);
                expect(res.body.message).to.equal("Post successfully deleted");
            });

        const posts = await Post.find();
        expect(posts.length).to.equal(1);
    });
});
