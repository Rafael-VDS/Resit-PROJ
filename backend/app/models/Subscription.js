const pool = require('../database/db');

const Subscription = {
  create: (id_user, id_channel) => {
    const sql = `
      INSERT INTO Subscriptions (id_user, id_channel)
      VALUES (?, ?)
    `;
    return pool.query(sql, [id_user, id_channel]);
  },

  update: (id_subscription, id_channel) => {
    const sql = `UPDATE Subscriptions SET id_channel = ? WHERE id_subscription = ?`;
    return pool.query(sql, [id_channel, id_subscription]);
  },

  delete: (id_subscription) => {
    const sql = `DELETE FROM Subscriptions WHERE id_subscription = ?`;
    return pool.query(sql, [id_subscription]);
  }
};

module.exports = Subscription;
