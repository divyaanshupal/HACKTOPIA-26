const express = require('express');
const { userController } = require('../controllers');
const { protect, hasPermission } = require('../middlewares/authMiddleware');

const router = express.Router();

// ================= AUTH =================
router.post('/login', userController.Login);
router.get('/logout', userController.logout);
router.get('/me', protect, userController.getCurrentUser);


// ================= REGISTRATION =================
router.post('/createUser', userController.createNewUser);

// ================= USERS =================

router.get(
  '/getUsers',
  protect,
  userController.getAllUsers
);

router.get(
  '/myLogs',
  protect,
  userController.getMyLogs
);

// ================= ROLE MANAGEMENT =================

// Admin → DEPT_HEAD
// DEPT_HEAD → OP_HEAD
router.patch(
  '/promote/:id',
  protect,
  hasPermission(["Admin","DEPT_HEAD"]),
  userController.promoteUser
);

// OP_HEAD & above
router.patch(
  '/verify/:id',
  protect,
  hasPermission(["OP_HEAD"]),
  userController.verifyUser
);

// ================= DESK MANAGEMENT =================

// Only Admin
router.patch(
  '/assignDesk',
  protect,
  hasPermission(["Admin", "DEPT_HEAD"]),
  userController.assignDesk
);

module.exports = router;
