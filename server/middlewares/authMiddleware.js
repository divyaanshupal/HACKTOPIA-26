const jwt = require('jsonwebtoken');
const { User } = require('../models');

// ================== PROTECT ==================
 const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'User no longer exists'
      });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid token'
    });
  }
};

// ================== ROLE HIERARCHY ==================
const roleHierarchy = {
  Admin: ["Admin", "DEPT_HEAD", "OP_HEAD", "GENERAL"],
  DEPT_HEAD: ["DEPT_HEAD", "OP_HEAD", "GENERAL"],
  OP_HEAD: ["OP_HEAD", "GENERAL"],
  GENERAL: ["GENERAL"]
};

// ================== PERMISSION CHECK ==================
const hasPermission = (allowedRoles) => {
  return (req, res, next) => {

    const userRole = req.user.role;
    const permittedRoles = roleHierarchy[userRole];

    const allowed = allowedRoles.some(role =>
      permittedRoles.includes(role)
    );

    if (!allowed) {
      return res.status(403).json({
        message: "You do not have permission"
      });
    }

    next();
  };
};

module.exports = {
  protect,
  hasPermission,
  roleHierarchy
};
