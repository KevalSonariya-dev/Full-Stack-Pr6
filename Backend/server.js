const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const Task = require("./models/Task");

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

app.get("/tasks", async (req, res, next) => {

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

app.get("/tasks/:id", async (req, res, next) => {

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

app.post("/tasks", async (req, res, next) => {

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

app.put("/tasks/:id", async (req, res, next) => {

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

app.delete("/tasks/:id", async (req, res, next) => {

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
// GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {

    console.error(err.message);


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