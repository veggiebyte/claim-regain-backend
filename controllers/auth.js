const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const saltRounds = 12;

router.post('/sign-up', async (req, res) => {
  try {
    // Check if the username is already taken
    const userInDatabase = await User.findOne({ username: req.body.username });

    if (userInDatabase) {
      return res.status(409).json({ err: 'Username already taken.' });
    }

    // Create a new user with hashed password and role
    const user = await User.create({
      username: req.body.username,
      hashedPassword: bcrypt.hashSync(req.body.password, saltRounds),
      role: req.body.role // Add role field
    });

    // Construct the payload with role
    const payload = { username: user.username, _id: user._id, role: user.role };
    // Create the token, attaching the payload
    const token = jwt.sign({ payload }, process.env.JWT_SECRET);
    // Send the token instead of the user
    res.status(201).json({ token, user: { username: user.username, role: user.role } });
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});

router.post('/sign-in', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(401).json({ err: 'Invalid credentials.' });
    }

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password, user.hashedPassword
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({ err: 'Invalid credentials.' });
    }

    // Construct the payload with role
    const payload = { username: user.username, _id: user._id, role: user.role };

    // Create the token, attaching the payload
    const token = jwt.sign({ payload }, process.env.JWT_SECRET);

    // Send the token with user info
    res.status(200).json({ token, user: { username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;