from flask import Flask, render_template
from flask_cors import CORS

app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
# CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://localhost:5000"]}})

CORS(app)
from routes.email_routes import email_routes
from routes.text_routes import text_routes
from routes.video_routes import video_routes
from routes.face_routes import face_routes
from routes.files_routes import files_routes

app.register_blueprint(video_routes)
app.register_blueprint(email_routes)
app.register_blueprint(text_routes)
app.register_blueprint(face_routes)
app.register_blueprint(files_routes)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)