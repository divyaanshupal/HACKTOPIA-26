const express = require('express');
const router = express.Router();
const { viewController, userController } = require('../controllers');

router.get('/', viewController.getLoginPage);

// Admin routes
router.get('/adminDashboard', userController.isLoggedIn, viewController.getAdminDigitalDesk);
router.get('/adminDashboard/digitalDesk', userController.isLoggedIn, viewController.getAdminDigitalDesk);
router.get('/adminDashboard/trackFiles', userController.isLoggedIn, viewController.getTrackFileDesk);
router.get('/adminDashboard/createUser', userController.isLoggedIn, viewController.getCreateUserDesk);
router.get('/adminDashboard/handleTransfer', userController.isLoggedIn, viewController.getTransferDesk);
router.get('/adminDashboard/logDesk', userController.isLoggedIn, viewController.getAdminLogDesk);

// User routes
router.get('/userDashboard', userController.isLoggedIn, viewController.getUserDigitalDesk);
router.get('/userDashboard/DigitalDesk', userController.isLoggedIn, viewController.getUserDigitalDesk);
router.get('/userDashboard/logDesk', userController.isLoggedIn, viewController.getUserLogDesk);

// File detail routes
router.get('/trackfile/:id', userController.isLoggedIn, viewController.getTrackFileInfo);
router.get('/fileDetail/:id', userController.isLoggedIn, viewController.getFileInfo);
router.get('/myFile/:id', userController.isLoggedIn, viewController.getMyFileInfo);

// Applicant routes
router.get('/applicant/files', viewController.getApplicantDesk);

module.exports = router;
