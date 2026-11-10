const router = require('express').Router();
const Event = require('../models/Event');
const Feedback = require('../models/Feedback');
const { protect } = require('../middleware/protect');

router.get('/events/:id/feedback', async (req, res) => {
  try {
    res.json(await Feedback.find({ event: req.params.id }).populate('auteur', 'nom').sort({ createdAt: -1 }));
  } catch { res.status(404).json({ message: 'Introuvable' }); }
});

router.post('/events/:id/feedback', protect, async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: 'Événement introuvable' });
    if (!ev.inscrits.some(u => u.equals(req.user._id))) return res.status(403).json({ message: 'Seuls les inscrits peuvent donner un avis' });
    const fb = await Feedback.create({ event: ev._id, auteur: req.user._id, note: req.body.note, commentaire: req.body.commentaire });
    res.status(201).json(await fb.populate('auteur', 'nom'));
  } catch (e) {
    res.status(400).json({ message: e.code === 11000 ? 'Vous avez déjà donné votre avis' : e.message });
  }
});

router.delete('/feedback/:id', protect, async (req, res) => {
  try {
    const fb = await Feedback.findById(req.params.id);
    if (!fb) return res.status(404).json({ message: 'Avis introuvable' });
    if (req.user.role !== 'admin' && !fb.auteur.equals(req.user._id)) return res.status(403).json({ message: 'Accès refusé' });
    await fb.deleteOne();
    res.json({ message: 'Avis supprimé' });
  } catch { res.status(404).json({ message: 'Introuvable' }); }
});
module.exports = router;
