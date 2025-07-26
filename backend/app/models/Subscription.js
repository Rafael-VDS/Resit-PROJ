const pool = require('../database/db');

const Subscription = {
  create: (user_id, channel_id) => {
    const sql = `
      INSERT INTO Subscriptions (user_id, channel_id)
      VALUES (?, ?)
    `;
    return pool.query(sql, [user_id, channel_id]);
  },

  update: (id_subscription, channel_id) => {
    const sql = `UPDATE Subscriptions SET channel_id = ? WHERE id = ?`;
    return pool.query(sql, [channel_id, id_subscription]);
  },

  delete: (id_subscription) => {
    const sql = `DELETE FROM Subscriptions WHERE id = ?`;
    return pool.query(sql, [id_subscription]);
  },

  deleteByUserAndChannel: (user_id, channel_id) => {
    const sql = `DELETE FROM Subscriptions WHERE user_id = ? AND channel_id = ?`;
    return pool.query(sql, [user_id, channel_id]);
  },

  getAllByUser: (user_id) => {
    const sql = `
      SELECT S.id, S.user_id, S.channel_id, S.subscribed_at,
             U.username, U.description, U.image
      FROM Subscriptions S
      JOIN Users U ON S.channel_id = U.id
      WHERE S.user_id = ?
      ORDER BY S.subscribed_at DESC
    `;
    return pool.query(sql, [user_id]);
  },

  getByUserAndChannel: (user_id, channel_id) => {
    const sql = `
      SELECT * FROM Subscriptions 
      WHERE user_id = ? AND channel_id = ?
    `;
    return pool.query(sql, [user_id, channel_id]);
  },

  getSubscribersCount: (channel_id) => {
    const sql = `
      SELECT COUNT(*) as count 
      FROM Subscriptions 
      WHERE channel_id = ?
    `;
    return pool.query(sql, [channel_id]);
  }
};

module.exports = Subscription;
