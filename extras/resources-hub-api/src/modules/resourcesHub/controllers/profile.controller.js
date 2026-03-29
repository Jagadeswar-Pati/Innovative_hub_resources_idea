import ResourcesUser from '../models/ResourcesUser.model.js';
import { uploadImage } from '../utils/cloudinary.js';
import { validateImageUpload } from '../utils/cloudinary.js';
import { createNotification } from '../services/notification.service.js';
import mongoose from 'mongoose';
import fs from 'fs';

const PROFILE_FOLDER = 'resources_hub/profiles';

/** GET /profile/me - get current user full profile (protected) */
export const getProfile = async (req, res) => {
  try {
    const user = await ResourcesUser.findById(req.user._id).select('-password -emailVerificationToken -emailVerificationExpires');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const payload = user.toObject();
    payload.id = user._id;
    res.json({ success: true, user: payload });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** PUT /profile - update profile (all editable fields) */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      name,
      username,
      bio,
      role,
      institution,
      experienceLevel,
      skills,
      links,
      profileVisibility,
      paidProfile,
      education,
      experience,
      interests,
    } = req.body;

    const user = await ResourcesUser.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name !== undefined) user.name = String(name || '').trim() || user.name;
    if (username !== undefined) {
      const uname = String(username || '').trim().toLowerCase();
      if (uname) {
        const existing = await ResourcesUser.findOne({ username: uname, _id: { $ne: userId } });
        if (existing) return res.status(400).json({ success: false, message: 'Username already taken' });
        user.username = uname;
      } else {
        user.username = null;
      }
    }
    if (bio !== undefined) user.bio = String(bio || '').trim();
    if (role !== undefined) user.role = ['student', 'mentor', 'professor'].includes(role) ? role : null;
    if (institution !== undefined) user.institution = String(institution || '').trim();
    if (experienceLevel !== undefined) user.experienceLevel = ['beginner', 'intermediate', 'advanced'].includes(experienceLevel) ? experienceLevel : null;
    if (Array.isArray(skills)) user.skills = skills.map((s) => String(s).trim()).filter(Boolean);
    if (typeof links === 'object') {
      user.links = {
        website: links.website ?? user.links?.website ?? '',
        linkedin: links.linkedin ?? user.links?.linkedin ?? '',
        twitter: links.twitter ?? user.links?.twitter ?? '',
        github: links.github ?? user.links?.github ?? '',
        portfolio: links.portfolio ?? user.links?.portfolio ?? '',
        personalWebsite: links.personalWebsite ?? user.links?.personalWebsite ?? '',
        other: links.other ?? user.links?.other ?? '',
      };
    }
    if (education !== undefined) user.education = String(education || '').trim();
    if (experience !== undefined) user.experience = String(experience || '').trim();
    if (Array.isArray(interests)) user.interests = interests.map((x) => String(x).trim()).filter(Boolean);
    if (profileVisibility !== undefined) user.profileVisibility = profileVisibility === 'private' ? 'private' : 'public';
    if (paidProfile !== undefined) user.paidProfile = !!paidProfile;

    await user.save();
    const safe = user.toObject();
    safe.id = user._id;
    delete safe.password;
    delete safe.emailVerificationToken;
    delete safe.emailVerificationExpires;
    res.json({ success: true, user: safe });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /profile/handle/:handle - get public profile by username or id */
export const getProfileByHandle = async (req, res) => {
  try {
    const handle = String(req.params.handle || '').trim().toLowerCase();
    if (!handle) {
      return res.status(400).json({ success: false, message: 'Profile handle is required' });
    }

    const query = mongoose.Types.ObjectId.isValid(handle)
      ? { $or: [{ username: handle }, { _id: handle }] }
      : { username: handle };

    const user = await ResourcesUser.findOne({
      ...query,
      isBanned: { $ne: true },
    })
      .select('-password -emailVerificationToken -emailVerificationExpires -resetPasswordToken -resetPasswordExpires')
      .lean();

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const viewerId = req.user?._id?.toString();
    const isOwner = viewerId && user._id.toString() === viewerId;

    if (user.profileVisibility === 'private' && !isOwner) {
      return res.status(403).json({ success: false, message: 'This profile is private' });
    }

    const followersCount = user.followers?.length || 0;
    const followingCount = user.following?.length || 0;
    const isFollowing = viewerId ? user.followers?.some((id) => id.toString() === viewerId) : false;

    res.json({
      success: true,
      user: {
        ...user,
        id: user._id,
        followersCount,
        followingCount,
        isFollowing,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** POST /profile/follow/:userId */
export const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const myUserId = req.user._id;
    if (targetUserId === myUserId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const [me, target] = await Promise.all([
      ResourcesUser.findById(myUserId),
      ResourcesUser.findById(targetUserId),
    ]);

    if (!me || !target) return res.status(404).json({ success: false, message: 'User not found' });

    const alreadyFollowing = me.following.some((id) => id.toString() === targetUserId);
    if (!alreadyFollowing) {
      me.following.push(target._id);
      target.followers.push(me._id);
      await Promise.all([me.save(), target.save()]);

      await createNotification({
        userId: target._id,
        actorId: me._id,
        type: 'new_follower',
        title: 'New follower',
        message: `${me.name || me.username || 'Someone'} started following you.`,
        link: `/profile/${me.username || me._id}`,
        metadata: { followerId: me._id },
      });
    }

    res.json({
      success: true,
      followersCount: target.followers.length,
      followingCount: me.following.length,
      isFollowing: true,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** POST /profile/unfollow/:userId */
export const unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const myUserId = req.user._id;
    if (targetUserId === myUserId.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid user' });
    }

    const [me, target] = await Promise.all([
      ResourcesUser.findById(myUserId),
      ResourcesUser.findById(targetUserId),
    ]);

    if (!me || !target) return res.status(404).json({ success: false, message: 'User not found' });

    me.following = me.following.filter((id) => id.toString() !== targetUserId);
    target.followers = target.followers.filter((id) => id.toString() !== myUserId.toString());
    await Promise.all([me.save(), target.save()]);

    res.json({
      success: true,
      followersCount: target.followers.length,
      followingCount: me.following.length,
      isFollowing: false,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** POST /profile/avatar - upload profile picture */
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image provided' });
    const validation = validateImageUpload(req.file);
    if (!validation.valid) {
      if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: validation.error });
    }
    const url = await uploadImage(req.file.path, PROFILE_FOLDER);
    if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    const user = await ResourcesUser.findByIdAndUpdate(req.user._id, { avatarUrl: url }, { new: true })
      .select('-password -emailVerificationToken -emailVerificationExpires');
    res.json({ success: true, avatarUrl: url, user });
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: err.message });
  }
};

/** POST /profile/cover - upload cover photo */
export const uploadCover = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image provided' });
    const validation = validateImageUpload(req.file);
    if (!validation.valid) {
      if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: validation.error });
    }
    const url = await uploadImage(req.file.path, PROFILE_FOLDER);
    if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    const user = await ResourcesUser.findByIdAndUpdate(req.user._id, { coverPhotoUrl: url }, { new: true })
      .select('-password -emailVerificationToken -emailVerificationExpires');
    res.json({ success: true, coverPhotoUrl: url, user });
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: err.message });
  }
};
