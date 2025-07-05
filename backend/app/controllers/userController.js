const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET;

// 🔐 Enregistrer un nouvel utilisateur
exports.register = async (req, res) => {
  const { email, username, password } = req.body;

  // Vérification des champs
  if (!email || !username || !password) {
    return res.status(400).json({ error: 'Champs manquants.' });
  }

  try {
    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Création dans la base de données
    const [result] = await User.create(email, username, hashedPassword);

    // Réponse
    res.status(201).json({
      id: result.insertId,
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

    // Vérifie le mot de passe
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }

    // Génère un token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: err.sqlMessage });
  }
};

// 👤 Récupérer le profil utilisateur connecté
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

// ✏️ Modifier le profil utilisateur
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const imageFilename = req.file ? req.file.filename : null;

  const { email, username, password } = req.body;

  if (!email && !username && !password && !imageFilename) {
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

    if (imageFilename) {
      fields.push('image = ?');
      values.push(imageFilename);
    }

    if (password) {
      const hashed = await bcrypt.hash(password, saltRounds);
      fields.push('password = ?');
      values.push(hashed);
    }

    await User.update(userId, fields, values);

    res.json({ message: 'Profil mis à jour.' });

  } catch (err) {
    const status = err.code === 'ER_DUP_ENTRY' ? 409 : 500;
    res.status(status).json({ error: err.sqlMessage });
  }
};
