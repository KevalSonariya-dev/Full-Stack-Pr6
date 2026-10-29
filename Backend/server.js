const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const Task = require("./models/Task");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/authMiddleware");
const { validateTask, validateAuth } = require("./middleware/validationMiddleware");
const cache = require("./cache");
const taskEvents = require("./events");
require("./listeners");

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

// Health check endpoint for CI/CD and uptime monitoring
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", service: "task-manager-api" });
});



// ==========================================
// REAL-TIME SSE STREAM (Multi-Tab Synchronization)
// ==========================================

let sseClients = [];

app.get("/tasks/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Handshake ping
    res.write(`data: ${JSON.stringify({ type: "CONNECTED" })}\n\n`);

    sseClients.push(res);
    console.log(`[SSE] Tab connected. Active connections: ${sseClients.length}`);

    req.on("close", () => {
        sseClients = sseClients.filter((client) => client !== res);
        console.log(`[SSE] Tab disconnected. Active connections: ${sseClients.length}`);
    });
});

const broadcastSSE = (type, data) => {
    if (sseClients.length === 0) return;
    const payload = `data: ${JSON.stringify({ type, data })}\n\n`;
    sseClients.forEach((client) => {
        try {
            client.write(payload);
        } catch (err) {
            console.error("[SSE Broadcast Error]", err.message);
        }
    });
};

// Connect EventEmitter to SSE real-time broadcast
taskEvents.on("task-created", (payload) => {
    const task = payload.task || payload;
    broadcastSSE("TASK_CREATED", task);
});

taskEvents.on("task-updated", (task) => {
    broadcastSSE("TASK_UPDATED", task);
});

taskEvents.on("task-deleted", (task) => {
    broadcastSSE("TASK_DELETED", task);
});


// ==========================================
// GET ALL TASKS (Cached with node-cache)
// ==========================================

app.get("/tasks", authMiddleware, async (req, res, next) => {

    try {

        const cacheKey = "all_tasks";
        const cachedTasks = cache.get(cacheKey);

        if (cachedTasks) {
            console.log(`[CACHE HIT] Serving ${cacheKey} from in-memory cache`);
            return res.status(200).json(cachedTasks);
        }

        console.log(`[CACHE MISS] Fetching ${cacheKey} from MongoDB...`);
        const tasks = await Task.find()
            .sort({ createdAt: -1 });

        // Cache the result with default TTL (60s)
        cache.set(cacheKey, tasks);

        res.status(200).json(tasks);

    } catch (err) {

        next(err);

    }

});


// ==========================================
// GET SINGLE TASK (Cached by task ID)
// ==========================================

app.get("/tasks/:id", authMiddleware, async (req, res, next) => {

    try {

        const cacheKey = `task_${req.params.id}`;
        const cachedTask = cache.get(cacheKey);

        if (cachedTask) {
            console.log(`[CACHE HIT] Serving ${cacheKey} from in-memory cache`);
            return res.status(200).json(cachedTask);
        }

        console.log(`[CACHE MISS] Fetching ${cacheKey} from MongoDB...`);
        const task = await Task.findById(req.params.id);

        if (!task) {

            return res.status(404).json({
                error: "Task Not Found",
                message: "No task exists with the provided ID"
            });

        }

        cache.set(cacheKey, task);
        res.status(200).json(task);

    } catch (err) {

        next(err);

    }

});


// ==========================================
// CREATE TASK (Invalidates all_tasks cache)
// ==========================================

app.post("/tasks", authMiddleware, validateTask, async (req, res, next) => {

    try {

        const task = await Task.create({

            title: req.body.title,

            description: req.body.description,

            completed: req.body.completed,

            priority: req.body.priority

        });

        // Invalidate cache on write
        cache.del("all_tasks");
        console.log("[CACHE INVALIDATED] Key 'all_tasks' purged due to POST /tasks");

        console.log(`[API] Response sent at ${new Date().toISOString()}`);
        res.status(201).json(task);

        // Emit background event (non-blocking notification processing)
        taskEvents.emit("task-created", {
            task,
            user: req.user?.email || "Authorized User"
        });

    } catch (err) {

        next(err);

    }

});


// ==========================================
// UPDATE TASK (Invalidates all_tasks and task_:id cache)
// ==========================================

app.put("/tasks/:id", authMiddleware, async (req, res, next) => {

    try {

        const task = await Task.findByIdAndUpdate(

            req.params.id,

            {
                title: req.body.title,
                description: req.body.description,
                completed: req.body.completed,
                priority: req.body.priority
            },

            {
                new: true,
                runValidators: true
            }

        );

        if (!task) {

            return res.status(404).json({
                error: "Task Not Found",
                message: "No task exists with the provided ID"
            });

        }

        // Trim title during update
        if (typeof task.title === "string") {

            task.title = task.title.trim();

            await task.save();

        }

        // Invalidate cache on update
        cache.del("all_tasks");
        cache.del(`task_${req.params.id}`);
        console.log(`[CACHE INVALIDATED] Keys 'all_tasks' and 'task_${req.params.id}' purged due to PUT /tasks/${req.params.id}`);

        res.status(200).json(task);

        // Emit background event (non-blocking notification & real-time sync)
        taskEvents.emit("task-updated", task);

    } catch (err) {

        next(err);

    }

});


// ==========================================
// DELETE TASK (Invalidates all_tasks and task_:id cache)
// ==========================================

app.delete("/tasks/:id", authMiddleware, async (req, res, next) => {

    try {

        const task = await Task.findByIdAndDelete(
            req.params.id
        );

        if (!task) {

            return res.status(404).json({
                error: "Task Not Found",
                message: "No task exists with the provided ID"
            });

        }

        // Invalidate cache on delete
        cache.del("all_tasks");
        cache.del(`task_${req.params.id}`);
        console.log(`[CACHE INVALIDATED] Keys 'all_tasks' and 'task_${req.params.id}' purged due to DELETE /tasks/${req.params.id}`);

        console.log(`[API] Delete response sent at ${new Date().toISOString()}`);
        res.status(200).json({

            message: "Task Deleted Successfully",

            deletedTask: task

        });

        // Emit background event (non-blocking audit logging)
        taskEvents.emit("task-deleted", task);

    } catch (err) {

        next(err);

    }

});


// ==========================================
// CACHE STATS (Debug / Monitoring Endpoint)
// ==========================================

app.get("/cache/stats", authMiddleware, (req, res) => {
    res.status(200).json({
        keys: cache.keys(),
        stats: cache.getStats()
    });
});


// ==========================================
// REGISTER USER
// ==========================================

app.post("/register", validateAuth, async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                error: "Validation Error",
                message: "Email and password are required"
            });
        }

        // Check whether user already exists
        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({
                error: "Duplicate Email",
                message: "A user with this email is already registered"
            });
        }

        // Hash password using bcryptjs with salt factor 10
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        const user = await User.create({
            email: normalizedEmail,
            password: hashedPassword
        });

        // Return success response without exposing password
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                email: user.email
            }
        });

    } catch (err) {
        next(err);
    }
});


// ==========================================
// LOGIN USER
// ==========================================

app.post("/login", validateAuth, async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                error: "Validation Error",
                message: "Email and password are required"
            });
        }

        // Find user by email
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({
                error: "Authentication Error",
                message: "Invalid email or password"
            });
        }

        // Verify password with bcrypt.compare()
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                error: "Authentication Error",
                message: "Invalid email or password"
            });
        }

        // Generate JWT with user's ID in payload, expiring in 1 hour
        const token = jwt.sign(
            { id: user._id, userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email
            }
        });

    } catch (err) {
        next(err);
    }
});


// ==========================================
// GET LOGGED-IN USER PROFILE (/me)
// ==========================================

app.get("/me", authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id || req.user.userId;
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                error: "Not Found",
                message: "User not found"
            });
        }

        res.status(200).json({
            id: user._id,
            email: user.email
        });

    } catch (err) {
        next(err);
    }
});


// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {

    console.error(err.message);

    // Malformed JSON syntax error from express.json()
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            error: "Validation Error",
            message: "Malformed JSON payload provided in request"
        });
    }

    // Duplicate key error (e.g. unique email)
    if (err.code === 11000) {
        return res.status(400).json({
            error: "Duplicate Field",
            message: "A record with this unique value already exists"
        });
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {

        const errors = Object.values(err.errors)
            .map((error) => ({

                field: error.path,

                message: error.message

            }));

        return res.status(400).json({

            error: "Validation Error",

            errors: errors

        });

    }


    // Invalid MongoDB ID
    if (err.name === "CastError") {

        return res.status(400).json({

            error: "Invalid ID",

            message:
                "The provided task ID is not a valid MongoDB ObjectId"

        });

    }


    // Other server errors
    res.status(500).json({

        error: "Internal Server Error",

        message: "Something went wrong on the server"

    });

});


// ==========================================
// CONNECT TO MONGODB
// ==========================================

async function startServer() {

    try {

        if (!process.env.MONGO_URI) {

            throw new Error(
                "MONGO_URI is missing. Add it to the .env file."
            );

        }

        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log("MongoDB connected");


        app.listen(PORT, () => {

            console.log(
                `Server Running on Port ${PORT}`
            );

        });

    } catch (err) {

        console.error(
            "Failed to start server:",
            err.message
        );

        process.exit(1);

    }

}

// Export app for test suites (Jest/Supertest) and start server only in non-test mode
if (process.env.NODE_ENV !== "test") {
    startServer();
}

module.exports = app;
