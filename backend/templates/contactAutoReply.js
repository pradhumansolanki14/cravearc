export const contactAutoReplyTemplate = (name) => {
  return `
    <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 24px; font-weight: 900; color: #10b981; letter-spacing: 1.5px; text-transform: uppercase;">CraveArc</span>
      </div>
      <h2 style="color: #0f172a; font-weight: 800; font-size: 20px; margin-bottom: 16px;">We Have Received Your Message</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hi ${name},</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Thank you for contacting CraveArc! We have received your message and our team will respond as soon as possible.</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Most inquiries are reviewed within 24 hours. In the meantime, you can check our Help center for immediate answers to common questions.</p>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
      <p style="color: #94a3b8; font-size: 11px; line-height: 1.5;">Thanks for choosing CraveArc,<br />The Support Team</p>
    </div>
  `;
};
export const contactAdminAlertTemplate = (customerName, email, subject, message) => {
  return `
    <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: 1.5px; text-transform: uppercase;">CraveArc</span>
      </div>
      <h2 style="color: #0f172a; font-weight: 800; font-size: 18px; margin-bottom: 16px;">New Support Inquiry</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hello Platform Admin,</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">A user has submitted the contact support form on the website:</p>
      
      <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; font-size: 13px;">
        <p style="margin: 4px 0; color: #334155;"><strong>From:</strong> ${customerName} (${email})</p>
        <p style="margin: 4px 0; color: #334155;"><strong>Subject:</strong> ${subject}</p>
        <p style="margin: 10px 0 4px 0; color: #334155; border-top: 1px solid #e2e8f0; padding-top: 10px;"><strong>Message:</strong><br />${message.replace(/\n/g, '<br />')}</p>
      </div>
    </div>
  `;
};
