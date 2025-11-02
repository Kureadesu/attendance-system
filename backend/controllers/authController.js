// controllers/authController.js
import jwt from 'jsonwebtoken';
import { Admin } from '../models/index.js';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Static admin credentials (you can change these)
    const staticAdmin = {
      username: 'admin',
      password: 'admin123'
    };

    if (username === staticAdmin.username && password === staticAdmin.password) {
      const token = jwt.sign(
        { username: staticAdmin.username, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        message: 'Login successful',
        token,
        user: {
          username: staticAdmin.username,
          role: 'admin'
        }
      });
    }

    // If you want to use database admins instead, uncomment below:
    /*
    const admin = await Admin.findOne({ where: { username } });
    if (!admin || !(await admin.validatePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: admin.id,
        username: admin.username,
        role: 'admin'
      }
    });
    */

    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = (req, res) => {
  res.json({
    user: req.user
  });
};