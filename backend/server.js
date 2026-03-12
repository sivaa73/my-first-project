const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db'); 
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const docRoutes = require('./routes/docRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Link Routes
app.use('/api/auth', authRoutes);
app.use('/api/docs', docRoutes);

// --- ADMIN GLOBAL DATA ROUTES ---

// 1. Fetch User Directory
app.get('/api/admin/users', async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, username, role, approval_level FROM users');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// 2. Fetch Global Document Archive (FIXED FOR INVALID DATE)
app.get('/api/admin/documents', async (req, res) => {
    try {
        // We use COALESCE to ensure that if submitted_at is NULL, it returns the current time 
        // instead of causing an "Invalid Date" error on the frontend
        const query = `
            SELECT 
                d.id, 
                d.title, 
                d.status, 
                d.current_level, 
                COALESCE(d.submitted_at, CURRENT_TIMESTAMP) as submitted_at, 
                u.username 
            FROM documents d 
            JOIN users u ON d.user_id = u.id 
            ORDER BY d.submitted_at DESC
        `;
        const [docs] = await db.execute(query);
        res.json(docs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch document archive" });
    }
});

// 3. Delete User Functionality
app.delete('/api/admin/users/:id', async (req, res) => {
    try {
        // This permanently removes the user from the User Directory
        await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: "User deleted" });
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
});

app.get('/', (req, res) => res.send("Approval System API is running..."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));