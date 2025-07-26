const Comment = require('../models/Comment');

exports.createComment = async (req, res) => {
  const { video_id, content } = req.body;
  const user_id = req.user.id;

  if (!video_id || !content) {
    return res.status(400).json({ error: 'Champs requis manquants.' });
  }

  try {
    await Comment.create(user_id, video_id, content);
    res.status(201).json({ message: 'Commentaire créé.' });
  } catch (err) {
    res.status(500).json({ error: err.sqlMessage });
  }
};

exports.updateComment = async (req, res) => {
  const { content } = req.body;
  const id_comment = req.params.id;
  const user_id = req.user.id;

  if (!content) {
    return res.status(400).json({ error: 'Contenu requis.' });
  }

  try {
    const [result] = await Comment.update(id_comment, user_id, content);
    if (result.affectedRows === 0) {
      return res.status(403).json({ error: 'Modification non autorisée.' });
    }
    res.json({ message: 'Commentaire modifié.' });
  } catch (err) {
    res.status(500).json({ error: err.sqlMessage });
  }
};

exports.deleteComment = async (req, res) => {
  const id_comment = req.params.id;
  const user_id = req.user.id;

  try {
    const [result] = await Comment.delete(id_comment, user_id);
    if (result.affectedRows === 0) {
      return res.status(403).json({ error: 'Suppression non autorisée.' });
    }
    res.json({ message: 'Commentaire supprimé.' });
  } catch (err) {
    res.status(500).json({ error: err.sqlMessage });
  }
};

exports.getComments = async (req, res) => {
  const { id } = req.params;

  try {
    const [comments] = await Comment.getByVideoId(id);
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: err.sqlMessage });
  }
};
