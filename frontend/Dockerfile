# frontend/Dockerfile
# This Dockerfile builds the Vue.js frontend application and serves it using a Node.js/Express server.

# --- Build Stage ---
# This stage builds the Vue.js application from source code.
FROM node:18-alpine as build-stage

WORKDIR /app

# Set build-time arguments. These are passed from docker-compose.
# BUILD_MODE controls whether the Vue app is built for development or production.
ARG BUILD_MODE=production
ARG VUE_APP_API_URL
ARG VUE_APP_DEV_USER_EMAIL

# Set environment variables for the build process.
# `vue-cli-service build` uses NODE_ENV to determine the build mode.
# When NODE_ENV is 'development', the check in App.vue will pass, enabling the 'x-user-email' header.
ENV NODE_ENV=$BUILD_MODE
ENV VUE_APP_API_URL=$VUE_APP_API_URL
ENV VUE_APP_DEV_USER_EMAIL=$VUE_APP_DEV_USER_EMAIL

# Copy package.json and package-lock.json first for layer caching.
COPY package*.json ./
# Install dependencies
RUN npm install

# Copy the rest of the frontend source code
COPY . .

# Build the application.
RUN npm run build

# --- Serve Stage ---
# This stage serves the built static files and proxies API requests using a lightweight Node.js/Express server.
FROM node:18-alpine

WORKDIR /app

# Set the environment to production for the Express server
ENV NODE_ENV=production

# Copy built assets from the build-stage
COPY --from=build-stage /app/dist ./dist

# Copy the server-related files and dependencies
COPY --from=build-stage /app/node_modules ./node_modules
COPY --from=build-stage /app/package.json .
COPY --from=build-stage /app/server.js .

EXPOSE 8080

# The command to start the Node.js server.
# The server.js file is configured to listen on process.env.PORT || 8080
CMD ["node", "server.js"]
