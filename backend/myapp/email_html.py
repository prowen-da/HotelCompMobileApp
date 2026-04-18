def send_otp(otp):
  try:
    html_content = f"""<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Prowen Tech</a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>Thank you for choosing Prowen Hotels. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">{otp}</h2>
    <p style="font-size:0.9em;">Regards,<br />Prowen Tech</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>Prowen Tech</p>
      <p>LGB Street,Coimbatore</p>
      <p>Tamil Nadu</p>
    </div>
  </div>
</div>"""
    return html_content
  except:
    return "Error"
  
  
def send_link(access_token):
  try:
    html_content = f"""<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="#" style="font-size:1.4em;color:#00466a;text-decoration:none;font-weight:600">Prowen Tech</a>
      </div>

      <p style="font-size:1.1em">Hi,</p>
      <p>Welcome to <strong>Prowen Tech</strong>! 🎉<br>
      Your account has been successfully created.</p>

      <p>To complete your registration and access your account, please click the secure link below:</p>

      <div style="text-align:center;margin:30px 0;">
        <a href="https://webbuilder.prowentech.com/verify-token/?key={access_token}" style="background:#00466a;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;font-weight:bold;">
          Activate My Account
        </a>
      </div>

      <p>This link contains your unique access credentials and is valid for a limited time,And open this in your Registered Browser.<br>
      Please do not share it with anyone — it’s meant just for you.</p>

      <p style="font-size:0.9em;">Regards,<br>Prowen Tech Team</p>

      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1.4;font-weight:300">
        <p>Prowen Tech</p>
        <p>LGB Street, Coimbatore</p>
        <p>Tamil Nadu</p>
      </div>
    </div>
  </div>
  """
    return html_content
  except:
    return "Error"
  

def forgot_password_html(token):
  html_content = f"""<html>
<head>
  <meta charset="UTF-8">
  <title>Password Reset</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Helvetica,Arial,sans-serif;line-height:1.6;">
  <div style="margin:50px auto;width:70%;padding:20px 0;background:#ffffff;border-radius:8px;">
    <!-- Header -->
    <div style="border-bottom:1px solid #eee;padding:0 20px;">
      <a href="https://prowentech.com" style="font-size:1.4em;color:#00466a;text-decoration:none;font-weight:600;">Prowen Tech</a>
    </div>

    <!-- Body -->
    <div style="padding:20px;">
      <p style="font-size:1.1em;margin:0;">Hi there,</p>
      <p>You are receiving this email because someone requested to reset the password for your Prowen Website Builder account.</p>

      <p style="margin-top:15px;">Reset link:</p>
      <p>
        <a href="https://webwebbuilder.prowentech.com/authentication/reset-password/?token={token}" style="color:#00466a;word-break:break-all;">
          https://webwebbuilder.prowentech.com/authentication/reset-password/?token={token}
        </a>
      </p>

      <p style="margin-top:15px;">Remember: This link is only valid for the next 30 minutes. If you don't want to change your password, you can safely ignore this email.</p>

      <p style="margin-top:15px;">URL: 
        <a href="https://prowentech.com" style="color:#00466a;">https://prowentech.com</a>
      </p>

      <p style="font-size:0.9em;margin-top:20px;">Regards,<br>Prowen Tech</p>
    </div>

    <!-- Footer -->
    <hr style="border:none;border-top:1px solid #eee;margin:0;">
    <div style="padding:8px 20px;color:#aaa;font-size:0.8em;line-height:1;font-weight:300;text-align:right;">
      <p style="margin:0;">Prowen Tech</p>
      <p style="margin:0;">LGB Street, Coimbatore</p>
      <p style="margin:0;">Tamil Nadu</p>
    </div>
  </div>
</body>
</html>
"""
  return html_content



from datetime import datetime

def sendInvoice(invoice_id,amount,currency,name,email,template_name):
  today = datetime.now()
  formatted_date = today.strftime("%Y %b %d").upper()  # %b gives short month name
  currency = "₹"
  html_content = f"""<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Invoice</title>
  </head>
  <body style="margin:0; padding:20px; background-color:#f5f5f5; font-family: Arial, sans-serif; color:#222;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="700" style="background:#ffffff; border:1px solid #ddd; border-radius:6px;">
      
      <!-- HEADER -->
      <tr>
        <td style="background-color:#2E3A59; padding:20px 30px; color:#fff;">
          <table width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="vertical-align:top;">
                <h2 style="margin:0; font-size:28px; letter-spacing:1px;">INVOICE</h2>
                <small style="color:#ddd;">{invoice_id}</small>
              </td>
              <td align="right" style="vertical-align:top;">
                <p style="margin:0; font-size:14px;"><strong>Date:</strong> {formatted_date}</p>
                <p style="margin:5px 0 0 0;">
                  <span style="background:#fff; color:#2E3A59; padding:6px 10px; border-radius:4px; font-weight:bold;">
                    Balance Due: {currency}{amount}
                  </span>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- FROM / TO -->
      <tr>
        <td style="padding:30px;">
          <table width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <!-- Bill From -->
              <td width="50%" valign="top" style="padding-right:20px;">
                <strong style="font-size:15px; color:#2E3A59;">Bill From:</strong>
                <p style="margin:8px 0 0 0; line-height:1.6; font-size:14px;">
                  Prowen Technologies India Private Limited<br>
                  Site No:28B, Kanchi Ma Nagar, Vilankuruchi,<br>
                  Coimbatore, Tamil Nadu<br>
                  <b>GST No:</b> 33AAOCP7363G1Z4
                </p>
              </td>

              <!-- Bill To -->
              <td width="50%" valign="top" align="right">
                <strong style="font-size:15px; color:#2E3A59;">Bill To:</strong>
                <p style="margin:8px 0 0 0; line-height:1.6; font-size:14px;">
                  {name}<br>
                  {email}<br>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- TABLE -->
      <tr>
        <td style="padding:0 30px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            <thead>
              <tr style="background-color:#2E3A59; color:#ffffff;">
                <th align="left" style="padding:10px;">Item</th>
                <th align="right" style="padding:10px;">Quantity</th>
                <th align="right" style="padding:10px;">Rate</th>
                <th align="right" style="padding:10px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background-color:#f9f9f9;">
                <td style="padding:10px; border-bottom:1px solid #eee;">{template_name} Plan</td>
                <td align="right" style="padding:10px; border-bottom:1px solid #eee;">1</td>
                <td align="right" style="padding:10px; border-bottom:1px solid #eee;">{currency}{amount}</td>
                <td align="right" style="padding:10px; border-bottom:1px solid #eee;">{currency}{amount}</td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>

      <!-- TOTALS -->
      <tr>
        <td style="padding:25px 30px;" align="right">
          <p style="margin:6px 0; font-size:15px;"><strong>Subtotal:</strong> {currency}{amount}</p>
          <p style="margin:6px 0; font-size:15px;"><strong>Total:</strong> {currency}{amount}</p>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td align="center" style="background-color:#f4f4f4; padding:20px;">
          <h3 style="margin:0; font-size:16px; color:#2E3A59;">PROWEN TECHNOLOGIES INDIA PRIVATE LIMITED</h3>
          <p style="margin:4px 0 0 0; font-size:13px; color:#555;">
            Site No:28B, Kanchi Ma Nagar, Vilankuruchi
          </p>
        </td>
      </tr>

    </table>
  </body>
</html>"""
  #<p><strong>Tax (0%):</strong> INR$0.00</p>
  return html_content




