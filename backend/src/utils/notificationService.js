const nodemailer = require('nodemailer');
const { Notification, User } = require('../models');

// Configure email transporter (Mock for development)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: process.env.EMAIL_PORT || 587,
    auth: {
        user: process.env.EMAIL_USER || 'mock_user',
        pass: process.env.EMAIL_PASS || 'mock_pass'
    }
});

const sendNotification = async (userId, { title, message, type = 'INFO', link = null, email = false }) => {
    try {
        // 1. Create In-App Notification
        const notification = await Notification.create({
            userId,
            title,
            message,
            type,
            link
        });

        // 2. Send Email if requested
        if (email) {
            const user = await User.findByPk(userId);
            if (user && user.email) {
                const mailOptions = {
                    from: '"HMS Pro Alerts" <alerts@hmspro.com>',
                    to: user.email,
                    subject: title,
                    text: message,
                    html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #2563eb;">${title}</h2>
                            <p>${message}</p>
                            ${link ? `<a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}${link}" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px;">View Details</a>` : ''}
                           </div>`
                };

                // In a real environment, we'd await this. For now, we'll log it.
                if (process.env.NODE_ENV === 'production') {
                    await transporter.sendMail(mailOptions);
                } else {
                    console.log(`[EMAIL MOCK] To: ${user.email} | Subject: ${title}`);
                }
            }
        }

        return notification;
    } catch (error) {
        console.error('Notification Error:', error);
    }
};

module.exports = { sendNotification };
