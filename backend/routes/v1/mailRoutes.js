import express from "express";
import nodemailer from "nodemailer";
import { Faculty, Student } from "#models/index.js";

const router = express.Router();

import { config } from "dotenv";

config({ path: "../../.env" });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Bypass SSL verification if needed
  },
});

const generateEmailBody = (bodyContent, recipientName) => {
  const currentYear = new Date().getFullYear();

  const footer = `
      <tr>
        <td style="text-align: center; font-size: 12px; color: #888; padding-top: 20px; border-top: 1px solid #ddd;">
          <p>© ${currentYear} Bharath Institute of Higher Education & Research. All rights reserved.</p>
          <p>If you have any questions or concerns, feel free to <a href="mailto:srishty@bharathuniv.ac.in" style="color: #1a73e8; text-decoration: none;">contact us</a>.</p>
          <p>Bharath Institute of Higher Education & Research, 173, Agharam Road, Selaiyur, Chennai, Tamil Nadu 600073</p>
        </td>
      </tr>
    `;

  const emailBody = `
      <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>BIHER ERP Mail Service</title>
          </head>
        <body style="font-family: Arial, sans-serif; background-color: #f7f7f7; border-radius: 8px;">
          <table style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <tr>
              <td style="font-size: 12px; color: #333; text-align: center;">
                <p style="text-align: left;">Hello, ${recipientName}!</p>
              </td>
            </tr>
            <tr>
              <td style="font-size: 12px; color: #555;">
                <p style="line-height: 12px;">${bodyContent}</p>
              </td>
            </tr>
            ${footer}
          </table>
        </body>
      </html>
    `;

  return emailBody;
};

// Send email utility function
const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: `"BIHER SRISHTY" <${process.env.EMAIL_ID}>`, // sender address
    to, // receiver
    subject, // Subject line
    text, // plain text body
    html, // HTML body
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent: " + to);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};

router.post("/test", async (req, res) => {
  try {
    const email = req.body.email;

    const Faculty = await faculty.findOne({ email: email });
    const Student = await student.findOne({ email: email });

    const user = Faculty || Student;

    const name = user.name;

    const mailConfigurations = {
      from: process.env.EMAIL_ID,
      to: email,
      subject: "Test mail",
      text: `${name} has sent you a proposal for your project.`,
    };

    transporter.sendMail(mailConfigurations, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to send email" });
      } else {
        console.log("Email sent: " + info.response);
        return res.status(200).json({ msg: "OK" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { sendEmail, generateEmailBody };
export default router;