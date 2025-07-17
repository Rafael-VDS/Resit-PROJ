const Hashtag = require('../models/Hashtag');

exports.createHashtag = async (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: 'Nom requis.' });

  try {
    await Hashtag.create(name);
    res.status(201).json({ message: 'Hashtag créé.' });
  } catch (err) {
    res.status(err.code === 'ER_DUP_ENTRY' ? 409 : 500).json({ error: err.sqlMessage });
  }
};

exports.updateHashtag = async (req, res) => {
  const { name } = req.body;
  const id = req.params.id;

  if (!name) return res.status(400).json({ error: 'Nom requis.' });

  try {
    const [result] = await Hashtag.update(id, name);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hashtag introuvable.' });
    }
    res.json({ message: 'Hashtag modifié.' });
  } catch (err) {
    res.status(500).json({ error: err.sqlMessage });
  }
};

exports.deleteHashtag = async (req, res) => {
  const id = req.params.id;

  try {
    const [result] = await Hashtag.delete(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hashtag introuvable.' });
    }
    res.json({ message: 'Hashtag supprimé.' });
  } catch (err) {
    res.status(500).json({ error: err.sqlMessage });
  }
};
