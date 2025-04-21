import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail", // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendAcceptanceEmail = async (toEmail, studentName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Congratulations! Your Admission to KRMU",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a365d;">Congratulations ${studentName}!</h2>
          <p>We are pleased to inform you that you have been accepted to KRM University.</p>
          
          <h3 style="color: #1a365d; margin-top: 20px;">Next Steps:</h3>
          <ol>
            <li>Complete your enrollment by visiting the student portal</li>
            <li>Submit any remaining documents</li>
            <li>Pay your tuition fees</li>
          </ol>
          
          <p style="margin-top: 20px;">If you have any questions, please contact our admissions office.</p>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #f7fafc; border-left: 4px solid #4299e1;">
            <p><strong>KRM University Admissions Office</strong></p>
            <p>Email: admissions@krmu.edu</p>
            <p>Phone: +91-XXXXXXXXXX</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export const sendRejectionEmail = async (toEmail, studentName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Admission Update from KRM University",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #cc0000;">Dear ${studentName},</h2>
          <p>Thank you for your interest in KRM University and for taking the time to apply.</p>

          <p>After careful consideration of your application, we regret to inform you that we are unable to offer you admission at this time.</p>
          
          <p>This decision was not easy, and we truly appreciate the effort you put into your application. We encourage you to continue pursuing your academic goals and wish you the very best in your future endeavors.</p>
          
          <p style="margin-top: 20px;">If you have any questions or would like feedback on your application, feel free to reach out to our admissions team.</p>

          <div style="margin-top: 30px; padding: 15px; background-color: #fef2f2; border-left: 4px solid #e53e3e;">
            <p><strong>KRM University Admissions Office</strong></p>
            <p>Email: admissions@krmu.edu</p>
            <p>Phone: +91-XXXXXXXXXX</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending rejection email:", error);
    return false;
  }
};
