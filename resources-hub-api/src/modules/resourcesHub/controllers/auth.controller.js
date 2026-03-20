import ResourcesUser from '../models/ResourcesUser.model.js';
import { generateToken } from '../utils/jwt.js';

export const register = async (req, res) => {
  try {
    const {
      email,
      password,
      bio,
      name,
      username,
      role,
      institution,
      experienceLevel,
      skills = [],
      links = {},
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    if (!bio || typeof bio !== 'string' || bio.trim().length < 20) {
      return res.status(400).json({ success: false, message: 'Bio is required (minimum 20 characters)' });
    }

    const existing = await ResourcesUser.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    if (username) {
      const existingUsername = await ResourcesUser.findOne({ username: username.toLowerCase() });
      if (existingUsername) return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    const crypto = await import('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const emailLower = email.toLowerCase().trim();
    const displayName = name?.trim() || emailLower.split('@')[0];
    const userObj = {
      name: displayName,
      username: username?.trim()?.toLowerCase() || null,
      email: emailLower,
      password,
      bio: bio.trim(),
      role: role || null,
      institution: institution?.trim() || '',
      experienceLevel: experienceLevel || null,
      skills: Array.isArray(skills) ? skills : [],
      links: typeof links === 'object' ? links : {},
      isEmailVerified: process.env.SKIP_EMAIL_VERIFICATION === 'true',
      emailVerificationToken: process.env.SKIP_EMAIL_VERIFICATION === 'true' ? null : verificationToken,
      emailVerificationExpires: process.env.SKIP_EMAIL_VERIFICATION === 'true' ? null : new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
    const user = await ResourcesUser.create(userObj);
    const token = generateToken(user._id);
    const safeUser = {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio,
      role: user.role,
      skills: user.skills,
      experienceLevel: user.experienceLevel,
      avatarUrl: user.avatarUrl,
      isEmailVerified: user.isEmailVerified,
      institution: user.institution,
      links: user.links,
      paidProfile: user.paidProfile,
      profileVisibility: user.profileVisibility,
      coverPhotoUrl: user.coverPhotoUrl,
    };
    const verifyUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    res.status(201).json({
      success: true,
      token,
      user: safeUser,
      needsVerification: !user.isEmailVerified,
      verificationUrl: `${verifyUrl}/verify-email?token=${verificationToken}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    const user = await ResourcesUser.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Account banned from Resources Hub' });
    }
    if (!user.isEmailVerified && process.env.SKIP_EMAIL_VERIFICATION !== 'true') {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
        needsVerification: true,
      });
    }
    const token = generateToken(user._id);
    const safeUser = {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio,
      role: user.role,
      skills: user.skills,
      experienceLevel: user.experienceLevel,
      avatarUrl: user.avatarUrl,
      coverPhotoUrl: user.coverPhotoUrl,
      institution: user.institution,
      links: user.links,
      paidProfile: user.paidProfile,
      profileVisibility: user.profileVisibility,
      isEmailVerified: user.isEmailVerified,
      walletBalance: user.walletBalance,
    };
    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Login failed' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;
    const safeUser = {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio,
      role: user.role,
      skills: user.skills,
      experienceLevel: user.experienceLevel,
      avatarUrl: user.avatarUrl,
      coverPhotoUrl: user.coverPhotoUrl,
      institution: user.institution,
      links: user.links,
      paidProfile: user.paidProfile,
      profileVisibility: user.profileVisibility,
      walletBalance: user.walletBalance,
      isEmailVerified: user.isEmailVerified,
    };
    res.json({ success: true, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: 'Token required' });
    const user = await ResourcesUser.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification link' });
    }
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();
    res.json({ success: true, message: 'Email verified. You can now log in.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }
    const user = await ResourcesUser.findById(req.user._id);
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { password, confirm } = req.body;
    if (!password || confirm !== 'DELETE') {
      return res.status(400).json({ success: false, message: 'Password and confirmation (type DELETE) required' });
    }
    const user = await ResourcesUser.findById(req.user._id);
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }
    await ResourcesUser.findByIdAndDelete(req.user._id);
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await ResourcesUser.findOne({ email: String(email).toLowerCase().trim() });
    // Keep response generic to avoid user enumeration.
    if (!user) {
      return res.json({ success: true, message: 'If this email exists, a reset link has been generated' });
    }

    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5174';
    const resetUrl = `${frontendBase}/reset-password?token=${encodeURIComponent(resetToken)}`;

    // Placeholder response for now; email provider can be plugged in later.
    res.json({
      success: true,
      message: 'Password reset link generated',
      resetUrl,
      expiresInMinutes: 60,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Forgot password failed' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await ResourcesUser.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = String(newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Reset password failed' });
  }
};
