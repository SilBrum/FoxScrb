const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, cb) {
    cb(null, req.user._id + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Profile view route
router.get('/profile', (req, res) => {
  res.render('profile', { user: req.user });
});

// Profile update route
router.post('/profile', upload.single('profilePicture'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.name = req.body.name || user.name;
    user.profilePicture = req.file ? `/uploads/${req.file.filename}` : user.profilePicture;
    await user.save();
    res.redirect('/profile');
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// Password change route
router.post('/profile/change-password', async (req, res) => {
  const { password, passwordConfirm } = req.body;

  if (password !== passwordConfirm) {
    return res.render('profile', { user: req.user, errorMessage: 'Passwords do not match.' });
  }

  try {
    const user = await User.findById(req.user._id);
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
    res.render('profile', { user: req.user, successMessage: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
