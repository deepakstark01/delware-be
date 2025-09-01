import nodemailer from 'nodemailer';

// Console transport for development/stub
const transporter = nodemailer.createTransport({
  streamTransport: true,
  newline: 'unix',
  buffer: true
});

export const sendWelcomeEmail = async (user, tempPassword) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@membership.com',
    to: user.email,
    subject: 'Welcome to Our Membership Platform - Account Activated!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2c3e50;">Welcome ${user.firstName}!</h1>
        <p>Congratulations! Your payment has been successfully processed and your membership account is now active.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;">
          <h3>Your Account Details:</h3>
          <ul>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Membership Plan:</strong> ${user.membershipPlan}</li>
            <li><strong>Status:</strong> Active</li>
          </ul>
        </div>

        <div style="background-color: #fff3cd; padding: 15px; border: 1px solid #ffeaa7; border-radius: 4px; margin: 20px 0;">
          <h3>🔐 Your Temporary Login Credentials:</h3>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Temporary Password:</strong> <code style="background-color: #f1f3f4; padding: 2px 6px;">${tempPassword}</code></p>
          <p><em>⚠️ Please log in and change your password immediately for security.</em></p>
        </div>

        <p>Thank you for joining our platform! You can now access all the features included in your membership.</p>
        
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">This email was sent because your payment was successfully processed. Only paid members receive account activation emails.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to paid member: ${user.email} (Plan: ${user.membershipPlan})`);
    console.log('Email content:', info.message.toString());
    return info;
  } catch (error) {
    console.error(`❌ Error sending welcome email to ${user.email}:`, error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@membership.com',
    to: user.email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>Hello ${user.firstName},</p>
      <p>You requested a password reset. Use the following token:</p>
      <p><strong>${resetToken}</strong></p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.message.toString());
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};
