const Router = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const config = require('config');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const router = new Router();
const authMiddleware = require('../middleware/auth.middleware');

router.post(
  '/registration',
  [
    check('email', 'Uncorrect email').isEmail(),
    check('name', 'Uncorrect email').isLength({
      min: 3,
      max: 12,
    }),
    check('password', 'Password must be longer than 3 and shorter than 12').isLength({
      min: 3,
      max: 12,
    }),
  ],
  async (req, res) => {
    try {
      console.log(req.body);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Uncorrect request', errors });
      }

      const { email, name, password } = req.body;

      const candidate = await User.findOne({ email });

      if (candidate) {
        return res.status(400).json({ message: `Пользователь с данной почтой уже зарегистрирован` });
      }
      const hashPassword = await bcrypt.hash(password, 8);
      const user = new User({ email, name, password: hashPassword });
      await user.save();
      return res.json({ message: 'Вы успешно зарегистрировались' });
    } catch (e) {
      console.log(e);
      res.send({ message: 'Server error' });
    }
  },
);

router.post(
  '/login',

  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const isPassEqual = bcrypt.compareSync(password, user.password);
      if (!isPassEqual) {
        return res.status(400).json({ message: 'Invalid password' });
      }

      const token = jwt.sign({ id: user.id }, config.get('secretKey'), { expiresIn: '1h' });
      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (e) {
      console.log(e);
      res.send({ message: 'Server error' });
    }
  },
);

router.get(
  '/auth',
  authMiddleware,

  async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.user.id });
      const token = jwt.sign({ id: user.id }, config.get('secretKey'), { expiresIn: '1h' });
      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (e) {
      console.log(e);
      res.send({ message: 'Server error' });
    }
  },
);

module.exports = router;
