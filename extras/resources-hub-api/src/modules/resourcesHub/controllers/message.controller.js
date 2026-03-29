import ResourcesConversation from '../models/ResourcesConversation.model.js';
import ResourcesMessage from '../models/ResourcesMessage.model.js';
import ResourcesPost from '../models/ResourcesPost.model.js';
import ResourcesTransaction from '../models/ResourcesTransaction.model.js';
import { MESSAGE_FEE_PAID_POST } from '../utils/messageFee.js';
import { uploadImage } from '../utils/cloudinary.js';
import { validateImageUpload } from '../utils/cloudinary.js';
import { createNotification } from '../services/notification.service.js';
import fs from 'fs';

export const startOrGetConversation = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user._id;

    const post = await ResourcesPost.findById(postId).populate('createdBy', 'name email avatarUrl');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const postOwnerId = post.createdBy._id;
    if (postOwnerId.toString() === userId.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot message yourself' });
    }

    let conv = await ResourcesConversation.findOne({
      postId,
      otherUserId: userId,
    })
      .populate('postId', 'title collaborationType')
      .populate('postOwnerId', 'name email avatarUrl')
      .populate('otherUserId', 'name email avatarUrl');

    if (conv) {
      const lastMsg = await ResourcesMessage.findOne({ conversationId: conv._id })
        .sort({ createdAt: -1 })
        .populate('senderId', 'name');
      return res.json({
        success: true,
        conversation: conv,
        needsPayment: false,
        messageFee: null,
        lastMessage: lastMsg,
      });
    }

    if (post.collaborationType === 'paid') {
      return res.json({
        success: true,
        conversation: null,
        needsPayment: true,
        messageFee: MESSAGE_FEE_PAID_POST,
        post: { _id: post._id, title: post.title },
      });
    }

    conv = await ResourcesConversation.create({
      postId,
      postOwnerId,
      otherUserId: userId,
      postCollaborationType: 'free',
      messageAccessPaid: true,
    });
    conv = await conv
      .populate('postId', 'title collaborationType')
      .populate('postOwnerId', 'name email avatarUrl')
      .populate('otherUserId', 'name email avatarUrl');

    res.status(201).json({
      success: true,
      conversation: conv,
      needsPayment: false,
      messageFee: null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const payMessageAccess = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user._id;

    const post = await ResourcesPost.findById(postId).populate('createdBy', 'name email avatarUrl');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.collaborationType !== 'paid') {
      return res.status(400).json({ success: false, message: 'Message access is free for this post' });
    }

    const postOwnerId = post.createdBy._id;
    if (postOwnerId.toString() === userId.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot message yourself' });
    }

    let conv = await ResourcesConversation.findOne({ postId, otherUserId: userId });
    if (conv && conv.messageAccessPaid) {
      conv = await conv
        .populate('postId', 'title collaborationType')
        .populate('postOwnerId', 'name email avatarUrl')
        .populate('otherUserId', 'name email avatarUrl');
      return res.json({ success: true, conversation: conv, alreadyPaid: true });
    }

    const fee = MESSAGE_FEE_PAID_POST;

    if (conv) {
      conv.messageAccessPaid = true;
      conv.messageFeePaidAt = new Date();
      conv.updatedAt = new Date();
      await conv.save();
    } else {
      conv = await ResourcesConversation.create({
        postId,
        postOwnerId,
        otherUserId: userId,
        postCollaborationType: 'paid',
        messageAccessPaid: true,
        messageFeePaidAt: new Date(),
      });
    }

    await ResourcesTransaction.create({
      collaborationId: null,
      type: 'platform_fee',
      amount: fee,
      gstAmount: 0,
      fromUserId: userId,
      status: 'completed',
      metadata: { type: 'message_access', postId, conversationId: conv._id },
    });

    conv = await conv
      .populate('postId', 'title collaborationType')
      .populate('postOwnerId', 'name email avatarUrl')
      .populate('otherUserId', 'name email avatarUrl');

    await createNotification({
      userId: postOwnerId,
      actorId: userId,
      type: 'engineering_paid_unlock',
      title: 'Paid collaboration unlocked',
      message: `${req.user.name || 'A user'} unlocked discussion for "${post.title}".`,
      link: `/messages/${conv._id}`,
      metadata: { postId, conversationId: conv._id },
    });

    res.json({ success: true, conversation: conv, message: 'Message access unlocked (₹5 paid)' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const convs = await ResourcesConversation.find({
      $or: [{ postOwnerId: userId }, { otherUserId: userId }],
    })
      .sort({ lastMessageAt: -1 })
      .populate('postId', 'title collaborationType')
      .populate('postOwnerId', 'name email avatarUrl')
      .populate('otherUserId', 'name email avatarUrl')
      .lean();

    const withLastMessage = await Promise.all(
      convs.map(async (c) => {
        const lastMsg = await ResourcesMessage.findOne({ conversationId: c._id })
          .sort({ createdAt: -1 })
          .populate('senderId', 'name')
          .lean();
        const unreadCount = await ResourcesMessage.countDocuments({
          conversationId: c._id,
          senderId: { $ne: userId },
          readAt: null,
        });
        const other = c.postOwnerId._id.toString() === userId.toString() ? c.otherUserId : c.postOwnerId;
        return {
          ...c,
          otherUser: other,
          lastMessage: lastMsg,
          unreadCount,
        };
      })
    );

    res.json({ success: true, conversations: withLastMessage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conv = await ResourcesConversation.findById(conversationId);
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
    const isParticipant =
      conv.postOwnerId.toString() === userId.toString() || conv.otherUserId.toString() === userId.toString();
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Not a participant' });
    if (conv.postCollaborationType === 'paid' && !conv.messageAccessPaid) {
      return res.status(403).json({ success: false, message: 'Pay ₹5 to unlock messaging' });
    }

    const messages = await ResourcesMessage.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name email avatarUrl')
      .lean();

    await ResourcesMessage.updateMany(
      { conversationId, senderId: { $ne: userId }, readAt: null },
      { readAt: new Date() }
    );

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content?.trim()) return res.status(400).json({ success: false, message: 'Message content required' });

    const conv = await ResourcesConversation.findById(conversationId);
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
    const isParticipant =
      conv.postOwnerId.toString() === userId.toString() || conv.otherUserId.toString() === userId.toString();
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Not a participant' });
    if (conv.postCollaborationType === 'paid' && !conv.messageAccessPaid) {
      return res.status(403).json({ success: false, message: 'Pay ₹5 to unlock messaging' });
    }

    const msg = await ResourcesMessage.create({
      conversationId,
      senderId: userId,
      content: content.trim(),
    });

    await ResourcesConversation.findByIdAndUpdate(conversationId, {
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    });

    const populated = await msg.populate('senderId', 'name email avatarUrl');

    const receiverId =
      conv.postOwnerId.toString() === userId.toString() ? conv.otherUserId : conv.postOwnerId;
    await createNotification({
      userId: receiverId,
      actorId: userId,
      type: 'new_message',
      title: 'New message',
      message: `${req.user.name || 'Someone'} sent you a message.`,
      link: `/messages/${conversationId}`,
      metadata: { conversationId },
    });

    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const sendImageMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    if (!req.file) return res.status(400).json({ success: false, message: 'Image required' });
    const validation = validateImageUpload(req.file);
    if (!validation.valid) {
      if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: validation.error });
    }

    const conv = await ResourcesConversation.findById(conversationId);
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
    const isParticipant =
      conv.postOwnerId.toString() === userId.toString() || conv.otherUserId.toString() === userId.toString();
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Not a participant' });
    if (conv.postCollaborationType === 'paid' && !conv.messageAccessPaid) {
      return res.status(403).json({ success: false, message: 'Pay ₹5 to unlock messaging' });
    }

    const imageUrl = await uploadImage(req.file.path, 'resources_hub/messages');
    if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    const msg = await ResourcesMessage.create({
      conversationId,
      senderId: userId,
      content: '',
      imageUrl,
    });

    await ResourcesConversation.findByIdAndUpdate(conversationId, {
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    });

    const populated = await msg.populate('senderId', 'name email avatarUrl');

    const receiverId =
      conv.postOwnerId.toString() === userId.toString() ? conv.otherUserId : conv.postOwnerId;
    await createNotification({
      userId: receiverId,
      actorId: userId,
      type: 'new_message',
      title: 'New message',
      message: `${req.user.name || 'Someone'} sent an image.`,
      link: `/messages/${conversationId}`,
      metadata: { conversationId },
    });

    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMessageFee = (req, res) => {
  res.json({ success: true, messageFee: MESSAGE_FEE_PAID_POST });
};
