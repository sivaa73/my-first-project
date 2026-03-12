const db = require('../config/db');

const Document = {
  create: async (userId, fileName, fileUrl) => {
    const [result] = await db.execute(
      'INSERT INTO documents (user_id, file_name, file_url) VALUES (?, ?, ?)',
      [userId, fileName, fileUrl]
    );
    return result;
  },
  
  getForUser: async (userId) => {
    const [rows] = await db.execute('SELECT * FROM documents WHERE user_id = ?', [userId]);
    return rows;
  }
};

module.exports = Document;