import dotenv from "dotenv";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

// Get directory name for .env path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

// Create SMTP transporter
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

// Define mail options
const mailOptions = {
  from: process.env.EMAIL_ID,
  bcc: ["balajibalamurugan1@gmail.com", "rebison85@gmail.com", "sahanav1255@gmail.com"], 
  subject: "Test Email from cPanel SMTP",
  text: "Hello! This is a test email sent using cPanel SMTP and Nodemailer.",
};

// Send email
transporter.sendMail(mailOptions)
  .then(info => console.log("Email sent successfully:", info.response))
  .catch(error => console.error("Error:", error));
