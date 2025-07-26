const History = require('../models/History');

exports.addToHistory = async (req, res) => {
  const user_id = req.user.id;
  const { video_id } = req.body;

  if (!video_id)
    return res.status(400).json({ error: 'video_id manquant.' });

  try {
    await History.create(user_id, video_id);
    return res.status(201).json({ message: 'Ajoute a l historique.' });
  } catch (err) {
    console.error('Erreur addToHistory:', err);
    return res.status(500).json({ error: err.sqlMessage || err.message });
  }
};

exports.updateHistory = async (req, res) => {
  const id = req.params.id;
  const { video_id } = req.body;

  if (!video_id)
    return res.status(400).json({ error: 'video_id manquant.' });

  try {
    await History.update(id, video_id);
    return res.json({ message: 'Historique mis a jour.' });
  } catch (err) {
    console.error('Erreur updateHistory:', err);
    return res.status(500).json({ error: err.sqlMessage || err.message });
  }
};

exports.deleteHistory = async (req, res) => {
  const user_id = req.user.id;
  const video_id = req.params.video_id;

  try {
    await History.delete(user_id, video_id);
    return res.json({ message: 'Historique supprime.' });
  } catch (err) {
    console.error('Erreur deleteHistory:', err);
    return res.status(500).json({ error: err.sqlMessage || err.message });
  }
};

exports.getUserHistory = async (req, res) => {
  const user_id = req.user.id;

  try {
    const [rows] = await History.getAllByUser(user_id);
    return res.json(rows);
  } catch (err) {
    console.error('Erreur getUserHistory:', err);
    return res.status(500).json({ error: err.sqlMessage || err.message });
  }
};

exports.clearAllHistory = async (req, res) => {
  const user_id = req.user.id;

  try {
    await History.deleteAll(user_id);
    return res.json({ message: 'Tout l historique a ete supprime.' });
  } catch (err) {
    console.error('Erreur clearAllHistory:', err);
    return res.status(500).json({ error: err.sqlMessage || err.message });
  }
};
