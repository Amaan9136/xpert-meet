from flask import Blueprint, request, jsonify, Response
from dotenv import load_dotenv
import os
import google.generativeai as genai

# config .env file
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

text_routes = Blueprint('text_routes', __name__)
role_short_transcription = """
"FORMAT: Generate an HTML-formatted summary where data needs to be in the form of HTML and main heading <p class='font-bold'>, subheading <p class='font-semibold'>, paragraph <p>, line break <br />, unordered list <ul>, and list item <li>. (dont use any other html tags)"
ROLE: You are a data analyst tasked with summarizing a discussion on a specific topic based on a short transcript. Your goal is to provide a detailed and informative summary of the key points and insights discussed. Ensure that your summary is coherent, insightful, and comprises at least 150 words. Use the given text as a starting point:
"""

role_long_transcription = """
"FORMAT: Generate an HTML-formatted summary where data needs to be in the form of HTML and main heading <p class='font-bold'>, subheading <p class='font-semibold'>, paragraph <p>, line break <br />, unordered list <ul>, and list item <li>. (dont use any other html tags)"
ROLE: You are a data analyst tasked with presenting insights from a meeting transcript. Your goal is to succinctly explain the key topics discussed, highlight important points, and provide a comprehensive description of the meeting's data in bullet points, comprising at least 150 words:
"""

def generate_summary(role, transcription):
    model = genai.GenerativeModel("gemini-pro")
    try:
        response = model.generate_content(role + transcription)
        return response.text
    except Exception as e:
        print(f"An error occurred: {e}")
        return f"An error occurred while generating content: {e}"

@text_routes.route('/text-to-summary', methods=['POST'])
def generate_summary_route():
    data = request.get_json()
    transcription = data.get('transcription')
    
    try:
        if transcription:
            # Assign role based on transcription length
            if len(transcription.split()) <= 50:
                summary = generate_summary(role_short_transcription, transcription)
            else:
                summary = generate_summary(role_long_transcription, transcription)

            # Return the HTML content with the appropriate content type
            return Response(summary, content_type='text/html')
        else:
            return '<i>Unable to generate a summary. Please provide a valid transcription.<i>'

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": f"Internal Server Error: {e}"}), 500