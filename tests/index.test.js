const supertest = require("supertest");
const app = require("../app");
const request = supertest(app);
const { describe, after, it } = require("mocha");
const { closeDatabase } = require("../utils/config");

describe("index route tests", () => {
    it("/ redirects to /api", async () => {
        await request
            .get("/")
            .expect("Content-Type", "text/plain; charset=utf-8")
            .expect("Location", "/api")
            .expect(302);
    });

    it("returns welcome message", async () => {
        await request
            .get("/api")
            .expect("Content-Type", /json/)
            .expect({ message: "Welcome to the blog API" })
            .expect(200);
    });
});

// disconnects and removes the memory server after test
after(async () => {
    await closeDatabase();
});
