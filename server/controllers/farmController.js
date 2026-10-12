const crypto = require('crypto');
const FarmProfile = require('../models/FarmProfile');

const makeCode = (username = 'farm') => `${String(username).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 18) || 'farm'}-${crypto.randomBytes(3).toString('hex')}`;

exports.publishFarm = async (req, res) => {
  try {
    const snapshot = req.body?.snapshot;
    if (!snapshot || typeof snapshot !== 'object') return res.status(400).json({ message: 'A farm snapshot is required' });
    if (JSON.stringify(snapshot).length > 50000) return res.status(413).json({ message: 'Farm snapshot is too large' });
    let profile = await FarmProfile.findOne({ owner: req.user._id });
    if (!profile) profile = await FarmProfile.create({ owner: req.user._id, visitCode: makeCode(req.user.username), snapshot });
    else { profile.snapshot = snapshot; await profile.save(); }
    return res.json({ visitCode: profile.visitCode, reactions: profile.reactions, updatedAt: profile.updatedAt });
  } catch (error) {
    console.error('Could not publish farm', error);
    return res.status(500).json({ message: 'Could not publish farm' });
  }
};

exports.visitFarm = async (req, res) => {
  try {
    const profile = await FarmProfile.findOne({ visitCode: req.params.visitCode }).populate('owner', 'username');
    if (!profile) return res.status(404).json({ message: 'Farm not found' });
    return res.json({ visitCode: profile.visitCode, ownerName: profile.owner?.username || 'A focused friend', snapshot: profile.snapshot, reactions: profile.reactions, updatedAt: profile.updatedAt });
  } catch (error) {
    console.error('Could not load farm', error);
    return res.status(500).json({ message: 'Could not load farm' });
  }
};

exports.reactToFarm = async (req, res) => {
  try {
    const reaction = req.body?.reaction;
    if (!['cozy', 'beautiful', 'growing'].includes(reaction)) return res.status(400).json({ message: 'Invalid reaction' });
    const profile = await FarmProfile.findOneAndUpdate({ visitCode: req.params.visitCode }, { $inc: { [`reactions.${reaction}`]: 1 } }, { new: true });
    if (!profile) return res.status(404).json({ message: 'Farm not found' });
    return res.json({ reactions: profile.reactions });
  } catch (error) {
    console.error('Could not react to farm', error);
    return res.status(500).json({ message: 'Could not react to farm' });
  }
};
