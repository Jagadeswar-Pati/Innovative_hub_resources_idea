import ResourcesCommunity from '../models/ResourcesCommunity.model.js';
import ResourcesCommunityMessage from '../models/ResourcesCommunityMessage.model.js';
import { createNotification } from '../services/notification.service.js';

const isCommunityAdmin = (community, userId) => {
  if (!community || !userId) return false;
  const uid = userId.toString();
  if (community.createdBy.toString() === uid) return true;
  return (community.adminIds || []).some((id) => id.toString() === uid);
};

export const listCommunities = async (req, res) => {
  try {
    const { publicOnly } = req.query;
    const query = {};
    if (publicOnly === 'true') query.isPublic = true;
    const communities = await ResourcesCommunity.find(query)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name avatarUrl')
      .populate('adminIds', 'name username avatarUrl')
      .populate('memberIds', 'name avatarUrl')
      .lean();
    const userId = req.user?._id?.toString();
    const withMember = communities.map((c) => ({
      ...c,
      isMember: userId ? c.memberIds?.some((m) => m._id.toString() === userId) : false,
    }));
    res.json({ success: true, communities: withMember });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCommunity = async (req, res) => {
  try {
    const community = await ResourcesCommunity.findById(req.params.id)
      .populate('createdBy', 'name username avatarUrl bio')
      .populate('adminIds', 'name username avatarUrl')
      .populate('memberIds', 'name username avatarUrl')
      .lean();
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });
    if (!community.isPublic && !req.user) {
      return res.status(403).json({ success: false, message: 'Private community' });
    }
    if (!community.isPublic && req.user) {
      const isMember = community.memberIds.some((m) => m._id.toString() === req.user._id.toString());
      if (!isMember && community.createdBy._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Join to view' });
      }
    }
    const isMember = req.user
      ? community.memberIds.some((m) => m._id.toString() === req.user._id.toString())
      : false;
    const isAdmin = req.user ? isCommunityAdmin(community, req.user._id) : false;
    res.json({ success: true, community: { ...community, isMember, isAdmin } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCommunity = async (req, res) => {
  try {
    const { name, description, isPublic = true } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Community name required' });
    const community = await ResourcesCommunity.create({
      name: name.trim(),
      description: (description || '').trim(),
      isPublic: !!isPublic,
      createdBy: req.user._id,
      adminIds: [req.user._id],
      memberIds: [req.user._id],
    });
    const populated = await ResourcesCommunity.findById(community._id)
      .populate('createdBy', 'name avatarUrl')
      .populate('adminIds', 'name username avatarUrl')
      .populate('memberIds', 'name avatarUrl')
      .lean();
    res.status(201).json({ success: true, community: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const joinCommunity = async (req, res) => {
  try {
    const community = await ResourcesCommunity.findById(req.params.id);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });
    if (!community.isPublic) return res.status(403).json({ success: false, message: 'Private community - invite only' });
    const userId = req.user._id;
    if (community.memberIds.some((m) => m.toString() === userId.toString())) {
      return res.json({ success: true, community, message: 'Already a member' });
    }
    community.memberIds.push(userId);
    await community.save();
    const populated = await ResourcesCommunity.findById(community._id)
      .populate('createdBy', 'name avatarUrl')
      .populate('adminIds', 'name username avatarUrl')
      .populate('memberIds', 'name avatarUrl')
      .lean();

    await createNotification({
      userId: community.createdBy,
      actorId: userId,
      type: 'community_update',
      title: 'New community member',
      message: `${req.user.name || 'A user'} joined ${community.name}.`,
      link: `/community/${community._id}`,
      metadata: { communityId: community._id, action: 'join' },
    });

    res.json({ success: true, community: populated, message: 'Joined community' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const leaveCommunity = async (req, res) => {
  try {
    const community = await ResourcesCommunity.findById(req.params.id);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });
    const userId = req.user._id;
    if (community.createdBy.toString() === userId.toString()) {
      return res.status(400).json({ success: false, message: 'Creator cannot leave' });
    }
    community.memberIds = community.memberIds.filter((m) => m.toString() !== userId.toString());
    await community.save();
    const populated = await ResourcesCommunity.findById(community._id)
      .populate('createdBy', 'name avatarUrl')
      .populate('adminIds', 'name username avatarUrl')
      .populate('memberIds', 'name avatarUrl')
      .lean();
    res.json({ success: true, community: populated, message: 'Left community' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCommunityMessages = async (req, res) => {
  try {
    const community = await ResourcesCommunity.findById(req.params.id).lean();
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });

    const userId = req.user?._id?.toString();
    const isMember = userId
      ? community.memberIds.some((id) => id.toString() === userId) || community.createdBy.toString() === userId
      : false;
    if (!community.isPublic && !isMember) {
      return res.status(403).json({ success: false, message: 'Join to view updates' });
    }

    const messages = await ResourcesCommunityMessage.find({ communityId: community._id })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name username avatarUrl')
      .lean();

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCommunityMessage = async (req, res) => {
  try {
    const community = await ResourcesCommunity.findById(req.params.id);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });

    if (!isCommunityAdmin(community, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Only creator/admins can post updates' });
    }

    const text = String(req.body.text || '').trim();
    const imageUrl = req.body.imageUrl || null;
    if (!text && !imageUrl) {
      return res.status(400).json({ success: false, message: 'Message text or image is required' });
    }

    const message = await ResourcesCommunityMessage.create({
      communityId: community._id,
      senderId: req.user._id,
      text,
      imageUrl,
    });
    const populated = await message.populate('senderId', 'name username avatarUrl');

    const memberIds = (community.memberIds || []).map((id) => id.toString());
    await Promise.all(
      memberIds
        .filter((id) => id !== req.user._id.toString())
        .map((memberId) =>
          createNotification({
            userId: memberId,
            actorId: req.user._id,
            type: 'community_update',
            title: `${community.name} update`,
            message: `${req.user.name || 'Admin'} posted a new channel update.`,
            link: `/community/${community._id}`,
            metadata: { communityId: community._id, messageId: message._id },
          })
        )
    );

    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCommunityMessage = async (req, res) => {
  try {
    const community = await ResourcesCommunity.findById(req.params.id);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });
    if (!isCommunityAdmin(community, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Only creator/admins can delete updates' });
    }

    const message = await ResourcesCommunityMessage.findOneAndDelete({
      _id: req.params.messageId,
      communityId: community._id,
    });
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, message: 'Update deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addCommunityAdmin = async (req, res) => {
  try {
    const community = await ResourcesCommunity.findById(req.params.id);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });
    if (community.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only creator can manage admins' });
    }
    const adminUserId = req.body.userId;
    if (!adminUserId) return res.status(400).json({ success: false, message: 'userId is required' });
    if (!community.memberIds.some((id) => id.toString() === adminUserId)) {
      return res.status(400).json({ success: false, message: 'User must be a member first' });
    }
    if (!community.adminIds.some((id) => id.toString() === adminUserId)) {
      community.adminIds.push(adminUserId);
      await community.save();
    }
    const populated = await ResourcesCommunity.findById(community._id)
      .populate('createdBy', 'name username avatarUrl')
      .populate('adminIds', 'name username avatarUrl')
      .populate('memberIds', 'name username avatarUrl')
      .lean();
    res.json({ success: true, community: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const removeCommunityAdmin = async (req, res) => {
  try {
    const community = await ResourcesCommunity.findById(req.params.id);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });
    if (community.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only creator can manage admins' });
    }
    const adminUserId = req.params.userId;
    community.adminIds = community.adminIds.filter((id) => id.toString() !== adminUserId);
    await community.save();
    const populated = await ResourcesCommunity.findById(community._id)
      .populate('createdBy', 'name username avatarUrl')
      .populate('adminIds', 'name username avatarUrl')
      .populate('memberIds', 'name username avatarUrl')
      .lean();
    res.json({ success: true, community: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCommunity = async (req, res) => {
  try {
    const community = await ResourcesCommunity.findById(req.params.id);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });
    if (community.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only creator can delete community' });
    }
    await ResourcesCommunityMessage.deleteMany({ communityId: community._id });
    await ResourcesCommunity.findByIdAndDelete(community._id);
    res.json({ success: true, message: 'Community deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
