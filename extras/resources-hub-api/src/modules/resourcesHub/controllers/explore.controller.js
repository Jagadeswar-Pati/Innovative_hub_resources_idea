import ResourcesPost from '../models/ResourcesPost.model.js';
import ResourcesCommunity from '../models/ResourcesCommunity.model.js';
import ResourcesLike from '../models/ResourcesLike.model.js';

/** GET /explore/trending - trending ideas, startups, hashtags, communities */
export const getTrending = async (req, res) => {
  try {
    const limit = 5;

    const [trendingIdeas, trendingStartups, popularCommunities, hashtags] = await Promise.all([
      ResourcesPost.find({ status: 'active', postType: 'idea' })
        .populate('createdBy', 'name avatarUrl')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      ResourcesPost.find({ status: 'active', postType: 'startup' })
        .populate('createdBy', 'name avatarUrl')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      ResourcesCommunity.find({ isPublic: true })
        .populate('createdBy', 'name avatarUrl')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      ResourcesPost.aggregate([
        { $match: { status: 'active' } },
        { $unwind: '$tags' },
        { $group: { _id: { $toLower: '$tags' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { tag: '$_id', count: 1, _id: 0 } },
      ]),
    ]);

    res.json({
      success: true,
      trendingIdeas,
      trendingStartups,
      popularCommunities,
      hashtags,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
