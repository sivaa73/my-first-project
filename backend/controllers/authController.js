const db = require('../config/db');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Log the attempt in your terminal so you can see it's working
    console.log("Login attempt for:", username);

    // 2. Query your 'users' table. 
    // Ensure your table actually has 'username' and 'password' columns
    const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);

    if (users.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = users[0];

    // 3. Simple password check (assuming plain text in DB for now)
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // 4. Send back the data. 
    // In image_bbad81.png, your primary key is 'id'. 
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id, 
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    // This will print the exact reason for the 'Server Error' in your VS Code terminal
    console.error("LOGIN DATABASE ERROR:", error.message);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};