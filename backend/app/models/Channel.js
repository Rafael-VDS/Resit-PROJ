const pool = require('../database/db');

const Channel = {
  create: (name, description, image, id_user) => {
    const sql = 'INSERT INTO Channels (name, description, image, id_user) VALUES (?, ?, ?, ?)';
    return pool.query(sql, [name, description, image, id_user]);
  },

  update: (id, fields, values) => {
    const sql = `UPDATE Channels SET ${fields.join(', ')} WHERE id = ?`;
    return pool.query(sql, [...values, id]);
  },

  delete: (id) => {
    const sql = 'DELETE FROM Channels WHERE id = ?';
    return pool.query(sql, [id]);
  },

  getByUser: (id_user) => {
    const sql = 'SELECT * FROM Channels WHERE id_user = ?';
    return pool.query(sql, [id_user]);
  }
};

module.exports = Channel;
