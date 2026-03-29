import ResourcesProject from '../models/ResourcesProject.model.js';

export const getProjects = async (req, res) => {
  try {
    const { category, difficulty, tag, limit = 50, skip = 0 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (tag) query.tags = { $in: [tag] };

    const projects = await ResourcesProject.find(query)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .populate('createdBy', 'name username avatarUrl')
      .lean();
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { title, description, category, difficulty, tags, links, pptUrl, circuitDetails, contactAllowed } = req.body;
    if (!title?.trim() || !description?.trim() || !category) {
      return res.status(400).json({ success: false, message: 'Title, description and category required' });
    }
    const validCategories = ['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'AI_ML', 'Robotics', 'IoT'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }
    const project = await ResourcesProject.create({
      title: title.trim(),
      description: description.trim(),
      category,
      difficulty: ['beginner', 'intermediate', 'advanced'].includes(difficulty) ? difficulty : 'intermediate',
      tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
      links: Array.isArray(links) ? links.filter((l) => l?.url?.trim()) : [],
      pptUrl: pptUrl?.trim() || null,
      circuitDetails: circuitDetails?.trim() || null,
      createdBy: req.user._id,
      contactAllowed: contactAllowed !== false,
    });
    const populated = await ResourcesProject.findById(project._id)
      .populate('createdBy', 'name username avatarUrl')
      .lean();
    res.status(201).json({ success: true, project: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await ResourcesProject.findById(req.params.id)
      .populate('createdBy', 'name username avatarUrl bio')
      .lean();
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
