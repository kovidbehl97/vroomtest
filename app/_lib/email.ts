// File: _lib/email.ts
import nodemailer from 'nodemailer';

// Create a transporter using your Brevo SMTP credentials from environment variables
const transporter = nodemailer.createTransport({
  host: "smtp.mailersend.net",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_LOGIN,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface BookingDetails {
  userName?: string;
  car: {
    make: string;
    model: string;
  };
  pickupDate: string;
  dropoffDate: string;
  sessionId: string;
  amount?: number; // optional if you want to show price
  currency?: string;
}

export async function sendBookingConfirmation(toEmail: string, bookingDetails: BookingDetails) {
  try {
    const mailOptions = {
      from: 'checkouts@vroomify.publicvm.com',
      to: toEmail,
      subject: 'Your Car Rental Booking is Confirmed!',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #6772e5; color: #ffffff; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Vroomify Booking Receipt</h1>
        </div>
        <div style="padding: 20px; color: #333;">
          <p>Hello <strong>${bookingDetails.userName || 'Customer'}</strong>,</p>
          <p>Thank you for your booking! Here are your details:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Car</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${bookingDetails.car.make} ${bookingDetails.car.model}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Pick-up Date</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${bookingDetails.pickupDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Drop-off Date</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${bookingDetails.dropoffDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Booking ID</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${bookingDetails.sessionId}</td>
            </tr>
            ${
              bookingDetails.amount
                ? `<tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Amount</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${bookingDetails.currency || 'USD'} ${bookingDetails.amount.toFixed(2)}</td>
                  </tr>`
                : ''
            }
          </table>
          <p style="margin-top: 20px;">If you have any questions, please contact us at <a href="mailto:support@vroomify.publicvm.com">support@vroomify.publicvm.com</a>.</p>
        </div>
        <div style="background-color: #f6f9fc; color: #8898aa; text-align: center; padding: 15px; font-size: 12px;">
          &copy; ${new Date().getFullYear()} Vroomify. All rights reserved.
        </div>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Booking receipt email sent successfully!");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error sending email:", error.message);
    } else {
      console.error("Unknown error sending email:", error);
    }
  }
}
