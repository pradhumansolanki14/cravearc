export const verifyEmailTemplate = (name, url) => {
  return `
    <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 24px; font-weight: 900; color: #10b981; letter-spacing: 1.5px; text-transform: uppercase;">CraveArc</span>
      </div>
      <h2 style="color: #0f172a; font-weight: 800; font-size: 20px; margin-bottom: 16px;">Verify Your Email Address</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hi ${name},</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Thank you for registering on CraveArc! To complete your registration and activate your account, please click the button below to verify your email address:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="background-color: #10b981; color: #ffffff; padding: 12px 28px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);">Verify Email Address</a>
      </div>
      <p style="color: #64748b; font-size: 13px; line-height: 1.6;">Or copy and paste this link into your browser:</p>
      <p style="color: #10b981; font-size: 12px; word-break: break-all;"><a href="${url}" style="color: #10b981; text-decoration: underline;">${url}</a></p>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
      <p style="color: #94a3b8; font-size: 11px; line-height: 1.5;">This verification link will expire in 24 hours. If you did not register for a CraveArc account, please ignore this email.</p>
    </div>
  `;
};
