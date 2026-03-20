import ResourcesUser from '../models/ResourcesUser.model.js';
import ResourcesPost from '../models/ResourcesPost.model.js';
import ResourcesProject from '../models/ResourcesProject.model.js';
import ResourcesCommunity from '../models/ResourcesCommunity.model.js';

export const search = async (req, res) => {
  try {
    const q = (req.query.q || '').trim().toLowerCase();
    const limit = Math.min(Number(req.query.limit) || 10, 20);

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        users: [],
        posts: [],
        projects: [],
        communities: [],
        hashtags: [],
      });
    }

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const [users, posts, projects, communities] = await Promise.all([
      ResourcesUser.find({
        $or: [
          { name: regex },
          { email: regex },
          { username: regex },
          { bio: regex },
        ],
        isBanned: { $ne: true },
      })
        .select('name username avatarUrl role')
        .limit(limit)
        .lean(),
      ResourcesPost.find({
        status: 'active',
        $or: [
          { title: regex },
          { description: regex },
          { tags: regex },
        ],
      })
        .populate('createdBy', 'name avatarUrl')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      ResourcesProject.find({
        $or: [
          { title: regex },
          { description: regex },
          { tags: regex },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      ResourcesCommunity.find({
        isPublic: true,
        $or: [
          { name: regex },
          { description: regex },
        ],
      })
        .populate('createdBy', 'name avatarUrl')
        .limit(limit)
        .lean(),
    ]);

    const tagMatch = q.startsWith('#') ? q.slice(1).toLowerCase() : q.toLowerCase();
    const hashtagPosts = await ResourcesPost.aggregate([
      { $match: { status: 'active', tags: { $regex: tagMatch, $options: 'i' } } },
      { $unwind: '$tags' },
      { $match: { tags: { $regex: tagMatch, $options: 'i' } } },
      { $group: { _id: { $toLower: '$tags' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { tag: '$_id', count: 1, _id: 0 } },
    ]);

    res.json({
      success: true,
      users,
      posts,
      projects,
      communities,
      hashtags: hashtagPosts,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const q = (req.query.q || '').trim().toLowerCase();
    const limit = Math.min(Number(req.query.limit) || 10, 30);

    if (!q || q.length < 1) {
      return res.json({ success: true, users: [] });
    }

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const users = await ResourcesUser.find({
      isBanned: { $ne: true },
      $or: [{ name: regex }, { username: regex }, { bio: regex }],
    })
      .select('name username avatarUrl bio role skills')
      .limit(limit)
      .lean();

    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
