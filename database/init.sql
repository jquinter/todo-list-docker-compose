-- database/init.sql
-- SQL script to initialize the PostgreSQL database schema and populate with initial data.
-- This script is executed automatically by the PostgreSQL Docker image when the container starts for the first time.

-- Create the 'users' table to store user profiles.
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the 'todos' table if it does not already exist.
-- This prevents errors if the script is run multiple times or the table already exists.
CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,          -- Unique identifier for each todo, auto-increments
    title VARCHAR(255) NOT NULL,    -- The title/description of the todo item, cannot be null
    completed BOOLEAN DEFAULT FALSE,-- Status of the todo item, defaults to false (not completed)
    user_id INTEGER NOT NULL,       -- Foreign key to associate the todo with a user
    created_at TIMESTAMPTZ DEFAULT NOW(), -- Timestamp when the todo was created
    completed_at TIMESTAMPTZ,       -- Timestamp when the todo was completed
    CONSTRAINT fk_user
        FOREIGN KEY(user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE -- If a user is deleted, their todos are also deleted.
);

-- Insert some sample users.
INSERT INTO users (username, email) VALUES
('jquinter_gmail_com', 'jquinter@gmail.com'),
('julio_andres_quinteros_pro_gmail_com', 'julio.andres.quinteros.pro@gmail.com')
ON CONFLICT (username) DO NOTHING;

-- Insert some initial dummy data, now associated with users.
INSERT INTO todos (title, completed, user_id, completed_at) VALUES
('Learn Docker Compose', TRUE, 1, NOW() - INTERVAL '1 day'), -- Jane's completed todo
('Build a ToDo App', TRUE, 1, NOW()),                       -- Jane's completed todo
('Give a Docker Lecture', FALSE, 1, NULL),                  -- Jane's active todo
('Explore Monitoring Tools', FALSE, 2, NULL)                -- Bob's active todo
ON CONFLICT (id) DO NOTHING;
