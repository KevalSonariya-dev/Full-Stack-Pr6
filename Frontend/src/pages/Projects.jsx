import { useEffect, useMemo, useState } from "react";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  generateAiDescription,
} from "../api/api";

import toast from "react-hot-toast";

import "./Projects.css";

const priorityRank = {
  high: 3,
  medium: 2,
  low: 1,
};

function Projects() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNotice, setAiNotice] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("medium");

  const handleAiGenerate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a task title first!");
      return;
    }

    setAiLoading(true);
    setAiNotice(null);

    try {
      const res = await generateAiDescription(title);
      if (res && res.description) {
        setDescription(res.description);
        if (res.fallback) {
          setAiNotice({
            type: "fallback",
            text: res.message || "AI service offline. Contextual suggestion provided.",
          });
          toast("Contextual suggestion applied (AI offline)", { icon: "ℹ️" });
        } else {
          setAiNotice({
            type: "success",
            text: `Generated via ${res.provider || "AI"}. This is an editable suggestion.`,
          });
          toast.success("AI description generated!");
        }
      } else if (res && res.rateLimited) {
        toast.error(res.message);
      } else {
        toast.error("Could not generate description. Please enter manually.");
      }
    } catch (err) {
      console.error("[AI Error]", err);
      toast.error(err.message || "AI generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTasks();
  }, []);

  // Dual-Sync: Browser BroadcastChannel (0ms local cross-tab) + Server-Sent Events (SSE from backend)
  useEffect(() => {
    const channel = typeof window !== "undefined" && "BroadcastChannel" in window
      ? new BroadcastChannel("tasks_realtime_sync")
      : null;

    const handleIncomingSync = (type, data) => {
      if (!data) return;
      const incomingId = String(data._id || data.id || "");
      if (!incomingId) return;

      if (type === "TASK_CREATED") {
        setTasks((prev) => {
          if (prev.some((t) => String(t._id || t.id) === incomingId)) {
            return prev;
          }
          return [data, ...prev];
        });
      } else if (type === "TASK_UPDATED") {
        setTasks((prev) =>
          prev.map((t) => (String(t._id || t.id) === incomingId ? data : t))
        );
      } else if (type === "TASK_DELETED") {
        setTasks((prev) =>
          prev.filter((t) => String(t._id || t.id) !== incomingId)
        );
      }
    };

    if (channel) {
      channel.onmessage = (event) => {
        const { type, data } = event.data || {};
        console.log("[BroadcastChannel] Sync received:", type);
        handleIncomingSync(type, data);
      };
    }

    const eventSource = new EventSource("http://localhost:5000/tasks/stream");

    eventSource.onopen = () => {
      console.log("[SSE] Connected to real-time server stream");
    };

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type && payload.type !== "CONNECTED") {
          console.log("[SSE] Sync received:", payload.type);
          handleIncomingSync(payload.type, payload.data);
        }
      } catch (err) {
        console.error("[SSE] Parse error:", err);
      }
    };

    eventSource.onerror = () => {
      // Automatic reconnect
    };

    return () => {
      if (channel) channel.close();
      eventSource.close();
    };
  }, []);

  const summary = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const pending = total - completed;
    const highPriority = tasks.filter((task) => task.priority === "high").length;

    return { total, completed, pending, highPriority };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const filteredTasks = tasks.filter((task) => {
      const matchesSearch =
        !query ||
        `${task.title || ""} ${task.description || ""}`
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "pending"
            ? !task.completed
            : statusFilter === "completed"
              ? task.completed
              : task.priority === "high";

      return matchesSearch && matchesStatus;
    });

    return [...filteredTasks].sort((firstTask, secondTask) => {
      const firstTime = new Date(firstTask.createdAt || 0).getTime();
      const secondTime = new Date(secondTask.createdAt || 0).getTime();

      switch (sortBy) {
        case "oldest":
          return firstTime - secondTime;
        case "priority-high":
          return (
            (priorityRank[secondTask.priority] || 0) -
            (priorityRank[firstTask.priority] || 0)
          );
        case "priority-low":
          return (
            (priorityRank[firstTask.priority] || 0) -
            (priorityRank[secondTask.priority] || 0)
          );
        case "newest":
        default:
          return secondTime - firstTime;
      }
    });
  }, [tasks, searchTerm, statusFilter, sortBy]);

  const handleCreateTask = async (event) => {
    event.preventDefault();

    if (actionLoading) return;

    if (!title.trim()) {
      setError("Task title is required");
      toast.error("Task title is required");
      return;
    }

    try {
      setError("");
      setActionLoading(true);

      const newTask = await createTask({
        title,
        description,
        completed: false,
        priority,
      });

      const newId = String(newTask._id || newTask.id || "");
      setTasks((previousTasks) => {
        if (newId && previousTasks.some((t) => String(t._id || t.id) === newId)) {
          return previousTasks;
        }
        return [newTask, ...previousTasks];
      });
      setTitle("");
      setDescription("");
      setPriority("medium");
      setAiNotice(null);
      toast.success("Task created successfully");
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("tasks_realtime_sync");
        bc.postMessage({ type: "TASK_CREATED", data: newTask });
        bc.close();
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const startEditing = (task) => {
    setEditingId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditPriority(task.priority || "medium");
  };

  const handleUpdateTask = async (id) => {
    if (!editTitle.trim()) {
      setError("Task title is required");
      toast.error("Task title is required");
      return;
    }

    try {
      setError("");
      setActionLoading(true);

      const currentTask = tasks.find((task) => task._id === id);

      const updatedTask = await updateTask(id, {
        title: editTitle,
        description: editDescription,
        completed: currentTask ? currentTask.completed : false,
        priority: editPriority,
      });

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task._id === id ? updatedTask : task
        )
      );

      setEditingId(null);
      setEditTitle("");
      setEditDescription("");
      setEditPriority("medium");
      toast.success("Task updated successfully");
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("tasks_realtime_sync");
        bc.postMessage({ type: "TASK_UPDATED", data: updatedTask });
        bc.close();
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTask = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setError("");
      setActionLoading(true);

      await deleteTask(id);

      setTasks((previousTasks) =>
        previousTasks.filter((task) => task._id !== id)
      );

      if (editingId === id) {
        setEditingId(null);
      }

      toast.success("Task deleted successfully");
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("tasks_realtime_sync");
        bc.postMessage({ type: "TASK_DELETED", data: id });
        bc.close();
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleCompleted = async (task) => {
    try {
      setError("");
      setActionLoading(true);

      const updatedTask = await updateTask(task._id, {
        title: task.title,
        description: task.description,
        completed: !task.completed,
        priority: task.priority,
      });

      setTasks((previousTasks) =>
        previousTasks.map((item) =>
          item._id === task._id ? updatedTask : item
        )
      );

      toast.success(
        updatedTask.completed
          ? "Task marked as completed"
          : "Task marked as pending"
      );
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="projects-page">
        <div className="dashboard-header">
          <div>
            <p className="section-tag">Productivity Workspace</p>
            <h1>Task Manager</h1>
            <p className="section-subtitle">
              Organize your work, track progress, and stay productive.
            </p>
          </div>
        </div>

        <div className="stats-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="stat-card skeleton-card" />
          ))}
        </div>

        <div className="board-grid">
          <div className="panel skeleton-panel" />
          <div className="panel skeleton-panel large" />
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <div className="dashboard-header">
        <div>
          <p className="section-tag">Productivity Workspace</p>
          <h1>Task Manager</h1>
          <p className="section-subtitle">
            Organize your work, track progress, and stay productive.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Tasks</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Completed</span>
          <strong>{summary.completed}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending</span>
          <strong>{summary.pending}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">High Priority</span>
          <strong>{summary.highPriority}</strong>
        </div>
      </div>

      {error && (
        <div className="error-state" role="alert">
          <span className="error-icon" aria-hidden="true">
            ⚠
          </span>
          <div>
            <h3>Something went wrong</h3>
            <p>{error}</p>
          </div>
          <button type="button" className="secondary-btn" onClick={loadTasks}>
            Retry
          </button>
        </div>
      )}

      <div className="board-grid">
        <section className="panel form-panel">
          <div className="panel-header">
            <h2>Add New Task</h2>
          </div>

          <form className="task-form" onSubmit={handleCreateTask}>
            <label className="field">
              <span>Task Title</span>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter task title"
                aria-label="Task title"
              />
            </label>

            <div className="field">
              <div className="description-header-row">
                <span>Description</span>
                <button
                  type="button"
                  className="btn-ai-generate"
                  onClick={handleAiGenerate}
                  disabled={aiLoading || !title.trim()}
                  title={!title.trim() ? "Enter a task title first to use AI" : "Auto-generate description with AI"}
                >
                  {aiLoading ? (
                    <>
                      <span className="ai-spinner"></span> Generating...
                    </>
                  ) : (
                    <>✨ Auto-generate with AI</>
                  )}
                </button>
              </div>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add a short task description (or click Auto-generate above)"
                rows="4"
                aria-label="Task description"
              />
              {aiNotice && (
                <div className={`ai-disclaimer ${aiNotice.type}`}>
                  <span>{aiNotice.type === "success" ? "🤖" : "ℹ️"} {aiNotice.text}</span>
                </div>
              )}
            </div>

            <label className="field">
              <span>Priority</span>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                aria-label="Task priority"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <button type="submit" className="primary-btn submit-btn" disabled={actionLoading}>
              {actionLoading ? "Adding..." : "Add Task"}
            </button>
          </form>
        </section>

        <section className="panel list-panel">
          <div className="panel-header panel-header-wrap">
            <h2>Task List</h2>
          </div>

          <div className="toolbar">
            <label className="search-field" htmlFor="task-search">
              <span>Search</span>
              <input
                id="task-search"
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search tasks by title or description"
                aria-label="Search tasks"
              />
            </label>

            <div className="toolbar-controls">
              <div className="filter-group" aria-label="Task status filter">
                {[
                  { label: "All", value: "all" },
                  { label: "Pending", value: "pending" },
                  { label: "Completed", value: "completed" },
                  { label: "High Priority", value: "high" },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    className={statusFilter === filter.value ? "filter-chip active" : "filter-chip"}
                    onClick={() => setStatusFilter(filter.value)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <label className="sort-field">
                <span>Sort</span>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="priority-high">Priority: High → Low</option>
                  <option value="priority-low">Priority: Low → High</option>
                </select>
              </label>
            </div>
          </div>

          {visibleTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon" aria-hidden="true">
                ✓
              </div>
              <h3>No tasks yet</h3>
              <p>Create your first task and start getting things done.</p>
            </div>
          ) : (
            <div className="task-list">
              {visibleTasks.map((task) => (
                <article
                  key={task._id}
                  className={`task-card ${task.completed ? "completed" : "pending"} priority-${task.priority || "medium"}`}
                >
                  {editingId === task._id ? (
                    <div className="edit-form">
                      <div className="field-stack">
                        <label className="field">
                          <span>Title</span>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(event) => setEditTitle(event.target.value)}
                            aria-label="Edit task title"
                          />
                        </label>

                        <label className="field">
                          <span>Description</span>
                          <textarea
                            value={editDescription}
                            onChange={(event) => setEditDescription(event.target.value)}
                            rows="3"
                            aria-label="Edit task description"
                          />
                        </label>

                        <label className="field">
                          <span>Priority</span>
                          <select
                            value={editPriority}
                            onChange={(event) => setEditPriority(event.target.value)}
                            aria-label="Edit task priority"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </label>
                      </div>

                      <div className="inline-actions">
                        <button
                          type="button"
                          className="primary-btn"
                          onClick={() => handleUpdateTask(task._id)}
                          disabled={actionLoading}
                        >
                          {actionLoading ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={() => setEditingId(null)}
                          disabled={actionLoading}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="task-card-head">
                        <span className={`priority-badge priority-${task.priority || "medium"}`}>
                          {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : "Medium"}
                        </span>
                        <span className={task.completed ? "status-badge completed" : "status-badge pending"}>
                          {task.completed ? "Completed" : "Pending"}
                        </span>
                      </div>

                      <h3>{task.title}</h3>
                      <p className="task-description">
                        {task.description || "No description provided."}
                      </p>

                      <div className="task-actions">
                        <button
                          type="button"
                          className="primary-btn"
                          onClick={() => handleToggleCompleted(task)}
                          disabled={actionLoading}
                        >
                          {task.completed ? "Mark Pending" : "Mark Complete"}
                        </button>
                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={() => startEditing(task)}
                          disabled={actionLoading}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="danger-btn"
                          onClick={() => handleDeleteTask(task._id)}
                          disabled={actionLoading}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Projects;