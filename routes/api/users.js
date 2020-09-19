const express = require('express');
const router = express.Router();
const {validationResult} = require('express-validator');
const registerValidator = require('../../validators/registerValidator');
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');


// @route:   POST api/users
// @description: register user
// @access:  public
router.post('/', registerValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()})
  }

  const {name, email, password} = req.body;

  try {
    // see if user exists
    let user = await User.findOne({email});
    if (user) {
      res.status(400).json({errors: [{msg: 'user already exists'}]})
    }

    // get user's gravatar'
    const avatar = gravatar.url(email, {s: '200', r: 'pg', d: 'mm'})
    user = new User({name, email, avatar, password});

    // encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = {
      user: {id: user.id}
    }
    jwt.sign(payload,
      config.get('jwtSecret'),
      {expiresIn: 360000},
      (err, token) => {
        if (err) throw err;
        res.json({token});
      });

    // return jsonwebtoken
  } catch (err) {
    console.log(err.message);
    res.status(500).send('server error');
  }
});


module.exports = router;