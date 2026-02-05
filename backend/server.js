const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Ensure upload directory exists
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// --- API Routes ---

// Get Categories for a User
// Assuming we pass user_id in headers or params for now, or default to 1 for MVP
app.get('/api/categories', async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.json([]); // Return empty if no user specified
        }
        const result = await db.query('SELECT * FROM categories WHERE user_id = $1 ORDER BY name ASC', [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Category
app.post('/api/categories', async (req, res) => {
    const { name, userId } = req.body;
    if (!name || !userId) return res.status(400).json({ error: 'Name and User ID are required' });

    try {
        const result = await db.query(
            'INSERT INTO categories (name, user_id) VALUES ($1, $2) RETURNING *',
            [name, userId]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Upload Document with Category
app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
    const { title, categoryId, userId, type } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    try {
        const uid = userId; // Strict check, no fallback
        if (!uid) return res.status(400).json({ error: 'User ID is required' });
        const catId = categoryId ? parseInt(categoryId) : null;
        const docType = type || 'document';

        const result = await db.query(
            'INSERT INTO documents (title, file_path, original_name, mime_type, size, type, user_id, category_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [
                title || file.originalname,
                file.path,
                file.originalname,
                file.mimetype,
                file.size,
                docType,
                uid,
                catId
            ]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get My Library Documents
app.get('/api/documents/library', async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) return res.json([]);
        const categoryId = req.query.categoryId;

        let query = `
      SELECT d.*, c.name as category_name 
      FROM documents d 
      LEFT JOIN categories c ON d.category_id = c.id 
      WHERE d.user_id = $1
    `;
        const params = [userId];

        if (categoryId && categoryId !== 'all') {
            query += ` AND d.category_id = $2`;
            params.push(categoryId);
        }

        query += ` ORDER BY d.created_at DESC`;

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Mock inbox endpoint to prevent frontend breaking (From previous request context)
app.get('/api/documents/inbox', (req, res) => {
    res.json([]);
});

// Update Category
app.put('/api/categories/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    try {
        const result = await db.query(
            'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete Category
app.delete('/api/categories/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Optional: Check if category has documents and handle accordingly (e.g., block delete or cascade)
        // For now, assuming cascade or allowed delete
        await db.query('DELETE FROM categories WHERE id = $1', [id]);
        res.json({ message: 'Category deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete Document
app.delete('/api/documents/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Get file path to delete from disk
        const docResult = await db.query('SELECT file_path FROM documents WHERE id = $1', [id]);
        if (docResult.rows.length > 0) {
            const filePath = docResult.rows[0].file_path;
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (e) {
                    console.error("Error deleting file:", e);
                }
            }
        }

        await db.query('DELETE FROM documents WHERE id = $1', [id]);
        res.json({ message: 'Document deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Drafts API ---
app.post('/api/drafts', async (req, res) => {
    const { id, userId, name, content } = req.body;
    const uid = userId;
    if (!uid) return res.status(400).json({ error: 'User ID is required' });

    try {
        let result;
        if (id) {
            result = await db.query(
                'UPDATE drafts SET name = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
                [name, content, id]
            );
        } else {
            result = await db.query(
                'INSERT INTO drafts (user_id, name, content) VALUES ($1, $2, $3) RETURNING *',
                [uid, name, content]
            );
        }

        if (result.rows.length === 0 && id) {
            return res.status(404).json({ error: 'Draft not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/drafts', async (req, res) => {
    try {
        try {
            const userId = req.query.userId;
            if (!userId) return res.json([]);
            const result = await db.query('SELECT * FROM drafts WHERE user_id = $1 ORDER BY updated_at DESC', [userId]);
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });

app.get('/api/drafts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM drafts WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Draft not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/drafts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM drafts WHERE id = $1', [id]);
        res.json({ message: 'Draft deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Auth & Login ---
app.post('/api/auth/login', async (req, res) => {
    const { employeeId, password } = req.body;
    if (!employeeId || !password) return res.status(400).json({ error: 'Missing credentials' });

    try {
        const result = await db.query(`
            SELECT u.*, r.name as role_name, r.privileges 
            FROM users u 
            LEFT JOIN roles r ON u.role_id = r.id 
            WHERE u.employee_id = $1 AND u.password_hash = $2
        `, [employeeId, password]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        if (user.status !== 'Active') {
            return res.status(403).json({ error: 'Account is inactive' });
        }

        // Return user info excluding password
        delete user.password_hash;
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- User Management ---
app.get('/api/users', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT u.*, r.name as role_name 
            FROM users u 
            LEFT JOIN roles r ON u.role_id = r.id 
            ORDER BY u.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/users', async (req, res) => {
    const { employee_id, name, email, phone_number, password, role_id, status, branch, team, position } = req.body;

    if (!employee_id || !name || !email || !role_id || !branch || !position) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await db.query(
            'INSERT INTO users (employee_id, name, email, phone_number, password_hash, role_id, status, branch, team, position) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [employee_id, name, email, phone_number, password || 'password123', role_id, status || 'Active', branch || 'Headquarters', team, position || 'Employee']
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { employee_id, name, email, phone_number, role_id, status, branch, team, position } = req.body;

    if (!employee_id || !name || !email || !role_id || !branch || !position) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Protect Admin (EMP-001)
        const checkResult = await db.query('SELECT employee_id FROM users WHERE id = $1', [id]);
        if (checkResult.rows.length > 0 && checkResult.rows[0].employee_id === 'EMP-001') {
            // Cannot change role of admin
            // However, we can allow updating name or phone, but usually best to restrict.
            // The prompt says: "Avoid the admin from being deleted or his role being changed."

            // Check if role_id is being changed
            const currentRole = await db.query('SELECT role_id FROM users WHERE id = $1', [id]);
            if (role_id && role_id != currentRole.rows[0].role_id) {
                return res.status(403).json({ error: 'Cannot change admin role' });
            }
        }

        const result = await db.query(
            'UPDATE users SET employee_id = $1, name = $2, email = $3, phone_number = $4, role_id = $5, status = $6, branch = $7, team = $8, position = $9 WHERE id = $10 RETURNING *',
            [employee_id, name, email, phone_number, role_id, status, branch, team, position, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const checkResult = await db.query('SELECT employee_id FROM users WHERE id = $1', [id]);
        if (checkResult.rows.length > 0 && checkResult.rows[0].employee_id === 'EMP-001') {
            return res.status(403).json({ error: 'Cannot delete admin account' });
        }
        await db.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Role Management ---
app.get('/api/roles', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM roles ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/roles', async (req, res) => {
    const { name, description, privileges } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO roles (name, description, privileges) VALUES ($1, $2, $3) RETURNING *',
            [name, description, privileges]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/roles/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, privileges } = req.body;
    try {
        const checkResult = await db.query('SELECT name FROM roles WHERE id = $1', [id]);
        if (checkResult.rows.length > 0 && checkResult.rows[0].name === 'Admin') {
            if (name !== 'Admin') {
                return res.status(403).json({ error: 'Cannot change Admin role name' });
            }
        }
        const result = await db.query(
            'UPDATE roles SET name = $1, description = $2, privileges = $3 WHERE id = $4 RETURNING *',
            [name, description, privileges, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/roles/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const checkResult = await db.query('SELECT name FROM roles WHERE id = $1', [id]);
        if (checkResult.rows.length > 0 && checkResult.rows[0].name === 'Admin') {
            return res.status(403).json({ error: 'Cannot delete Admin role' });
        }
        await db.query('DELETE FROM roles WHERE id = $1', [id]);
        res.json({ message: 'Role deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


// Get Metadata (Branches, Teams)
app.get('/api/metadata/branches', async (req, res) => {
    try {
        const result = await db.query('SELECT DISTINCT branch FROM users WHERE branch IS NOT NULL ORDER BY branch');
        res.json(result.rows.map(row => row.branch));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/metadata/teams', async (req, res) => {
    try {
        const result = await db.query('SELECT DISTINCT team FROM users WHERE team IS NOT NULL ORDER BY team');
        res.json(result.rows.map(row => row.team));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

