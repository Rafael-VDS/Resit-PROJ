const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'changeme';

// 🔐 Middleware pour vérifier le token d'authentification
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Vérifie que le header Authorization existe et commence par "Bearer"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant.' });
  }

  // Récupère le token sans "Bearer "
  const token = authHeader.split(' ')[1];

  try {
    // Vérifie le token avec le secret
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload; // Ajoute les infos du user dans la requête
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token invalide.' });
  }
};
