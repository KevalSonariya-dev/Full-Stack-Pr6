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


// ==========================================
// GET ALL TASKS
// ==========================================

app.get("/tasks", authMiddleware, async (req, res, next) => {

    try {

        const tasks = await Task.find()
            .sort({ createdAt: -1 });

        res.status(200).json(tasks);

    } catch (err) {

        next(err);

    }

});


// ==========================================
// GET SINGLE TASK
// ==========================================

app.get("/tasks/:id", authMiddleware, async (req, res, next) => {

    try {

        const task = await Task.findById(req.params.id);

        if (!task) {

            return res.status(404).json({
                error: "Task Not Found",
                message: "No task exists with the provided ID"
            });

        }

        res.status(200).json(task);

    } catch (err) {

        next(err);

    }

});


// ==========================================
// CREATE TASK
// ==========================================

app.post("/tasks", authMiddleware, validateTask, async (req, res, next) => {

    try {

        const task = await Task.create({

            title: req.body.title,

            description: req.body.description,

            completed: req.body.completed,

            priority: req.body.priority

        });

        res.status(201).json(task);

    } catch (err) {

        next(err);

    }

});


// ==========================================
// UPDATE TASK
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

        res.status(200).json(task);

    } catch (err) {

        next(err);

    }

});


// ==========================================
// DELETE TASK
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

        res.status(200).json({

            message: "Task Deleted Successfully",

            deletedTask: task

        });

    } catch (err) {

        next(err);

    }

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

startServer();