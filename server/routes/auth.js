const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/protect');

const sign = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const out = u => ({ _id: u._id, nom: u.nom, email: u.email, role: u.role });

router.post('/register', async (req, res) => {
  try {
    const { nom, email, motDePasse, role } = req.body;
    if (!nom || !email || !motDePasse || motDePasse.length < 6)
      return res.status(400).json({ message: 'Nom, email et mot de passe (6 caractères min.) requis' });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    const hash = await bcrypt.hash(motDePasse, 10);
    const user = await User.create({ nom, email, motDePasse: hash, role: role === 'club' ? 'club' : 'etudiant' });
    res.status(201).json({ token: sign(user._id), user: out(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
    if (!user || !(await bcrypt.compare(req.body.motDePasse || '', user.motDePasse)))
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    res.json({ token: sign(user._id), user: out(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/me', protect, (req, res) => res.json(out(req.user)));
module.exports = router;
