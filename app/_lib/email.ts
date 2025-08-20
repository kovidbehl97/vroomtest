// File: _lib/email.ts
import nodemailer from 'nodemailer';

// Create a transporter using your Brevo SMTP credentials from environment variables
const transporter = nodemailer.createTransport({
  host: "smtp.mailersend.net", 
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.SMTP_LOGIN,    
    pass: process.env.SMTP_PASSWORD, 
  },
});

export async function sendBookingConfirmation(toEmail: string, bookingDetails: any) {
  try {
    const mailOptions = {
      from: 'checkouts@vroomify.publicvm.com', // Your verified sender email
      to: toEmail,
      subject: 'Your Car Rental Booking is Confirmed!',
      html: `
        <h1>Booking Confirmation</h1>
        <p>Hello, ${bookingDetails.userName || 'Customer'},</p>
        <p>Thank you for your booking! Here are your details:</p>
        <ul>
          <li><strong>Car:</strong> ${bookingDetails.car.make} ${bookingDetails.car.model}</li>
          <li><strong>Pick-up Date:</strong> ${bookingDetails.pickupDate}</li>
          <li><strong>Drop-off Date:</strong> ${bookingDetails.dropoffDate}</li>
          <li><strong>Booking ID:</strong> ${bookingDetails.sessionId}</li>
        </ul>
        <p>If you have any questions, please contact us.</p>
        <p>Best regards,<br/>Vroomify Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}