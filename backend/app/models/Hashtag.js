const pool = require('../database/db');

const Hashtag = {
  create: (name) => {
    const sql = 'INSERT INTO Hashtags (name) VALUES (?)';
    return pool.query(sql, [name]);
  },

  update: (id, name) => {
    const sql = 'UPDATE Hashtags SET name = ? WHERE id_hashtag = ?';
    return pool.query(sql, [name, id]);
  },

  delete: (id) => {
    const sql = 'DELETE FROM Hashtags WHERE id_hashtag = ?';
    return pool.query(sql, [id]);
  }
};

module.exports = Hashtag;
