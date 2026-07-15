export const orderConfirmTemplate = (name, orderId, amount, items) => {
  const itemsHtml = items.map(item => `
    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px;">
      <span style="color: #334155; font-weight: 600;">×${item.quantity} ${item.name}</span>
      <span style="color: #64748b; font-family: monospace;">INR ${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  `).join('');

  return `
    <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 24px; font-weight: 900; color: #10b981; letter-spacing: 1.5px; text-transform: uppercase;">CraveArc</span>
      </div>
      <h2 style="color: #0f172a; font-weight: 800; font-size: 20px; margin-bottom: 16px;">Order Confirmed!</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hi ${name},</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Thank you for your order! We are happy to let you know that your order has been confirmed and is now being prepared by the kitchen.</p>
      
      <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <h3 style="margin-top: 0; font-size: 12px; text-transform: uppercase; tracking-wider: 1px; color: #94a3b8; margin-bottom: 10px;">Order Details</h3>
        <p style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 15px;">Order ID: #${orderId.slice(-8).toUpperCase()}</p>
        
        <div>
          ${itemsHtml}
        </div>
        
        <div style="display: flex; justify-content: space-between; padding-top: 15px; font-weight: 700; font-size: 14px; color: #0f172a;">
          <span>Total Paid</span>
          <span>INR ${parseFloat(amount).toFixed(2)}</span>
        </div>
      </div>
      
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">You can track the live preparation and delivery progress directly inside the CraveArc app.</p>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
      <p style="color: #94a3b8; font-size: 11px; line-height: 1.5;">If you have any questions or need support, please open a ticket in your profile tab or reply to this email.</p>
    </div>
  `;
};
