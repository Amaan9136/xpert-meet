from flask import Blueprint, request
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

email_routes = Blueprint('email_routes', __name__)

def send_email(sender_email, sender_password, recipient_emails, message='<p>About the meeting</p>', title='About the meeting'):
    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = ", ".join(recipient_emails)
    msg["Subject"] = title
    msg.attach(MIMEText(message, "html"))
    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, recipient_emails, msg.as_string())

@email_routes.route('/send-mail', methods=['POST'])
def send_mail():
    data = request.get_json()
    message = data.get('message', '<p>About the meeting</p>')
    title = data.get('title', 'About the meeting') 
    sender_email = "syedkhalander66@gmail.com" # sender email
    sender_password = "dwtx buxw gdzj vzfc" # sender password
    recipient_emails = ["syedkhalander66@gmail.com", "kinglocker00@gmail.com"] # receiver email
    send_email(sender_email, sender_password, recipient_emails, message, title)
    return 'Email sent successfully!'
