const supertest = require("supertest");
const app = require("../app");
const request = supertest(app);
const {
    connectToDatabase,
    disconnectDatabase,
} = require("../middleware/mongoConfig");

describe("index route tests", () => {
    before(async () => {
        await disconnectDatabase();
        process.env.NODE_ENV = "test";
        await connectToDatabase();
    });

    // disconnects and removes the memory server after test
    after(async () => {
        await disconnectDatabase();
    });

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
