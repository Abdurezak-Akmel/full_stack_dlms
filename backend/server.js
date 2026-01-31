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
        const userId = req.query.userId || 1; // Default to user 1 for now
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
    if (!name) return res.status(400).json({ error: 'Name is required' });

    try {
        const uid = userId || 1;
        const result = await db.query(
            'INSERT INTO categories (name, user_id) VALUES ($1, $2) RETURNING *',
            [name, uid]
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
        const uid = userId || 1;
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
        const userId = req.query.userId || 1;
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

// Create or Update Draft
app.post('/api/drafts', async (req, res) => {
    const { id, userId, name, content } = req.body;
    const uid = userId || 1; // Default to user 1

    try {
        let result;
        if (id) {
            // Update existing draft
            // Check if it belongs to user
            // Note: In real app check ownership. Here assuming it's correct.
            result = await db.query(
                'UPDATE drafts SET name = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
                [name, content, id]
            );
        } else {
            // Create new draft
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

// Get User Drafts
app.get('/api/drafts', async (req, res) => {
    try {
        const userId = req.query.userId || 1;
        const result = await db.query('SELECT * FROM drafts WHERE user_id = $1 ORDER BY updated_at DESC', [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Single Draft
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

// Delete Draft
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
