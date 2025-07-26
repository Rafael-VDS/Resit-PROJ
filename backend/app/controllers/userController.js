const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Playlist = require('../models/Playlist');
const pool = require('../database/db');

const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET;

// 🔐 Enregistrer un nouvel utilisateur
exports.register = async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: 'Champs manquants.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const [result] = await User.create(email, username, hashedPassword);
    
    // Créer automatiquement la playlist "À regarder plus tard"
    const userId = result.insertId;
    await Playlist.createWatchLaterPlaylist(userId);

    res.status(201).json({
      id: userId,
      email,
      username
    });
  } catch (err) {
    const status = err.code === 'ER_DUP_ENTRY' ? 409 : 500;
    res.status(status).json({ error: err.sqlMessage });
  }
};

// 🔓 Connexion d’un utilisateur
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Champs manquants.' });
  }

  try {
    const [rows] = await User.findByEmail(email);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Email inconnu.' });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.sqlMessage });
  }
};

// 👤 Récupérer le profil utilisateur
exports.getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await User.findById(userId);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.sqlMessage });
  }
};

// 👤 Récupérer un utilisateur par username
exports.getUserByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    const [rows] = await User.findByUsername(username);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.sqlMessage });
  }
};

// ✏️ Modifier le profil utilisateur
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const profileImageFilename = req.file ? req.file.filename : null;
  const { email, username, password, description } = req.body;

  if (!email && !username && !password && !profileImageFilename && description === undefined) {
    return res.status(400).json({ error: 'Rien à mettre à jour.' });
  }

  try {
    const fields = [];
    const values = [];

    if (email) {
      fields.push('email = ?');
      values.push(email);
    }

    if (username) {
      fields.push('username = ?');
      values.push(username);
    }

    if (description !== undefined) {
      fields.push('description = ?');
      values.push(description);
    }

    if (profileImageFilename) {
      fields.push('image = ?'); // Utiliser 'image' au lieu de 'profile_image'
      values.push(profileImageFilename);
    }

    if (password) {
      const hashed = await bcrypt.hash(password, saltRounds);
      fields.push('password = ?');
      values.push(hashed);
    }

    await User.update(userId, fields, values);
    
    // Récupérer les données mises à jour pour les retourner
    const [updatedUser] = await User.findById(userId);
    
    res.json({ 
      message: 'Profil mis à jour.',
      image: updatedUser[0].image // Retourner 'image' au lieu de 'profile_image'
    });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du profil:', err);
    const status = err.code === 'ER_DUP_ENTRY' ? 409 : 500;
    res.status(status).json({ error: err.sqlMessage || 'Erreur serveur' });
  }
};

// 🔐 Vérifier le mot de passe actuel
exports.verifyPassword = async (req, res) => {
  const userId = req.user.id;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Mot de passe requis.' });
  }

  try {
    // Récupérer l'utilisateur avec le mot de passe hashé
    const [rows] = await pool.query('SELECT password FROM Users WHERE id = ?', [userId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }

    res.json({ message: 'Mot de passe vérifié.' });
  } catch (err) {
    console.error('Erreur lors de la vérification du mot de passe:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// 🔑 Changer le mot de passe
exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: 'Nouveau mot de passe requis.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await User.update(userId, ['password = ?'], [hashedPassword]);
    
    res.json({ message: 'Mot de passe modifié avec succès.' });
  } catch (err) {
    console.error('Erreur lors du changement de mot de passe:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// ❌ Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  const userId = req.user.id;
  try {
    await User.delete(userId);
    res.json({ message: 'Utilisateur supprimé.' });
  } catch (err) {
    res.status(500).json({ error: err.sqlMessage });
  }
};
