# ToDo Application with Docker Compose

This project demonstrates a simple ToDo list application built with a Vue.js frontend, a Node.js/Express backend, and a PostgreSQL database, all orchestrated using Docker Compose. It also includes `pgAdmin` for database management and setup for unit/integration/E2E testing.

## Project Structure

```
todo-app/
├── frontend/                 # Vue.js Frontend Application
│   ├── public/
│   ├── src/
│   ├── tests/unit/
│   ├── .env.development      # Frontend development environment variables
│   ├── package.json
│   ├── vue.config.js
│   ├── nginx.conf            # Nginx configuration for serving Vue app and proxying API
│   └── Dockerfile            # Dockerfile for building frontend image
├── backend/                  # Node.js/Express Backend API
│   ├── src/
│   │   ├── routes/
│   │   ├── db.js
│   │   └── app.js
│   ├── tests/integration/    # Backend integration tests
│   ├── package.json
│   └── Dockerfile            # Dockerfile for building backend image
├── database/                 # PostgreSQL Database Initialization
│   └── init.sql              # SQL script for table creation and initial data
├── cypress/                  # End-to-End (E2E) tests with Cypress
│   ├── integration/
│   └── support/
├── .env                      # Environment variables for Docker Compose (e.g., database credentials)
├── docker-compose.yml        # Docker Compose configuration for all services
└── README.md                 # This file
```

## Prerequisites

* Docker Desktop (or Docker Engine and Docker Compose) installed on your machine.
* Node.js and npm (or yarn) installed for local development and running tests outside Docker.

## Setup and Running the Application

1.  **Clone the Repository (or create the files manually):**
    If you're copying the files, ensure the directory structure matches the one above.

2.  **Create the `.env` file:**
    In the root directory of the `todo-app` project, create a file named `.env` and add the following content. You can change the values as needed.

    ```dotenv
    DB_USER=dockeruser
    DB_PASSWORD=dockerpassword
    DB_NAME=todo_db

    PGADMIN_EMAIL=admin@example.com
    PGADMIN_PASSWORD=adminpassword
    ```

3.  **Install Node.js Dependencies (Optional, but recommended for local testing/development):**
    While Docker will install dependencies inside containers, it's good practice to have them locally for development tools and running tests directly.

    ```bash
    # In the root 'todo-app' directory
    cd frontend
    npm install
    cd ../backend
    npm install
    cd ..
    # For Cypress E2E tests (if you plan to run them locally)
    npm install cypress --prefix ./cypress # Install cypress into its own directory
    ```

4.  **Build and Run with Docker Compose:**
    Navigate to the root `todo-app` directory in your terminal and run:

    ```bash
    docker-compose up --build -d
    ```

    * `docker-compose up`: Starts all services defined in `docker-compose.yml`.
    * `--build`: Forces Docker Compose to rebuild images if Dockerfiles or their contexts have changed.
    * `-d`: Runs the containers in "detached" mode (in the background).

5.  **Verify Services:**
    * **Frontend:** Open your web browser and go to `http://localhost:8080`. You should see the ToDo list application.
    * **Backend API:** You can test the backend directly by visiting `http://localhost:3000/todos` in your browser or using a tool like Postman/Insomnia. You should see the initial dummy data in JSON format.
    * **pgAdmin:** Open `http://localhost:5050` in your browser.
        * Log in with the `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD` from your `.env` file.
        * To connect to your database:
            * Right-click on "Servers" in the left panel and select "Register" -> "Server...".
            * **General Tab:**
                * Name: `ToDo Database` (or any descriptive name)
            * **Connection Tab:**
                * Host name/address: `database` (This is the service name of the database container in `docker-compose.yml`)
                * Port: `5432`
                * Maintenance database: `todo_db` (or `postgres`)
                * Username: `dockeruser` (from your `.env`)
                * Password: `dockerpassword` (from your `.env`)
            * Click "Save". You should now be able to browse the `todo_db` database, its schemas, and the `todos` table.

## Stopping the Application

To stop and remove the running containers, networks, and volumes (for persistent data):

```bash
docker-compose down -v
```

* `docker-compose down`: Stops and removes containers and default network.
* `-v`: Also removes the volumes defined in `docker-compose.yml` (`db_data` and `pgadmin_data`). Use this if you want a clean slate for your database data. If you want to keep the data, omit `-v`.

## Testing

This project includes setups for unit, integration, and end-to-end (E2E) testing.

### 1. Frontend Unit Tests (Jest / Vue Test Utils)

These tests focus on individual Vue components.

* **Location:** `frontend/tests/unit/`
* **How to Run:**
    ```bash
    # Run inside the frontend container
    docker-compose run --rm frontend npm run test:unit
    ```

### 2. Backend Integration Tests (Jest / Supertest)

These tests verify the backend API endpoints and their interaction with mocked or real database calls.

* **Location:** `backend/tests/integration/`
* **How to Run:**
    ```bash
    # Run inside the backend container
    docker-compose run --rm backend npm test
    ```

### 3. End-to-End (E2E) Tests (Cypress)

These tests simulate user interactions in a real browser, interacting with the fully running application (frontend, backend, database).

* **Location:** `cypress/integration/`
* **How to Run:**
    1.  Ensure all Docker containers are running:
        ```bash
        docker-compose up -d
        ```
    2.  Open the Cypress test runner:
        ```bash
        # From the root 'todo-app' directory
        npx cypress open --project ./cypress
        ```
        Cypress will open a UI where you can select and run your tests.
    3.  Alternatively, run in headless mode (useful for CI/CD):
        ```bash
        # From the root 'todo-app' directory
        npx cypress run --project ./cypress
        ```

## Monitoring and Troubleshooting

* **Docker Logs:**
    * View logs for all services: `docker-compose logs`
    * View logs for a specific service (e.g., backend): `docker-compose logs backend`
    * Follow logs in real-time: `docker-compose logs -f frontend`
* **Exec into containers:**
    * Get a shell inside a running container (e.g., backend): `docker-compose exec backend sh` (or `bash`)
    * This allows you to inspect files, run commands, or debug directly within the container's environment.
* **pgAdmin:** Use the web interface at `http://localhost:5050` to inspect database tables, run queries, and verify data persistence.
* **Health Checks:** The `database` service in `docker-compose.yml` includes a health check. You can check the health status of services using `docker-compose ps`.
