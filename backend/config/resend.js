import { Resend } from 'resend';

const resendKey = process.env.RESEND_API_KEY || 're_placeholder_key';
const resend = new Resend(resendKey);

export default resend;
