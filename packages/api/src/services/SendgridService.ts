import got from 'got'

export async function sendVerificationEmail(to: string, token: string) {
  const verifyLink = process.env.WEB_APP_URL + `/console/emails/verify?token=${token}&email=${to}`
  const resp = await got.post('https://api.sendgrid.com/v3/mail/send', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
    },
    json: {
      from: {
        email: process.env.SENDGRID_SENDER_EMAIL,
      },
      personalizations: [
        {
          to: [
            {
              email: to,
            },
          ],
          dynamic_template_data: {
            verify_link: verifyLink,
          },
        },
      ],
      template_id: process.env.SENDGRID_VERIFY_EMAIL_TEMPLATE,
    },
  })
  return resp.statusCode == 202
}
