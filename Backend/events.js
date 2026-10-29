const EventEmitter = require('events');

/**
 * TaskEvents extends Node.js built-in EventEmitter
 * Provides a centralized event bus for asynchronous, decoupled background tasks.
 */
class TaskEvents extends EventEmitter {}

// Export singleton instance so all modules share the same emitter
module.exports = new TaskEvents();

