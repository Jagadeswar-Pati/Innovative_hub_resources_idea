/**
 * Resources Hub Seed Script
 * - DELETES ALL existing data in resources_hub database
 * - Inserts fresh data from seedData.js
 *
 * Run: npm run seed (from resources-hub-api folder)
 * Edit seedData.js to add your own users, posts, projects, communities
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  PASSWORD,
  USERS,
  POSTS,
  COMMENTS,
  PROJECTS,
  COMMUNITIES,
} from './seedData.js';

const MONGODB_URI = process.env.MONGODB_URI || process.env.RESOURCES_MONGODB_URI;
const DB_NAME = 'resources_hub';

const COLLECTIONS = [
  'resources_users',
  'resources_posts',
  'resources_comments',
  'resources_likes',
  'resources_collaborations',
  'resources_conversations',
  'resources_messages',
  'resources_projects',
  'resources_communities',
  'resources_transactions',
];

async function seed() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI or RESOURCES_MONGODB_URI required in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
  console.log(`Connected to MongoDB (database: ${DB_NAME})`);

  // ------ STEP 1: Delete all old data ------
  console.log('Deleting all existing data...');
  const db = mongoose.connection.db;
  for (const collName of COLLECTIONS) {
    try {
      const coll = db.collection(collName);
      const deleted = await coll.deleteMany({});
      if (deleted.deletedCount > 0) {
        console.log(`  Deleted ${deleted.deletedCount} from ${collName}`);
      }
    } catch (e) {
      if (e.codeName !== 'NamespaceNotFound') console.warn(`  ${collName}:`, e.message);
    }
  }
  console.log('Old data cleared.\n');

  // ------ STEP 2: Load models ------
  const ResourcesUser = (await import('../models/ResourcesUser.model.js')).default;
  const ResourcesPost = (await import('../models/ResourcesPost.model.js')).default;
  const ResourcesComment = (await import('../models/ResourcesComment.model.js')).default;
  const ResourcesProject = (await import('../models/ResourcesProject.model.js')).default;
  const ResourcesCommunity = (await import('../models/ResourcesCommunity.model.js')).default;

  // ------ STEP 3: Insert users ------
  const hashedPassword = await bcrypt.hash(PASSWORD, 10);
  const userDocs = USERS.map((u) => ({
    name: u.name,
    email: u.email,
    password: hashedPassword,
    bio: u.bio,
    username: u.username || null,
    role: u.role || null,
    institution: u.institution || '',
    experienceLevel: u.experienceLevel || null,
    skills: u.skills || [],
    isEmailVerified: true,
    isDummy: true,
  }));
  const users = await ResourcesUser.insertMany(userDocs);
  console.log(`Inserted ${users.length} users`);

  // ------ STEP 4: Insert posts ------
  const { calculatePaymentBreakdown } = await import('../utils/paymentCalc.js');
  const postDocs = POSTS.map((p) => {
    const createdBy = users[p.authorIndex]._id;
    let platformFee = null;
    let gstAmount = null;
    let totalAmount = null;
    let deadline = null;

    if (p.collaborationType === 'paid' && p.budget >= 5) {
      const breakdown = calculatePaymentBreakdown(p.budget);
      platformFee = breakdown.platformFee;
      gstAmount = breakdown.gstAmount;
      totalAmount = breakdown.totalAmount;
      deadline = p.deadline ? new Date(p.deadline) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    }

    return {
      title: p.title,
      description: p.description,
      tags: p.tags || [],
      postType: p.postType || 'general',
      collaborationType: p.collaborationType || 'free',
      createdBy,
      budget: p.collaborationType === 'paid' ? p.budget : null,
      platformFee,
      gstAmount,
      totalAmount,
      deadline,
      isDummy: true,
    };
  });
  const posts = await ResourcesPost.insertMany(postDocs);
  console.log(`Inserted ${posts.length} posts`);

  // ------ STEP 5: Insert comments ------
  const commentDocs = COMMENTS.map((c) => ({
    postId: posts[c.postIndex]._id,
    userId: users[c.authorIndex]._id,
    content: c.content,
  }));
  await ResourcesComment.insertMany(commentDocs);
  console.log(`Inserted ${commentDocs.length} comments`);

  // ------ STEP 6: Insert projects ------
  const projectDocs = PROJECTS.map((p) => ({
    title: p.title,
    description: p.description,
    category: p.category,
    difficulty: p.difficulty || 'intermediate',
    tags: p.tags || [],
    links: Array.isArray(p.links) ? p.links : [],
    pptUrl: p.pptUrl || null,
    circuitDetails: p.circuitDetails || null,
    createdBy: null,
    isDummy: true,
  }));
  await ResourcesProject.insertMany(projectDocs);
  console.log(`Inserted ${projectDocs.length} projects`);

  // ------ STEP 7: Insert communities ------
  const communityDocs = COMMUNITIES.map((c) => {
    const creatorId = users[c.creatorIndex]._id;
    const extraMembers = (c.memberIndices || []).map((i) => users[i]._id);
    const memberIds = [creatorId, ...extraMembers.filter((id) => !id.equals(creatorId))];
    return {
      name: c.name,
      description: c.description || '',
      isPublic: true,
      createdBy: creatorId,
      memberIds,
      isDummy: true,
    };
  });
  await ResourcesCommunity.insertMany(communityDocs);
  console.log(`Inserted ${communityDocs.length} communities`);

  // ------ Done ------
  console.log('\n--- Seed complete ---');
  console.log(`Users: ${users.length} (password: ${PASSWORD})`);
  console.log(`Posts: ${posts.length}`);
  console.log(`Comments: ${commentDocs.length}`);
  console.log(`Projects: ${projectDocs.length}`);
  console.log(`Communities: ${communityDocs.length}`);
  console.log('\nLogin with any user email and password:', PASSWORD);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
