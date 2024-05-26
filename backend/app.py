from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

from routes.email_routes import email_routes
from routes.text_routes import text_routes
# Register your routes
# ----------------------------
from routes.video_routes import video_routes

# Register your blueprints
# ----------------------------
app.register_blueprint(video_routes)
app.register_blueprint(email_routes)
app.register_blueprint(text_routes)

if __name__ == '__main__':
    app.run(debug=True)