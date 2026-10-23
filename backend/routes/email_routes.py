import os
import re
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from threading import Thread

import openpyxl
import PyPDF2
from docx import Document
from flask import Blueprint, request

email_routes = Blueprint('email_routes', __name__)

UPLOAD_FOLDER = 'backend/uploads'
OUTPUT_FOLDER = 'backend/routes'
EMAIL_FILE = os.path.join(OUTPUT_FOLDER, 'email.txt')

def schedule_file_deletion(filepath):
    def delete_file():
        if os.path.exists(filepath):
            os.remove(filepath)
            print(f"Deleted file: {filepath}")

    Thread(target=delete_file).start()

def extract_emails(input_file, filename):
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'

    emails = []
    file_extension = filename.split('.')[-1].lower()

    try:
        if file_extension == 'txt':
            with open(input_file, 'r') as infile:
                for line in infile:
                    found_emails = re.findall(email_pattern, line)
                    emails.extend(found_emails)

        elif file_extension == 'pdf':
            with open(input_file, 'rb') as infile:
                reader = PyPDF2.PdfReader(infile)
                for page in reader.pages:
                    text = page.extract_text()
                    found_emails = re.findall(email_pattern, text)
                    emails.extend(found_emails)

        elif file_extension in ['xlsx', 'xlsm', 'xltx', 'xltm']:
            workbook = openpyxl.load_workbook(input_file)
            for sheet in workbook:
                for row in sheet.iter_rows():
                    for cell in row:
                        if cell.value:
                            found_emails = re.findall(email_pattern, str(cell.value))
                            emails.extend(found_emails)
        else:
            return "Incorrect file type"
        
    except Exception as e:
        print(f"Error processing file: {e}")
        return None

    if not emails:
        return None

    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)

    with open(EMAIL_FILE, 'w') as outfile:
        for email in emails:
            outfile.write(email + '\n')

    return EMAIL_FILE

def send_email(sender_email, sender_password, recipient_emails, message='<p>About the meeting</p>', title='About the meeting'):
    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = ", ".join(recipient_emails)
    msg["Subject"] = title
    msg.attach(MIMEText(message, "html"))
    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, recipient_emails, msg.as_string())
        print(f"Email sent to {recipient_emails}")
    except Exception as e:
        print(f"Failed to send email: {e}")

@email_routes.route('/send-mail', methods=['POST'])
def send_mail():
    title = request.form.get('title', 'About the meeting')
    message = request.form.get('message', '<p>About the meeting</p>')
    sender_email = os.getenv("SENDER_EMAIL")
    sender_password = os.getenv("SENDER_PASSWORD")
    file = request.files.get('file')
    
    if file:
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
        filename = file.filename
        input_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(input_path)
        
        result = extract_emails(input_path, filename)
        if result == "Incorrect file type":
            return "Incorrect file type! Only .txt, .pdf, .xlsx, .xlsm, .xltx, and .xltm are supported."
        
        schedule_file_deletion(input_path)  

    recipient_emails = []
    try:
        with open(EMAIL_FILE, "r") as email_file:
            for line in email_file:
                recipient_emails.append(line.strip())
    except FileNotFoundError:
        print("Error: email.txt file not found.")
        return "Error: Recipient list file not found."
    
    if not recipient_emails:
        return "No email addresses found in the file."
    
    print(recipient_emails)
    send_email(sender_email, sender_password, recipient_emails, message, title)
    return 'Email sent successfully!'