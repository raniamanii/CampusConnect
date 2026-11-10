// npm run seed : crée un admin, un club, un étudiant et des événements de démonstration
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Event = require('./models/Event');
const Feedback = require('./models/Feedback');

const day = n => new Date(Date.now() + n * 864e5);
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Event.deleteMany(), Feedback.deleteMany()]);
  const h = await bcrypt.hash('password123', 10);
  const [admin, club, etu] = await User.create([
    { nom: 'Administration', email: 'admin@campus.tn', motDePasse: h, role: 'admin' },
    { nom: 'Club Robotique', email: 'club@campus.tn', motDePasse: h, role: 'club' },
    { nom: 'Yasmine Ben Ali', email: 'etudiant@campus.tn', motDePasse: h, role: 'etudiant' },
  ]);
  const base = { statut: 'publie', organisateur: club._id };
  const evs = await Event.create([
    { ...base, titre: 'Atelier Blockchain & DApps', description: 'Les bases de la blockchain et création de votre première DApp.', categorie: 'Technologie', niveau: 'Intermédiaire', date: day(3), heureDebut: '10:00', heureFin: '16:00', lieu: 'Labo Info A', capacite: 50, tags: ['Blockchain', 'Web3'], inscrits: [etu._id] },
    { ...base, titre: 'Soirée culturelle', description: 'Danse, musique et expositions pour une soirée entre étudiants.', categorie: 'Culture', date: day(6), heureDebut: '18:00', heureFin: '22:00', lieu: 'Grand amphi', capacite: 200, tags: ['Musique', 'Art'] },
    { ...base, titre: 'Bootcamp IA & Machine Learning', description: 'Deux demi-journées pour entraîner un premier modèle avec Python.', categorie: 'Science', niveau: 'Avancé', date: day(9), heureDebut: '09:00', heureFin: '17:00', lieu: 'Salle 12', capacite: 40, tags: ['IA', 'Python'] },
    { ...base, titre: 'Forum Stages & Emplois', description: 'Rencontrez des recruteurs et déposez vos CV.', categorie: 'Carrière', date: day(14), heureDebut: '09:30', heureFin: '15:00', lieu: 'Hall principal', capacite: 300, tags: ['Stage', 'CV'] },
    { ...base, titre: 'Tournoi inter-départements', description: 'Football à 5 et basket, inscription par équipe.', categorie: 'Sport', date: day(18), heureDebut: '14:00', heureFin: '19:00', lieu: 'Complexe sportif', capacite: 120, tags: ['Football'] },
    { ...base, titre: 'Hackathon 24h (terminé)', description: '24 heures pour construire un prototype.', categorie: 'Technologie', date: day(-10), heureDebut: '09:00', heureFin: '18:00', lieu: 'Labo Info B', capacite: 60, tags: ['Code'], inscrits: [etu._id] },
  ]);
  await Feedback.create({ event: evs[5]._id, auteur: etu._id, note: 5, commentaire: 'Super ambiance et très bons mentors.' });
  console.log('Données de démo créées. Comptes : admin@campus.tn / club@campus.tn / etudiant@campus.tn (mot de passe : password123)');
  process.exit(0);
})();
