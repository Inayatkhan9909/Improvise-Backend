import Notification from "../Models/NotitcationsModel";
import transporter from "./nodemailerConfig";

interface NotificationOptions {
  recipientIds: string[]; 
  type: "approval" | "new-signup" | "class-started" | "booking" | "info"; 
  message: string; 
  name: string; 
  email: string; 
  emailSubject?: string; 
  emailBody?: string; 
}

export const sendNotifications = async ({
  recipientIds,
  type,
  name,
  message,
  email,
  emailSubject,
  emailBody,
}: NotificationOptions) => {
  try {
    
    const notifications = recipientIds.map((id) => ({
      recipientId: id,
      type,
      message,
    }));

    await Notification.insertMany(notifications);
    console.log("UI Notifications sent successfully.");

    
    if (emailSubject && emailBody) {
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: emailSubject,
        html: `
          <p>Hi ${name},</p>
          <p>${emailBody}</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("Email notification sent successfully.");
    }
  } catch (error: any) {
    console.error("Error sending notifications:", error);
    throw new Error("Notification sending failed."); 
  }
};
