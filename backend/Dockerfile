# backend/Dockerfile
# This Dockerfile builds the Node.js backend application.

# Use a lightweight Node.js image as the base
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# FIXED: Install curl for health checks
# curl is often not included in minimal Alpine images by default.
RUN apk add --no-cache curl

# Copy package.json and package-lock.json first.
# This allows Docker to cache these layers, so npm install isn't re-run
# if only source code changes.
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Expose the port the Node.js application listens on
ARG BACKEND_PORT
ENV BACKEND_PORT=$BACKEND_PORT
EXPOSE $BACKEND_PORT
# Define the command to run the application when the container starts
CMD ["node", "src/app.js"]
