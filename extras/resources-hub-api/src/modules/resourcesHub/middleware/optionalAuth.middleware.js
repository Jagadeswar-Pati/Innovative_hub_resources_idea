import ResourcesUser from '../models/ResourcesUser.model.js';
import { verifyToken } from '../utils/jwt.js';

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      req.user = null;
      return next();
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      req.user = null;
      return next();
    }
    const user = await ResourcesUser.findById(decoded.userId);
    req.user = user && !user.isBanned ? user : null;
    next();
  } catch {
    req.user = null;
    next();
  }
};
