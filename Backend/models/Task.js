const mongoose = require("mongoose");
const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"]
    },

    description: {
        type: String
    },

    completed: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    priority: {
        type: String,
        enum: {
            values: ["low", "medium", "high"],
            message: "Priority must be low, medium, or high"
        },
        default: "medium"
    }
});

taskSchema.pre("save", function(next) {

    if (typeof this.title === "string") {
        this.title = this.title.trim();
    }

    next();
});

module.exports = mongoose.model("Task", taskSchema);