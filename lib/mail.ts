import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = "noreply@leangrouplogistics.site"

export const sendOTPEmail = async (email: string, code: string) => {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Your Verification Code",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="
                  background: rgba(15,15,15,0.95);
                  border: 1px solid rgba(215,177,95,0.25);
                  border-radius: 16px;
                  padding: 40px 32px;
                ">
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding-bottom: 24px;">
                      <h1 style="
                        margin: 0;
                        font-size: 1.8rem;
                        font-weight: 700;
                        color: #D7B15F;
                      ">Verify Your Email</h1>
                      <p style="
                        margin: 10px 0 0;
                        color: #ffffff;
                        font-size: 0.9rem;
                      ">Use the code below to complete your registration.</p>
                    </td>
                  </tr>

                  <!-- OTP Box -->
                  <tr>
                    <td align="center" style="padding: 16px 0 28px;">
                      <div style="
                        display: inline-block;
                        background: #141414;
                        border: 1px solid rgba(215,177,95,0.4);
                        border-radius: 14px;
                        padding: 20px 40px;
                      ">
                        <span style="
                          font-size: 2.8rem;
                          font-weight: 800;
                          letter-spacing: 0.5rem;
                          color: #D7B15F;
                        ">${code}</span>
                      </div>
                    </td>
                  </tr>

                  <!-- Expiry Notice -->
                  <tr>
                    <td align="center" style="padding-bottom: 28px;">
                      <p style="
                        margin: 0;
                        color: #aaaaaa;
                        font-size: 0.85rem;
                        line-height: 1.6;
                      ">
                        This code expires in <strong style="color:#ffffff;">10 minutes</strong>.<br/>
                        If you didn't create an account, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr>
                    <td style="
                      border-top: 1px solid rgba(215,177,95,0.15);
                      padding-top: 20px;
                    " align="center">
                      <p style="
                        margin: 0;
                        color: #555555;
                        font-size: 0.75rem;
                      ">© ${new Date().getFullYear()} Lean Group Logistics. All rights reserved.</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  })

  if (error) {
    console.error("[RESEND_ERROR]", error)
    throw new Error("Failed to send OTP email.")
  }

  return data
}