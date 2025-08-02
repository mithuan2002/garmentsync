
import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure with your email service (Gmail, SendGrid, etc.)
    // For development, you can use ethereal.email for testing
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
        pass: process.env.EMAIL_PASS || 'ethereal.pass'
      }
    });
  }

  async sendNotification(
    recipients: string[],
    subject: string,
    htmlContent: string,
    textContent: string
  ): Promise<void> {
    try {
      await Promise.all(
        recipients.map(email =>
          this.transporter.sendMail({
            from: process.env.FROM_EMAIL || 'noreply@ordertracker.com',
            to: email,
            subject,
            text: textContent,
            html: htmlContent,
          })
        )
      );
      console.log(`Email notifications sent to ${recipients.length} recipients`);
    } catch (error) {
      console.error('Failed to send email notifications:', error);
    }
  }

  async notifyStakeholders(
    stakeholderEmails: string[],
    orderInfo: { id: string; buyerName: string; styleNumber: string },
    notification: { type: 'comment' | 'update'; message: string; authorName: string; authorRole: string }
  ): Promise<void> {
    const subject = `Order ${orderInfo.id} - New ${notification.type}`;
    
    const htmlContent = `
      <h2>Order Update Notification</h2>
      <p><strong>Order ID:</strong> ${orderInfo.id}</p>
      <p><strong>Buyer:</strong> ${orderInfo.buyerName}</p>
      <p><strong>Style Number:</strong> ${orderInfo.styleNumber}</p>
      <hr>
      <p><strong>New ${notification.type} from ${notification.authorName} (${notification.authorRole}):</strong></p>
      <blockquote style="margin: 10px 0; padding: 10px; background-color: #f5f5f5; border-left: 4px solid #007bff;">
        ${notification.message}
      </blockquote>
      <p><a href="${process.env.APP_URL || 'http://localhost:5000'}/order/${orderInfo.id}">View Order Details</a></p>
    `;

    const textContent = `Order Update Notification
Order ID: ${orderInfo.id}
Buyer: ${orderInfo.buyerName}
Style Number: ${orderInfo.styleNumber}

New ${notification.type} from ${notification.authorName} (${notification.authorRole}):
${notification.message}

View Order Details: ${process.env.APP_URL || 'http://localhost:5000'}/order/${orderInfo.id}
    `;

    await this.sendNotification(stakeholderEmails, subject, htmlContent, textContent);
  }

  async sendStakeholderInvitation(
    recipientEmail: string,
    recipientName: string,
    orderInfo: { id: string; buyerName: string; styleNumber: string },
    inviterName: string,
    role: string,
    permissions: string,
    customMessage?: string
  ): Promise<void> {
    const subject = `Invitation to collaborate on Order ${orderInfo.id}`;
    
    const htmlContent = `
      <h2>You've been invited to collaborate on an order</h2>
      <p>Hello ${recipientName},</p>
      <p><strong>${inviterName}</strong> has invited you to collaborate on the following order:</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Order ID:</strong> ${orderInfo.id}</p>
        <p><strong>Buyer:</strong> ${orderInfo.buyerName}</p>
        <p><strong>Style Number:</strong> ${orderInfo.styleNumber}</p>
        <p><strong>Your Role:</strong> ${role}</p>
        <p><strong>Permissions:</strong> ${permissions}</p>
      </div>

      ${customMessage ? `<div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #ffc107;">
        <h4 style="margin: 0 0 10px 0; color: #856404;">Personal Message:</h4>
        <p style="margin: 0; color: #856404;">${customMessage}</p>
      </div>` : ''}

      <p>You can now track progress, add comments, and collaborate on this order.</p>
      <p><a href="${process.env.APP_URL || 'http://localhost:5000'}/order/${orderInfo.id}" 
         style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
         View Order Details
      </a></p>
      
      <p>If you have any questions, please contact ${inviterName}.</p>
    `;

    const textContent = `You've been invited to collaborate on an order

Hello ${recipientName},

${inviterName} has invited you to collaborate on the following order:

Order ID: ${orderInfo.id}
Buyer: ${orderInfo.buyerName}
Style Number: ${orderInfo.styleNumber}
Your Role: ${role}
Permissions: ${permissions}

${customMessage ? `Personal Message: ${customMessage}

` : ''}You can now track progress, add comments, and collaborate on this order.

View Order Details: ${process.env.APP_URL || 'http://localhost:5000'}/order/${orderInfo.id}

If you have any questions, please contact ${inviterName}.
    `;

    await this.sendNotification([recipientEmail], subject, htmlContent, textContent);
  }

  async sendNotificationReply(to: string, subject: string, message: string): Promise<void> {
    if (!this.client) {
      console.log("Email service not initialized - would send reply:", { to, subject, message });
      return;
    }

    try {
      const msg = {
        to,
        from: "admin@garmentfactory.com",
        subject,
        text: message,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">GarmentSync Reply</h2>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; line-height: 1.6; color: #374151;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
            <p>This message was sent via GarmentSync Manufacturing Platform</p>
          </div>
        </div>`,
      };

      await this.client.send(msg);
      console.log("Reply sent successfully to:", to);
    } catch (error) {
      console.error("Failed to send reply:", error);
      throw error;
    }
  }

  private async sendNotification(emails: string[], subject: string, htmlContent: string, textContent: string): Promise<void> {
    if (!this.client) {
      console.log("Email service not initialized - would send notification:", { emails, subject, textContent });
      return;
    }

    try {
      const msg = {
        to: emails,
        from: "notifications@garmentfactory.com",
        subject,
        text: textContent,
        html: htmlContent,
      };

      await this.client.sendMultiple(msg);
      console.log("Notification sent successfully to:", emails);
    } catch (error) {
      console.error("Failed to send notification:", error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
