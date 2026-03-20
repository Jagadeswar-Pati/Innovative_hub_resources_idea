import * as postService from '../services/post.service.js';
import { uploadImage } from '../utils/cloudinary.js';
import { validateImageUpload } from '../utils/cloudinary.js';
import ResourcesLike from '../models/ResourcesLike.model.js';
import ResourcesComment from '../models/ResourcesComment.model.js';
import fs from 'fs';

export const createPost = async (req, res) => {
  try {
    let mediaUrl = null;
    if (req.file) {
      const validation = validateImageUpload(req.file);
      if (!validation.valid) {
        if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: validation.error });
      }
      mediaUrl = await uploadImage(req.file.path);
      if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    }
    let tags = req.body.tags;
    if (typeof tags === 'string') {
      try { tags = JSON.parse(tags); } catch { tags = []; }
    }
    const postType = req.body.postType || 'general';
    const featuredPaid = req.body.featuredPaid === 'true' || req.body.featuredPaid === true;
    const body = { ...req.body, mediaUrl, tags: tags || [], postType, featuredPaid };
    const post = await postService.createPost(req.user._id, body);
    res.status(201).json({ success: true, post });
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(err.message?.includes('budget') ? 400 : 500).json({ success: false, message: err.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    let mediaUrl = req.body.mediaUrl;
    if (req.file) {
      const validation = validateImageUpload(req.file);
      if (!validation.valid) {
        if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: validation.error });
      }
      mediaUrl = await uploadImage(req.file.path);
      if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    }
    const body = { ...req.body, mediaUrl };
    const post = await postService.updatePost(req.params.id, req.user._id, body);
    res.json({ success: true, post });
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(err.message?.includes('creator') ? 403 : 500).json({ success: false, message: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const isAdmin = req.query.admin === 'true' && req.headers['x-admin-key'] === process.env.RESOURCES_ADMIN_SECRET;
    await postService.deletePost(req.params.id, req.user._id, isAdmin);
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    const status = err.message?.includes('creator') || err.message?.includes('admin') ? 403 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    const { collaborationType, tag, postType, limit, skip } = req.query;
    const posts = await postService.getPosts({ collaborationType, tag, postType, limit, skip });
    const userId = req.user?._id;

    const postsWithMeta = await Promise.all(
      posts.map(async (p) => {
        const likeCount = await ResourcesLike.countDocuments({ postId: p._id });
        const commentCount = await ResourcesComment.countDocuments({ postId: p._id });
        let liked = false;
        if (userId) {
          const like = await ResourcesLike.findOne({ postId: p._id, userId });
          liked = !!like;
        }
        return { ...p, likes: likeCount, comments: commentCount, liked };
      })
    );
    res.json({ success: true, posts: postsWithMeta });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await postService.getPostById(req.params.id);
    const likeCount = await ResourcesLike.countDocuments({ postId: post._id });
    const commentCount = await ResourcesComment.countDocuments({ postId: post._id });
    let liked = false;
    if (req.user) {
      const like = await ResourcesLike.findOne({ postId: post._id, userId: req.user._id });
      liked = !!like;
    }
    res.json({ success: true, post: { ...post, likes: likeCount, comments: commentCount, liked } });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};
