-- database/init.sql
-- SQL script to initialize the PostgreSQL database schema and populate with initial data.
-- This script is executed automatically by the PostgreSQL Docker image when the container starts for the first time.

-- Create the 'todos' table if it does not already exist.
-- This prevents errors if the script is run multiple times or the table already exists.
CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,      -- Unique identifier for each todo, auto-increments
    title VARCHAR(255) NOT NULL,-- The title/description of the todo item, cannot be null
    completed BOOLEAN DEFAULT FALSE -- Status of the todo item, defaults to false (not completed)
);

-- Insert some initial dummy data into the 'todos' table.
-- These will be visible when the application starts for the first time.
-- This is useful for demonstration purposes.
INSERT INTO todos (title, completed) VALUES
('Learn Docker Compose', TRUE),         -- A completed todo
('Build a ToDo App', TRUE),             -- Another completed todo
('Give a Docker Lecture', FALSE),       -- An uncompleted todo
('Explore Monitoring Tools', FALSE)     -- Another uncompleted todo
ON CONFLICT (id) DO NOTHING; -- Prevents inserting duplicate rows if the script is run again
                             -- and IDs might conflict (though SERIAL handles this normally)
