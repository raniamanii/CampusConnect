const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  motDePasse: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['etudiant', 'club', 'admin'], default: 'etudiant' },
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);
