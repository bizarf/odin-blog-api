const supertest = require("supertest");
const app = require("../app");
const User = require("../models/user");
const request = supertest(app);
const { expect } = require("chai");
const { describe, after, it } = require("mocha");
const { closeDatabase } = require("../utils/config");

describe("user route tests", () => {
    let jerryId;

    it("user fails to sign up", async () => {
        await request
            .post("/api/sign-up")
            .set("Content-Type", "application/json")
            .send({
                firstname: "",
                lastname: "",
                username: "",
                password: "",
                confirmPassword: "",
            })
            .expect(400)
            .expect((res) => {
                expect(res.body.errors).to.be.an("array");
                expect(res.body.errors.length).to.equal(5);
                expect(res.body.success).to.be.a("boolean");
                expect(res.body.success).to.equal(false);
            });
    });

    it("user signs up for an account", async () => {
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
            .expect(201)
            .expect((res) => {
                expect(res.body.success).to.be.a("boolean");
                expect(res.body.success).to.equal(true);
            });

        const user = await User.findOne({ username: "jerrylane@test.com" });
        expect(user.firstname).to.equal("Jerry");
        jerryId = user._id;
    });

    it("user logs into the account", async () => {
        await request
            .post("/api/login")
            .set("Content-Type", "application/json")
            .send({
                username: "jerrylane@test.com",
                password: "gdkfljgdlfgjld",
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.success).to.be.a("boolean");
                expect(res.body.success).to.equal(true);
                expect(res.body.token).to.be.a("string");
            });
    });

    it("user fails to sign up because of existing username", async () => {
        await request
            .post("/api/sign-up")
            .set("Content-Type", "application/json")
            .send({
                firstname: "Tom",
                lastname: "Hanks",
                username: "jerrylane@test.com",
                password: "gdkfljgdlfgjld",
                confirmPassword: "gdkfljgdlfgjld",
            })
            .expect(400)
            .expect((res) => {
                expect(res.body.success).to.be.a("boolean");
                expect(res.body.success).to.equal(false);
                expect(res.body.errors).to.be.an("array");
                expect(res.body.errors.length).to.equal(1);
                expect(res.body.errors[0].msg).to.equal("User already exists");
            });
    });

    it("user fails to sign up because the passwords don't match", async () => {
        await request
            .post("/api/sign-up")
            .set("Content-Type", "application/json")
            .send({
                firstname: "Tom",
                lastname: "Hanks",
                username: "tomhanks@test.com",
                password: "gdkfljgdlfgjld",
                confirmPassword: "gdkfljgdlfjl",
            })
            .expect(400)
            .expect((res) => {
                expect(res.body.success).to.be.a("boolean");
                expect(res.body.success).to.equal(false);
                expect(res.body.errors).to.be.an("array");
                expect(res.body.errors.length).to.equal(1);
                expect(res.body.errors[0].msg).to.equal(
                    "The passwords don't match"
                );
            });
    });

    it("user details are fetched from the database", async () => {
        await request
            .get(`/api/user/${jerryId}`)
            .set("Content-Type", "application/json")
            .expect(200)
            .expect((res) => {
                expect(res.body.success).to.be.a("boolean");
                expect(res.body.success).to.equal(true);
                expect(res.body.user).to.be.an("object");
                expect(res.body.user.firstname).to.equal("Jerry");
            });
    });
});

// disconnects and removes the memory server after test
after(async () => {
    await closeDatabase();
});
