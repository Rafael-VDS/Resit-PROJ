const Subscription = require('../models/Subscription');

exports.createSubscription = async (req, res) => {
  const { id_channel } = req.body;
  const id_user = req.user.id;

  if (!id_channel)
    return res.status(400).json({ error: 'id_channel manquant.' });

  try {
    await Subscription.create(id_user, id_channel);
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
  const { id_channel } = req.body;

  if (!id_channel)
    return res.status(400).json({ error: 'id_channel manquant.' });

  try {
    await Subscription.update(id_subscription, id_channel);
    return res.json({ message: 'Abonnement mis à jour.' });
  } catch (err) {
    return res.status(500).json({ error: err.sqlMessage });
  }
};

exports.deleteSubscription = async (req, res) => {
  const id_subscription = req.params.id;

  try {
    await Subscription.delete(id_subscription);
    return res.json({ message: 'Abonnement supprimé.' });
  } catch (err) {
    return res.status(500).json({ error: err.sqlMessage });
  }
};
