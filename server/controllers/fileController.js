const { File, User, Timeline, Log } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { sendFileNotification } = require('../utils/emailService');

exports.addNewFile = async (req, res) => {
  try {
    var userid;
    if (req.user && req.user.id) {
      userid = req.user.id;
    } else {
      userid = req.body.userId;
    }

    console.log('Debug addNewFile - UserID:', userid);

    const user = await User.findById(userid).populate({
      path: 'currentDesk'
    });

    if (!user) {
      console.log('Debug addNewFile - User not found in DB');
      return res.status(404).json({
        status: "fail",
        error: "User not found"
      });
    }

    console.log('Debug addNewFile - User found:', user.name);
    console.log('Debug addNewFile - CurrentDesk:', user.currentDesk);

    if (!user.currentDesk) {
      console.log('Debug addNewFile - No current desk assigned (allowing for General user)');
    }

    var creationDate = new Date();
    var mydate;
    if (req.body.expectedDate) {
      var expDate = req.body.expectedDate.split('-');
      // Month is 0-indexed in Date constructor
      mydate = new Date(expDate[0], expDate[1] - 1, expDate[2]);
    } else {
      mydate = new Date(); // Default to current date if not provided
    }

    var currentDate = new Date();

    const delayed = currentDate > mydate;


    var data = {
      subject: req.body.subject,
      status: "Pending",
      currentDesk: user.currentDesk ? user.currentDesk._id : null,
      previousDesk: user.currentDesk ? user.currentDesk._id : null,
      currentUserId: user.id,
      currentUserName: user.name,
      createdBy: user.id,  // Track original creator
      currentOffice: user.currentDesk ? user.currentDesk.office : null,
      currentBranch: user.currentDesk ? user.currentDesk.branch : null,
      mode: req.body.mode,
      creationDate: creationDate,
      expectedDate: mydate,
      delayed: delayed,
      applicantDetails: {
        name: req.body.applicantName,
        mobileNumber: req.body.applicantMobileNumber,
        email: req.body.applicantEmailId
      },
      applicantMobileNumber: req.body.applicantMobileNumber,
      dateOfLastForward: currentDate
    };

    const newFile = await File.create(data);
    res.status(201);
    res.json({
      status: "new File created",
      data: {
        newFile
      }
    });

    await Timeline.create({
      fileId: newFile._id,
      status: "Pending",
      desk: user.currentDesk ? user.currentDesk._id : null,
      dateOfReceiving: creationDate
    });

  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "fail",
      error: err.message || err
    });
  }
};

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Point to server/public/assets/files
    cb(null, path.join(__dirname, '../public/assets/files'));
  },
  filename: (req, file, cb) => {
    const extension = file.mimetype.split('/')[1];
    cb(null, `file-${Date.now()}.${extension}`);
  }
});

const upload = multer({ storage: multerStorage });

exports.multerFileUpload = upload.single('file');

exports.uploadFile = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../public/assets/files', req.file.filename);

    // 1. Initial save of the filename
    const data = {
      file: req.file.filename
    };
    let uploadedFile = await File.findByIdAndUpdate(req.body.fileId, data, {
      new: true,
      runValidators: true
    });

    // 2. Call AI Summarization Webhook (SYNCHRONOUS - wait for result before responding)
    try {
      console.log('Sending file to AI summarizer:', filePath);
      const form = new FormData();
      form.append('file', fs.createReadStream(filePath));

      const response = await axios.post('https://abhushuk.app.n8n.cloud/webhook/file-summarizer', form, {
        headers: {
          ...form.getHeaders(),
        },
        timeout: 30000 // 30 second timeout
      });

      if (response.data) {
        console.log('AI Response received:', response.data);
        const updateData = {};

        if (response.data.summary) {
          console.log('AI Summary received:', response.data.summary);
          updateData.summary = response.data.summary;
        }

        // Handle deadline from AI
        if (response.data.deadline) {
          console.log('AI Deadline detected:', response.data.deadline);
          updateData.expectedDate = new Date(response.data.deadline);
        }

        // Handle priority/label from AI
        if (response.data.label) {
          console.log('AI Priority detected:', response.data.label);
          updateData.priority = response.data.label;
        }

        // Handle auto-reject if return is true (or string "true") - SET TO CLOSED STATUS
        // User requirement: "if it comes true we have to close and reject the file outright"
        // Interpreted as: if response.data.return is true, reject.
        if (response.data.return === true || response.data.return === 'true') {
          console.log('AI flagged file for auto-rejection - CLOSING FILE');
          updateData.status = 'Closed';  // Check if user wants 'Rejected' or 'Closed'. Code said 'Closed' previously.
          // Note: Timeline says 'Rejected'.

          // Create timeline entry for auto-rejection
          try {
            const Timeline = require('../models/timelineModel');
            const timelineData = {
              fileId: req.body.fileId,
              remarks: 'Auto-closed by AI: Document flagged for return to applicant',
              status: 'Rejected'
            };
            const newTimeline = await Timeline.create(timelineData);
            updateData.$push = { timeline: newTimeline._id };
          } catch (tErr) {
            console.error('Error creating rejection timeline:', tErr);
          }
        }

        if (Object.keys(updateData).length > 0) {
          uploadedFile = await File.findByIdAndUpdate(req.body.fileId, updateData, { new: true });
          console.log('File updated with AI analysis:', updateData);
        }
      }
    } catch (aiErr) {
      console.error('AI Summarization failed:', aiErr.response?.data || aiErr.message);
      // Continue without AI - file will still be uploaded
    }

    res.status(200).json({
      status: 'Success',
      data: uploadedFile,
      autoRejected: uploadedFile.status === 'Closed' ? true : false
    });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(404).json({
      status: 'file upload failed',
      error: err.message || err
    });
  }
};

exports.updateTimeTaken = async (req, res, next) => {
  // Calculate time taken
  var date1 = new Date();
  var date2 = new Date();

  var Difference_In_Time = date2.getTime() - date1.getTime();
  var timeTaken = Difference_In_Time / (1000 * 3600 * 24);
};

exports.getAllFiles = async (req, res) => {
  const docs = await File.find().populate('currentDesk').populate('previousDesk').populate('timeline');
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

exports.getOneFile = async (req, res) => {
  try {
    let query = File.findById(req.params.id).populate('currentDesk').populate('previousDesk').populate({
      path: 'timeline',
      populate: ({ path: 'desk', populate: { path: 'user' } })
    });
    const doc = await query;
    if (doc) {
      return res.status(200).json({
        data: doc
      });
    } else {
      return res.status(200).json({
        detail: "no document with this id found"
      });
    }
  } catch (error) {
    return res.status(400).json({
      error: error
    });
  }
};

exports.addExistingFile = async (req, res) => {
  try {
    // Implementation for adding existing file
  } catch (err) {
    // Handle error
  }
};

exports.logger = async (req, res, next) => {
  var date = new Date();
  var data = {
    fileId: req.body.fileId,
    userId: req.user.id,
    time: date
  };

  const newlog = await Log.create(data);
  next();
};

exports.sendFile = async (req, res) => {
  try {
    // check for the role and if the user is gebneral he can not do it
    // if (!["Admin", "DEPT_HEAD", "OP_HEAD"].includes(req.user.role)) {
    //   return res.status(403).json({
    //     message: "You cannot forward files"
    //   });
    // }

    if (
      (req.body.status === "Approved" || req.body.status === "Rejected") &&
      !req.body.remarks
    ) {
      return res.status(400).json({
        message: "Remarks are required when approving or rejecting a file"
      });
    }

    // 1. Check if file exists
    let query = File.findById(req.body.fileId);
    const fileInfo = await query;
    if (!fileInfo) {
      return res.status(404).json({
        error: "no file found of this ID"
      });
    }

    // 2. Get desk data from the user
    const user1 = await User.findById(req.user.id).populate({
      path: 'currentDesk'
    });

    var previousDesk = user1.currentDesk;

    let user2 = null;
    let nextDesk = null;

    // Only look up next user if provided
    if (req.body.nextUserId) {
      user2 = await User.findById(req.body.nextUserId).populate("currentDesk");

      console.log(user2);

      if (!user2) {
        return res.status(400).json({ message: "Next user not found" });
      }

      if (!user2.currentDesk) {
        return res.status(400).json({
          message: "Next user is not assigned to any desk"
        });
      }

      nextDesk = user2.currentDesk;

      // HIERARCHY CHECK - Allow sending to any HIGHER role (not necessarily immediate)
      const roleLevels = {
        'GENERAL': 0,
        'OP_HEAD': 1,
        'DEPT_HEAD': 2,
        'Admin': 3
      };

      const senderRole = req.user.role || 'GENERAL';
      const recipientRole = user2.role || 'GENERAL';

      const senderLevel = roleLevels[senderRole];
      const recipientLevel = roleLevels[recipientRole];

      // For non-rejection: sender must be lower level OR same level as recipient
      // Admins can send to anyone
      if (req.body.status !== 'Rejected') {
        if (senderRole !== 'Admin' && recipientLevel < senderLevel) {
          return res.status(403).json({
            message: `Hierarchy Violation: You (${senderRole}) cannot send files to a lower-ranked user (${recipientRole}).`
          });
        }
      }
    } else {
      // If no Next User ID, status must be Approved or Rejected (Closing/Terminating flow)
      if (req.body.status !== 'Approved' && req.body.status !== 'Rejected') {
        return res.status(400).json({
          message: "Next User is required unless you are Approving or Rejecting the file."
        });
      }
    }

    var currentDate = new Date();

    // 3. Add timeline
    // If forwarding, desk is previousDesk (sending FROM there). 
    // Wait, timeline usually records WHERE it was received. 
    // Existing code: desk: previousDesk.id
    // If we are NOT forwarding, we are just adding a log on the current desk?
    // Let's keep using user1.currentDesk (previousDesk) as the location of this action.

    var data = {
      fileId: req.body.fileId,
      status: req.body.status,
      remarks: req.body.remarks,
      desk: previousDesk ? previousDesk.id : null,
      dateOfReceiving: fileInfo.dateOfLastForward,
      dateOfForwarding: currentDate
    };

    const newTimeline = await Timeline.create(data);
    fileInfo.timeline.push(newTimeline.id);
    var updatedTimeline = fileInfo.timeline;

    const delayed = currentDate > fileInfo.expectedDate;

    // 4. Update the file data
    var updatingData = {
      // Only change location if forwarding
      // currentDesk: user2.currentDesk.id, 
      // previousDesk: user1.currentDesk,
      // currentBranch: user2.currentDesk.branch,
      // currentOffice: user2.currentDesk.office,
      // currentUserId: user2.id,
      // currentUserName: user2.name,

      delayed: delayed,
      dateOfLastForward: currentDate,
      timeline: updatedTimeline
    };

    if (user2) {
      updatingData.currentDesk = user2.currentDesk.id;
      updatingData.previousDesk = user1.currentDesk;
      updatingData.currentBranch = user2.currentDesk.branch;
      updatingData.currentOffice = user2.currentDesk.office;
      updatingData.currentUserId = user2.id;
      updatingData.currentUserName = user2.name;
    }

    if (req.body.status) {
      updatingData.status = req.body.status;
    }

    if (req.body.status === "Approved") {
      updatingData.status = "Closed";
    }

    const doc = await File.findByIdAndUpdate(req.body.fileId, updatingData, {
      new: true,
      runValidators: true
    });

    if (doc) {
      // Email Notifications (Background execution)
      (async () => {
        try {
          // 1. Notify Recipient (Forwarding)
          if (user2 && user2.email) {
            await sendFileNotification({
              recipientEmail: user2.email,
              recipientName: user2.name,
              senderName: user1.name,
              senderDesignation: user1.currentDesk?.designation,
              fileDetails: doc,
              remarks: req.body.remarks,
              status: req.body.status,
              pdfPath: doc.file // Attachment filename
            });
          }

          // 2. Notify Creator (Approved/Rejected)
          if (req.body.status === 'Approved' || req.body.status === 'Rejected') {
            // Find creator email
            let creatorEmail = null;
            let creatorName = null;

            if (fileInfo.createdBy) {
              const creator = await User.findById(fileInfo.createdBy);
              if (creator) {
                creatorEmail = creator.email;
                creatorName = creator.name;
              }
            } else if (fileInfo.applicantDetails?.email) {
              // Fallback to applicant if createdBy is missing
              creatorEmail = fileInfo.applicantDetails.email;
              creatorName = fileInfo.applicantDetails.name;
            }

            if (creatorEmail) {
              await sendFileNotification({
                recipientEmail: creatorEmail,
                recipientName: creatorName,
                senderName: user1.name,
                senderDesignation: user1.currentDesk?.designation,
                fileDetails: doc,
                remarks: req.body.remarks,
                status: req.body.status,
                pdfPath: doc.file
              });
            }
          }
        } catch (emailErr) {
          console.error('Email Notification Error:', emailErr);
        }
      })();

      return res.status(200).json({
        status: "Success",
        file: doc,
        user: user1
      });
    } else {
      return res.status(500).json({ message: "Failed to update file record" });
    }
  } catch (err) {
    res.status(400).json({
      message: err
    });
  }
};

exports.fileFilters = async (req, res) => {
  try {
    const files = await File.find(req.query);

    res.status(200).json({
      message: 'files filtered',
      results: files.length,
      files: files
    });
  } catch (err) {
    res.status(400).json({
      message: 'request failed',
      error: err
    });
  }
};

// Bulk approve/reject files
exports.bulkAction = async (req, res) => {
  try {
    const { fileIds, status, remarks } = req.body;

    // Validate inputs
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No files selected'
      });
    }

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid status. Must be Approved or Rejected'
      });
    }

    if (!remarks || !remarks.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Remarks are required for bulk actions'
      });
    }

    // Check user role - only Admin, DEPT_HEAD, OP_HEAD can bulk action
    if (!['Admin', 'DEPT_HEAD', 'OP_HEAD'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform bulk actions'
      });
    }

    const user = await User.findById(req.user.id).populate('currentDesk');
    const results = { success: 0, failed: 0, errors: [] };

    for (const fileId of fileIds) {
      try {
        const file = await File.findById(fileId);

        if (!file) {
          results.failed++;
          results.errors.push(`File ${fileId} not found`);
          continue;
        }

        // Debug log
        console.log('Bulk action - File currentUserId:', file.currentUserId, '| User id:', req.user.id);

        // Verify file is assigned to this user (handle ObjectId comparison)
        const fileUserId = file.currentUserId?.toString() || String(file.currentUserId);
        const requestUserId = req.user.id?.toString() || String(req.user.id);

        if (fileUserId !== requestUserId) {
          results.failed++;
          results.errors.push(`File ${fileId} is not assigned to you (file user: ${fileUserId}, your id: ${requestUserId})`);
          continue;
        }

        // Create timeline entry
        const timelineData = {
          fileId: fileId,  // Required field
          desk: user.currentDesk?._id,
          message: `File ${status.toLowerCase()} (Bulk Action): ${remarks}`,
          remarks: remarks,
          mode: `Bulk ${status}`
        };
        const newTimeline = await Timeline.create(timelineData);

        // Update file
        await File.findByIdAndUpdate(fileId, {
          status: status === 'Approved' ? 'Closed' : 'Rejected',
          $push: { timeline: newTimeline._id }
        });

        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push(`Error processing file ${fileId}: ${err.message}`);
      }
    }

    res.status(200).json({
      status: 'Success',
      message: `Bulk ${status.toLowerCase()} completed`,
      results: {
        total: fileIds.length,
        success: results.success,
        failed: results.failed,
        errors: results.errors.length > 0 ? results.errors : undefined
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Bulk action failed',
      error: err.message
    });
  }
};
