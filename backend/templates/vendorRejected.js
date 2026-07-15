export const vendorRejectedTemplate = (name, restaurantName) => {
  return `
    <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 24px; font-weight: 900; color: #ef4444; letter-spacing: 1.5px; text-transform: uppercase;">CraveArc</span>
      </div>
      <h2 style="color: #ef4444; font-weight: 800; font-size: 20px; margin-bottom: 16px;">Application Status Update</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hi ${name},</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Thank you for your interest in partnering with CraveArc. We have reviewed the details submitted for <strong>${restaurantName}</strong>.</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">Unfortunately, your application does not meet our current platform listing criteria. As a result, we are unable to approve your vendor profile at this time.</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">If you believe this was an error or wish to submit additional verification documentation, please contact our administrative team.</p>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
      <p style="color: #94a3b8; font-size: 11px; line-height: 1.5;">Regards,<br />Platform Administration, CraveArc Team</p>
    </div>
  `;
};
