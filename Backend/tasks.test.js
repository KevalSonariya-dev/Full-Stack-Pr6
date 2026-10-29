const request = require("supertest");

// Mock Task model so test runs quickly and independently of a live MongoDB instance in CI
jest.mock("./models/Task", () => ({
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockResolvedValue([
      { _id: "task-1", title: "CI Sample Task", completed: false }
    ])
  })
}));

// Mock authMiddleware so GET /tasks behaves as an authenticated request in test suite
jest.mock("./middleware/authMiddleware", () => (req, res, next) => {
  req.user = { id: "ci-test-user", email: "ci@example.com" };
  next();
});

const app = require("./server");

describe("Task Management API - CI/CD Automated Tests", () => {
  // Test 1: Required by Practical 12 lab manual (Deliberately broken to demonstrate CI pipeline failure)
  test("GET /tasks returns 200", async () => {
    const res = await request(app).get("/tasks");
    expect(res.statusCode).toBe(500); // Deliberate failure: expecting 500 but API returns 200
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test 2: Post-Laboratory Work requirement (second endpoint)
  test("GET /health returns 200", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("OK");
  });
});
