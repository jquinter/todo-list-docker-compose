# frontend/Dockerfile
# This Dockerfile builds the Vue.js frontend application and serves it using Nginx.

# Stage 1: Build the Vue.js application
FROM node:18-alpine as build-stage

# Set the working directory inside the container
WORKDIR /app

# FIXED: Declare ARG and set ENV immediately after WORKDIR
# This ensures the VUE_APP_API_URL environment variable is available
# for subsequent commands like 'npm install' or 'npm run build'.
ARG VUE_APP_API_URL
ENV VUE_APP_API_URL=$VUE_APP_API_URL

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./
# Install Node.js dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the Vue.js application for production.
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine as production-stage

# Copy the built Vue.js application from the build-stage to Nginx's web root
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration file
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80, which Nginx will listen on
EXPOSE 80

# Command to run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
