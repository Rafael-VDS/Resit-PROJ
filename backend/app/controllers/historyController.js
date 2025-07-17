const History = require('../models/History');

exports.addToHistory = async (req, res) => {
  const id_user = req.user.id;
  const { id_video } = req.body;

  if (!id_video)
    return res.status(400).json({ error: 'id_video manquant.' });

  try {
    await History.create(id_user, id_video);
    return res.status(201).json({ message: 'Ajouté à l’historique.' });
  } catch (err) {
    return res.status(500).json({ error: err.sqlMessage });
  }
};

exports.updateHistory = async (req, res) => {
  const id_history = req.params.id_history;
  const { id_video } = req.body;

  if (!id_video)
    return res.status(400).json({ error: 'id_video manquant.' });

  try {
    await History.update(id_history, id_video);
    return res.json({ message: 'Historique mis à jour.' });
  } catch (err) {
    return res.status(500).json({ error: err.sqlMessage });
  }
};

exports.deleteHistory = async (req, res) => {
  const id_user = req.user.id;
  const id_video = req.params.id_video;

  try {
    await History.delete(id_user, id_video);
    return res.json({ message: 'Historique supprimé.' });
  } catch (err) {
    return res.status(500).json({ error: err.sqlMessage });
  }
};

exports.getUserHistory = async (req, res) => {
  const id_user = req.user.id;

  try {
    const [rows] = await History.getAllByUser(id_user);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.sqlMessage });
  }
};
