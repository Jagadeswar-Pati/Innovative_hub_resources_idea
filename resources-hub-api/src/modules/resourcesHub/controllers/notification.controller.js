import ResourcesNotification from '../models/ResourcesNotification.model.js';

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await ResourcesNotification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('actorId', 'name username avatarUrl')
      .lean();

    const unreadCount = await ResourcesNotification.countDocuments({
      userId: req.user._id,
      read: false,
    });

    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markRead = async (req, res) => {
  try {
    const notification = await ResourcesNotification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    )
      .populate('actorId', 'name username avatarUrl')
      .lean();

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await ResourcesNotification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
