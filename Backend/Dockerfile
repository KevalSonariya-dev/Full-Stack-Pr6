# Base image with Node.js 18 runtime
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy dependency definitions first to take advantage of Docker layer caching
COPY package*.json ./

# Install project dependencies inside the container
RUN npm install

# Copy application source code
COPY . .

# Expose backend API port
EXPOSE 5000

# Start Express server
CMD ["node", "server.js"]

