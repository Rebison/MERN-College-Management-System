import { transporter } from '../../emails/config/emailTransporter.js';
import { getPermissionTemplate } from '../../emails/templates/permissionTemplate.js';

/**
 * Generate both HTML and plain text version of the email.
 * @param {string} bodyContent - HTML content inside the body section
 * @param {string} recipientName - Name of the email recipient
 * @returns {{ html: string, text: string }}
 */
export const generateEmailBody = (bodyContent, recipientName = 'there') => {
    const currentYear = new Date().getFullYear();

    const footerHTML = `
        <tr>
            <td style="padding: 12px; font-size: 12px; color: #888888; text-align: center;">
                <p>© ${currentYear} Bharath Institute of Higher Education & Research</p>
                <p style="margin: 4px 0;">
                    For queries, contact 
                    <a href="mailto:srishty@bharathuniv.ac.in" style="color: #1a73e8; text-decoration: none;">srishty.bharathuniv.ac.in</a>
                </p>
                <p style="margin: 4px 0;">
                    173, Agharam Road, Selaiyur, Chennai, Tamil Nadu 600073
                </p>
            </td>
        </tr>
  `;

    const html = `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>BIHER ERP Notification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">

            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width: 600px; margin: 20px auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); overflow: hidden;">

                <tr>
                    <td style="padding: 12px;">
                        <p style="font-size: 16px; color: #333333; margin: 0 0 12px;">
                            Hello, ${recipientName}!
                        </p>

                        <p style="font-size: 14px; color: #555555; line-height: 1.6; margin: 0;">
                            ${bodyContent}
                        </p>
                    </td>
                </tr>

                <tr>
                    <td style="padding: 0 12px;">
                        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                    </td>
                </tr>

                ${footerHTML}
            </table>
        </body>
    </html>
  `;

    // Remove HTML tags for plain text version
    const text = `Dear ${recipientName},\n\n${bodyContent
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim()}`;

    return { html, text };
};

/**
 * Sends email using configured transporter.
 * @param {string} to - Email address of the recipient
 * @param {string} subject - Subject line
 * @param {string} text - Plain text version
 * @param {string} html - HTML version
 */
export const sendEmail = async (to, subject, text, html) => {
    const mailOptions = {
        from: `"BIHER E-CELL" <${process.env.EMAIL_ID}>`,
        to,
        subject,
        text,
        html
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${to}`);
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        throw error;
    }
};

/**
 * Shortcut method to send permission-related template
 * @param {'submitted'|'approved'|'rejected'|'reminder'} type 
 * @param {string} recipientEmail 
 * @param {string} recipientName 
 * @param {object} extras - Any extra data for template (requestType, approverName, etc.)
 */
export const sendPermissionEmail = async (type, recipientEmail, recipientName, extras = {}) => {
    const { subject, bodyContent } = getPermissionTemplate(type, recipientName, extras);
    const { html, text } = generateEmailBody(bodyContent, recipientName);
    await sendEmail(recipientEmail, subject, text, html);
};
