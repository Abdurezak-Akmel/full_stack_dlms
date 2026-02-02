-- Create Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    privileges JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'Active', -- Active, Inactive
    branch VARCHAR(100) NOT NULL DEFAULT 'Headquarters',
    team VARCHAR(100),
    position VARCHAR(100) NOT NULL DEFAULT 'Employee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, user_id)
);

-- Create Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    mime_type VARCHAR(100),
    size BIGINT,
    type VARCHAR(50) DEFAULT 'document',
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Drafts Table
CREATE TABLE IF NOT EXISTS drafts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    content JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seeding Roles
INSERT INTO roles (name, description, privileges) VALUES 
('Admin', 'System Administrator with full access', '{
    "myLibrary": {"upload": true},
    "compose": {"shareIndividual": true, "shareTeam": true, "shareWorkspace": true, "shareBranch": true, "createWorkspace": true},
    "approval": {"hasModule": true},
    "workspace": {"createWorkspace": true}
}'),
('User', 'Standard User', '{
    "myLibrary": {"upload": false},
    "compose": {"shareIndividual": true, "shareTeam": false, "shareWorkspace": false, "shareBranch": false, "createWorkspace": false},
    "approval": {"hasModule": true},
    "workspace": {"createWorkspace": false}
}')
ON CONFLICT (name) DO NOTHING;

-- Seeding Users (Password: password123)
-- Admin User
INSERT INTO users (employee_id, name, email, phone_number, password_hash, role_id, status, branch, team, position)
SELECT 'EMP-001', 'Admin User', 'admin@dms.com', '0911223344', 'password123', (SELECT id FROM roles WHERE name = 'Admin'), 'Active', 'Mesob Head Quarter', 'Executive Team', 'Administrator'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE employee_id = 'EMP-001');

-- Test User
INSERT INTO users (employee_id, name, email, phone_number, password_hash, role_id, status, branch, team, position)
SELECT 'EMP-002', 'Test User', 'test@dms.com', '0922334455', 'password123', (SELECT id FROM roles WHERE name = 'User'), 'Active', 'Bole Mesob', 'Finance', 'Accountant'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE employee_id = 'EMP-002');

