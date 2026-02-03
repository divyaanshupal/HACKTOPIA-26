const nodemailer = require('nodemailer');
const path = require('path');

// Create reusable transporter object using Gmail
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

/**
 * Send file notification email to recipient
 * @param {Object} options
 * @param {string} options.recipientEmail - Email address of the recipient
 * @param {string} options.recipientName - Name of the recipient
 * @param {string} options.senderName - Name of the sender
 * @param {string} options.senderDesignation - Sender's desk/designation
 * @param {Object} options.fileDetails - File details object
 * @param {string} options.remarks - Remarks/comments
 * @param {string} options.status - File status (Pending, Approved, Rejected)
 * @param {string|null} options.pdfPath - Path to the PDF file (optional)
 */
const sendFileNotification = async (options) => {
    const {
        recipientEmail,
        recipientName,
        senderName,
        senderDesignation,
        fileDetails,
        remarks,
        status,
        pdfPath
    } = options;

    // Skip if email not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('Email not configured. Skipping notification.');
        return { success: false, message: 'Email not configured' };
    }

    const transporter = createTransporter();

    // Determine email subject based on status
    let emailSubject = `📁 New File Received: ${fileDetails.subject}`;
    let statusColor = '#f59e0b'; // yellow for pending
    let statusEmoji = '📋';

    if (status === 'Approved') {
        emailSubject = `✅ File Approved: ${fileDetails.subject}`;
        statusColor = '#10b981'; // green
        statusEmoji = '✅';
    } else if (status === 'Rejected') {
        emailSubject = `❌ File Rejected: ${fileDetails.subject}`;
        statusColor = '#ef4444'; // red
        statusEmoji = '❌';
    }

    // HTML Email Template
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; background-color: ${statusColor}; }
        .info-box { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0; }
        .info-row { display: flex; margin: 8px 0; }
        .info-label { font-weight: bold; color: #64748b; width: 120px; }
        .info-value { color: #1e293b; }
        .remarks-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
        .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${statusEmoji} File Tracking System</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Educational Institute</p>
        </div>
        
        <div class="content">
          <p>Dear <strong>${recipientName}</strong>,</p>
          
          <p>You have received a new file that requires your attention:</p>
          
          <div class="info-box">
            <div class="info-row">
              <span class="info-label">File ID:</span>
              <span class="info-value">${fileDetails.fileId || fileDetails._id}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Subject:</span>
              <span class="info-value"><strong>${fileDetails.subject}</strong></span>
            </div>
            <div class="info-row">
              <span class="info-label">From:</span>
              <span class="info-value">${senderName} (${senderDesignation || 'N/A'})</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="status-badge">${status}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span class="info-value">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
            </div>
          </div>
          
          ${remarks ? `
          <div class="remarks-box">
            <strong>📝 Remarks:</strong>
            <p style="margin: 10px 0 0;">${remarks}</p>
          </div>
          ` : ''}
          
          ${pdfPath ? '<p>📎 <strong>Attachment:</strong> The file document is attached to this email.</p>' : ''}
          
          <p>Please log in to the File Tracking System to take action on this file.</p>
        </div>
        
        <div class="footer">
          <p>This is an automated notification from the File Tracking System.</p>
          <p>© ${new Date().getFullYear()} Educational Institute - File Tracking System</p>
        </div>
      </div>
    </body>
    </html>
  `;

    // Build email options
    const mailOptions = {
        from: `"File Tracking System" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: emailSubject,
        html: htmlContent
    };

    // Add attachment if PDF exists
    if (pdfPath) {
        const absolutePath = path.join(__dirname, '..', 'public', 'assets', 'files', pdfPath);
        mailOptions.attachments = [{
            filename: pdfPath,
            path: absolutePath
        }];
    }

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendFileNotification };
