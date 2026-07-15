export const passwordChangedTemplate = (name) => {
  return `
    <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 24px; font-weight: 900; color: #10b981; letter-spacing: 1.5px; text-transform: uppercase;">CraveArc</span>
      </div>
      <h2 style="color: #0f172a; font-weight: 800; font-size: 20px; margin-bottom: 16px;">Password Reset Successful</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hi ${name},</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">This is a confirmation email that the password for your CraveArc account has been changed successfully.</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">If you made this change, you do not need to take any action. You can now log in using your new password.</p>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
      <p style="color: #ef4444; font-size: 11px; line-height: 1.5; font-weight: 600;">If you did not request this password change, please contact CraveArc support immediately to secure your account.</p>
    </div>
  `;
};
