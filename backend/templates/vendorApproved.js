export const vendorApprovedTemplate = (name, restaurantName) => {
  return `
    <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 24px; font-weight: 900; color: #10b981; letter-spacing: 1.5px; text-transform: uppercase;">CraveArc</span>
      </div>
      <h2 style="color: #10b981; font-weight: 800; font-size: 20px; margin-bottom: 16px;">Congratulations! Application Approved</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hi ${name},</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">We are thrilled to let you know that your partner account for <strong>${restaurantName}</strong> has been approved!</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">You can now log in to the CraveArc Admin console to upload your menu, manage orders, configure business hours, and review analytics.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://admin.cravearc.com" style="background-color: #10b981; color: #ffffff; padding: 12px 28px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 14px; display: inline-block;">Log In to Console</a>
      </div>
      
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Welcome to the CraveArc merchant family! Let's satisfy cravings together.</p>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
      <p style="color: #94a3b8; font-size: 11px; line-height: 1.5;">If you experience login issues or have setup queries, contact our merchant support team.</p>
    </div>
  `;
};
