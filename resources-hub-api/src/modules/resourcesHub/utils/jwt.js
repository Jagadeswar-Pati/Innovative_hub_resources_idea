import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.RESOURCES_JWT_SECRET || process.env.JWT_SECRET || 'resources-hub-secret-change-in-production';
const JWT_EXPIRES = process.env.RESOURCES_JWT_EXPIRES || '7d';

export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
};

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch {
    return null;
  }
};
