require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

resend.emails.send({
  from: 'onboarding@resend.dev',
  to: 'test@example.com', // Need a valid email to test, I'll use a placeholder but we can see if auth error happens
  subject: 'Test Email',
  html: '<p>Test</p>'
}).then(res => {
  console.log("Success:", res);
}).catch(err => {
  console.error("Error:", err);
});
