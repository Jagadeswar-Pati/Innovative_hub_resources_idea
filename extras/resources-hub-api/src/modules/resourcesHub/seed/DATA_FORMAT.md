# Seed Data Format

Edit `seedData.js` and run `npm run seed` to populate the database.

**The seed DELETES all existing data first**, then inserts fresh data.

---

## PASSWORD

```js
export const PASSWORD = 'password123';  // All users get this (hashed)
```

---

## USERS

```js
export const USERS = [
  {
    name: 'Full Name',           // required
    email: 'email@example.com',  // required, unique
    bio: 'At least 20 chars...', // required, min 20 chars
    username: 'optional',        // optional, lowercase
    role: 'student',             // optional: student | mentor | professor
    institution: 'College name', // optional
    experienceLevel: 'beginner', // optional: beginner | intermediate | advanced
    skills: ['Skill1', 'Skill2'],// optional array
  },
];
```

---

## POSTS

Use `authorIndex` = index in USERS array (0-based).

```js
export const POSTS = [
  {
    title: 'Post title',                    // required
    description: 'Post body...',            // required
    authorIndex: 0,                         // index in USERS
    postType: 'idea',                       // idea | startup | resource | general
    collaborationType: 'free',              // free | paid
    tags: ['AI', 'IoT'],                    // array of hashtags (no #)
    budget: 1000,                           // required if paid (min 5)
    deadline: '2025-12-31',                 // optional, ISO date (paid only)
  },
];
```

---

## COMMENTS

```js
export const COMMENTS = [
  {
    postIndex: 0,      // index in POSTS array
    authorIndex: 0,    // index in USERS array
    content: 'Comment text',
  },
];
```

---

## PROJECTS (Engineering Zone)

```js
export const PROJECTS = [
  {
    title: 'Project title',
    description: 'Project description',
    category: 'CSE',           // CSE | ECE | EEE | Mechanical | Civil | AI_ML | Robotics | IoT
    difficulty: 'beginner',    // beginner | intermediate | advanced
    tags: ['Python', 'ML'],
  },
];
```

---

## COMMUNITIES

```js
export const COMMUNITIES = [
  {
    name: 'Community Name',
    description: 'What this community is about',
    creatorIndex: 0,           // index in USERS (creator, auto-added to members)
    memberIndices: [1, 2, 3],  // additional user indices
  },
];
```

---

## Run Seed

```bash
cd resources-hub-api
npm run seed
```

Login with any user email and the PASSWORD from seedData.js.
