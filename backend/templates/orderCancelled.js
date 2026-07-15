export const orderCancelledTemplate = (name, orderId) => {
  return `
    <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 24px; font-weight: 900; color: #ef4444; letter-spacing: 1.5px; text-transform: uppercase;">CraveArc</span>
      </div>
      <h2 style="color: #ef4444; font-weight: 800; font-size: 20px; margin-bottom: 16px;">Order Cancelled</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hi ${name},</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">We regret to inform you that your order <strong>#${orderId.slice(-8).toUpperCase()}</strong> has been cancelled.</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">If this was a paid transaction, your refund is being processed and will be credited to your original payment method within 3–5 business days.</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">We apologize for the inconvenience caused and hope to serve you better next time.</p>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
      <p style="color: #94a3b8; font-size: 11px; line-height: 1.5;">If you did not request this cancellation or have other issues, please contact CraveArc customer support.</p>
    </div>
  `;
};
