const mongoose = require('mongoose');

const FarmProfileSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  visitCode: { type: String, required: true, unique: true, index: true },
  snapshot: { type: mongoose.Schema.Types.Mixed, required: true, default: {} },
  reactions: {
    cozy: { type: Number, default: 0, min: 0 },
    beautiful: { type: Number, default: 0, min: 0 },
    growing: { type: Number, default: 0, min: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('FarmProfile', FarmProfileSchema);
