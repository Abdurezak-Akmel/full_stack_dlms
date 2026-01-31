-- Create Users Table if not exists (assuming basic auth exists or will exist)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, user_id) -- Unique category names per user
);

-- Create Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    mime_type VARCHAR(100),
    size BIGINT,
    type VARCHAR(50) DEFAULT 'document', -- 'document' or 'letter'
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seeding a default user for testing if table is empty
INSERT INTO users (name, email, role)
SELECT 'Test User', 'test@example.com', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users);

-- Seeding some default categories for the test user
INSERT INTO categories (name, user_id)
SELECT 'General', (SELECT id FROM users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'General');

INSERT INTO categories (name, user_id)
SELECT 'Work', (SELECT id FROM users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Work');

-- Create Drafts Table
CREATE TABLE IF NOT EXISTS drafts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    content JSONB, -- Stores the full form state
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
