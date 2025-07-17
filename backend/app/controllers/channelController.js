const Channel = require('../models/Channel');

exports.createChannel = async (req, res) => {
  const { name, description } = req.body;
  const image = req.file ? req.file.filename : null;
  const id_user = req.user.id;

  if (!name) return res.status(400).json({ error: 'Nom requis.' });

  try {
    const [result] = await Channel.create(name, description, image, id_user);
    return res.status(201).json({ message: 'Chaîne créée.', id: result.insertId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.updateChannel = async (req, res) => {
  const { name, description } = req.body;
  const image = req.file ? req.file.filename : null;
  const id = req.params.id;

  const fields = [];
  const values = [];

  if (name) { fields.push('name = ?'); values.push(name); }
  if (description) { fields.push('description = ?'); values.push(description); }
  if (image) { fields.push('image = ?'); values.push(image); }

  if (fields.length === 0)
    return res.status(400).json({ error: 'Aucune donnée à modifier.' });

  try {
    await Channel.update(id, fields, values);
    return res.json({ message: 'Chaîne mise à jour.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.deleteChannel = async (req, res) => {
  const id = req.params.id;
  try {
    await Channel.delete(id);
    return res.json({ message: 'Chaîne supprimée.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
