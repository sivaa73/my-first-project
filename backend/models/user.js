const db = require('../config/db');

const User = {
  // Find a user by username to check login
  findByUsername: async (username) => {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  },

  // Get all users (For the Admin Page)
  getAll: async () => {
    const [rows] = await db.execute('SELECT id, username, role, approval_level FROM users');
    return rows;
  }
};

module.exports = User;