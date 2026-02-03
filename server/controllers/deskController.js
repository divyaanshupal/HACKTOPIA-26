const { Desk, User } = require('../models');

exports.getAllDesks = async (req, res) => {
  const docs = await Desk.find().populate({
    path: 'user'
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

exports.assignDesk = async (req, res, next) => {
  try {
    var user = await User.find({ name: req.body.user });
    const desk = await Desk.find({ designation: req.params.name });
    var userId = user[0].id;
    var deskId = desk[0].id;

    const data = await Desk.findByIdAndUpdate(deskId, {
      user: userId,
      userAssigned: true
    }, {
      new: true
    });
    next();
  } catch (err) {
    res.status(400).json({
      status: "Fail"
    });
  }
};

exports.updateDesk = async (req, res, next) => {
  try {
    const doc = await Desk.findByIdAndUpdate(req.body.deskId, { user: req.body.newUserId, userAssigned: true }, {
      new: true,
      runValidators: true
    });
    if (!doc) req.status(400).json({ messege: "Please Provide a valid Desk Id" });
    else next();
  } catch (error) {
    res.status(400).json({
      status: "updating failed",
      error: { error }
    });
    next();
  }
};

exports.createADesk = async (req, res) => {
  try {
    const newDoc = await Desk.create(req.body);
    res.status(201);
    res.json({
      status: "added data!",
      data: {
        data: newDoc
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "not a valid request"
    });
  }
};
