// utils/jwt.js
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'test-secret';

exports.signToken = payload =>
  jwt.sign(payload, SECRET, { expiresIn: '1h' });

exports.verifyToken = token =>
  jwt.verify(token, SECRET);
