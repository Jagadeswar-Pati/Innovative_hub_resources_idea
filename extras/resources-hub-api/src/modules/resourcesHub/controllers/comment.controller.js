import ResourcesComment from '../models/ResourcesComment.model.js';

export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Content required' });
    }
    const comment = await ResourcesComment.create({
      postId,
      userId: req.user._id,
      content: content.trim(),
    });
    const populated = await comment.populate('userId', 'name email role avatarUrl');
    res.status(201).json({ success: true, comment: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const comments = await ResourcesComment.find({ postId: req.params.postId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email role avatarUrl')
      .lean();
    res.json({ success: true, comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
