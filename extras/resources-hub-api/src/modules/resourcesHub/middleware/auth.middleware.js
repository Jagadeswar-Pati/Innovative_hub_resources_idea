import ResourcesUser from '../models/ResourcesUser.model.js';
import { verifyToken } from '../utils/jwt.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    const user = await ResourcesUser.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Account banned from Resources Hub' });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Not authorized' });
  }
};
