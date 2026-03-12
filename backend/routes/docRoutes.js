const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const db = require('../config/db'); // <--- MAKE SURE THIS PATH IS CORRECT
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { userId } = req.body;
    const fileName = req.file.originalname; // This will go into 'title'
    const filePath = req.file.path.replace(/\\/g, "/"); // This will go into 'file_path'

    console.log("Saving for User:", userId);

    // MATCHING YOUR DATABASE COLUMNS EXACTLY
const query = 'INSERT INTO documents (user_id, title, file_path, status, current_level) VALUES (?, ?, ?, ?, ?)';

// This sends 'PENDING' and 'L1' so it shows up for Priya
await db.execute(query, [userId, fileName, filePath, 'PENDING', 'L1']);

    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error("MYSQL ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
});
// Route to get all documents for a specific user// backend/routes/docRoutes.js
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Use 'id' or 'user_id' based on your actual column name in image_bbad81.png
    const [rows] = await db.execute(
      'SELECT * FROM documents WHERE user_id = ? ORDER BY submitted_at DESC', 
      [userId]
    );

    console.log(`Sending ${rows.length} docs to Frontend for User: ${userId}`);
    res.json(rows);
  } catch (error) {
    console.error("GET DOCS ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Route to update document status and move to next level
router.put('/update-status/:id', async (req, res) => {
  const { id } = req.params;
  const { status, nextLevel } = req.body;

  try {
    const sql = 'UPDATE documents SET status = ?, current_level = ? WHERE id = ?';
    await db.execute(sql, [status, nextLevel, id]);
    res.json({ message: "Document updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to get documents pending for a specific level
// backend/routes/docRoutes.js

// Fetch documents pending for a specific level
router.get('/pending/:level', async (req, res) => {
  try {
    const { level } = req.params;
    // We select based on the level passed from the frontend (e.g., 'L1')
    const [rows] = await db.execute(
      'SELECT * FROM documents WHERE current_level = ? AND status = "PENDING"', 
      [level]
    );
    res.json(rows);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});
// Fetch documents already processed by this level
// Fetch history of decisions for a specific level
router.get('/history/:level', async (req, res) => {
  try {
    const { level } = req.params;
    // This looks for documents that were at this level but have been approved/rejected
    // Adjust logic if you use a separate history table, otherwise this filters the docs table
    const [rows] = await db.execute(
      'SELECT * FROM documents WHERE (current_level != ? OR status != "PENDING") AND status != "DRAFT"', 
      [level]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// backend/routes/adminRoutes.js (or added to docRoutes.js)

// Get ALL users for the directory
router.get('/api/admin/users', async (req, res) => {
  try {
      // Fetches every user registered in the system
      const [users] = await db.execute('SELECT id, username, role, approval_level, created_at FROM users');
      res.json(users);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// Get ALL documents for global stats (Pending, Approved, Rejected)
router.get('/api/admin/documents', async (req, res) => {
  try {
      // Fetches every document ever uploaded
      const [docs] = await db.execute('SELECT * FROM documents ORDER BY submitted_at DESC');
      res.json(docs);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// DELETE USER ROUTE
router.delete('/admin/users/:id', async (req, res) => {
  try {
      const userId = req.params.id;
      // This will delete the user and their associated documents if you have ON DELETE CASCADE set up in MySQL
      await db.execute('DELETE FROM users WHERE id = ?', [userId]);
      res.json({ message: "User deleted successfully" });
  } catch (err) {
      res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;