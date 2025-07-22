import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';
import path from 'path';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'profilePicture', 'createdAt', 'updatedAt']
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name && !email) {
      return res.status(400).json({ error: 'Name or email is required to update profile' });
    }
    const user = await User.findByPk(req.user.id);
    if (!user) {
      console.error('User not found for update:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }
    if (name) user.name = name;
    if (email) user.email = email;
    await user.save().catch(saveErr => {
      console.error('Error saving user during profile update:', saveErr);
      throw new Error('Database save failed');
    });
    res.json({ message: 'Profile updated', user: { id: user.id, name: user.name, email: user.email, profilePicture: user.profilePicture } });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile', details: err.message });
  }
};

export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!req.user || !req.user.id) {
      console.error('No authenticated user found in request');
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const user = await User.findByPk(req.user.id);
    if (!user) {
      console.error(`User not found: ${req.user.id}`);
      return res.status(404).json({ error: 'User not found' });
    }
    user.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
    await user.save().catch(saveErr => {
      console.error('Error saving user:', saveErr);
      throw new Error('Database save failed');
    });
    res.json({ message: 'Profile picture updated', profilePicture: user.profilePicture });
  } catch (err) {
    console.error('Profile picture upload error:', err);
    res.status(500).json({ error: 'Failed to upload profile picture', details: err.message });
  }
};
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current and new password required' });
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ error: 'Current password is incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password' });
  }
};
