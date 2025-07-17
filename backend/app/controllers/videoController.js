const Video = require('../models/Video');

const normalizeBoolean = (value) => {
  return value === true || value === 'true' || value === 1 || value === '1';
};

// 🔸 Créer une vidéo
exports.createVideo = async (req, res) => {
  console.log("🟡 Body :", req.body);
  console.log("🟡 Fichiers :", req.files);
  console.log("🟡 Utilisateur :", req.user);

  const { title, description, is_public } = req.body;
  const file = req.files?.file?.[0];

  if (!title || !file) {
    console.log("🔴 Champs manquants :", { title, file });
    return res.status(400).json({ error: 'Champs obligatoires manquants.' });
  }

  try {
    const isPublic = normalizeBoolean(is_public) ? 1 : 0;

    const data = {
      user_id: req.user.id,
      title,
      description: description || '',
      video_url: file.filename,
      thumbnail_url: req.files?.thumbnail?.[0]?.filename || null,
      is_public: isPublic
    };

    console.log("🟢 Données insérées :", data);

    await Video.create(data);
    return res.status(201).json({ message: 'Vidéo ajoutée.' });
  } catch (err) {
    console.log("❌ Erreur SQL :", err);
    return res.status(500).json({ error: err.sqlMessage });
  }
};

// 🔸 Modifier une vidéo
exports.updateVideo = async (req, res) => {
  const id_video = req.params.id;
  const { title, description, is_public } = req.body;

  console.log("🟡 Requête MAJ vidéo :", req.body);
  console.log("🟡 Fichiers :", req.files);

  try {
    const fields = [];
    const values = [];

    if (title) {
      fields.push('title = ?');
      values.push(title);
    }

    if (description) {
      fields.push('description = ?');
      values.push(description);
    }

    if (is_public !== undefined) {
      const isPublic = normalizeBoolean(is_public) ? 1 : 0;
      fields.push('is_public = ?');
      values.push(isPublic);
    }

    const newVideo = req.files?.file?.[0];
    const newThumbnail = req.files?.thumbnail?.[0];

    if (newVideo) {
      fields.push('video_url = ?');
      values.push(newVideo.filename);
    }

    if (newThumbnail) {
      fields.push('thumbnail_url = ?');
      values.push(newThumbnail.filename);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour.' });
    }

    await Video.update(id_video, fields, values);
    return res.json({ message: 'Vidéo modifiée.' });
  } catch (err) {
    console.log("❌ Erreur update :", err);
    return res.status(500).json({ error: err.sqlMessage });
  }
};

// 🔸 Supprimer une vidéo
exports.deleteVideo = async (req, res) => {
  const id_video = req.params.id;

  try {
    await Video.delete(id_video);
    return res.json({ message: 'Vidéo supprimée.' });
  } catch (err) {
    console.error("❌ Erreur suppression :", err);
    return res.status(500).json({ error: err.sqlMessage });
  }
};

// 🔸 Récupérer une vidéo par ID
exports.getVideoById = async (req, res) => {
  const id_video = req.params.id;

  try {
    const [rows] = await Video.getById(id_video);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Vidéo non trouvée.' });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("❌ Erreur getVideoById :", err);
    return res.status(500).json({ error: err.message });
  }
};

// 🔸 Récupérer les 10 dernières vidéos publiques
exports.getPublicVideo = async (req, res) => {
  try {
    const [videos] = await Video.getLatestPublic(9); // méthode à créer dans le modèle
    return res.json(videos);
  } catch (err) {
    console.error("❌ Erreur getPublicVideo :", err);
    return res.status(500).json({ error: err.message });
  }
};

// 🔸 Récupérer les 10 dernières vidéos privées de l'utilisateur
exports.getPrivateVideo = async (req, res) => {
  try {
    const userId = req.user.id;
    const [videos] = await Video.getLatestPrivateByUser(userId, 9); // méthode à créer aussi
    return res.json(videos);
  } catch (err) {
    console.error("❌ Erreur getPrivateVideo :", err);
    return res.status(500).json({ error: err.message });
  }
};