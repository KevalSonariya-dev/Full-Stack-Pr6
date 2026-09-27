const BASE_URL = "http://localhost:5000";

// Helper functions for client-side JWT management
export const getToken = () => localStorage.getItem("token");
export const setToken = (token) => localStorage.setItem("token", token);
export const removeToken = () => localStorage.removeItem("token");

// Helper to attach Authorization header when token exists
const authHeaders = (headers = {}) => {
    const token = getToken();
    return {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
};

// Centralized response handler that catches 401 Unauthorized
const handleResponse = async (response) => {
    if (response.status === 401) {
        removeToken();
        window.dispatchEvent(new Event("auth:unauthorized"));
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Session expired or unauthorized. Please login again.");
    }

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Request failed");
    }

    return response.json();
};

// ==========================================
// AUTHENTICATION API
// ==========================================

export const registerUser = async (credentials) => {
    const response = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
    });

    return handleResponse(response);
};

export const loginUser = async (credentials) => {
    const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
    });

    return handleResponse(response);
};

export const getMe = async () => {
    const response = await fetch(`${BASE_URL}/me`, {
        method: "GET",
        headers: authHeaders()
    });

    return handleResponse(response);
};

// ==========================================
// TASK MANAGEMENT API (PROTECTED)
// ==========================================

export const getTasks = async () => {
    const response = await fetch(`${BASE_URL}/tasks`, {
        headers: authHeaders()
    });

    return handleResponse(response);
};

export const createTask = async (task) => {
    const response = await fetch(`${BASE_URL}/tasks`, {
        method: "POST",
        headers: authHeaders({
            "Content-Type": "application/json"
        }),
        body: JSON.stringify(task)
    });

    return handleResponse(response);
};

export const updateTask = async (id, task) => {
    const response = await fetch(`${BASE_URL}/tasks/${id}`, {
        method: "PUT",
        headers: authHeaders({
            "Content-Type": "application/json"
        }),
        body: JSON.stringify(task)
    });

    return handleResponse(response);
};

export const deleteTask = async (id) => {
    const response = await fetch(`${BASE_URL}/tasks/${id}`, {
        method: "DELETE",
        headers: authHeaders()
    });

    return handleResponse(response);
};