import os

import google.generativeai as genai
from dotenv import load_dotenv
from flask import Blueprint, Response, jsonify, request

# config .env file
load_dotenv()

text_routes = Blueprint('text_routes', __name__)

role_short_transcription = """
"FORMAT: Generate an HTML-formatted summary where data needs to be in the form of HTML and main heading <p class='font-bold'>, subheading <p class='font-semibold'>, paragraph <p>, line break <br />, unordered list <ul>, and list item <li>. (dont use any other html tags)"
ROLE: You are a data analyst tasked with summarizing a discussion on a specific topic based on a short transcript. Your goal is to provide a detailed and informative summary of the key points and insights discussed. Ensure that your summary is coherent, insightful, and comprises at least 150 words. Use the given text as a starting point:
"""

role_long_transcription = """
"FORMAT: Generate an HTML-formatted summary where data needs to be in the form of HTML and main heading <p class='font-bold'>, subheading <p class='font-semibold'>, paragraph <p>, line break <br />, unordered list <ul>, and list item <li>. (dont use any other html tags)"
ROLE: You are a data analyst tasked with presenting insights from a meeting transcript. Your goal is to succinctly explain the key topics discussed, highlight important points, and provide a comprehensive description of the meeting's data in bullet points, comprising at least 150 words:
"""

role_generate_quiz = """
"FORMAT: Generate 6 quiz questions the form of HTML and each question need to you this class <p class='font-bold'> and answers in ul li tags (dont use any other html tags)"
ROLE: You are an educational content creator tasked with generating quiz questions from the provided data. Ensure that the questions are clear, relevant, and cover the key points discussed. Use the given text as a starting point."
"""
genai.configure(api_key=os.getenv("MODEL"))

def generate_summary(role, transcription):
    model = genai.GenerativeModel("gemini-pro")
    try:
        response = model.generate_content(role + transcription)
        return response.text
    except Exception as e:
        print(f"An error occurred: {e}")
        return f"An error occurred while generating content: {e}"

def generate_quiz(role, keyPoints):
    model = genai.GenerativeModel("gemini-pro")
    try:
        response = model.generate_content(role + keyPoints)
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

@text_routes.route('/take-quiz', methods=['POST'])
def generate_quiz_route():
    data = request.get_json()
    keyPoints = data.get('keyPoints')
    try:
        if keyPoints:
            quiz = generate_quiz(role_generate_quiz, keyPoints)
            # Return the HTML content with the appropriate content type
            return Response(quiz, content_type='text/html')
        else:
            return '<i>Unable to generate quiz questions. Please provide a valid key points.<i>'
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": f"Internal Server Error: {e}"}), 500
