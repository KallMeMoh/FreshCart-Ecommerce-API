export const accountVerificationTemplate = (verificationLink: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your account</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;font-family: Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f2f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="500" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);border:1px solid #dddfe2;">
          
          <tr>
            <td style="padding:20px 20px 15px; background-color:#ffffff;">
              <p style="margin:0;font-size:24px;font-weight:800;color:#1877f2;letter-spacing:-0.5px;">E-Commerce App</p>
            </td>
          </tr>

          <tr>
            <td style="padding:20px;border-top:1px solid #e5e5e5;">
              <p style="margin:0 0 16px;font-size:17px;font-weight:600;color:#1c1e21;">Verify Your Account</p>
              <p style="margin:0 0 24px;font-size:15px;color:#4b4f56;line-height:1.5;">
                We received a request to verify your E-Commerce App account. Click the button below to verify. This link expires in <strong>15 minutes</strong>.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left">
                    <a href="${verificationLink}" style="display:inline-block;padding:10px 20px;background-color:#1877f2;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:6px;">Verify Account</a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:13px;color:#90949c;line-height:1.4;">
                If the button doesn't work, copy and paste this link into your browser:<br/>
                <a href="${verificationLink}" style="color:#1877f2;text-decoration:none;word-break:break-all;">${verificationLink}</a>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:20px;background-color:#ffffff;">
              <p style="margin:0;font-size:12px;color:#8a8d91;line-height:1.4;">
                © ${new Date().getFullYear()} E-Commerce App Inc. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
