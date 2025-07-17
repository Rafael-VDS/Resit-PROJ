const Like = require('../models/Like');

exports.likeVideo = async (req, res) => {
  const id_user = req.user.id;
  const { id_video } = req.body;

  if (!id_video)
    return res.status(400).json({ error: 'id_video manquant.' });

  try {
    await Like.create(id_user, id_video);
    return res.status(201).json({ message: 'Vidéo likée.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Vidéo déjà likée.' });
    }
    return res.status(500).json({ error: err.sqlMessage });
  }
};

exports.unlikeVideo = async (req, res) => {
  const id_user = req.user.id;
  const id_video = req.params.id_video;

  try {
    await Like.delete(id_user, id_video);
    return res.json({ message: 'Like supprimé.' });
  } catch (err) {
    return res.status(500).json({ error: err.sqlMessage });
  }
};

exports.countLikes = async (req, res) => {
  const id_video = req.params.id_video;

  try {
    const [rows] = await Like.countByVideo(id_video);
    return res.json({ totalLikes: rows[0].totalLikes });
  } catch (err) {
    return res.status(500).json({ error: err.sqlMessage });
  }
};

exports.userHasLiked = async (req, res) => {
  const id_user = req.user.id;
  const id_video = req.params.id_video;

  try {
    const [rows] = await Like.getUserLike(id_user, id_video);
    return res.json({ liked: rows.length > 0 });
  } catch (err) {
    return res.status(500).json({ error: err.sqlMessage });
  }
};