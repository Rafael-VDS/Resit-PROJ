const pool = require('../database/db');

const User = {
  // ➕ Insérer un nouvel utilisateur (chaîne = username)
  create: (email, username, hashedPassword) => {
    const sql = 'INSERT INTO Users (email, username, password) VALUES (?, ?, ?)';
    return pool.query(sql, [email, username, hashedPassword]);
  },

  // 🔍 Trouver un utilisateur par email
  findByEmail: (email) => {
    const sql = 'SELECT * FROM Users WHERE email = ?';
    return pool.query(sql, [email]);
  },

  // 🔍 Trouver un utilisateur par ID (inclut chaîne)
  findById: (id) => {
    const sql = `
      SELECT id, email, username, image, created_at, username AS channel_name
      FROM Users
      WHERE id = ?
    `;
    return pool.query(sql, [id]);
  },

  // ✏️ Mettre à jour un utilisateur
  update: (id, fields, values) => {
    const sql = `UPDATE Users SET ${fields.join(', ')} WHERE id = ?`;
    return pool.query(sql, [...values, id]);
  },

  // ❌ Supprimer un utilisateur
  delete: (id) => {
    const sql = 'DELETE FROM Users WHERE id = ?';
    return pool.query(sql, [id]);
  }
};

module.exports = User;
