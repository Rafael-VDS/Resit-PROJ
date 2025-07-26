const Subscription = require('../models/Subscription');

exports.createSubscription = async (req, res) => {
  const { channel_id } = req.body;
  const user_id = req.user.id;

  if (!channel_id)
    return res.status(400).json({ error: 'channel_id manquant.' });

  // Empêcher de s'abonner à soi-même
  if (user_id == channel_id) {
    return res.status(400).json({ error: 'Vous ne pouvez pas vous abonner à votre propre chaîne.' });
  }

  try {
    await Subscription.create(user_id, channel_id);
    return res.status(201).json({ message: 'Abonnement créé.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Déjà abonné à cette chaîne.' });
    }
    return res.status(500).json({ error: err.sqlMessage });
  }
};

exports.updateSubscription = async (req, res) => {
  const id_subscription = req.params.id;
  const { channel_id } = req.body;

  if (!channel_id)
    return res.status(400).json({ error: 'channel_id manquant.' });

  try {
    await Subscription.update(id_subscription, channel_id);
    return res.json({ message: 'Abonnement mis à jour.' });
  } catch (err) {
    return res.status(500).json({ error: err.sqlMessage });
  }
};

exports.deleteSubscription = async (req, res) => {
  const channel_id = req.params.channel_id;
  const user_id = req.user.id;

  try {
    await Subscription.deleteByUserAndChannel(user_id, channel_id);
    return res.json({ message: 'Désabonnement effectué.' });
  } catch (err) {
    return res.status(500).json({ error: err.sqlMessage });
  }
};

exports.getUserSubscriptions = async (req, res) => {
  const user_id = req.user.id;

  try {
    const [rows] = await Subscription.getAllByUser(user_id);
    return res.json(rows);
  } catch (err) {
    console.error('Erreur getUserSubscriptions:', err);
    return res.status(500).json({ error: err.sqlMessage || err.message });
  }
};

exports.getSubscriptionStatus = async (req, res) => {
  const channel_id = req.params.channel_id;
  const user_id = req.user.id;

  try {
    const [rows] = await Subscription.getByUserAndChannel(user_id, channel_id);
    return res.json({ isSubscribed: rows.length > 0 });
  } catch (err) {
    console.error('Erreur getSubscriptionStatus:', err);
    return res.status(500).json({ error: err.sqlMessage || err.message });
  }
};

exports.getSubscribersCount = async (req, res) => {
  const channel_id = req.params.channel_id;

  try {
    const [rows] = await Subscription.getSubscribersCount(channel_id);
    return res.json({ count: rows[0].count });
  } catch (err) {
    console.error('Erreur getSubscribersCount:', err);
    return res.status(500).json({ error: err.sqlMessage || err.message });
  }
};
