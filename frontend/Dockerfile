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

# This environment variable will be used by Nginx to proxy requests to the backend.
# It can be overridden at runtime, e.g., with `docker run -e BACKEND_URL=...`
ARG VUE_APP_API_URL
ENV BACKEND_URL=$VUE_APP_API_URL

ARG NGINX_PORT
ENV NGINX_PORT=$NGINX_PORT

# Install gettext package which provides the `envsubst` utility.
RUN apk add --no-cache gettext

# Copy the built Vue.js application from the build-stage to Nginx's web root
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy the Nginx configuration template. `envsubst` will process this file.
COPY ./nginx.conf.template /etc/nginx/conf.d/default.conf.template

# Expose port, which Nginx will listen on
EXPOSE $NGINX_PORT

# Copy your custom entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Make the entrypoint script executable
RUN chmod +x /docker-entrypoint.sh

# Set the custom entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
