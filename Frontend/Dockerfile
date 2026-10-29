# Multi-stage build for React (Vite) frontend
FROM node:18 AS build

# Set working directory inside container
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install frontend dependencies
RUN npm install

# Copy application source code
COPY . .

# Build the production React bundle (Supplementary Problem: Multi-stage build)
RUN npm run build

# Expose Vite preview / serve port
EXPOSE 5173

# Serve production build accessible outside the container on port 5173
CMD ["npm", "run", "preview", "--", "--host", "--port", "5173"]

