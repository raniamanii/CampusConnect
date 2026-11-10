const router = require('express').Router();
const Event = require('../models/Event');
const Feedback = require('../models/Feedback');
const { protect, restrictTo } = require('../middleware/protect');

const fail = (res, e) => res.status(e.name === 'CastError' ? 404 : 500).json({ message: e.name === 'CastError' ? 'Introuvable' : e.message });
const populateOrg = q => q.populate('organisateur', 'nom role');

// ajoute note moyenne + nombre d'avis à chaque événement
async function withRatings(events) {
  const stats = await Feedback.aggregate([
    { $match: { event: { $in: events.map(e => e._id) } } },
    { $group: { _id: '$event', moyenne: { $avg: '$note' }, nb: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(stats.map(s => [s._id, s]));
  return events.map(e => ({ ...e.toObject(), moyenne: map[e._id] ? +map[e._id].moyenne.toFixed(1) : null, nbAvis: map[e._id]?.nb || 0 }));
}

router.get('/', async (req, res) => {
  try {
    const { q, categorie, tri } = req.query;
    const f = { statut: 'publie' };
    if (categorie && categorie !== 'Tous') f.categorie = categorie;
    if (q) { const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); f.$or = [{ titre: rx }, { description: rx }, { tags: rx }]; }
    const events = await populateOrg(Event.find(f).sort(tri === 'recent' ? { createdAt: -1 } : { date: 1 }));
    res.json(await withRatings(events));
  } catch (e) { fail(res, e); }
});

router.get('/mes-inscriptions', protect, async (req, res) => {
  try { res.json(await withRatings(await populateOrg(Event.find({ inscrits: req.user._id }).sort({ date: 1 })))); }
  catch (e) { fail(res, e); }
});

router.get('/en-attente', protect, restrictTo('admin'), async (req, res) => {
  try { res.json(await populateOrg(Event.find({ statut: 'en_attente' }).sort({ createdAt: -1 }))); }
  catch (e) { fail(res, e); }
});

router.get('/:id', async (req, res) => {
  try {
    const e = await populateOrg(Event.findById(req.params.id));
    if (!e) return res.status(404).json({ message: 'Événement introuvable' });
    res.json((await withRatings([e]))[0]);
  } catch (e) { fail(res, e); }
});

router.post('/', protect, restrictTo('club', 'admin'), async (req, res) => {
  try {
    const { titre, description, categorie, niveau, date, heureDebut, heureFin, lieu, capacite, tags } = req.body;
    const ev = await Event.create({
      titre, description, categorie, niveau, date, heureDebut, heureFin, lieu, capacite, tags,
      organisateur: req.user._id,
      statut: req.user.role === 'admin' ? 'publie' : 'en_attente',
    });
    res.status(201).json(ev);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.patch('/:id/valider', protect, restrictTo('admin'), async (req, res) => {
  try {
    const ev = await Event.findByIdAndUpdate(req.params.id, { statut: 'publie' }, { new: true });
    if (!ev) return res.status(404).json({ message: 'Événement introuvable' });
    res.json(ev);
  } catch (e) { fail(res, e); }
});

router.post('/:id/inscription', protect, async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev || ev.statut !== 'publie') return res.status(404).json({ message: 'Événement introuvable' });
    if (ev.inscrits.some(u => u.equals(req.user._id))) return res.status(400).json({ message: 'Déjà inscrit' });
    if (ev.inscrits.length >= ev.capacite) return res.status(400).json({ message: 'Événement complet' });
    ev.inscrits.push(req.user._id);
    await ev.save();
    res.status(201).json({ inscrits: ev.inscrits });
  } catch (e) { fail(res, e); }
});

router.delete('/:id/inscription', protect, async (req, res) => {
  try {
    const ev = await Event.findByIdAndUpdate(req.params.id, { $pull: { inscrits: req.user._id } }, { new: true });
    if (!ev) return res.status(404).json({ message: 'Événement introuvable' });
    res.json({ inscrits: ev.inscrits });
  } catch (e) { fail(res, e); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: 'Événement introuvable' });
    if (req.user.role !== 'admin' && !ev.organisateur.equals(req.user._id)) return res.status(403).json({ message: 'Accès refusé' });
    await Feedback.deleteMany({ event: ev._id });
    await ev.deleteOne();
    res.json({ message: 'Événement supprimé' });
  } catch (e) { fail(res, e); }
});
module.exports = router;
