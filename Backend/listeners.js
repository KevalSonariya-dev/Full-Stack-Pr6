const taskEvents = require('./events');
taskEvents.on('task-created', (payload) => {
    // Artificial delay of 2 seconds (2000ms) to simulate slow external operations (email, SMS, audit logs)
    setTimeout(() => {
        try {
            const task = payload.task || payload;
            const user = payload.user || payload.assignedUser || "Authorized User";
            const timestamp = new Date().toISOString();

            console.log(
                `[Notification Worker] Task "${task.title}" created at ${timestamp} (Assigned/Triggered by: ${user})`
            );
        } catch (err) {
            taskEvents.emit('error', err);
        }
    }, 2000);
});

/**
 * Event Listener: task-deleted (Supplementary Problem 1)
 * Logs an audit message whenever a task is removed.
 */
taskEvents.on('task-deleted', (payload) => {
    const task = payload.task || payload;
    const timestamp = new Date().toISOString();

    console.log(
        `[Audit Worker] Task "${task.title || payload._id}" deleted at ${timestamp}`
    );
});

taskEvents.on('error', (err) => {
    console.error(`[Event Error] Error encountered in background listener:`, err.message);
});
console.log("[Events] Event listeners registered successfully.");

