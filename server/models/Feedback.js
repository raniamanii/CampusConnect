const mongoose = require('mongoose');
const feedbackSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }, // Event 1 -> N Feedback
  auteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  note: { type: Number, required: true, min: 1, max: 5 },
  commentaire: { type: String, required: true, maxlength: 500 },
}, { timestamps: true });
feedbackSchema.index({ event: 1, auteur: 1 }, { unique: true }); // un seul avis par étudiant et par événement
module.exports = mongoose.model('Feedback', feedbackSchema);
