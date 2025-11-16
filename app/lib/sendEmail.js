import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }) {
  try {
    const data = await resend.emails.send({
      from: "Social Logs <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
    console.log(' Email sent:', data);
    return true;
  } catch (error) {
    console.error(' Email error:', error);
    return false;
  }
}

export default sendEmail;
