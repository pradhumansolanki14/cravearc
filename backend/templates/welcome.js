export const welcomeTemplate = (name) => {
  return `
    <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 24px; font-weight: 900; color: #10b981; letter-spacing: 1.5px; text-transform: uppercase;">CraveArc</span>
      </div>
      <h2 style="color: #0f172a; font-weight: 800; font-size: 20px; margin-bottom: 16px;">Welcome to CraveArc!</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hi ${name},</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Your email address has been successfully verified, and your CraveArc account is now fully active!</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Get ready to explore the best local kitchens, order gourmet meals, and track your deliveries in real-time. We are excited to have you on board!</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://cravearc.com" style="background-color: #10b981; color: #ffffff; padding: 12px 28px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);">Start Ordering Now</a>
      </div>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
      <p style="color: #94a3b8; font-size: 11px; line-height: 1.5;">If you have any questions, feel free to reply to this email or reach out to our customer support team.</p>
    </div>
  `;
};
