
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

    const textContent = `
      Order Update Notification
      
      Order ID: ${orderInfo.id}
      Buyer: ${orderInfo.buyerName}
      Style Number: ${orderInfo.styleNumber}
      
      New ${notification.type} from ${notification.authorName} (${notification.authorRole}):
      ${notification.message}
      
      View order details: ${process.env.APP_URL || 'http://localhost:5000'}/order/${orderInfo.id}
    `;

    await this.sendNotification(stakeholderEmails, subject, htmlContent, textContent);
  }
}

export const emailService = new EmailService();
