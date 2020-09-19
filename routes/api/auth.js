const express = require('express');
const router = express.Router();
const authUser = require('../../middlewares/auth');
const User = require('../../models/User');
const {validationResult} = require('express-validator');
const loginValidator = require('../../validators/loginValidator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');


// @route:   POST api/auth
// @description: authorize user
// @access:  private
router.get('/', authUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').select('-_id').select('-__v');
    res.json(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('server error');
  }
});


// @route:   POST api/auth
// @description: authenticate user and get token
// @access:  public
router.post('/', loginValidator, async (req, res) => {
  const errors = validationResult(req);
  console.log(errors.array())
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  const {email, password} = req.body;
  console.log(email, password);
  try {
    // see if user exists
    let user = await User.findOne({email});
    if (!user) {
      res.status(400).json({errors: [{msg: 'invalid email or password'}]});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({errors: [{msg: 'invalid email or password'}]});
    }

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