const { Log, User, Desk } = require('../models');
const jwt = require('jsonwebtoken');

exports.Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(200).json({
        status: "fail",
        messege: "Provide both Email and Password"
      });
      return next();
    }

    const isuser = await User.findOne({ email });

    if (!isuser) {
      return res.status(400).json({
        status: "fail",
        message: "User not found"
      });
    }

    // if (isuser.onDesk === false) {
    //   res.status(200).json({
    //     status: "fail",
    //     messege: "You are no more on the Desk"
    //   });
    //   return next();
    // }

    if (!isuser || (password != isuser.password)) {
      res.status(200).json({
        status: "fail",
        messege: "user and password does not match"
      });
      return next();
    }

    const token = jwt.sign({ id: isuser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES
    });

    const cookieOptions = {
      expiresIn: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
      httpOnly: true
    };

    res.cookie('jwt', token, cookieOptions);
    res.status(201).json({
      status: 'success',
      token,
      data: {
        isuser
      }
    });
    next();

  } catch (error) {
    res.status(400).json({
      status: "Failed",
      err: error
    });
  }
};

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        return next();
      }

      res.locals.user = currentUser;
      req.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  } else {
    res.json({
      error: "please Logging"
    });
  }
};

exports.createNewUser = async (req, res) => {
  try {

    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ data: "user already exists" });
    }
    const newUser = await User.create({
      ...req.body,
      role: "GENERAL",
      onDesk: false
    });

    res.status(201);
    res.json({
      status: "new user created",
      data: {
        newUser
      }
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: "fail",
      erroe: (err)
    });
  }
};

exports.promoteUser = async (req, res) => {
  try {
    const { newRole } = req.body;

    const roleLevels = {
      'GENERAL': 0,
      'OP_HEAD': 1,
      'DEPT_HEAD': 2,
      'Admin': 3
    };

    const operatorRole = req.user.role || 'GENERAL';
    const operatorLevel = roleLevels[operatorRole];

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const targetLevel = roleLevels[targetUser.role || 'GENERAL'];
    const newRoleLevel = roleLevels[newRole];

    // Rule 1: Cannot modify someone of equal or higher rank
    if (operatorLevel <= targetLevel) {
      return res.status(403).json({
        message: "You cannot modify a user with equal or higher rank than yourself."
      });
    }

    // Rule 2: Cannot assign a role of equal or higher rank
    if (operatorLevel <= newRoleLevel) {
      return res.status(403).json({
        message: "You cannot assign a role equal to or higher than your own."
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: newRole },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      user
    });

  } catch (err) {
    res.status(400).json({
      status: "fail",
      error: err
    });
  }
};


exports.verifyUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { verified: true },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      user
    });

  } catch (err) {
    res.status(400).json({
      status: "fail",
      error: err
    });
  }
};

exports.assignDesk = async (req, res) => {
  try {

    const user = await User.findById(req.body.userId);
    const desk = await Desk.findById(req.body.deskId);

    if (!user || !desk) {
      return res.status(400).json({
        message: "User or Desk not found"
      });
    }

    user.currentDesk = desk._id;
    user.onDesk = true;
    await user.save();

    res.status(200).json({
      status: "success",
      user
    });

  } catch (err) {
    res.status(400).json({
      status: "fail",
      error: err
    });
  }
};

exports.getAllUsers = async (req, res) => {
  const docs = await User.find().populate({
    path: 'currentDesk'
  });
  try {
    res.status(200).json({
      NoOfResults: docs.length,
      data: {
        docs
      }
    });
  } catch (error) {
    res.json(error);
  }
};

exports.updateUser = async (req, res, next) => {
  var currentUser = req.body.currentUserId;
  var newUser = req.body.newUserId;
  var desk = req.body.deskId;

  var cuser = await User.findByIdAndUpdate(currentUser, { currentDesk: null, onDesk: false }, {
    new: true,
    runValidators: true
  });

  if (!cuser) return res.status(400).json({ message: "Current User does not exist, Please Provide a registered User id" });

  var nuser = await User.findByIdAndUpdate(newUser, { currentDesk: desk, onDesk: true }, {
    new: true,
    runValidators: true
  });

  if (!nuser) return res.status(400).json({ message: "New User does not exist, Please Provide a registered User id" });

  res.status(200).json({
    status: "Success"
  });
};

exports.getMyLogs = async (req, res) => {
  try {
    const logs = await Log.find({ $expr: { $eq: [{ $month: '$time' }, `${req.query.month}`] }, userId: `${req.body.userId}` });
    res.status(200).json({
      status: 'Success',
      logs: logs,
      length: logs.length
    });
  } catch (err) {
    res.status(400).json({
      status: "fail"
    });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.cookies.jwt) {
      return res.status(401).json({
        status: 'fail',
        message: 'Not logged in'
      });
    }

    const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id).populate('currentDesk');

    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: currentUser
      }
    });
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: 'Invalid token'
    });
  }
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};
