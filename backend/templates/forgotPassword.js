export const forgotPasswordTemplate = (name, url) => {
  return `
    <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 24px; font-weight: 900; color: #10b981; letter-spacing: 1.5px; text-transform: uppercase;">CraveArc</span>
      </div>
      <h2 style="color: #0f172a; font-weight: 800; font-size: 20px; margin-bottom: 16px;">Reset Your Password</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hi ${name},</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">We received a request to reset the password for your CraveArc account. Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="background-color: #0f172a; color: #ffffff; padding: 12px 28px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);">Reset Password</a>
      </div>
      <p style="color: #64748b; font-size: 13px; line-height: 1.6;">Or copy and paste this link into your browser:</p>
      <p style="color: #10b981; font-size: 12px; word-break: break-all;"><a href="${url}" style="color: #10b981; text-decoration: underline;">${url}</a></p>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
      <p style="color: #94a3b8; font-size: 11px; line-height: 1.5;">This reset link will expire in 1 hour and is valid for one-time use only. If you did not request this, you can safely ignore this email; your password will remain unchanged.</p>
    </div>
  `;
};
