from flask import Blueprint
from transformers import GPT2LMHeadModel, GPT2Tokenizer

gpt_routes = Blueprint('gpt_routes', __name__)

model_name = 'gpt2'
model = GPT2LMHeadModel.from_pretrained(model_name)
tokenizer = GPT2Tokenizer.from_pretrained(model_name)

model.eval()


def generate_text(prompt, max_length=50, num_return_sequences=1):
    inputs = tokenizer.encode(prompt, return_tensors='pt')
    outputs = model.generate(
        inputs,
        max_length=max_length,
        num_return_sequences=num_return_sequences,
        do_sample=True,
        top_k=50,
        top_p=0.95,
        temperature=1.0
    )
    return [tokenizer.decode(output, skip_special_tokens=True) for output in outputs]

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

prompt = role_generate_quiz

generated_texts = generate_text(prompt)

@gpt_routes.route('/generate-text')
def gen_text():
  for i, text in enumerate(generated_texts):
      print(f"Generated Text {i + 1}: {text}\n")
  return text
  
gen_text()