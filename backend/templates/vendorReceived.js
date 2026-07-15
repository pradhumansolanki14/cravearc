export const vendorReceivedTemplate = (name, restaurantName) => {
  return `
    <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 24px; font-weight: 900; color: #10b981; letter-spacing: 1.5px; text-transform: uppercase;">CraveArc</span>
      </div>
      <h2 style="color: #0f172a; font-weight: 800; font-size: 20px; margin-bottom: 16px;">Application Received</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hi ${name},</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Thank you for registering your restaurant, <strong>${restaurantName}</strong>, to partner with CraveArc!</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Your vendor application is currently under review by our platform administration team. We will verify your details and get back to you with an update within 24–48 hours.</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">We appreciate your patience and look forward to growing together.</p>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
      <p style="color: #94a3b8; font-size: 11px; line-height: 1.5;">This email is automated. Please do not reply directly. Contact our merchant support center for further help.</p>
    </div>
  `;
};
export const vendorAdminAlertTemplate = (vendorName, email, restaurantName) => {
  return `
    <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: 1.5px; text-transform: uppercase;">CraveArc</span>
      </div>
      <h2 style="color: #0f172a; font-weight: 800; font-size: 18px; margin-bottom: 16px;">New Vendor Registration Alert</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hello Platform Admin,</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">A new restaurant partner has completed self-registration and is awaiting console verification:</p>
      
      <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; font-size: 13px;">
        <p style="margin: 4px 0; color: #334155;"><strong>Restaurant:</strong> ${restaurantName}</p>
        <p style="margin: 4px 0; color: #334155;"><strong>Owner:</strong> ${vendorName}</p>
        <p style="margin: 4px 0; color: #334155;"><strong>Email:</strong> ${email}</p>
      </div>
      
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Please review their application in the Platform Admin dashboard to approve or reject the partner.</p>
    </div>
  `;
};
