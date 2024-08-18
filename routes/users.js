const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const multer = require('multer');

// Login 
router.get('/login', (req, res) => res.render('login', { errors: req.flash('errors'), success_msg: req.flash('success_msg') }));

// Register
router.get('/register', (req, res) => res.render('register', { errors: req.flash('errors') }));

router.post('/register', async (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // Missing info error
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  // Password match error
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  // Password too short error
  if (password.length < 6) {
    errors.push({ msg: 'Password should be at least 6 characters' });
  }

  // Check for errors
  if (errors.length > 0) {
    req.flash('errors', errors);
    res.redirect('/users/register');
  } else {
    try {
      const user = await User.findOne({ email });
      if (user) {
        errors.push({ msg: 'Email is already registered' });
        req.flash('errors', errors);
        return res.redirect('/users/register');
      }

      const newUser = new User({ name, email, password });

      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(password, salt);
      await newUser.save();

      req.flash('success_msg', 'You are now registered and can log in');
      res.redirect('/users/login');
    } catch (err) {
      console.error(err);
      errors.push({ msg: 'An error occurred during registration' });
      req.flash('errors', errors);
      res.redirect('/users/register');
    }
  }
});

// Login Handle
router.post('/login', (req, res, next) => {
  const { email, password } = req.body;
  let errors = [];

  // Check required fields
  if (!email || !password) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  // Check for errors
  if (errors.length > 0) {
    req.flash('errors', errors);
    return res.redirect('/users/login');
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err);
      errors.push({ msg: 'An error occurred during login' });
      req.flash('errors', errors);
      return res.redirect('/users/login');
    }
    if (!user) {
      errors.push({ msg: 'Incorrect email or password' });
      req.flash('errors', errors);
      return res.redirect('/users/login');
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error(err);
        errors.push({ msg: 'An error occurred during login' });
        req.flash('errors', errors);
        return res.redirect('/users/login');
      }
      req.flash('success_msg', 'You are now logged in');
      res.redirect('/notes');
    });
  })(req, res, next);
});

// Forgot Password Page
router.get('/forgot-password', (req, res) => res.render('forgot-password', { errors: req.flash('errors'), success_msg: req.flash('success_msg') }));

// Handle Password Reset Request
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  let errors = [];

  if (!email) {
    errors.push({ msg: 'Please enter your email' });
    req.flash('errors', errors);
    return res.redirect('/users/forgot-password');
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      errors.push({ msg: 'No account found with that email' });
      req.flash('errors', errors);
      return res.redirect('/users/forgot-password');
    }

    //Password reset
    req.flash('success_msg', 'Password reset instructions have been sent to your email');
    res.redirect('/users/login');
  } catch (err) {
    console.error(err);
    errors.push({ msg: 'An error occurred while trying to reset your password' });
    req.flash('errors', errors);
    res.redirect('/users/forgot-password');
  }
});

// Profile stuff - Change pic, change password, view profile
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, cb) {
    cb(null, req.user._id + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/profile', (req, res) => {
  res.render('profile', { user: req.user });
});

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

router.post('/profile/change-password', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }
    await user.save();
    res.redirect('/profile');
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// Logout 
router.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
  });
});

module.exports = router;
