import { Resend } from 'resend';

let resend_api_key = process.env.RESEND_API_KEY;
if (!resend_api_key) {
  console.log(
    'Missing RESEND_API_KEY environment variable: sending emails will not work.'
  );
  resend_api_key = 'test_nonfunctional_api_key';
}

export const resend = new Resend(resend_api_key);
