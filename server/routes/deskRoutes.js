const express = require('express');
const { deskController, userController } = require('../controllers');

const router = express.Router();

router.post('/createnewDesk', deskController.createADesk);
router.patch('/HandleTransfer', deskController.updateDesk, userController.updateUser);
router.patch('/assignUserToDesk/:name', deskController.assignDesk, userController.assignDesk);
router.get('/getDesks', deskController.getAllDesks);

module.exports = router;
