const express = require('express');
const router = express.Router();
const db = require('../config/db'); // <--- CRITICAL: You must add this line!

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      // Searching the users table for the specific username
      const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
      const user = users[0];
  
      if (user && user.password === password) {
        // This sends all data including 'L1' or 'USER' to the frontend
        res.json({ 
          id: user.id, 
          username: user.username, 
          role: user.role, 
          approval_level: user.approval_level 
        });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (err) {
      console.error("Login Error:", err.message);
      res.status(500).json({ error: err.message });
    }
});

module.exports = router;