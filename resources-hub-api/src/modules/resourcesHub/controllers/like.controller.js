import ResourcesLike from '../models/ResourcesLike.model.js';

export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    const existing = await ResourcesLike.findOne({ postId, userId });
    if (existing) {
      await ResourcesLike.findByIdAndDelete(existing._id);
      return res.json({ success: true, liked: false, message: 'Unliked' });
    }
    await ResourcesLike.create({ postId, userId });
    res.json({ success: true, liked: true, message: 'Liked' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
