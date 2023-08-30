const supertest = require("supertest");
const app = require("../app");
const request = supertest(app);
const { expect } = require("chai");
const {
    connectToDatabase,
    disconnectDatabase,
} = require("../middleware/mongoConfig");

describe("user route tests", () => {
    before(async () => {
        await disconnectDatabase();
        process.env.NODE_ENV = "test";
        await connectToDatabase();
    });

    // disconnects and removes the memory server after test
    after(async () => {
        await disconnectDatabase();
    });

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
});
