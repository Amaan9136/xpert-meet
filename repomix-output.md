This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
````
backend/
  routes/
    email_routes.py
    email.txt
    face_routes.py
    files_routes.py
    text_routes.py
    video_routes.py
  templates/
    index.html
  .env.example
  app.py
  requirements.txt
public/
  assets/
    signs/
      space.png
    meetImg.jpg
  favicon.ico
  index.html
  logo192.png
  logo512.png
  manifest.json
  robots.txt
screenshots/
  logo.jpg
src/
  components/
    Chatbot/
      data/
        timetables/
          timetable.xlsx
        botFunctions.js
        botMessagesHandle.js
      Chatbot.css
      Chatbot.js
    Google/
      GoogleLoginComponent.js
      GoogleLogoutComponent.js
    Header/
      Header.css
      Header.js
    JamBoard/
      JamBoard.css
      JamBoard.js
    MainScreen/
      MainScreen.component.js
      MainScreen.css
    MeetingFooter/
      MeetingFooter.component.js
      MeetingFooter.css
    MeetingInfo/
      MeetingInfo.css
      MeetingInfo.js
    MessageBox/
      MessageBox.css
      MessageBox.js
    Model/
      Model.css
      Model.js
    Participants/
      Participant/
        Participant.component.js
        Participant.css
      Participants.component.js
      Participants.css
    Shared/
      Card/
        Card.component.js
        Card.css
    Sign/
      Sign.js
    Transcription/
      Transcription.css
      Transcription.js
  pages/
    Cheat/
      Cheat.js
    ErrorHandler/
      ErrorHandler.js
    Home/
      Home.css
      Home.js
    Meet/
      Meet.css
      Meet.js
    NoInternet/
      NoInternet.component.js
      NoInternet.module.css
    Summary/
      Summary.css
      Summary.js
  server/
    firebase.js
    http.js
    peerConnection.js
  store/
    actioncreator.js
    actiontypes.js
    reducer.js
  App.js
  AppContext.js
  AppLoader.js
  index.css
  index.js
  logo.svg
  reportWebVitals.js
.env.example
.gitignore
package.json
README.md
tailwind.config.js
vercel.json
````

# Files

## File: backend/routes/email.txt
````
syedkhalander66@gmail.com
````

## File: backend/routes/face_routes.py
````python
from flask import Blueprint, jsonify, Response
import cv2
import mediapipe as mp
import numpy as np

face_routes = Blueprint('face_routes', __name__)
# Initialize MediaPipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh()

# Global variables for copying detection
copying_count = 0
previous_orientation = "front"

def detect_face_orientation(landmarks):
    """Detects the orientation of the face based on landmarks."""
    nose_tip = np.array([landmarks[1].x, landmarks[1].y])
    left_cheek = np.array([landmarks[234].x, landmarks[234].y])
    right_cheek = np.array([landmarks[454].x, landmarks[454].y])

    nose_to_right_cheek = np.linalg.norm(nose_tip - left_cheek)
    nose_to_left_cheek = np.linalg.norm(nose_tip - right_cheek)
    left_to_right_distance = np.linalg.norm(left_cheek - right_cheek)

    # adjust the face orientation 0.3
    if nose_to_right_cheek < left_to_right_distance * 0.3:
        return "right"
    elif nose_to_left_cheek < left_to_right_distance * 0.3:
        return "left"
    else:
        return "front"

def process_video_frame(frame):
    """Processes a video frame to detect face orientation and copying."""
    global previous_orientation, copying_count

    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb_frame)

    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            orientation = detect_face_orientation(face_landmarks.landmark)
            if (previous_orientation in ["left", "right"]) and orientation == "front":
                copying_count += 1
            previous_orientation = orientation

def generate_frames():
    """Generates video frames from the camera."""
    cap = cv2.VideoCapture(0)
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        process_video_frame(frame)  # Process the frame
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    cap.release()

@face_routes.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@face_routes.route('/is_copying', methods=['GET'])
def is_copying():
    global copying_count
    copy_direction = "none" if copying_count == 0 else previous_orientation
    is_copying = copy_direction != "front"  
    return jsonify(isCopying=is_copying, copyDirection=copy_direction, copyCount=str(copying_count)+'%')
````

## File: backend/routes/files_routes.py
````python
from flask import request, make_response, jsonify, Blueprint
from zipfile import ZipFile,ZIP_DEFLATED
from werkzeug.utils import secure_filename
import os
from werkzeug.exceptions import RequestEntityTooLarge
import shutil


files_routes = Blueprint('files_routes', __name__)

# Configure upload folder path
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '../uploads/notes/')
MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10 MB in bytes

@files_routes.route('/upload-notes', methods=['POST'])
def upload_notes():
    try:
        # Check for file and validate filename in one step
        file = request.files.get('file')
        if not file or not file.filename or file.filename.startswith('.'):
            return 'No file uploaded or invalid filename'

        # Check file size
        if request.content_length > MAX_CONTENT_LENGTH:
            raise RequestEntityTooLarge

        # Save the file
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Create directory if needed
        file.save(filepath)

        return 'File uploaded successfully!'
    except RequestEntityTooLarge:
        return 'File size exceeds 10 MB limit'
    except Exception as e:
        return f'Error uploading file: {e}'

@files_routes.route('/download-notes', methods=['POST'])
def download_notes():
    data = request.get_json()
    notes_lists = data.get("notesLists")
    if not notes_lists:
        return jsonify({'message': 'No notes found in the request.'}), 404
    updated_paths = [os.path.join(UPLOAD_FOLDER, path.replace(" ", "_")) for path in notes_lists]

    zip_filename = "notes.zip"
    zip_filepath = os.path.join(UPLOAD_FOLDER, zip_filename)

    try:
        with ZipFile(zip_filepath, 'w', ZIP_DEFLATED) as zip_file:
            for path in updated_paths:
                if os.path.exists(path):
                    zip_file.write(path, os.path.basename(path))

        with open(zip_filepath, 'rb') as zip_file:
            zip_data = zip_file.read()
            response = make_response(zip_data)
            response.headers['Content-Type'] = 'application/zip'
            response.headers['Content-Disposition'] = f'attachment; filename="{zip_filename}"'
            return response
    except Exception as e:
        print(f"Error creating/sending ZIP archive: {e}")
        return jsonify({'message': 'Failed to create/send ZIP archive.'}), 500


# remove notes folder after call has been ended
@files_routes.route('/remove-notes')
def remove_notes():
    shutil.rmtree('backend/uploads/notes')
    return jsonify({'message': 'Removed All Files.'}), 200
````

## File: backend/templates/index.html
````html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exam Mode Trail</title>
</head>

<body>
    <h1>Exam Mode Trail</h1>
    <img src="http://localhost:5000/video_feed" width="640" height="480" />
    <div id="copy-status"></div>
</body>
<script>
    const resultDiv = document.getElementById('copy-status');

    async function isCopying() {
        try {
            const response = await fetch('http://localhost:5000/is_copying');
            const data = await response.json();
            console.log(data);
            const isCopying = data.isCopying;
            const copyDirection = data.copyDirection;
            const copyCount = data.copyCount;
            resultDiv.textContent = `Is copying: ${isCopying}, Copy direction: ${copyDirection}, Copy Count: ${copyCount}`;
        } catch (error) {
            console.error('Error fetching data:', error);
            resultDiv.textContent = 'Error fetching data';
        }
    }

    setInterval(() => {
        isCopying();
    }, 300);
</script>

</html>
````

## File: backend/.env.example
````
MODEL = 'REMOVED'
````

## File: src/components/Google/GoogleLoginComponent.js
````javascript
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext } from 'react';
import { GoogleLogin } from 'react-google-login';
import { AppContext } from '../../AppContext';

const clientId = '578619713815-5crb1lnc5o6ff6ju8imndrqjo803ibk2.apps.googleusercontent.com';

export default function GoogleLoginComponent() {
  const { setAppState, setAppData } = useContext(AppContext);

  const handleLoginSuccess = (response) => {
    console.log('Login Success: currentUser:', response.profileObj);
    setAppData((prev) => ({ ...prev, googleData: response.profileObj }));
    localStorage.setItem('googleData', JSON.stringify(response.profileObj));
  };

  const handleLoginFailure = (response) => {
    console.error('Login Failed:', response);
    if (response.error === 'popup_closed_by_user') {
      // Handle popup closed by user (e.g., show an error message)
      console.error('Popup closed by user');
    } else {
      // Handle other login failures
    }
  };

  return (
    <GoogleLogin
      clientId={clientId}
      buttonText="Google"
      cookiePolicy='single_host_origin'
      onSuccess={handleLoginSuccess}
      onFailure={handleLoginFailure}
      isSignedIn={true}
      render={renderProps => (
        <button className='btn from-left' onClick={renderProps.onClick} disabled={renderProps.disabled}>
          <FontAwesomeIcon className='rotate' icon={faGoogle} /> Google
        </button>
      )}
    />
  );
}
````

## File: src/components/Google/GoogleLogoutComponent.js
````javascript
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { GoogleLogout } from 'react-google-login';

export default function GoogleLogoutComponent() {
  const clientId = '578619713815-5crb1lnc5o6ff6ju8imndrqjo803ibk2.apps.googleusercontent.com';
  
  const handleLogout = () => {
    localStorage.removeItem('googleData');
    window.location.reload();
  };

  return (
    <div>
      <GoogleLogout
        clientId={clientId}
        buttonText="Logout"
        onLogoutSuccess={handleLogout}
        onFailure={(error) => {
          console.error('Logout failed:', error);
        }}
        render={renderProps => (
          <button className='btn from-left' onClick={renderProps.onClick} disabled={renderProps.disabled}>
            <FontAwesomeIcon className='rotate' icon={faGoogle} /> Logout
          </button>
        )}
      />
    </div>
  );
}
````

## File: src/components/JamBoard/JamBoard.css
````css
.whiteboard-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  box-sizing: border-box; 
}

.canvas-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 800px; 
  height: 400px; 
  border: 1px solid #ccc; 
  background-color: #fff; 
  box-sizing: border-box; 
}

.controls {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.color-picker-button, .clear-button, .eraser-button {
  margin: 5px;
  padding: 10px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  border-radius: 5px;
}

.color-picker-button:hover, .clear-button:hover, .eraser-button:hover {
  background-color: #0056b3;
}

.eraser-button.active {
  background-color: #ffcccc; 
}
````

## File: src/components/JamBoard/JamBoard.js
````javascript
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef, useState } from 'react';
import CanvasDraw from 'react-canvas-draw';
import { SketchPicker } from 'react-color';
import firepadRef from '../../server/firebase';

const JamBoard = ({ setMeetingState }) => {
  const canvasRef = useRef(null);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushRadius, setBrushRadius] = useState(4);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    const userStatusRef = firepadRef.child('drawings');

    // Listen for updates from Firebase
    userStatusRef.on('value', snapshot => {
      try {
        const data = snapshot.val();
        if (canvasRef.current && data && !isUpdating) {
          canvasRef.current.loadSaveData(data, true);
        }
      } catch (error) {
        console.error("Error loading data: ", error);
      }
    });

    // Set the disconnect event to remove the user's drawing data
    userStatusRef.onDisconnect().remove();

    return () => {
      userStatusRef.off();
    };
  }, [isUpdating]);

  const roundDataPoints = (data) => {
    const parsedData = JSON.parse(data);
    parsedData.lines.forEach(line => {
      line.points.forEach(point => {
        point.x = parseFloat(point.x.toFixed(4));
        point.y = parseFloat(point.y.toFixed(4));
      });
    });
    return JSON.stringify(parsedData);
  };

  const handleChange = () => {
    if (canvasRef.current) {
      // Clear the previous timeout if it exists
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set a new timeout to post data after 5 seconds
      const newTimeoutId = setTimeout(() => {
        try {
          const data = canvasRef.current.getSaveData();
          const roundedData = roundDataPoints(data);
          setIsUpdating(true);
          firepadRef.child('drawings').set(roundedData).then(() => {
            setIsUpdating(false);
          });
        } catch (error) {
          console.error("Error saving data: ", error);
        }
      }, 3000); // 3000 milliseconds = 3 seconds

      setTimeoutId(newTimeoutId);
    }
  };

  const handleClear = () => {
    canvasRef.current.clear();
  };

  return (
    <div className={`messenger-container w-[320px] from-left mx-2 my-3`}>
      <div className="messenger-header text-2xl">
        <h1>Xpert JamBoard</h1>
        <FontAwesomeIcon
          className="icon transition-opa z-10"
          onClick={()=>{
            setMeetingState((prev) => ({
              showJam: !prev.showJam,
            }))
          }}
          icon={faTimes}
        />
      </div>
      <hr />
      <div className="section">
        <div className='flex items-center justify-center m-4'>
          <button className='btn' onClick={() => setShowColorPicker(!showColorPicker)}>Color</button>
          <button className='btn' onClick={() => setIsEraser(!isEraser)}>Eraser</button>
          <button className='btn' onClick={handleClear}>Clear</button>
        </div>
        {showColorPicker && (
          <SketchPicker
            color={brushColor}
            onChangeComplete={(color) => setBrushColor(color.hex)}
          />
        )}
        <CanvasDraw
          ref={canvasRef}
          brushColor={isEraser ? '#FFFFFF' : brushColor}
          brushRadius={brushRadius}
          lazyRadius={0}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default JamBoard;
````

## File: src/components/Sign/Sign.js
````javascript
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../AppContext';

const islGifs = [
  'any questions', 'are you angry', 'are you busy', 'are you hungry', 'are you sick', 'be careful',
  'can we meet tomorrow', 'did you book tickets', 'did you finish homework', 'do you go to office', 'do you have money',
  'do you want something to drink', 'do you want tea or coffee', 'do you watch TV', 'dont worry', 'flower is beautiful',
  'good afternoon', 'good evening', 'good morning', 'good night', 'good question', 'had your lunch', 'happy journey',
  'hello what is your name', 'how many people are there in your family', 'i am a clerk', 'i am bore doing nothing',
  'i am fine', 'i am sorry', 'i am thinking', 'i am tired', 'i dont understand anything', 'i go to a theatre', 'i love to shop',
  'i had to say something but i forgot', 'i have headache', 'i like pink colour', 'i live in nagpur', 'lets go for lunch',
  'my mother is a homemaker', 'my name is john', 'nice to meet you', 'no smoking please', 'open the door',
  'please call me later', 'please clean the room', 'please give me your pen', 'please use dustbin dont throw garbage',
  'please wait for sometime', 'shall I help you', 'shall we go together tomorrow', 'sign language interpreter',
  'sit down', 'stand up', 'take care', 'there was traffic jam', 'wait I am thinking', 'what are you doing', 'what is the problem',
  'what is todays date', 'what is your father do', 'what is your job', 'what is your mobile number', 'what is your name',
  'whats up', 'when is your interview', 'when we will go', 'where do you stay', 'where is the bathroom', 'where is the police station',
  'you are wrong'
];

const Sign = ({ setMeetingState }) => {
  const [gifSrc, setGifSrc] = useState('');
  const [region, setRegion] = useState('Indian');
  const [letterSrc, setLetterSrc] = useState([]);
  const { appData } = useContext(AppContext);

  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

  useEffect(() => {
    if (appData.transcriptionMsg && region) {
      processSpeech();
    }
  }, [appData.transcriptionMsg, region]);

  const processSpeech = () => {
    const normalizedText = appData.transcriptionMsg.trim().toLowerCase();
    const matchedGifs = [];

    let startIndex = 0;
    islGifs.forEach(phrase => {
      const regex = new RegExp(`\\b${phrase}\\b`, 'g');
      let match;
      while ((match = regex.exec(normalizedText)) !== null) {
        if (match.index >= startIndex) {
          matchedGifs.push(phrase);
          startIndex = match.index + match[0].length;
        }
      }
    });

    const newestGif = matchedGifs.length > 0 ? matchedGifs[matchedGifs.length - 1] : null;

    if (newestGif) {
      const gifPath = `/assets/signs/ISL_Gifs/${newestGif.replace(/\s+/g, ' ')}.gif`;
      setGifSrc(gifPath);
    } else {
      setGifSrc('');
    }

    const letterImages = [];
    for (let char of normalizedText) {
      if (/^[a-z]$/i.test(char)) {
        const imagePath = region === 'Indian' ? 
          `/assets/signs/${region}/${char}.jpg` : 
          `/assets/signs/${region}/${char.toUpperCase()}.png`;
        letterImages.push(imagePath);
      } else if (char === ' ') {
        letterImages.push(`/assets/signs/space.png`);
      }
    }

    setLetterSrc(letterImages);  
  };

  return (
    <div className={`messenger-container w-full from-left mx-2 my-3`}>
      <div className="messenger-header text-2xl">
        <h1>Xpert Sign Language</h1>
        <select
          className='select from-left'
          onChange={(event) => setRegion(event.target.value)}
          value={region}
        >
          <option value="Indian">Indian</option>
          <option value="British">British</option>
          <option value="American">American</option>
        </select>
        <FontAwesomeIcon
          className="icon transition-opa z-10"
          onClick={() => {
            setMeetingState((prev) => ({
              showSign: !prev.showSign,
            }));
          }}
          icon={faTimes}
        />
      </div>
      <hr />
      <div className="section pt-1 text-left m-4">
        {appData.transcriptionMsg && gifSrc && (
          <div className="gif-container mb-3">
            <img src={gifSrc} alt="Sign Language GIF" />
          </div>
        )}
        {/* Display individual letter signs regardless of whether a phrase was found */}
        {letterSrc.length > 0 && (
          <div className="letters-container mb-3 flex gap-2 flex-wrap items-center justify-center">
            {letterSrc.map((src, index) => (
              <img key={index} src={src} alt={`letter-${index}`} className="letter border rounded-md" width={'144px'} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sign;
````

## File: src/pages/Cheat/Cheat.js
````javascript
import React, { useEffect, useState } from 'react';

function Cheat() {
  const [copyStatus, setCopyStatus] = useState('Fetching data...');

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetch('http://localhost:5000/is_copying')
        .then(response => response.json())
        .then(data => {
          const { isCopying, copyDirection, copyCount } = data;
          setCopyStatus(`Is copying: ${isCopying}, Copy direction: ${copyDirection}, Copy Count: ${copyCount}`);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          setCopyStatus('Error fetching data');
        });
    }, 300);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
    <img src="http://localhost:5000/video_feed" width="640" height="480" />
      <div id="copy-status">{copyStatus}</div>
    </div>
  );
}

export default Cheat;
````

## File: .env.example
````
NEXT_PUBLIC_FIREBASE_DATABASE_URL= 
NEXT_PUBLIC_FIREBASE_API_KEY=
````

## File: vercel.json
````json
{
  "build": {
    "command": "npm run build",
    "output": ".vercel/output"
  }
}
````

## File: backend/routes/text_routes.py
````python
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
````

## File: backend/requirements.txt
````
Flask
Flask-CORS
python-dotenv
google-generativeai
python-docx
openpyxl
PyPDF2
moviepy
pyaudio
pyautogui
opencv-python
mediapipe
protobuf
````

## File: public/manifest.json
````json
{
  "short_name": "Xpert Video Meet",
  "name": "Xpert Video Meet",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
````

## File: public/robots.txt
````
# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:
````

## File: src/components/Chatbot/data/botFunctions.js
````javascript
import * as XLSX from 'xlsx';
import xlFile from './students.xlsx';
import timeTableFile from './timetables/timetable.xlsx';

export async function readTimeTableFile() {
  try {
    const response = await fetch(timeTableFile);
    const data = await response.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const headerRow = rows[0];

    const subjectIndex = headerRow.indexOf('subject');
    const dayIndex = headerRow.indexOf('day');
    const mentorIndex = headerRow.indexOf('mentor');
    const hoursIndex = headerRow.indexOf('hours');

    let tableRows = '';

    // insted of iterationg dynamically i want to iteratre all the colums and combine all until it reaches last column (last col is null
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const subject = row[subjectIndex];
      const day = row[dayIndex];
      const mentor = row[mentorIndex];
      const hours = row[hoursIndex];

      tableRows += `<tr>
        <td>${subject}</td>
        <td>${day}</td>
        <td>${mentor}</td>
        <td>${hours}</td>
      </tr>`;
    }

    const message = `<table class="bot-table">
      <tr>
        <th>Subject</th>
        <th>Day</th>
        <th>Mentor</th>
        <th>Hours</th>
      </tr>
      ${tableRows}
    </table>`;

    return {
      text: message,
      typing: 'Generating your timetable...'
    };
  } catch (error) {
    console.error('Error loading the Data:', error);
    return { text: 'Error loading the Data.' };
  }
}


export async function readStudentDatafromxl(usn) {
  try {
    const response = await fetch(xlFile);
    const data = await response.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const headerRow = rows[0];

    const usnIndex = headerRow.indexOf('USN');
    const nameIndex = headerRow.indexOf('Name');
    const emailIndex = headerRow.indexOf('Email');
    const phoneIndex = headerRow.indexOf('Phone');

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const usnFromSheet = (row[usnIndex] || '').toLowerCase();
      if (usnFromSheet === usn.toLowerCase()) {
        const name = row[nameIndex];
        const email = row[emailIndex];
        const phone = row[phoneIndex];

        const message = `Name: ${name}<br>RollNo: ${usn.toUpperCase()}<br>Email: <a class='font-semibold' href="mailto:${email}">${email}</a><br>Phone: <a class='font-semibold' href="tel:${phone}">${phone}</a>`;
        return {
          text: message,
          typing: `Searching for your Details ${usn.toUpperCase()} ...`
        };
      }
    }

    return { text: 'Student not found!' };
  } catch (error) {
    console.error('Error loading the Data:', error);
    return { text: 'Error loading the Data.' };
  }
}
````

## File: src/components/Header/Header.css
````css
.header {
  display: flex;
  justify-content: space-between;
}

.header .logo {
  display: flex;
  align-items: center;
}

.head-icon{
  transform-origin: 0px;
  animation: rotateAnim 0.4s ease-in-out;
}

.head-icon:hover .rotate{
  animation: rotateAnim 0.4s ease-in-out;
}

@media (max-width: 767px) {
  /* Mobile styles */
}

@media (min-width: 768px) {
  /* Desktop styles */
}
````

## File: src/components/MainScreen/MainScreen.css
````css
.main-screen {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.meet-body{
    display: flex;
    flex: 1;
}
````

## File: src/components/MessageBox/MessageBox.css
````css
.message-box {
  width: 350px;
  max-width: 500px;
  max-height: 36.25rem;
  background: #0a011c;
  border: solid 1px white;
  border-radius: 10px;
  overflow-y: auto;
  justify-content: space-between;
}

@media (max-width: 500px) {
  .message-box {
    width: 100%;
  }
}

.msg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #000;
  margin: 0 0.8rem;
}

.msg-header h1 {
  color: #fff;
  font-size: 1.5rem;
  font-family: "Finger Paint", cursive;
  padding: 1rem 1rem 1rem 0;
}

#message-section {
  height: 30rem;
  max-height: 28rem;
  overflow-y: auto;
  scrollbar-color: black var(--thumbBG);
}

#message-section #them,
#message-section #me {
  display: flex;
  position: relative;
  bottom: 0;
  min-height: 1.2rem;
  background-color: rgb(63, 63, 70);
  color: #fff;
  border-radius: 0 1rem 1rem 1.2rem;
  margin: 0.4rem 1.2rem 0rem;
}

#message-section .me {
  font-weight: 500;
  color: rgb(145, 14, 40);
}
#message-section .them{
  font-weight: 500;
  color: rgb(250, 204, 21);
}

#message-section #them {
  float: left;
  padding-left: 1.2rem;
  padding: 0.45rem 1rem 0.6rem 1rem;
}

#message-section #me {
  border-radius: 1rem 0rem 1rem 1.2rem;
  background-color: #fff;
  float: right;
  padding: 0.45rem 1rem 0.6rem 1rem;
  color: #000000;
}

#message-section .message {
  line-height: 1.2rem;
  clear: both;
}

.chat-footer {
  padding: 0.4rem 0.8rem;
}

#input-section input {
  background-color: rgb(63, 63, 70);
  color: white;
}

.send {
  cursor: pointer;
  margin-left: 1em;
}

.send .circle {
  position: relative;
  width: 2.8rem;
  height: 2.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
````

## File: src/components/MessageBox/MessageBox.js
````javascript
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './MessageBox.css';
import { faPaperPlane, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useContext, useEffect, useRef, useState } from 'react';
import firepadRef from '../../server/firebase';
import { AppContext } from '../../AppContext';

export default function MessageBox({ setMeetingState, username }) {
  const [messages, setMessages] = useState([]);
  const inputRef = useRef(null);
  const messageContainerRef = useRef(null);
  const { userKey } = useContext(AppContext);

  function handleInputSend() {
    const messageToSend = inputRef.current.value;
    if (messageToSend) {
      const messageRef = firepadRef.child("messages").push({
        userKey: userKey,
        name: username,
        text: messageToSend,
      });
      inputRef.current.value = "";
      messageRef.onDisconnect().remove();
    }
  }

  useEffect(() => {
    const messagesRef = firepadRef.child("messages");

    messagesRef.once("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.keys(data).map((key) => ({
          userKey: data[key].userKey,
          name: data[key].name,
          text: data[key].text,
        }));
        setMessages(messageList);
      }
    });

    messagesRef.on("child_added", (snapshot) => {
      // add pop up whenever a new message is there (need to be implemented)
      const newMessage = snapshot.val();
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      messagesRef.off();
    };
  }, []);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className='message-box from-left mx-2 my-3'>
      <div className="msg-header text-2xl">
        <h1>Xpert Messenger!</h1>
        <div className="head-right">
          <FontAwesomeIcon
            className="icon transition-opa z-10"
            onClick={() => setMeetingState((prev) => ({
              showMessage: !prev.showMessage,
            }))}
            icon={faTimes}
          />
        </div>
      </div>
      <hr />

      <div
        id="message-section"
        ref={messageContainerRef}
        className="message-container"
      >
        {messages.map((message, index) => (
          <span
            className={`message ${message.userKey === userKey ? 'me' : 'them'}`}
            key={index}
            id={message.userKey === userKey ? 'me' : 'them'}
          >
            <span className={`${message.userKey === userKey ? 'me' : 'them'}`}>{message.name}:&nbsp;</span>
            <span>{message.text}</span>
          </span>
        ))}
      </div>

      <div className="chat-footer">
        <div id="input-section" className="flex justify-between">
          <div className="w-full flex">
            <input
              ref={inputRef}
              className="flex-1 bg-gray-700 rounded-[1rem] ml-1 pl-4 text-white"
              type="text"
              placeholder="Type a message..."
              tabIndex="3"
              onKeyDown={(e) => e.key === 'Enter' && handleInputSend()}
            />
          </div>
          <button
            type="submit"
            className="send"
            tabIndex="3"
            onClick={handleInputSend}
          >
            <div className="circle">
              <FontAwesomeIcon className="icon-block" icon={faPaperPlane} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
````

## File: src/components/Participants/Participant/Participant.css
````css
.video{
    background-color:black;
    height: 100%;
    width: 100%;
    border-radius: 5px;
  }

  .card-menu {
    font-size: larger;
    color: white;
    bottom: 10px;
    position: absolute;
    right: 20px;
  }

  .card-menu-box{
    margin: 0;
    font-size: 12px;
    background-color: white;
    color: black;
    position: absolute;
    border-radius: 10px;
    bottom: 25px;
    right: 0px;
  }
  
  .card-menu-btn{
    padding: 6px 10px;
    width: 110px;
  }

  .card-menu:hover{
    cursor: pointer;
  }

  .participant {
    background-color: black;
    height: 100%;
    width: 100%;
    position: relative;
    border-radius: 5px;
    max-height: 37rem;
    min-height: 200px
  }

  .muted {
    color: #fff;
    right: 10px;
    position: absolute;
    top: 10px;
    background: black;
    border-radius: 50%;
    height: 22px;
    width: 22px!important;
  }

  .hide {
    display: none;
  }

  .avatar {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    font-size: 150px;
    font-family: roboto, arial;
    color: white;
    text-align: center;
    background: orange;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    text-transform: uppercase;
  }

  .avatar-img{
    width: 200px;
    height: 200px;
    border-radius: 50%;
    position: absolute;
    z-index: 10;
  }

  .name {
    color: white;
    bottom: 10px;
    position: absolute;
    left: 20px;
  }

  @media (max-width: 800px) {
    .participant{
      min-height: 0px;
    }
    .avatar {
      width: 80px;
      height: 80px;
      font-size: 50px;
    }
  }
````

## File: src/components/Participants/Participants.component.js
````javascript
import React, { useContext, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { AppContext } from '../../AppContext';
import { Participant } from "./Participant/Participant.component";
import "./Participants.css";

const Participants = (props) => {
  const { setParticipantsData } = useContext(AppContext);

  const videoRef = useRef(null);
  let participantKey = Object.keys(props.participants);

  useEffect(() => {
    setParticipantsData((prevData) => ({
      ...prevData,
      participants: props.participants
    }));
  }, [props.participants]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = props.stream;
      videoRef.current.muted = true;
    }
  }, [props.currentUser, props.stream]);

  const currentUser = props.currentUser
    ? Object.values(props.currentUser)[0]
    : null;

  let gridCol =
    participantKey.length === 1 ? 1 : participantKey.length <= 4 ? 2 : 4;
  const gridColSize = participantKey.length <= 4 ? 1 : 2;
  let gridRowSize =
    participantKey.length <= 4
      ? participantKey.length
      : Math.ceil(participantKey.length / 2);

  const screenPresenter = participantKey.find((element) => {
    const currentParticipant = props.participants[element];
    return currentParticipant.screen;
  });

  if (screenPresenter) {
    gridCol = 1;
    gridRowSize = 2;
  }
  const participants = participantKey.map((element, index) => {
    const currentParticipant = props.participants[element];
    const isCurrentUser = currentParticipant.currentUser;
    if (isCurrentUser) {
      return null;
    }
    const pc = currentParticipant.peerConnection;
    const remoteStream = new MediaStream();
    let curentIndex = index;
    if (pc) {
      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
        const videElement = document.getElementById(
          `participantVideo${curentIndex}`
        );
        if (videElement) videElement.srcObject = remoteStream;
      };
    }

    return (
      <Participant
        key={curentIndex}
        currentParticipant={currentParticipant}
        curentIndex={curentIndex}
        hideVideo={screenPresenter && screenPresenter !== element}
        showAvatar={
          !currentParticipant.video &&
          !currentParticipant.screen &&
          currentParticipant.name
        }
      />
    );
  });
  return (
    <div
      style={{
        "--grid-size": gridCol,
        "--grid-col-size": gridColSize,
        "--grid-row-size": gridRowSize,
      }}
      className={`participants`}
    >
      {participants}
      <Participant
        currentParticipant={currentUser}
        curentIndex={participantKey.length}
        hideVideo={screenPresenter && !currentUser.screen}
        videoRef={videoRef}
        showAvatar={currentUser && !currentUser.video && !currentUser.screen}
        currentUser={true}
      />
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    participants: state.participants,
    currentUser: state.currentUser,
    stream: state.mainStream,
  };
};

export default connect(mapStateToProps)(Participants);
````

## File: src/components/Participants/Participants.css
````css
.participants {
  display: grid;
  grid-template-columns: repeat(var(--grid-size), 1fr);
  grid-gap: 20px;
  height: 85vh;
  padding: 10px;
}

.participants img {
  border-radius: 50%;
  height: 120px;
  width: 120px;
}

@media (max-width: 800px) {
  .participants {
    grid-template-columns: repeat(var(--grid-col-size), 1fr);
    grid-template-rows: repeat(var(--grid-row-size), 1fr);
  }
}
````

## File: src/components/Shared/Card/Card.component.js
````javascript
import React from "react";
import "./Card.css";

const Card = (props) => {
  return <div className="card">{props.children}</div>;
};

export default Card;
````

## File: src/components/Shared/Card/Card.css
````css
.card{
    background: #ffffff;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;    
    height: 100%;
}
````

## File: src/pages/ErrorHandler/ErrorHandler.js
````javascript
// udemy react section 14 to know about Class Components
import React, { Component } from 'react';

export default class ErrorHandler extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error.message,
    };
  }

  componentDidCatch(error, info) {
    console.error("Caught an error from ERROR HANDLER:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <p>{this.state.errorMessage === 'Unstable internet connection!' && 'Unstable internet connection!'}
          </p>
        </>
      );
    }
    return this.props.children;
  }
}
````

## File: src/pages/Meet/Meet.css
````css
.Meet {
  display: flex;
  width: 100vw;
  height: 100vh;
}
````

## File: src/pages/NoInternet/NoInternet.component.js
````javascript
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checkInternetConnection } from '../../server/http';
import styles from './NoInternet.module.css';

export default function NoInternet() {
  const navigate = useNavigate();

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!checkInternetConnection()) {
        clearInterval(intervalId);
        navigate('/'); 
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [navigate]);

  return (
    <div id={styles.notfound}>
      <div className={styles.notfound}>
        <div className={styles.notfound404}>
          <h1>418</h1>
          <h2>Oops! The internet is brewing some tea.</h2>
        </div>
        <Link to="/">Homepage</Link>
      </div>
    </div>
  );
}
````

## File: src/pages/NoInternet/NoInternet.module.css
````css
#notfound {
  position: relative;
  height: 100vh;
  background: #170324;
}

#notfound .notfound {
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}

.notfound {
  max-width: 767px;
  width: 100%;
  line-height: 1.4;
  text-align: center;
}

.notfound .notfound404 {
  position: relative;
  height: 180px;
  margin-bottom: 20px;
  z-index: -1;
}

.notfound .notfound404 h1 {
  font-family: 'Montserrat', sans-serif;
  position: absolute;
  left: 50%;
  top: 15%;
  transform: translate(-50%, -50%);
  font-size: 224px;
  font-weight: 900;
  margin-top: 0px;
  margin-bottom: 0px;
  margin-left: -12px;
  color: #030005;
  text-transform: uppercase;
  text-shadow: -1px -1px 0px #8400ff, 1px 1px 0px #ff005a;
  letter-spacing: -20px;
}


.notfound .notfound404 h2 {
  font-family: 'Montserrat', sans-serif;
  position: absolute;
  left: 0;
  right: 0;
  top: 110px;
  font-size: 42px;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  text-shadow: 0px 2px 0px #8400ff;
  letter-spacing: 13px;
  margin: 0;
}

.notfound a {
  margin-top: 2.5rem;
  font-family: 'Montserrat', sans-serif;
  display: inline-block;
  text-transform: uppercase;
  color: #ff005a;
  text-decoration: none;
  border: 2px solid;
  background: transparent;
  padding: 10px 40px;
  font-size: 14px;
  font-weight: 700;
  -webkit-transition: 0.2s all;
  transition: 0.2s all;
}

.notfound a:hover {
  color: #8400ff;
}

@media only screen and (max-width: 767px) {
  .notfound .notfound404 h2 {
    font-size: 24px;
  }
}

@media only screen and (max-width: 480px) {
  .notfound .notfound404 h1 {
    font-size: 182px;
  }
}
````

## File: src/server/firebase.js
````javascript
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

var firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

firebase.initializeApp(firebaseConfig);
export const db = firebase;
var firepadRef = firebase.database().ref();

const urlparams = new URLSearchParams(window.location.search);
const roomId = urlparams.get("id");

if (roomId) {
  firepadRef = firepadRef.child(roomId);
} else {
  firepadRef = firepadRef.push();
}

export default firepadRef;
````

## File: src/server/peerConnection.js
````javascript
import firepadRef from "./firebase";
import { store } from "../index";

const participantRef = firepadRef.child("participants");

export const updatePreference = (userId, preference) => {
  const currentParticipantRef = participantRef.child(userId).child("preferences");
  setTimeout(() => {
    currentParticipantRef.update(preference);
  },50);
};

export const createOffer = (peerConnection, receiverId, createdID) => {
  const currentParticipantRef = participantRef.child(receiverId);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      currentParticipantRef
        .child("offerCandidates")
        .push({ ...event.candidate.toJSON(), userId: createdID });
    }
  };

  return peerConnection.createOffer()
    .then((offerDescription) => {
      return peerConnection.setLocalDescription(offerDescription)
        .then(() => {
          const offer = {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
            userId: createdID,
          };
          return currentParticipantRef.child("offers").push().set({ offer });
        });
    });
};

export const initializeListeners = (userId) => {
  const currentUserRef = participantRef.child(userId);

  currentUserRef.child("offers").on("child_added", (snapshot) => {
    const data = snapshot.val();
    if (data?.offer) {
      const pc = store.getState().participants[data.offer.userId].peerConnection;
      pc.setRemoteDescription(new RTCSessionDescription(data.offer))
        .then(() => createAnswer(data.offer.userId, userId));
    }
  });

  currentUserRef.child("offerCandidates").on("child_added", (snapshot) => {
    const data = snapshot.val();
    if (data.userId) {
      const pc = store.getState().participants[data.userId].peerConnection;
      pc.addIceCandidate(new RTCIceCandidate(data));
    }
  });

  currentUserRef.child("answers").on("child_added", (snapshot) => {
    const data = snapshot.val();
    if (data?.answer) {
      const pc = store.getState().participants[data.answer.userId].peerConnection;
      const answerDescription = new RTCSessionDescription(data.answer);
      pc.setRemoteDescription(answerDescription);
    }
  });

  currentUserRef.child("answerCandidates").on("child_added", (snapshot) => {
    const data = snapshot.val();
    if (data.userId) {
      const pc = store.getState().participants[data.userId].peerConnection;
      pc.addIceCandidate(new RTCIceCandidate(data));
    }
  });
};

const createAnswer = (otherUserId, userId) => {
  const pc = store.getState().participants[otherUserId].peerConnection;
  const participantRef1 = participantRef.child(otherUserId);

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      participantRef1
        .child("answerCandidates")
        .push({ ...event.candidate.toJSON(), userId: userId });
    }
  };

  return pc.createAnswer()
    .then((answerDescription) => {
      return pc.setLocalDescription(answerDescription)
        .then(() => {
          const answer = {
            type: answerDescription.type,
            sdp: answerDescription.sdp,
            userId: userId,
          };
          return participantRef1.child("answers").push().set({ answer });
        });
    });
};
````

## File: src/store/actioncreator.js
````javascript
import {
  SET_MAIN_STREAM,
  ADD_PARTICIPANT,
  SET_USER,
  REMOVE_PARTICIPANT,
  UPDATE_USER,
  UPDATE_PARTICIPANT,
} from "./actiontypes";

export const setMainStream = (stream) => {
  return {
    type: SET_MAIN_STREAM,
    payload: {
      mainStream: stream,
    },
  };
};

export const setUser = (user) => {
  return {
    type: SET_USER,
    payload: {
      currentUser: user,
    },
  };
};

export const addParticipant = (user) => {
  return {
    type: ADD_PARTICIPANT,
    payload: {
      newUser: user,
    },
  };
};

export const updateUser = (user) => {
  return {
    type: UPDATE_USER,
    payload: {
      currentUser: user,
    },
  };
};

export const updateParticipant = (user) => {
  return {
    type: UPDATE_PARTICIPANT,
    payload: {
      newUser: user,
    },
  };
};

export const removeParticipant = (userId) => {
  return {
    type: REMOVE_PARTICIPANT,
    payload: {
      id: userId,
    },
  };
};
````

## File: src/store/actiontypes.js
````javascript
export const SET_MAIN_STREAM = "SET_MAIN_STREAM";
export const ADD_PARTICIPANT = "ADD_PARTICIPANT";
export const REMOVE_PARTICIPANT = "REMOVE_PARTICIPANT";
export const SET_USER = "SET_USER";
export const UPDATE_USER = "UPDATE_USER";
export const UPDATE_PARTICIPANT = "UPDATE_PARTICIPANT";
````

## File: src/AppLoader.js
````javascript
import { SyncLoader } from 'react-spinners';

const Loader = ({ message = "Loading..." }) => (
  <>
    <div className="transparent-background flex-col">
      <SyncLoader color="white" />
      <div className='mt-4'>{message}</div>
    </div>
  </>
);

export default Loader;
````

## File: src/logo.svg
````xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 841.9 595.3"><g fill="#61DAFB"><path d="M666.3 296.5c0-32.5-40.7-63.3-103.1-82.4 14.4-63.6 8-114.2-20.2-130.4-6.5-3.8-14.1-5.6-22.4-5.6v22.3c4.6 0 8.3.9 11.4 2.6 13.6 7.8 19.5 37.5 14.9 75.7-1.1 9.4-2.9 19.3-5.1 29.4-19.6-4.8-41-8.5-63.5-10.9-13.5-18.5-27.5-35.3-41.6-50 32.6-30.3 63.2-46.9 84-46.9V78c-27.5 0-63.5 19.6-99.9 53.6-36.4-33.8-72.4-53.2-99.9-53.2v22.3c20.7 0 51.4 16.5 84 46.6-14 14.7-28 31.4-41.3 49.9-22.6 2.4-44 6.1-63.6 11-2.3-10-4-19.7-5.2-29-4.7-38.2 1.1-67.9 14.6-75.8 3-1.8 6.9-2.6 11.5-2.6V78.5c-8.4 0-16 1.8-22.6 5.6-28.1 16.2-34.4 66.7-19.9 130.1-62.2 19.2-102.7 49.9-102.7 82.3 0 32.5 40.7 63.3 103.1 82.4-14.4 63.6-8 114.2 20.2 130.4 6.5 3.8 14.1 5.6 22.5 5.6 27.5 0 63.5-19.6 99.9-53.6 36.4 33.8 72.4 53.2 99.9 53.2 8.4 0 16-1.8 22.6-5.6 28.1-16.2 34.4-66.7 19.9-130.1 62-19.1 102.5-49.9 102.5-82.3zm-130.2-66.7c-3.7 12.9-8.3 26.2-13.5 39.5-4.1-8-8.4-16-13.1-24-4.6-8-9.5-15.8-14.4-23.4 14.2 2.1 27.9 4.7 41 7.9zm-45.8 106.5c-7.8 13.5-15.8 26.3-24.1 38.2-14.9 1.3-30 2-45.2 2-15.1 0-30.2-.7-45-1.9-8.3-11.9-16.4-24.6-24.2-38-7.6-13.1-14.5-26.4-20.8-39.8 6.2-13.4 13.2-26.8 20.7-39.9 7.8-13.5 15.8-26.3 24.1-38.2 14.9-1.3 30-2 45.2-2 15.1 0 30.2.7 45 1.9 8.3 11.9 16.4 24.6 24.2 38 7.6 13.1 14.5 26.4 20.8 39.8-6.3 13.4-13.2 26.8-20.7 39.9zm32.3-13c5.4 13.4 10 26.8 13.8 39.8-13.1 3.2-26.9 5.9-41.2 8 4.9-7.7 9.8-15.6 14.4-23.7 4.6-8 8.9-16.1 13-24.1zM421.2 430c-9.3-9.6-18.6-20.3-27.8-32 9 .4 18.2.7 27.5.7 9.4 0 18.7-.2 27.8-.7-9 11.7-18.3 22.4-27.5 32zm-74.4-58.9c-14.2-2.1-27.9-4.7-41-7.9 3.7-12.9 8.3-26.2 13.5-39.5 4.1 8 8.4 16 13.1 24 4.7 8 9.5 15.8 14.4 23.4zM420.7 163c9.3 9.6 18.6 20.3 27.8 32-9-.4-18.2-.7-27.5-.7-9.4 0-18.7.2-27.8.7 9-11.7 18.3-22.4 27.5-32zm-74 58.9c-4.9 7.7-9.8 15.6-14.4 23.7-4.6 8-8.9 16-13 24-5.4-13.4-10-26.8-13.8-39.8 13.1-3.1 26.9-5.8 41.2-7.9zm-90.5 125.2c-35.4-15.1-58.3-34.9-58.3-50.6 0-15.7 22.9-35.6 58.3-50.6 8.6-3.7 18-7 27.7-10.1 5.7 19.6 13.2 40 22.5 60.9-9.2 20.8-16.6 41.1-22.2 60.6-9.9-3.1-19.3-6.5-28-10.2zM310 490c-13.6-7.8-19.5-37.5-14.9-75.7 1.1-9.4 2.9-19.3 5.1-29.4 19.6 4.8 41 8.5 63.5 10.9 13.5 18.5 27.5 35.3 41.6 50-32.6 30.3-63.2 46.9-84 46.9-4.5-.1-8.3-1-11.3-2.7zm237.2-76.2c4.7 38.2-1.1 67.9-14.6 75.8-3 1.8-6.9 2.6-11.5 2.6-20.7 0-51.4-16.5-84-46.6 14-14.7 28-31.4 41.3-49.9 22.6-2.4 44-6.1 63.6-11 2.3 10.1 4.1 19.8 5.2 29.1zm38.5-66.7c-8.6 3.7-18 7-27.7 10.1-5.7-19.6-13.2-40-22.5-60.9 9.2-20.8 16.6-41.1 22.2-60.6 9.9 3.1 19.3 6.5 28.1 10.2 35.4 15.1 58.3 34.9 58.3 50.6-.1 15.7-23 35.6-58.4 50.6zM320.8 78.4z"/><circle cx="420.9" cy="296.5" r="45.7"/><path d="M520.5 78.1z"/></g></svg>
````

## File: src/reportWebVitals.js
````javascript
const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
````

## File: tailwind.config.js
````javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
````

## File: backend/routes/email_routes.py
````python
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
    sender_email = "syedkhalander66@gmail.com"
    sender_password = "REMOVED"
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
````

## File: backend/routes/video_routes.py
````python
from flask import send_file, Blueprint, Response
import pyautogui
import cv2
import numpy as np
import time
from moviepy.editor import VideoFileClip, AudioFileClip
import threading
import os,wave,pyaudio,io

video_routes = Blueprint('video_routes', __name__)

recording_started = False
out_lock = threading.Lock()
audio_lock = threading.Lock()

# Function to combine video and audio files
def combine_audio_video(video_file, audio_file, output_file):
    video = VideoFileClip(video_file)
    audio = AudioFileClip(audio_file)
    video = video.set_audio(audio)
    video.write_videofile(output_file, codec='libx264', audio_codec='aac', temp_audiofile='temp-audio.m4a', remove_temp=True)

# Function to start video recording
def start_video_recording(output_file):
    global recording_started
    screen_width, screen_height = pyautogui.size()
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_file, fourcc, 20.0, (screen_width, screen_height))
    
    try:
        while recording_started:
            img = pyautogui.screenshot()
            frame = np.array(img)
            frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
            out.write(frame)
            time.sleep(0.01) # reduce this if app tries to crash
    except Exception as e:
        print(f"Error during video recording: {e}")
    finally:
        out.release()

# Function to start audio recording
def start_audio_recording(output_file):
    CHUNK = 1024
    FORMAT = pyaudio.paInt16
    CHANNELS = 2
    RATE = 44100
    audio = pyaudio.PyAudio()
    stream = audio.open(format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK)
    frames = []

    try:
        while recording_started:
            data = stream.read(CHUNK)
            frames.append(data)
    except Exception as e:
        print(f"Error during audio recording: {e}")
    finally:
        stream.stop_stream()
        stream.close()
        audio.terminate()

        wf = wave.open(output_file, 'wb')
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(audio.get_sample_size(FORMAT))
        wf.setframerate(RATE)
        wf.writeframes(b''.join(frames))
        wf.close()

# Function to start video and audio recording
def start_video_and_audio_recording(video_output_file, audio_output_file):
    global recording_started
    recording_started = True

    video_thread = threading.Thread(target=start_video_recording, args=(video_output_file,))
    audio_thread = threading.Thread(target=start_audio_recording, args=(audio_output_file,))

    video_thread.start()
    audio_thread.start()

    video_thread.join()
    recording_started = False
    audio_thread.join()


@video_routes.route('/screen-shot', methods=['GET'])
def screen_shot():
    img = pyautogui.screenshot()
    img_io = io.BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    return Response(img_io.getvalue(), mimetype='image/png', headers={
        'Content-Disposition': 'attachment;filename=screenshot.png'
    })


@video_routes.route('/start-record', methods=['GET'])
def start_recording():
    global recording_started
    if not recording_started:
        video_output_file = 'backend/records/videoRecords/output.mp4'
        audio_output_file = 'backend/records/audioRecords/output.wav'
        threading.Thread(target=start_video_and_audio_recording, args=(video_output_file, audio_output_file)).start()
        return 'Video and Audio recording started'
    else:
        return 'Video and Audio recording is already in progress'


@video_routes.route('/stop-record', methods=['GET'])
def stop_recording():
    global recording_started
    if recording_started:
        recording_started = False
        video_output_file = 'backend/records/videoRecords/output.mp4'
        audio_output_file = 'backend/records/audioRecords/output.wav'
        output_combined_file = 'backend/records/combinedRecords/output_combined.mp4'
        combine_audio_video(video_output_file, audio_output_file, output_combined_file)
        
        # remove folders after call has been ended
        os.remove(video_output_file)
        os.remove(audio_output_file) 
        
        return 'Video and Audio recording stopped and saved'
    else:
        return 'No recording in progress'


@video_routes.route('/download-video', methods=['GET'])
def download_video():
    try:
        video_path = 'backend/records/combinedRecords/output_combined.mp4'
        video_output_file = 'backend/records/videoRecords/output.mp4'
        audio_output_file = 'backend/records/audioRecords/output.wav'
        while os.path.exists(video_output_file) or os.path.exists(audio_output_file):
            time.sleep(1)  
        if not os.path.exists(video_path):
            return 'Video file does not exist yet. Please try again later.', 404
        with open(video_path, 'rb') as video_file:
            video_data = video_file.read()
        video_stream = io.BytesIO(video_data)
        video_stream.seek(0)
        return send_file(video_stream, mimetype='video/mp4', as_attachment=True, download_name='output.mp4')
    except Exception as e:
        print(f"Error: {e}")
        return str(e), 500
````

## File: backend/app.py
````python
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
````

## File: src/components/Chatbot/data/botMessagesHandle.js
````javascript
const userMessage = [
  /* 01 */["hi", "hey", "hello", "hlo", "hi there", "hey there"],
  /* 02 */["how are you", "how r u", "hw r u", "how are you doing", "how's it going", "how's life"],
  /* 03 */["what are you doing", "what is going on", "what is up", "wud", "what's up", "what's happening", "ok"],
  /* 04 */["how old are you"],
  /* 05 */["bye", "good bye", "take care"],
  /* 06 */["feedback", "report", "opinion","rating","thanks", "happy", "good", "fun", "wonderful", "fantastic", "cool", "very good", "awesome", "nice", "excellent"],
  /* 07 */["bad", "help", "bored", "tired", "not good", "feeling down", "feeling low", "i am sad", "sad"],

  // More questions can be added here
];

const botReply = [
  /* 01 */["Hello! 😊", "Hi! 👋", "Hey! 👍", "Hi there! 👋"],
  /* 02 */["Fine... how are you? 😄", "Pretty well, how are you? 😊", "Fantastic, how are you? 🌟"],
  /* 03 */["Getting better. There? 😄", "Somewhat okay! 😅", "Yeah fine!🏡"],
  /* 04 */["I am always young. 👶"],
  /* 05 */["Goodbye! 👋", "Farewell! 😊", "Please take care! 🌼"],
  /* 06 */["Thanks! Try giving feedback on WhatsApp: <a class='font-semibold' href='https://wa.me/7353346164'>7353346164</a> 💬"],
  /* 07 */[
    "I'm really sorry to hear that you're feeling this way. It's important to talk to someone you trust about your feelings. ❤️",
    "You don't have to go through this alone. Reach out to friends, family, or a mental health professional for support. 🤗",
    "I'm here to listen and chat with you, but I'm not a replacement for professional help. Please consider seeking help from a therapist or counselor. 🙏",
    "Remember that it's okay to not be okay sometimes. Your feelings are valid, and there are people who care about you. 💕",
    "If you'd like, we can chat about your feelings and experiences. Sharing can sometimes help lighten the burden. 📢",
    "Depression can be a tough journey, but there is hope and help available. You're not alone in this. 🌟",
    "Is there anything specific you'd like to talk about or any questions you have? 😊",
    "I'm here to provide a listening ear. Feel free to share as much or as little as you're comfortable with. 🤗"
  ],

  // More responses can be added here
];


// Ensure the number of responses in botReply matches the number of message groups in userMessage
if (botReply.length !== userMessage.length) {
  console.log("The number of message groups in botReply must match the number of message groups in userMessage.");
  console.log("userMessage", userMessage.length)
  console.log("botReply", botReply.length);
}

const alternative = [
  /* 1 */ "I am trying to figure this out, please give some time",
  /* 2 */ "I didn't catch that. I think once you end the call i can figure out the things properly 🧐",
  /* 3 */ "I didn't catch that. Could you please rephrase your question? 🤔",
  /* 4 */ "I'm not sure I understand. I think once you end the call i can figure out the things properly 🧐",
  /* 5 */ "Hmm, that's a bit confusing. I think once you end the call i can figure out the things properly 🤨",
  /* 6 */ "Could you try asking a different query? 🤨",
  // More alternatives can be added here
];


function calculateSimilarity(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const short = len1 < len2 ? len1 : len2;
  const long = len1 > len2 ? len1 : len2;
  let matchCount = 0;

  for (let i = 0; i < short; i++) {
    if (str1[i] === str2[i]) {
      matchCount++;
    }
  }
  const similarity = matchCount / long;
  return similarity;
}

function cleanInput(input) {
  return input
    .replace(/[^\w\s'"]/gi, "")
    .replace(/ a |i feel |whats|please /g, " ")
    .replace(/ please/g, "")
    .trim();
}

function isCommonWord(word) {
  const commonWords = [
    'why', 'who', 'how', 'what', 'please', 'a', 'an', 'the', 'is', 'are', 'am', 'I',
    'you', 'he', 'she', 'we', 'they', 'it', 'and', 'but', 'or', 'not', 'in', 'on',
    'your', 'my', 'their', 'his', 'her', 'its', 'our', 'with', 'without', 'at', 'by',
  ];
  return commonWords.includes(word.toLowerCase());
}

function findCategoryIndex(word) {
  return botReply.findIndex(category => category.includes(word));
}

function getRandomResponseFromCategory(categoryIndex) {
  const responses = botReply[categoryIndex];
  return responses[Math.floor(Math.random() * responses.length)];
}

function getRandomAlternativeResponse() {
  return alternative[Math.floor(Math.random() * alternative.length)];
}

// Use a Map for faster lookup of user messages
let userMessagesMap = new Map();
const storedUserMessagesMap = localStorage.getItem('userMessagesMap');
if (storedUserMessagesMap) {
  userMessagesMap = new Map(JSON.parse(storedUserMessagesMap));
} else {
  userMessage.forEach((messages, index) => {
    messages.forEach(message => {
      userMessagesMap.set(message.toLowerCase(), index);
    });
  });
  localStorage.setItem('userMessagesMap', JSON.stringify([...userMessagesMap]));
}

function findDirectMatch(text) {
  if (userMessagesMap.has(text)) {
    return getRandomResponseFromCategory(userMessagesMap.get(text));
  }
  return null;
}

export function findResponse(input) {
  let text = cleanInput(input);

  // Check for direct matches using the optimized function
  const directMatch = findDirectMatch(text);
  if (directMatch) {
    return directMatch;
  }

  //check each word
  const words = text.split(' ');
  for (const word of words) {
    if (isCommonWord(word)) {
      continue;
    }
    const categoryIndex = findCategoryIndex(word);
    if (categoryIndex !== -1) {
      return getRandomResponseFromCategory(categoryIndex);
    }
  }

  //check similarity
  const SIMILARITY_THRESHOLD = 0.6;
  for (let i = 0; i < userMessage.length; i++) {
    const messageGroup = userMessage[i];
    for (const message of messageGroup) {
      const similarityScore = calculateSimilarity(text, message);
      if (similarityScore >= SIMILARITY_THRESHOLD) {
        return getRandomResponseFromCategory(i);
      }
    }
  }

  return getRandomAlternativeResponse();
}
````

## File: src/components/Chatbot/Chatbot.css
````css
.chatbot {
  width: 350px;
  max-width: 500px;
  max-height: 36rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #0a011c;
  border: solid 1px white; 
  border-radius: 10px;
  font-size: 1rem;
}

@media (max-width: 500px) {
  .chatbot {
    width: 100%;
  }
}

.chatbot #botheader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #000;
  margin: 0 0.8rem;
}

.chatbot #botheader h1 {
  color: #fff;
  font-size: 1.5rem;
  font-family: "Finger Paint", cursive;
  padding: 1rem 1rem 1rem 0;
}

.chatbot #message-section {
  height: 30rem;
  max-height: 28rem;
  overflow-y: auto;
}

.chatbot #message-section::-webkit-scrollbar-track {
  background-color: rgb(0, 0, 0);
}

.chatbot #message-section #bot,
.chatbot #message-section #user {
  display: flex;
  position: relative;
  bottom: 0;
  min-height: 1.2rem;
  background-color: rgb(63, 63, 70);
  color: #fff;
  border-radius: 0 1rem 1rem 1.2rem;
  margin: 0.4rem 1.2rem 0rem;
}

.chatbot #message-section #bot {
  float: left;
  padding-left: 1.2rem;
  padding: 0.4rem 1rem 0.6rem 1rem;
}

.chatbot #message-section #user {
  border-radius: 1rem 0rem 1rem 1.2rem;
  background-color: #fff;
  float: right;
  padding: 0.4rem 1rem 0.6rem 1rem;
  color: #000000;
}

.chatbot #message-section .message {
  color: #000;
  clear: both;
  line-height: 1.2rem;
  padding: 8px;
  position: relative;
  margin: 8px 0;
  max-width: 85%;
  word-wrap: break-word;
  z-index: 2;
}

.chat-footer{
  padding: 0.8rem;
  padding-top: 0.1rem;
}

.chatbot #input-section input{
  background-color: rgb(63, 63, 70);
  color: white;
}

.chatbot .send {
  background: transparent;
  border: 0;
  cursor: pointer;
  flex: 0 0 auto;
  margin-left: 1em;
  margin-right: 0;
  padding: 0;
  position: relative;
  outline: none;
}

.circle:hover,
.circle:active {
  opacity: 0.7;
}

.chatbot .send .circle {
  position: relative;
  width: 2.8rem;
  height: 2.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.circle {
  background-color: rgb(57, 57, 150);
  border-radius: 10px;
  color: #fff;
}

input:focus, .circle:focus, .send:focus , button:focus {
  border: 1px solid white !important;
  outline: none; 
  border-radius: 10px;
}

.allquickbtn{
  margin: 0.2rem;
}

.quickmessage {
  background-color: rgb(57, 57, 150);
  color: #ffffff;
  border-radius: 10px;
  padding: 0.2rem 0.4rem 0.2rem 0.4rem;
  margin: 0.13rem;
}

.typing-animation {
  animation: typing 0.5s ease-in-out infinite;
}

.bot-table th, .bot-table td {
  padding: 2px;
  border: 1px solid white;
}

@keyframes typing {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
````

## File: src/components/Chatbot/Chatbot.js
````javascript
import { faPaperPlane, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../AppContext";
import { generateChatbotSummary } from '../../server/http';
import "./Chatbot.css";
import { readStudentDatafromxl, readTimeTableFile } from "./data/botFunctions";
import { findResponse } from "./data/botMessagesHandle";

export default function Chatbot() {
  const { appData } = useContext(AppContext);

  // without Transcription Message:
  // const toTranscribe = appData.keyPoints.length !== 0 ? ' key points discussed: ' + appData.keyPoints.join(', ') : '';
  
  // with Transcription Message:
  const toTranscribe = appData.transcriptionMsg + (appData.keyPoints.length !== 0 ? ' key points discussed: ' + appData.keyPoints.join(', ') : ''); 

  // Retrieve messages from local storage if available, otherwise use default messages
  const [messages, setMessages] = useState(() => {
    const storedMessages = localStorage.getItem('messages');
    return storedMessages ? JSON.parse(storedMessages) : [
      { id: "bot", text: "Hello.. I'm listening! Go on.." },
      // other default messages
    ];
  });
  const inputRef = useRef(null);
  const messageContainerRef = useRef(null);
  const isAnyMessageAnimating = messages.some(message => message.animate);
  const usnexp = /\b[0-9]{1}[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}\b/i;

  function output(input) {
    userMessageSend({ text: input });
    const lowerInput = input.toLowerCase();
    const includesUsn = ["student", "rollno", "details", "usn"].some(keyword => lowerInput.includes(keyword));
    const usn = usnexp.test(lowerInput) ? lowerInput.match(usnexp)[0] : null;

    const includesMeeting = ["meeting", "Talk about this meeting", "What is this meeting about"].some(keyword => lowerInput.includes(keyword));
    const includesTimeTable = ["time table", "time", "table"].some(keyword => lowerInput.includes(keyword));

    if (includesMeeting) {
      if (toTranscribe) {
        (async () => {
          const summary = await generateChatbotSummary(toTranscribe);
          await botMessageSend({ text: summary, typing: 'Analyzing and generating the response...' });
        })();
      }
      else {
        botMessageSend({ text: '<i>Unable to generate a summary. waiting for host to provide summary or key-points<i>' })
      }
    } else if (includesTimeTable) {
      readTimeTableFile()
        .then(message => { botMessageSend(message) })
    } else if (includesUsn || usn) {
      if (usn) {
        readStudentDatafromxl(usn)
          .then(message => { botMessageSend(message) })
      } else {
        botMessageSend({ text: "Enter Student Rollno 📝" });
      }
    } else {
      botMessageSend({ text: findResponse(lowerInput) });
    }
  }

  function userMessageSend(...messages) {
    const updatedMessages = messages.map((message) => {
      const { text, defaultClass } = message;
      const newMessage = { id: "user", text, defaultClass };
      return newMessage;
    });
    setMessages((prevMessages) => [...prevMessages, ...updatedMessages]);
  }

  function botMessageSend(...messages) {
    //  { text, typing, delay, defaultClass }
    const defaultTyping = 'Typing...';
    const defaultDelay = 1000;
    const updatedMessages = messages.map((message) => {
      const { text, typing, delay, defaultClass } = message;
      const typingValue = typing !== undefined ? typing : defaultTyping;
      const delayValue = delay !== undefined ? delay : defaultDelay;
      const newMessage = { id: "bot", text, typing: typingValue, delay: delayValue, animate: true, defaultClass };
      setTimeout(() => {
        newMessage.animate = false;
        setMessages((prevMessages) => [...prevMessages]);
      }, delayValue);
      return newMessage;
    });
    setMessages((prevMessages) => [...prevMessages, ...updatedMessages]);
  }

  function handleInputSend(btnMessage) {
    const messageToSend = typeof btnMessage === 'string' ? btnMessage : inputRef.current.value;
    if (messageToSend) {
      output(messageToSend);
      inputRef.current.value = "";
    }
  }

  function reset() {
    setMessages([{ id: "bot", text: "Hello.. I'm listening! Go on.." }]);
  }

  useEffect(() => {
    if (messageContainerRef.current) {
      localStorage.setItem('messages', JSON.stringify(messages));
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chatbot">
      <div id="botheader">
        <h1>Xpert Chatter!</h1>
        <button className="send" onClick={reset}>
          <div className="circle refresh">
            <FontAwesomeIcon className="icon-block" icon={faRefresh} />
          </div>
        </button>
      </div>
      <hr />
      <div
        id="message-section"
        ref={messageContainerRef}
        className="message-container"
      >
        {messages.map((message, index) => (
          <span
            className={`message ${message.id === 'bot' && message.animate ? 'typing-animation' : ''}`}
            key={index}
            id={message.id}
          >
            {message.animate ? (
              <span>{message.typing}</span>
            ) : (
              <span className={`${message.defaultClass && message.defaultClass}`}>
                <span dangerouslySetInnerHTML={{ __html: message.text }} />
              </span>
            )}
          </span>
        ))}
      </div>
      <div className="chat-footer">
        <div className="allquickbtn">
          <button
            tabIndex="1"
            className="quickmessage"
            onClick={() => handleInputSend("Talk about this meeting 📝")}
            disabled={isAnyMessageAnimating}
          >
            Talk about this meeting 📝
          </button>
          <button
            tabIndex="4"
            className="quickmessage"
            onClick={() => handleInputSend("What is this meeting about?🤔")}
            disabled={isAnyMessageAnimating}
          >
            What is this meeting about?🤔
          </button>
        </div>
        <div id="input-section" className="flex justify-between">
          <div className="w-full flex">
            <input
              ref={inputRef}
              className="flex-1 bg-gray-700 rounded-[1rem] ml-1 pl-4 text-white"
              type="text"
              placeholder="Type a message..."
              tabIndex="3"
              onKeyDown={(e) => e.key === 'Enter' && handleInputSend()}
              disabled={isAnyMessageAnimating}
            />
          </div>
          <button
            type="submit"
            className="send"
            onClick={handleInputSend}
            tabIndex="3"
            disabled={isAnyMessageAnimating}
          >
            <div className="circle">
              <FontAwesomeIcon className="icon-block" icon={faPaperPlane} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
````

## File: src/components/Header/Header.js
````javascript
// Header.jsx

import {
  faCalendarAlt,
  faExclamationCircle,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from 'react';
import './Header.css';

export default function Header({ handleCalendar, handleSettings }) {
  return (
    <>
      <div className="header">
        <div className="logo">
          <p className='text-3xl'>Xpert</p>
          <span className='mt-3'>Meet</span>
        </div>
        <div>
          <button className='head-icon'><FontAwesomeIcon  className='rotate text-[24px] p-[10px]' icon={faExclamationCircle} /></button>
          <button className='head-icon' onClick={handleCalendar}><FontAwesomeIcon className='rotate text-[24px] p-[10px]' icon={faCalendarAlt} /></button>
          <button className='head-icon' onClick={handleSettings}><FontAwesomeIcon className='rotate text-[24px] p-[10px]' icon={faGear} /></button>
        </div>
      </div>
    </>
  );
}
````

## File: src/components/MainScreen/MainScreen.component.js
````javascript
import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { setMainStream, updateUser } from "../../store/actioncreator";
import Chatbot from "../Chatbot/Chatbot";
import JamBoard from "../JamBoard/JamBoard";
import MeetingFooter from "../MeetingFooter/MeetingFooter.component";
import MeetingInfo from "../MeetingInfo/MeetingInfo";
import MessageBox from '../MessageBox/MessageBox';
import Participants from "../Participants/Participants.component";
import Sign from "../Sign/Sign";
import Transcription from "../Transcription/Transcription";
import "./MainScreen.css";

const MainScreen = (props) => {
  const participantRef = useRef(props.participants);
  const [meetingState, setMeetingState] = useState({
    meetingInfo: false,
    showTranscripts: window.innerWidth >= 768,
    showChatbot: false,
    showMessage: false,
    showJam: false,
    showSign: false,
  });
  const onMicClick = (micEnabled) => {
    if (props.stream) {
      props.stream.getAudioTracks()[0].enabled = micEnabled;
      props.updateUser({ audio: micEnabled });
    }
  };
  const onVideoClick = (videoEnabled) => {
    if (props.stream) {
      props.stream.getVideoTracks()[0].enabled = videoEnabled;
      props.updateUser({ video: videoEnabled });
    }
  };

  useEffect(() => {
    participantRef.current = props.participants;
  }, [props.participants]);

  const updateStream = (stream) => {
    for (let key in participantRef.current) {
      const sender = participantRef.current[key];
      if (sender.currentUser) continue;
      const peerConnection = sender.peerConnection
        .getSenders()
        .find((s) => (s.track ? s.track.kind === "video" : false));
      peerConnection.replaceTrack(stream.getVideoTracks()[0]);
    }
    props.setMainStream(stream);
  };

  const onScreenShareEnd = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    localStream.getVideoTracks()[0].enabled = Object.values(
      props.currentUser
    )[0].video;

    updateStream(localStream);

    props.updateUser({ screen: false });
  };

  const onScreenClick = async () => {
    let mediaStream;
    if (navigator.getDisplayMedia) {
      mediaStream = await navigator.getDisplayMedia({ video: true });
    } else if (navigator.mediaDevices.getDisplayMedia) {
      mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
    } else {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { mediaSource: "screen" },
      });
    }

    mediaStream.getVideoTracks()[0].onended = onScreenShareEnd;
    updateStream(mediaStream);
    props.updateUser({ screen: true });
  };

  return (
    <div className="main-screen">
      <div className="meet-body">
        <div className="flex-1">
        {window.innerWidth <= 500 && (meetingState.showTranscripts || meetingState.showChatbot || meetingState.showMessage) ? null : <Participants />}
        </div> 
        {/* <Cheat/> */}
        {meetingState.showJam && <JamBoard setMeetingState={setMeetingState}/>}
        {meetingState.showSign && <Sign setMeetingState={setMeetingState} />}
        {meetingState.meetingInfo && <MeetingInfo setMeetingState={setMeetingState} name={props.name} />}
        {meetingState.showTranscripts && <Transcription setMeetingState={setMeetingState} />}
        {meetingState.showChatbot && <div className="from-left mx-2 my-3"><Chatbot /></div>}
        {meetingState.showMessage && <MessageBox setMeetingState={setMeetingState} username={props.name}/>}
      </div>
        <MeetingFooter
          onScreenClick={onScreenClick}
          onMicClick={onMicClick}
          onVideoClick={onVideoClick}
          meetingState={meetingState}
          setMeetingState={setMeetingState}
        />
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    stream: state.mainStream,
    participants: state.participants,
    currentUser: state.currentUser,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setMainStream: (stream) => dispatch(setMainStream(stream)),
    updateUser: (user) => dispatch(updateUser(user)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MainScreen);
````

## File: src/components/MeetingFooter/MeetingFooter.component.js
````javascript
import {
  faAlignLeft,
  faCamera,
  faComments,
  faDesktop,
  faKey,
  faLink,
  faLinkSlash,
  faMessage,
  faMicrophone,
  faMicrophoneSlash,
  faNoteSticky,
  faPenToSquare,
  faPhone,
  faSignLanguage,
  faSlash,
  faVideo,
  faVideoSlash
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { AppContext } from '../../AppContext';
import { onScreenshotClick, stopVideoRecording } from "../../server/http";
import Model from "../Model/Model";
import "./MeetingFooter.css";

const MeetingFooter = (props) => {
  const { appState, setAppState, participantsData } = useContext(AppContext);
  const { meetingState, setMeetingState } = props;
  const navigate = useNavigate();
  const [streamState, setStreamState] = useState({
    mic: true,
    video: false,
    screen: false,
  });

  const handleEndCall = () => {
    stopVideoRecording();
    navigate('/summary');
  };

  const micClick = () => {
    setStreamState((currentState) => {
      return {
        ...currentState,
        mic: !currentState.mic,
      };
    });
  };

  const onVideoClick = () => {
    setStreamState((currentState) => {
      return {
        ...currentState,
        video: !currentState.video,
      };
    });
  };

  const onScreenClick = () => {
    props.onScreenClick(setScreenState);
  };

  const setScreenState = (isEnabled) => {
    setStreamState((currentState) => {
      return {
        ...currentState,
        screen: isEnabled,
      };
    });
  };

  function onClickIcon(btnType) {
    if (btnType === 'keys') {
      setAppState({
        loaderShow: false,
        model: {
          showModel: true,
          modelNeedInput: true,
          modelType: 'keys',
          modelMsg: "Enter a Key Points on this meeting:"
        }
      });
    } else if (btnType === 'notes') {
      setAppState({
        loaderShow: false,
        model: {
          showModel: true,
          modelType: 'notes',
          modelMsg: participantsData.isHost ? "Upload the notes or materials:" : "Download Notes"
        }
      });
    }
    
  }

  useEffect(() => {
    props.onMicClick(streamState.mic);
  }, [streamState.mic]);

  useEffect(() => {
    props.onVideoClick(streamState.video);
  }, [streamState.video]);

  return (
    <>
      <ReactTooltip id="tooltip" effect="solid" />
      {appState.model.showModel && (
        <Model />
      )}
      <div className="meeting-footer border-t">
        <div
          className={`meeting-icons ${!streamState.mic ? "active" : ""}`}
          title={streamState.mic ? "Mute Audio" : "Unmute Audio"}
          onClick={micClick}
        >
          <FontAwesomeIcon
            icon={!streamState.mic ? faMicrophoneSlash : faMicrophone}
          />
        </div>
        <div
          className={`meeting-icons ${!streamState.video ? "active" : ""}`}
          title={streamState.video ? "Hide Video" : "Show Video"}
          onClick={onVideoClick}
        >
          <FontAwesomeIcon icon={!streamState.video ? faVideoSlash : faVideo} />
        </div>
        <div className="meeting-icons" onClick={onScreenshotClick}
          title="Take Screenshot"
        >
          <FontAwesomeIcon icon={faCamera} />
        </div>
        <div
          className="meeting-icons"
          title="Share Screen"
          onClick={onScreenClick}
          disabled={streamState.screen}
        >
          <FontAwesomeIcon icon={faDesktop} />
        </div>
        <div
          className={`meeting-icons ${props.meetingState.showJam ? "active" : ""}`}
          title={props.meetingState.showJam ? "Close Jam Board" : "Jam Board"}
          onClick={() =>
            setMeetingState((prev) => ({
              showJam: !prev.showJam,
            }))
          }
          disabled={streamState.screen}
        >
          <FontAwesomeIcon icon={faPenToSquare} />
        </div>
        <div
          className={`meeting-icons ${props.meetingState.showSign ? "active" : ""}`}
          title={props.meetingState.showSign ? "Close Sign Language" : "Sign Langugeae"}
          onClick={() =>
            setMeetingState((prev) => ({
              showSign: !prev.showSign,
            }))
          }
          disabled={streamState.screen}
        >
          <FontAwesomeIcon icon={faSignLanguage} />
        </div>
        <div className="meeting-icons active" onClick={handleEndCall}
          title="End Call">
          <FontAwesomeIcon icon={faPhone} />
        </div>
        <div
          className={`meeting-icons ${props.meetingState.meetingInfo ? "" : "active"}`}
          title={props.meetingState.meetingInfo ? "Close Link Info" : "Link Info"}
          onClick={() =>
            setMeetingState((prev) => ({
              ...prev,
              meetingInfo: !prev.meetingInfo,
            }))
          }
        >
          <FontAwesomeIcon
            icon={meetingState.meetingInfo ? faLink : faLinkSlash}
          />
        </div>
        <div className={`meeting-icons ${appState.model.showModel && appState.model.modelType === 'keys' ? "" : "active"}`} onClick={() => onClickIcon('keys')}
          title="Key Points">
          {appState.model.showModel && appState.model.modelType === 'keys' ? (
            <FontAwesomeIcon icon={faKey} />
          ) : (
            <>
              <FontAwesomeIcon
                icon={faSlash}
                className="absolute mobile-hide"
              />
              <FontAwesomeIcon
                icon={faKey}
                className="relative"
              />
            </>
          )}
        </div>
        <div className={`meeting-icons ${appState.model.showModel && appState.model.modelType === 'notes' ? "" : "active"}`} onClick={() => onClickIcon('notes')}
          title="Notes">
          {appState.model.showModel && appState.model.modelType === 'notes' ? (
            <FontAwesomeIcon icon={faNoteSticky} />
          ) : (
            <>
              <FontAwesomeIcon
                icon={faSlash}
                className="absolute mobile-hide"
              />
              <FontAwesomeIcon
                icon={faNoteSticky}
                className="relative"
              />
            </>
          )}
        </div>
        <div
          className={`meeting-icons ${meetingState.showTranscripts ? "" : "active"}`}
          title="Transcription"
          onClick={() =>
            setMeetingState((prev) => ({
              showTranscripts: !prev.showTranscripts,
            }))
          }
        >
          {meetingState.showTranscripts ? (
            <FontAwesomeIcon icon={faAlignLeft} />
          ) : (
            <>
              <FontAwesomeIcon
                icon={faSlash}
                className="absolute mobile-hide"
              />
              <FontAwesomeIcon
                icon={faAlignLeft}
                className="relative"
              />
            </>
          )}
        </div>
        <div
          className={`meeting-icons ${meetingState.showMessage ? "" : "active"}`}
          title="Message"
          onClick={() => {
            setMeetingState((prev) => ({
              showMessage: !prev.showMessage,
            }))
          }}
        >
          {meetingState.showMessage ? (
            <FontAwesomeIcon icon={faComments} />
          ) : (
            <>
              <FontAwesomeIcon
                icon={faSlash}
                className="absolute mobile-hide"
              />
              <FontAwesomeIcon
                icon={faComments}
                className="relative"
              />
            </>
          )}
        </div>
        <div
          className={`meeting-icons ${meetingState.showChatbot ? "" : "active"}`}
          title="Chatbot"
          onClick={() => {
            setMeetingState((prev) => ({
              showChatbot: !prev.showChatbot,
            }))
          }}
        >
          {meetingState.showChatbot ? (
            <FontAwesomeIcon icon={faMessage} />
          ) : (
            <>
              <FontAwesomeIcon
                icon={faSlash}
                className="absolute mobile-hide"
              />
              <FontAwesomeIcon
                icon={faMessage}
                className="relative"
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};


export default MeetingFooter;
````

## File: src/components/MeetingFooter/MeetingFooter.css
````css
.meeting-footer {
  background: #0a011c;
  display: flex;
  justify-content: center;
  padding: 9px;
}

.meeting-icons {
  color: white;
  border-radius: 50%;
  background: #202124;
  min-width: 40px;
  min-height: 40px;
  margin: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.active {
  background-color: #ea4335;
}

div[disabled] {
  pointer-events: none;
  opacity: 0.3;
}

@media (max-width: 550px) {
  .mobile-hide{
    display: none;
  }

  .meeting-footer {
    justify-content: start;
    overflow-x: scroll;
  }

  .meeting-icons {
    margin: 10px;
  }
}

@media (min-width: 500px) and (max-width: 1200px) {
  /* */
}

@media (min-width: 768px) {
  /* Desktop styles */
}
````

## File: src/components/MeetingInfo/MeetingInfo.css
````css
.meeting-info-block {
  position: absolute;
  bottom: 4.5rem;
  left: 42vw;
  background-color: #1e0d3e;
  border-radius: 10px;
  border: white solid 2px;
  padding: 20px;
  width: 310px;
  z-index: 10;
}

@media (max-width: 768px) {
  .meeting-info-block {
    left: 50%;
    transform: translateX(-50%);
    width: 300px;
  }
}

.meeting-info-block .meeting-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.meeting-info-block .meeting-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 400;
}

.meeting-info-block .meeting-header .icon {
  cursor: pointer;
  font-size: 20px;
}

.meeting-info-block .add-people-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #04796a;
  font-size: 14px;
  padding: 8px;
  border-radius: 5px;
  outline: none;
  border: none;
  margin-top: 10px;
}

.meeting-info-block .add-people-btn .icon {
  font-size: 12px;
  margin-right: 10px;
}

.meeting-info-block .info-text {
  font-size: 14px;
}

.meeting-info-block .meet-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f1f3f5;
  padding: 15px;
  border-radius: 5px;
}

.meeting-info-block .meet-link span {
  font-size: 14px;
  font-weight: 600;
  border: none;
  outline: none;
  background: none;
  flex: 1;
  color: #555;
}

.meeting-info-block .meet-link .icon {
  cursor: pointer;
  color: #555;
}

.meeting-info-block .permission-text {
  display: flex;
  align-items: center;
  justify-content: center;
}

.meeting-info-block .permission-text .icon {
  color: #4385f4;
  font-size: 20px;
  margin-right: 10px;
}

.meeting-info-block .small-text {
  font-size: 13px;
}
````

## File: src/components/MeetingInfo/MeetingInfo.js
````javascript
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faTimes,
  faUser,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import "./MeetingInfo.css";

const MeetingInfo = ({ setMeetingState, name }) => {
  const url = window.location.href;
  return (
    <div className="meeting-info-block">
      <div className="meeting-header">
        <h3>Grab Your Meet link</h3>
        <FontAwesomeIcon
          className="icon"
          icon={faTimes}
          onClick={() => {
            setMeetingState(prevState => ({
              ...prevState,
              meetingInfo: !prevState.meetingInfo,
            }));
          }}
        />
      </div>
      <button
        onClick={() => navigator.clipboard.writeText(url)}
        className="add-people-btn">
        <FontAwesomeIcon className="icon" icon={faUser} />
        Add Others
      </button>
      <p className="info-text py-3">
        Or share this meeting link with others you want in the meeting
      </p>
      <div className="meet-link">
        <span>{url}</span>
        <FontAwesomeIcon
          className="icon"
          icon={faCopy}
          onClick={() => navigator.clipboard.writeText(url)}
        />
      </div>
      <div className="permission-text py-3">
        <FontAwesomeIcon className="icon pr-1" icon={faShieldAlt} />
        <p className="small-text">
          People who use this meeting link must get your permission before they
          can join.
        </p>
      </div>
      <p className="small-text">Joined as {name}</p>
    </div>
  );
};

export default MeetingInfo;
````

## File: src/components/Model/Model.css
````css
.model-box {
  max-width: 32rem;
  background-color: #1f2937;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  font-weight: 600;
  font-size: 1.2rem;
  padding: 1rem 2rem;
}

.model-box input{
  background-color: #171f2a;
  border-radius: 0.375rem;
  border:solid 3px rgb(55 65 81);
  width:100%;
}

.big-box{
  width: 32rem;
}

@media (max-width: 720px) {
  .model-box{
    width: 90%;
  }
}

@media (max-width: 500px) {
  .model-box {
    font-size: 1rem;
  }
}

.select {
  background-color: #19524b;
  color: white;
  border: 2px solid #00ffaa;
  border-radius: 0.375rem;
  padding: 0.5rem;
}

.select:hover,
.select:focus {
  background-color: #047857;
  border-color: #047857;
}

.select option {
  background-color: #1f2937;
}

.btn {
  background-color: #19524b;
  border: 2px solid #00ffaa;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  margin-right: 1rem;
  transition: all 0.5s ease; 
  transform-origin: 0px;
  animation: rotateAnim 0.2s ease-in-out;
}

.btn:hover {
  background-color: #047857;
  border-color: #047857;
}

.btn:hover .rotate{
  animation: rotateAnim 0.4s ease-in-out;
}

.close-btn {
  color: white;
  border: 2px solid white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.4s ease; 
}

.close-btn:hover {
  background-color: #4b5563;
  border-color: #4b5563;
}
````

## File: src/components/Model/Model.js
````javascript
import { faCodiepie } from '@fortawesome/free-brands-svg-icons';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { gapi } from 'gapi-script';
import React, { useContext, useEffect, useRef } from 'react';
import { AppContext } from '../../AppContext';
import firepadRef from '../../server/firebase';
import { downloadNotes, handleSendMail, uploadNotes } from '../../server/http';
import GoogleLoginComponent from '../Google/GoogleLoginComponent';
import GoogleLogoutComponent from '../Google/GoogleLogoutComponent';
import './Model.css';

export default function Model({ setUserName }) {
  const { appState, setAppState, appData, setAppData, participantsData } = useContext(AppContext);
  const inputRef = useRef(null);

  const clientId = '578619713815-5crb1lnc5o6ff6ju8imndrqjo803ibk2.apps.googleusercontent.com';

  const handleClose = () => {
    setAppState({ ...appState, model: { showModel: false } });
  };

  useEffect(() => {

    function startGoogleAuth() {
      gapi.client.init({
        clientId: clientId,
        scope: ""
      })
    }

    gapi.load('client:auth2', startGoogleAuth)

    firepadRef.once("value")
      .then((snapshot) => {
        const fetchedNotesLists = Object.values(snapshot.val().notes || {})
          .map((item) => item.filename);
        setAppData((prev) => ({ ...prev, notesLists: fetchedNotesLists }));
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });

    const handleEscapeKeyPress = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    const handleBackButton = () => {
      handleClose();
    };

    document.addEventListener('keydown', handleEscapeKeyPress);
    window.addEventListener('popstate', handleBackButton);

    return () => {
      document.removeEventListener('keydown', handleEscapeKeyPress);
      window.removeEventListener('popstate', handleBackButton);
    };
  }, []);

  const handleConfirm = () => {
    if (appState.model.modelType === 'join') {
      // set username for joiner
      const name = inputRef.current.value.trim();
      const isValidInput = /^[a-zA-Z\s]*$/.test(name);
      if (!isValidInput || name === '') {
        setAppState({
          ...appState,
          model: {
            showModel: true,
            modelNeedInput: false,
            modelMsg: "Enter a valid Name!"
          }
        });
      } else {
        setUserName(name);
        setAppState({ ...appState, model: { showModel: false } });
      }
    } else if (appState.model.modelType === 'keys') {
      // to add key points
      const keyPointsValue = inputRef.current.value.trim();
      if (keyPointsValue) {
        inputRef.current.value = '';
        const capitalizedValue = keyPointsValue.charAt(0).toUpperCase() + keyPointsValue.slice(1);
        setAppData((prev) => ({ ...prev, keyPoints: [...prev.keyPoints, capitalizedValue] }));
      }
    }  else if (appState.model.modelType === 'add-mail') {
      const file = inputRef.current.files[0];
      const meetingLink = window.location.href;
      const newMeetingLink = meetingLink.replace('http://localhost:3000', 'https://xpert-video-meet.vercel.app');
      console.log(newMeetingLink);
      const emailTitle = 'Join the Meeting Now!';
      const emailBody = `
<div style="color: blue;">
  <p>Dear Attendee,</p>
  <p>The meeting has commenced. Your presence is required.</p>
  <p>Please click the link below to join the meeting:</p>
  <p><a href="${newMeetingLink}">${newMeetingLink}</a></p>
</div>
`;
      // changes made to show model
      handleSendMail(setAppState, emailTitle, emailBody, file, "add-mail");
    } else if (appState.model.modelType == 'final-mail') {
      const file = inputRef.current.files[0];
      handleSendMail(setAppState, appState.emailData.emailTitle, appState.emailData.emailMsg, file, "final-mail");
    } else if (appState.model.modelType === 'notes') {
      // upload for host
      if (participantsData.isHost) {
        const file = inputRef.current.files[0];
        if (!file) {
          setAppState({ ...appState, model: { showModel: true, modelNeedInput: false, modelMsg: "Upload the notes or materials:", modelType: 'notes' } });
          return;
        }

        uploadNotes(setAppState, file)

        firepadRef.child("notes").push({ filename: file.name }).onDisconnect().remove()
          .catch((error) => setAppState({ ...appState, model: { showModel: true, modelNeedInput: false, modelMsg: "Error storing note: " + error.message } }));

      } else {
        // download notes for participants
        downloadNotes(setAppState, appData.notesLists)
      }
      // close after all operations
      setAppState({
        ...appState,
        model: { showModel: false },
      });

    } else if (appState.model.modelType === 'date') {
      navigator.clipboard.writeText(window.location.href + '?id=' + firepadRef.key);
    } else if (appState.model.modelType === 'settings') {
      localStorage.setItem('appData', JSON.stringify(appData));
      setAppState({
        ...appState,
        model: { showModel: false },
      });
    }
  };

  return (
    <div className="transparent-background">
      <div className={`from-top model-box ${appState.model.modelType === 'settings' ? 'big-box' : ''}`}>
        <div className='message text-lg'>
          <h1 className={appState.model.modelType === 'settings' ? 'text-[1.4rem]' : 'text-[1.3rem]'}>{appState.model.modelMsg}</h1>
        </div>
        {(appState.model.modelNeedInput) && (
          <div className='operation'>
            <input
              // text input
              className="px-3 py-2 mt-2 bg-gray-900"
              ref={inputRef}
            />
          </div>
        )}
        {((appState.model.modelType === 'add-mail') || (appState.model.modelType === 'final-mail') || (appState.model.modelType === 'notes' && participantsData.isHost)) && (
          <div className='operation'>
            <input
              // file input
              type='file'
              className="px-3 py-2 mt-2 bg-gray-900"
              ref={inputRef}
            />
          </div>
        )}
        {(appState.model.modelType === 'notes') && (
          <div className='operation'>
            <ul className="list-disc ml-5">
              {appData.notesLists.map((value, index) => (
                <li key={'notesLists' + index}>{value}</li>
              ))}
            </ul>
          </div>
        )}


        {(appState.model.modelType === 'settings') && (
          <>
            <h2 className="my-2 text-[1.2rem]">Current Mode: {appData.meetMode}</h2>
            <select
              className='select from-left w-full'
              onChange={(event) => setAppData({
                ...appData,
                meetMode: event.target.value
              })}
              value={appData.meetMode}
            >
              <option value="Casual">Casual</option>
              <option value="Class">Class</option>
              <option value="Exam">Exam</option>
              <option value="Office">Office</option>
            </select>
            <h2 className="my-2 text-[1.2rem]">Choose Profile Color: {appData.profileColor}</h2>
            <input className="h-11"
              type='color'
              onChange={(event) => setAppData({
                ...appData,
                profileColor: event.target.value
              })}
              value={appData.profileColor}
            />
            <h2 className="mt-2 text-[1.2rem]">Sign-Up:</h2>
            {appData.googleData?.givenName && <h1>Welcome {appData.googleData?.givenName}!</h1>}
            <div className='flex'>
            {appData.googleData ? <GoogleLogoutComponent /> : <GoogleLoginComponent />}
            <button className='btn from-left my-2 sm:my-0'><FontAwesomeIcon className='rotate' icon={faCodiepie} /> Create WeXpert Account</button>
            </div>
          </>
        )}
        <div className={`py-3 flex justify-${appState.model.modelNeedInput ? 'end' : 'center'}`}>
          <button
            className='close-btn from-left'
            onClick={handleClose}
          >
            Close
          </button>
          {appState.model.modelType && appState.model.modelType !== 'invalid' && (
            <button
              onClick={handleConfirm}
              className="btn from-left mr-0 ml-4"
            >
              {appState.model.modelType === 'settings' && <FontAwesomeIcon className='rotate' icon={faGear} />}
              {appState.model.modelType === 'keys' ? 'Add' :
                appState.model.modelType === 'add-mail' || appState.model.modelType === 'final-mail' || (appState.model.modelType === 'notes' && participantsData.isHost) ? 'Upload' :
                  appState.model.modelType === 'date' ? 'Copy Link' :
                    appState.model.modelType === 'notes' ? 'Download All' :
                      appState.model.modelType === 'settings' ? ' Save Settings' :
                        appState.model.modelNeedInput && 'Confirm'}
            </button>
          )}
        </div>
        {appData.keyPoints.length !== 0 && appState.model.modelType === 'keys' && (
          <>
            <h1 className="text-lg font-semibold mb-1">Key Points Added:</h1>
            <ul className="list-disc ml-5">
              {appData.keyPoints.map((value, index) => (
                <li key={'keyPoints' + index}>{value}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
````

## File: src/components/Participants/Participant/Participant.component.js
````javascript
import { faEllipsisV, faMicrophoneSlash, faUserTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useState } from "react";
import { AppContext } from "../../../AppContext";
import firepadRef from "../../../server/firebase";
import {
  removeParticipant
} from "../../../store/actioncreator";
import Card from "../../Shared/Card/Card.component";
import "./Participant.css";

export const Participant = (props) => {
  const { participantsData, appData } = useContext(AppContext);
  const {
    curentIndex,
    currentParticipant,
    hideVideo,
    videoRef,
    showAvatar,
    currentUser,
  } = props;
  const [isHovered, setIsHovered] = useState(false);
  const [showBox, setShowBox] = useState(false);
  function removeUser(participantName) {
    // remove by using the user id (try not to use name since it remove all users by the same name)
    const participantRef = firepadRef.child("participants");

    const participantKey = Object.keys(participantsData.participants).find(key => {
      return participantsData.participants[key].name === participantName;
    });

    if (participantKey) {
      participantRef.child(participantKey).remove();
      removeParticipant(participantKey);

    } else {
      console.error('Participant not found');
    }
  }

  if (!currentParticipant) return <></>;

  return (
    <div
      className={`participant ${hideVideo ? "hide" : ""} border`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card>
        <video
          ref={videoRef}
          className="video"
          id={`participantVideo${curentIndex}`}
          autoPlay
          playsInline
        ></video>
        {!currentParticipant.audio && (
          <FontAwesomeIcon
            className="muted"
            icon={faMicrophoneSlash}
            title="Muted"
          />
        )}
        {/* {(appData.googleData?.imageUrl && showAvatar) ?
          <img
            src={appData.googleData.imageUrl}
            className="avatar-img" />
          :
          <div
            style={{ background: currentParticipant.avatarColor }}
            className="avatar"
          >
            {currentParticipant.name[0]}
          </div>
        } */}

        {showAvatar && (
          <div
            style={{ background: currentParticipant.avatarColor }}
            className="avatar"
          >
            {currentParticipant.name[0]}
          </div>
        )}
        <div className="name">
          {currentParticipant.name}
          {currentUser ? "(You)" : ""}
        </div>
        {(isHovered && participantsData.isHost) && (
          <div className="card-menu flex gap-3">
            {showBox &&
              <div className="card-menu-box">
                {(!currentUser && "(You)") && <p className="card-menu-btn" onClick={() => removeUser(currentParticipant.name)}>Remove {currentParticipant.name} <FontAwesomeIcon icon={faUserTimes} /></p>}
              </div>}
            <FontAwesomeIcon icon={faEllipsisV} onMouseEnter={() => setShowBox(!showBox)} />
          </div>
        )}
      </Card>
    </div>
  );
};
````

## File: src/components/Transcription/Transcription.css
````css
.messenger-container {
  max-width: 500px;
  max-height: 36.25rem;
  background: #0a011c;
  border: solid 1px white; 
  overflow-y: auto;
  box-sizing: border-box;
  border-radius: 10px;
  justify-content: space-between;
}

.messenger-header h1 {
  color: #fff;
  font-size: 1.5rem;
  font-family: "Finger Paint", cursive;
}

.messenger-container .messenger-header {
  padding: 12px 12px 6px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 400;
}

.messenger-container::-webkit-scrollbar {
  display: none;
}

@media (max-width: 500px) {
  .messenger-container {
    width: 100%;
  }
}
````

## File: src/components/Transcription/Transcription.js
````javascript
import { faTimes, faUserFriends } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect } from "react";
import { AppContext } from '../../AppContext';
import "./Transcription.css";

const Transcription = ({ setMeetingState }) => {
  const { appData, setAppData , participantsData } = useContext(AppContext);
  const numberOfParticipants = Object.keys(participantsData.participants).length;

  const startRecognition = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = ['en-US', 'kn-IN'];
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setAppData(prev => ({
            ...prev,
            transcriptionMsg: prev.transcriptionMsg + transcript + '. ',
          }));
        } 
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      console.log('Recognition ended');
      recognition.stop();
    };

    recognition.start();
  };

  useEffect(() => {
    startRecognition();
  }, [startRecognition]);

  function toggleTranscription() {
    setMeetingState((prev) => ({
      showTranscripts: !prev.showTranscripts,
    }));

    setAppData(prev => ({
      ...prev,
      transcriptionMsg: prev.transcriptionMsg,
    }));
  }

  return (
    <>
      <div className={`messenger-container w-[320px] from-left mx-2 my-3`}>
          <div className="messenger-header text-2xl">
            <h1>Xpert Transcriber</h1>
            <FontAwesomeIcon
              className="icon transition-opa z-10"
              onClick={toggleTranscription}
              icon={faTimes}
            />
          </div>
          <div className="flex justify-center gap-3 pb-2">
            <div className="">
              <FontAwesomeIcon className="" icon={faUserFriends} />
            </div>
            <p>Participants ({numberOfParticipants})</p>
          </div>
        <hr />
        <div className="transcript-section pl-6 pr-3 pt-1 text-left">
          {appData.transcriptionMsg || (
            <p className="animate-pulse infinite">Talk to display transcription...</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Transcription;
````

## File: src/pages/Home/Home.css
````css
.home-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
}

.home-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left-side h2 {
  font-size: 44px;
  font-weight: 400;
  line-height: 1.2;
}

.left-side p {
  font-size: 18px;
  font-weight: 300;
}

.left-side .input-block {
  width: max-content;
  display: flex;
  align-items: center;
  margin: 16px 0;
}

.left-side .btn {
  font-size: 1.2rem;
}

.left-side .btn .icon-block {
  padding-right: 10px;
}

.left-side .input-section {
  position: relative;
  margin-right: 10px;
}

.left-side .input-section .icon-block {
  position: absolute;
  top: 50%;
  transform: translate(10px, -50%);
  color: #5f6368;
}

.left-side .input-section input {
  font-size: 1.2rem;
  padding: 8px;
  font-weight: 400;
  border: 3px solid #19524b;
  color: black;
  border-radius: 5px;
  padding-left: 2rem;
  box-sizing: border-box;
  outline: none;
}

.left-side .help-text {
  margin: 30px 0;
  padding-top: 25px;
  border-top: 1px solid #ddd;
}

.left-side .help-text a {
  text-decoration: none;
  color: #187469;
}

.right-side {
  padding: 10px;
}

.right-side img{
  border-radius: 10px;
  max-width: 40rem;
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.302), 0 2px 6px 2px rgba(60, 64, 67, 0.149);
}

.calendar {
  max-width: 400px;
  background-color: #333333;
  border: 1px solid #444444;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(255, 255, 255, 0.1);
  z-index: 10;
}

.react-calendar {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #ffffff;
  text-align: center;
}

.react-calendar__navigation {
  background: #222222;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: right;
}

.react-calendar__navigation button {
  cursor: pointer;
  font-size: 1.5rem;
  font-weight: 500;
  color: #e8ebee;
  transition: color 0.3s ease-in-out;
}

.react-calendar__navigation button:hover {
  color: #0056b3;
}

.react-calendar__navigation button.react-calendar__navigation__arrow {
  margin: 0 5px;
}

.react-calendar__month-view__weekdays {
  display: flex;
  justify-content: space-around;
  background-color: #222222;
  padding: 10px 0;
  color: white;
}

.react-calendar__month-view__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.react-calendar__month-view__days__day {
  padding: 8px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
}

.react-calendar__month-view__days__day:hover {
  background-color: #0056b3;
}

.react-calendar__tile--active {
  background-color: #0056b3;
}

@media (max-width: 720px) {
  .calendar{
    width: 90%;
  }
}

@media (max-width: 500px) {
  .home-page {
    padding: 1rem;
  }

  .home-body {
    margin-top: 1.5rem;
  }

  .left-side h2 {
    font-size: 2.3rem;
  }

  .left-side .input-section {
    margin: 0;
  }

  .left-side .input-block {
    display: block;
    margin: 10px 0;
  }

  .left-side .btn {
    font-size: 1rem;
    margin: 5px 0;
  }

}
````

## File: src/pages/Home/Home.js
````javascript
import { faChain, faKeyboard, faVideo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../AppContext';
import Loader from '../../AppLoader';
import Header from '../../components/Header/Header';
import Model from '../../components/Model/Model';
import firepadRef from '../../server/firebase';
import { checkInternetConnection } from "../../server/http";
import "./Home.css";

export default function Home({ setUserName }) {
  const navigate = useNavigate();
  if (checkInternetConnection()) {
    navigate('/internet');
  }
  const inputRef = useRef(null);
  const joinRef = useRef(null);
  const { appState, setAppState, participantsData, setAppData, appData } = useContext(AppContext);

  useEffect(() => {
    const storedGoogleData =  JSON.parse(localStorage.getItem('googleData'))
    setAppData((prev) => ({ ...prev, googleData: storedGoogleData }));
  }, []);


  function handleCalendar() {
    setAppState((prevAppState) => ({
      ...prevAppState,
      calendar: {
        ...prevAppState.calendar,
        showCalendar: !prevAppState.calendar.showCalendar,
      },
    }));
  }

  function handleSettings() {
    setAppState({
      ...appState,
      model: {
        showModel: true,
        modelType: 'settings',
        modelMsg: "Settings:"
      },
    });
  }

  const handleCalendarChange = (selectedDate) => {
    const dateString = selectedDate.toISOString();
    localStorage.setItem('selectedDate', dateString);

    const currentDate = new Date();
    const selectedDateObj = new Date(dateString);

    const isPastDate = selectedDateObj.setHours(0, 0, 0, 0) < currentDate.setHours(0, 0, 0, 0);

    setAppState((prevAppState) => ({
      ...prevAppState,
      calendar: {
        showCalendar: !prevAppState.calendar.showCalendar,
        calendarDate: dateString,
      },
      loaderShow: false,
      model: {
        showModel: true,
        modelType: isPastDate ? 'invalid' : 'date',
        modelMsg: isPastDate
          ? 'Invalid date. Please select a future date.'
          : `Meeting Scheduled Successfully! 
            \n Join meeting on ${selectedDateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}`,
      },
    }));
  };

  const handleNewMeeting = () => {
    const name = inputRef.current.value.trim();
    const joinValue = joinRef.current.value.trim();
    const isValidInput = /^[a-zA-Z\s]*$/.test(name);
    if (!isValidInput || name === '') {
      setAppState({
        ...appState,
        loaderShow: false,
        model: {
          showModel: true,
          modelNeedInput: false,
          modelMsg: "Enter a valid Name!"
        }
      });
    } else if (joinValue) {
      setAppState({
        ...appState,
        loaderShow: false,
        model: {
          showModel: true,
          modelNeedInput: false,
          modelMsg: "You cannot join and host the meeting at same time!"
        }
      });
    } else {
      setAppState({
        loaderShow: false,
        model: {
          showModel: true,
          modelNeedInput: false,
          modelType: 'add-mail',
          modelMsg: "Would you like to send notifications via email? If yes, please upload the file having email in it."
        }
      });
      setUserName(name);
    }
  };

  const urlParams = new URLSearchParams(window.location.search);
  const joinKey = urlParams.get("id");
  useEffect(() => {
    if (joinKey) {
      joinRef.current.value = joinKey;
    }
    window.history.replaceState(null, "Meet", window.location.pathname);
  }, [joinKey]);

  const handleJoinClick = async () => {
    setAppState({ ...appState, loaderShow: true });
    const joinValue = joinRef.current.value;
    try {
      const snapshot = await firepadRef.root.once('value');
      const allKeys = snapshot.exists() ? Object.keys(snapshot.val()) : [];
      if (allKeys.includes(joinValue)) {
        setAppState(prevState => ({
          ...prevState,
          loaderShow: false,
          model: {
            showModel: true,
            modelNeedInput: true,
            modelType: 'join',
            modelMsg: 'Enter Name to Join Meeting:'
          }
        }));
      } else {
        setAppState(prevState => ({
          ...prevState,
          loaderShow: false,
          model: {
            showModel: true,
            modelNeedInput: false,
            modelMsg: 'Meeting ID is invalid!'
          }
        }));
        joinRef.current.value = '';
      }
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
      alert("Error fetching data from Firebase. Please check console for details.");
    }
  };


  return (
    <>
      {appState.loaderShow && <Loader message={"Getting Info..."} />}
      {(appState.model.showModel && appState.model.modelNeedInput) ? (
        // model for joiner
        <Model setUserName={setUserName} />
      ) : (
        appState.model.showModel && (
          <Model />
        )
      )}
      {appState.model.showModel && participantsData.isHost && (
        // send email to participants if this is host
        <Model />
      )}
      {appState.calendar && appState.calendar.showCalendar && (
        <div className="transparent-background">
          <div className="calendar from-top">
            <Calendar
              className='react-calendar'
              onChange={handleCalendarChange}
              value={appState.calendar.calendarDate || new Date()}
            />
            <button className="text-[1.2rem] px-4 py-2 from-left w-full border-t hover:bg-stone-800 transition duration-300" onClick={handleCalendar}>Close</button>
          </div>
        </div>
      )}
      <div className="home-page">
        <Header handleCalendar={handleCalendar} handleSettings={handleSettings} />
        <div className="home-body">
          <div className="left-side">
            <div className="lg:mr-10">
              <h2>Premium video meetings. Now free for everyone.</h2>
              <p className='mt-2'>
                We re-engineered the service we built for secure business
                meetings, Xpert Meet, to make it free and available for all.
              </p>
              <div className="input-block">
                <div className="input-section">
                  <FontAwesomeIcon className="icon-block" icon={faKeyboard} />
                  <input
                    ref={inputRef}
                    defaultValue={appData.googleData?.givenName || ""}
                    placeholder="Enter Name to Host"
                  />
                </div>
                <button className="btn" onClick={handleNewMeeting}>
                  <FontAwesomeIcon className="icon-block" icon={faVideo} />
                  New Meeting
                </button>
              </div>
              <div className="input-block">
                <div className="input-section">
                  <FontAwesomeIcon className="icon-block" icon={faKeyboard} />
                  <input
                    ref={joinRef}
                    placeholder="Enter a code or link"
                  />
                </div>
                <button className="btn" onClick={handleJoinClick}>
                  <FontAwesomeIcon className="icon-block" icon={faChain} />
                  Join Meeting
                </button>
              </div>
            </div>
            <div className="help-text">
              <Link to="/">Learn more</Link> about Xpert-Meet
            </div>
          </div>
          <div className="right-side hidden lg:block">
            <img src={process.env.PUBLIC_URL + '/assets/meetImg.jpg'} alt="Meet" />
          </div>
        </div>
      </div>
    </>
  );
}
````

## File: src/pages/Meet/Meet.js
````javascript
import { useContext, useEffect } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppContext } from '../../AppContext';
import Loader from '../../AppLoader';
import MainScreen from "../../components/MainScreen/MainScreen.component";
import firepadRef, { db } from "../../server/firebase";
import { checkInternetConnection, startVideoRecording } from "../../server/http";
import {
  addParticipant,
  removeParticipant,
  setMainStream,
  setUser,
  updateParticipant,
} from "../../store/actioncreator";
import "./Meet.css";

function Meet(props) {
  const navigate = useNavigate();
  if (checkInternetConnection()) {
    navigate('/internet');
  }
  const { appState, setAppState, appData, setParticipantsData } = useContext(AppContext);
  useEffect(() => {
    setAppState((prevAppState) => ({
      ...prevAppState,
      loaderShow: true,
      loaderMsg: 'Arranging Meeting...',
    }));
    const loaderTimeout = setTimeout(() => {
      setAppState((prevAppState) => ({
        ...prevAppState,
        loaderShow: false,
      }));
    }, 1500);

    return () => {
      clearTimeout(loaderTimeout);
    };
  }, [setAppState]);

  const { name, setMainStream, setUser, addParticipant, removeParticipant, updateParticipant } = props;
  const getUserStream = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    return localStream;
  };

  useEffect(() => {
    let isSubscribed = true;
    const fetchData = async () => {
      try {
        const stream = await getUserStream();
        if (isSubscribed) {
          stream.getVideoTracks()[0].enabled = false;
          setMainStream(stream);
          const connectedRef = await db.database().ref(".info/connected");
          const participantRef = firepadRef.child("participants");
          const snapshot = await participantRef.once("value");
          const participantsArray = Object.values(snapshot.val() || {});
          const isHostExists = participantsArray.some(participant => participant.isHost);
          const hostRef = firepadRef.child("host");
          const hostSnapshot = await hostRef.once("value");

          connectedRef.on("value", (snap) => {
            if (snap.val()) {
              const defaultPreference = {
                audio: true,
                video: false,
                screen: false,
              };
              const userStatusRef = participantRef.push({
                userName: name,
                preferences: defaultPreference,
                isHost: !isHostExists,
                profileColor: appData.profileColor
              });
              setUser({
                [userStatusRef.key]: { name, ...defaultPreference },
              });

              if (!isHostExists) {
                // !isHostExists means - HOST not exist, set this as HOST
                const hostStatusRef = firepadRef.child("host").push({
                  id: userStatusRef.key,
                  userName: name,
                });
                setParticipantsData((prevData) => ({
                  ...prevData,
                  id: userStatusRef.key,
                  name,
                  isHost: !isHostExists,
                }));
                hostStatusRef.onDisconnect().remove();
              } else {
                // this is NOT HOST, get Existing HOST data
                const dbHostDataArray = Object.values(hostSnapshot.val() || {});
                const dbHostData = dbHostDataArray[0];
                if (dbHostData) {
                  setParticipantsData((prevData) => ({
                    ...prevData,
                    id: dbHostData.id,
                    name: dbHostData.userName,
                    isHost: !isHostExists,
                  }));
                }
              }
              userStatusRef.onDisconnect().remove();
            }
          });
          participantRef.on("child_added", (snap) => {
            const preferenceUpdateEvent = participantRef.child(snap.key).child("preferences");
            preferenceUpdateEvent.on("child_changed", (preferenceSnap) => {
              updateParticipant({
                [snap.key]: {
                  [preferenceSnap.key]: preferenceSnap.val(),
                },
              });
            });
            const { userName: name, preferences = {}, profileColor } = snap.val();
            addParticipant({
              [snap.key]: {
                name,
                ...preferences,
                profileColor
              },
            });
          });
          participantRef.on("child_removed", (snap) => {
            removeParticipant(snap.key);
          });
          window.history.replaceState(null, "Meet", "?id=" + firepadRef.key);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    return () => {
      isSubscribed = false;
    };
  }, [name, setMainStream, setUser, addParticipant, removeParticipant, updateParticipant, setParticipantsData]);

  useEffect(() => {
    startVideoRecording();
  }, []);

  return (
    <>
      {appState.loaderShow ? (
        <Loader message={appState.loaderMsg ? appState.loaderMsg : 'Loading...'} />
      ) : (
        <MainScreen name={name} />
      )}
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    stream: state && state.mainStream ? state.mainStream : null,
    user: state && state.currentUser ? state.currentUser : null,
  };
};

const mapDispatchToProps = {
  setMainStream,
  addParticipant,
  setUser,
  removeParticipant,
  updateParticipant,
};

export default connect(mapStateToProps, mapDispatchToProps)(Meet);
````

## File: src/pages/Summary/Summary.css
````css
.btn {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  padding: 8px;
  border: none;
  outline: none;
  background: none;
  border-radius: 5px;
  text-decoration: none;
  background-color: #19524b;

  &:hover {
    box-shadow: 0 0 10px rgba(45, 216, 219, 0.5);
  }
}

@keyframes fadeIn {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}

.generating-text {
  opacity: 0;
  animation: fadeIn 1s infinite;
}

.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
````

## File: src/pages/Summary/Summary.js
````javascript
import { faClose, faDownload, faMessage, faQuestion, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { AppContext } from '../../AppContext';
import Loader from '../../AppLoader';
import Chatbot from '../../components/Chatbot/Chatbot';
import Model from '../../components/Model/Model';
import { checkInternetConnection, downloadVideo, generateSummary, takeQuiz } from '../../server/http';
import './Summary.css';

export default function Summary() {

  const navigate = useNavigate();
  if (checkInternetConnection()) {
    navigate('/internet');
  }
  const { appState, setAppState, appData, participantsData } = useContext(AppContext);
  const [generate, setGenerate] = useState({});
  const messageRef = useRef(null);

  const toTranscribe = appData.transcriptionMsg + (appData.keyPoints.length !== 0 ? ' key points discussed: ' + appData.keyPoints.join(', ') : '');
  const keyPoints = appData.keyPoints.length !== 0 ? ' key points discussed: ' + appData.keyPoints.join(', ') : '';

  useEffect(() => {
    setAppState((prevAppState) => ({
      ...prevAppState,
      loaderShow: true,
    }));
    const loaderTimeout = setTimeout(() => {
      setAppState((prevAppState) => ({
        ...prevAppState,
        loaderShow: false,
      }));
    }, 2000);
    return () => {
      clearTimeout(loaderTimeout);
    };
  }, [setAppState]);

  useEffect(() => {
    console.log("Hey");
    generateSummary(setGenerate, toTranscribe);
  }, []);

  return (
    <>
      {appState.model.showModel && (
        <Model />
      )}
      {appState.loaderShow ? (
        <Loader message={appState.loaderMsg ? appState.loaderMsg : "Heading to the Summary Page. Hold tight, we're almost there!"} />
      ) : (
        <div className="flex flex-col justify-center items-center min-h-screen text-xl">
          <div className="p-10 rounded-xl max-w-screen-xl">
            <div className='message-ref' ref={messageRef} >
              <h1 className="text-5xl font-semibold mb-3 border-b-2 pb-3">Summary:</h1>
              {appData.keyPoints.length === 0 ? <i>No Key Points Added!</i> : (
                <div className="mb-3 border-b-2 pb-3">
                  <h1 className="text-3xl font-semibold mb-1">Key Points Discussed:</h1>
                  <ul className="list-disc ml-7">
                    {appData.keyPoints.map((point, index) => (
                      <li key={'keyPoints' + index}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
              {appData.transcriptionMsg && (
                <div className="mb-3 border-b-2 pb-3 border-gray-300">
                  <h1 className="text-3xl font-semibold mb-1">Transcribed Data:</h1>
                  <p>{appData.transcriptionMsg}</p>
                </div>
              )}
              <div className="mb-3 border-b-2 pb-3">
                <h1 className="text-3xl font-semibold my-1">Brief Description:</h1>
                {generate.isGenerating ?
                  <p className='generating-text'>{generate.generatedMsg}</p> : (
                    <div className='my-3' dangerouslySetInnerHTML={{ __html: generate.generatedMsg }}></div>
                  )}
              </div>
              {generate.isGeneratingQuiz || generate.generatedQuiz ? (
                <div className="mb-3 border-b-2 pb-3">
                  <h1 className="text-3xl font-semibold my-1">Quiz Questions:</h1>
                  {generate.isGeneratingQuiz ?
                    <p className='generating-text'>{generate.generatedQuiz}</p> : (
                      <div className='my-3' dangerouslySetInnerHTML={{ __html: generate.generatedQuiz }}></div>
                    )}
                </div>
              ) : <></>}
            </div>
            <div className="flex gap-5 mt-3">
              <button
                className={`btn${generate.isGenerating ? ' disabled' : ''}`}
                onClick={() => { generateSummary(setGenerate, toTranscribe, 'end') }}
                disabled={generate.isGenerating}
              >
                <FontAwesomeIcon icon={faRefresh} />&nbsp;&nbsp;Regenerate Description
              </button>
              {/* appData.meetMode==='Class' to conditionally render */}
              <button
                className={`btn${generate.isGeneratingQuiz ? ' disabled' : ''}`}
                onClick={() => { takeQuiz(setGenerate, toTranscribe) }}
                disabled={generate.isGeneratingQuiz}
              >
                <FontAwesomeIcon icon={faQuestion} />&nbsp;&nbsp;Take Quiz
              </button>
            </div>
            <div className="flex gap-5 mt-3">
              {participantsData.isHost &&
                <button
                  className="btn"
                  onClick={() => {
                    setAppState((prev) => ({
                      ...prev,
                      model: {
                        ...prev.model,
                        showModel: true,
                        modelMsg: 'Please upload the file containing email.',
                        modelType: 'final-mail',
                      },
                      emailData: {
                        emailTitle: "The Meeting Was Ended",
                        emailMsg: messageRef.current.innerHTML,
                      },
                    }));
                  }}
                >
                   Send Summary as Email
                </button>
              }
              <button className="btn" onClick={() => { downloadVideo(setAppState); }}><FontAwesomeIcon icon={faDownload} />&nbsp;&nbsp;Download Session Video</button>
              <button className="btn" onClick={() => { setAppState(prevState => ({ ...prevState, showChatbot: !prevState.showChatbot })); }}>
                {appState.showChatbot ? <FontAwesomeIcon icon={faClose} /> : <FontAwesomeIcon icon={faMessage} />}&nbsp;&nbsp;
                {appState.showChatbot ? 'Close' : 'Open'} Chatbot
              </button>
            </div>
          </div>
          {appState.showChatbot && <Chatbot />}
        </div>
      )}
    </>
  );
}
````

## File: src/server/http.js
````javascript
// https://wxm-back.vercel.app
// http://localhost:5000

export function checkInternetConnection() {
  if (!navigator.onLine) {
    // true => offline
    return true;
  }
}

export const generateChatbotSummary = async (dataToSummarize) => {
  try {
    const response = await fetch(`http://localhost:5000/text-to-summary`, {
      method: 'POST',
      body: JSON.stringify({ transcription: dataToSummarize }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const responseData = await response.text();
      return responseData;
    } else {
      console.error('Response Error:', response.status, response.statusText);
      return 'Error generating summary';
    }
  } catch (error) {
    console.error('Request Error:', error);
    return 'Error generating summary';
  }
};

export const generateSummary = async (setGenerate, transcription) => {
  try {
      setGenerate(prevState => ({
        ...prevState,
        isGenerating: true,
        generatedMsg: 'Generating Brief Description...'
      }));

    const response = await fetch(`http://localhost:5000/text-to-summary`, {
      method: 'POST',
      body: JSON.stringify({ transcription }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const responseData = await response.text();
      setGenerate(prevState => ({
        ...prevState,
        isGenerating: false,
        generatedMsg: responseData,
      }));
    } else {
      console.error(response.status, response.statusText);
    }
  } catch (error) {
    console.error('Sending Request Error:', error);
  }
};

export const takeQuiz = async (setGenerate, keyPoints) => {
  console.log(keyPoints)
  try {
    setGenerate(prevState => ({
      ...prevState,
      isGeneratingQuiz: true,
      generatedQuiz: 'Generating Quiz...'
    }));

    const response = await fetch(`http://localhost:5000/take-quiz`, {
      method: 'POST',
      body: JSON.stringify({ keyPoints }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const responseData = await response.text();
      setGenerate(prevState => ({
        ...prevState,
        isGeneratingQuiz: false,
        generatedQuiz: responseData.replace(/```/g, '').replace(/html/g, '')
      }));
    } else {
      console.error(response.status, response.statusText);
    }
  } catch (error) {
    console.error('Sending Request Error:', error);
  }
};



export const downloadVideo = async (setAppState) => {
  setAppState(prevState => ({
    ...prevState,
    model: {
      showModel: true,
      modelNeedInput: false,
      modelMsg: "Downloading the Session may take time. Please do not close the browser!",
    },
  }));
  try {
    const response = await fetch('http://localhost:5000/download-video', {
      method: 'GET'
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'output.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      console.error('Failed to download video:', response.statusText);
    }
  } catch (error) {
    console.error('Error downloading video:', error);
  }
};


export const startVideoRecording = async () => {
  try {
    const response = await fetch(`http://localhost:5000/start-record`, {
      method: 'GET'
    });
    if (response.ok) {
      console.log('Video recording started successfully!');
    } else {
      console.error('Failed to start video recording:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error starting video recording:', error);
  }
};

export const stopVideoRecording = async () => {
  try {
    // remove the notes folder to clean the storage
    // dont do this if you want to keep the notes in storage
    /**
     * if you want to download notes even after reaching the summery page then delete below line of code "remove-notes" and 
     * make it to setTimeout so that you can delete after 1 min or something like that and
     * give a button in summery page to download this zip file
     */
    await fetch("http://localhost:5000/remove-notes");
    await fetch("http://localhost:5000/stop-record");
  } catch (error) {
    console.error("Error stopping video recording:", error);
    // Handle the error, e.g., show an error message to the user
  }
};


export function handleSendMail(setAppState, title, message, file, modelMailType) {
  if (!file || file.size === 0 || file === undefined) {
    setAppState(prevState => ({
      ...prevState,
      model: {
        showModel: true,
        modelNeedInput: false,
        modelType: modelMailType,
        modelMsg: 'Please upload the file containing email again.',
      },
    }));
    return; 
  }

  setAppState(prevState => ({
    ...prevState,
    loaderShow: true,
    loaderMsg: 'Sending email...',
  }));

  const formData = new FormData();
  formData.append('title', title);
  formData.append('message', message);
  formData.append('file', file);

  fetch('http://localhost:5000/send-mail', {
    method: 'POST',
    body: formData,
  })
    .then(response => response.text())
    .then(data => {
      const modelType = data.includes('Incorrect file type') || data === 'No email addresses found in the file.' ? 'add-email' : '';
      setAppState({
        loaderShow: false,
        model: {
          showModel: true,
          modelNeedInput: false,
          modelType: modelType,
          modelMsg: data,
        },
      });
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

export const onScreenshotClick = async () => {
  try {
    const response = await fetch('http://localhost:5000/screen-shot');
    if (!response.ok) {
      throw new Error(`Failed to capture screenshot: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'screenshot.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error capturing screenshot:', error.message);
  }
};

export const uploadNotes = async (setAppState, file) => {
  if (!file || file.size === 0 || file === undefined) {
    setAppState(prevState => ({
      ...prevState,
      model: {
        showModel: true,
        modelNeedInput: false,
        modelType: 'notes', 
        modelMsg: 'Please upload a valid file.',
      },
    }));
    return;
  }

  setAppState(prevState => ({
    ...prevState,
    loaderShow: true,
    loaderMsg: 'Sharing Notes with participants...',
  }));

  const formData = new FormData();
  formData.append('file', file);

  fetch('http://localhost:5000/upload-notes', {
    method: 'POST',
    body: formData,
  })
    .then(data => {
      const modelType = data.includes('Error uploading file') || data === 'File size exceeds 10 MB limit' ? 'notes' : '';

      setAppState({
        loaderShow: false,
        model: {
          showModel: true,
          modelNeedInput: false,
          modelType: modelType,
          modelMsg: data,
        },
      });
    })
    .catch(error => {
      console.error('Error:', error);
    });
};

export const downloadNotes = async (setAppState, notesLists) => {
  if (!notesLists || notesLists.length === 0) {
    setAppState((prevState) => ({
      ...prevState,
      model: {
        showModel: true,
        modelNeedInput: false,
        modelType: 'notes',
        modelMsg: 'No Notes uploaded yet!',
      },
    }));
    return;
  }

  setAppState((prevState) => ({
    ...prevState,
    loaderShow: true,
    loaderMsg: 'Downloading Notes...',
  }));

  const body = JSON.stringify({ notesLists: notesLists });

  try {
    const response = await fetch('http://localhost:5000/download-notes', {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error downloading notes: ${response.statusText}`);
    }

    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob); 
    link.download = 'combined_files.zip'; 
    link.click(); 

  } catch (error) {
    console.error('Error:', error);
    setAppState((prevState) => ({
      ...prevState,
      model: {
        showModel: true,
        modelNeedInput: false,
        modelType: 'notes',
        modelMsg: 'Error downloading notes!',
      },
    }));
  } 
};
````

## File: src/store/reducer.js
````javascript
import {
  ADD_PARTICIPANT,
  REMOVE_PARTICIPANT,
  SET_MAIN_STREAM,
  SET_USER,
  UPDATE_PARTICIPANT,
  UPDATE_USER,
} from "./actiontypes";

import {
  createOffer,
  initializeListeners,
  updatePreference,
} from "../server/peerConnection";

let defaultUserState = {
  mainStream: null,
  participants: {},
  currentUser: null,
};

const servers = {
  iceServers: [
    {
      urls: [
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302",
        "stun:stun.services.mozilla.com",
      ],
    },
  ],
  iceCandidatePoolSize: 10,
};

const generateColor = (isNewUser) => {
  if (isNewUser) {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  } else {
    const storedAppData = JSON.parse(localStorage.getItem('appData'));
    const storedProfileColor = storedAppData ? storedAppData.profileColor : '';
    return storedProfileColor || '';
  }
};


export const userReducer = (state = defaultUserState, action) => {
  if (action.type === SET_MAIN_STREAM) {
    let payload = action.payload;
    state = { ...state, ...payload };
    return state;
  } else if (action.type === ADD_PARTICIPANT) {
    let payload = action.payload;
    const currentUserId = Object.keys(state.currentUser)[0];
    const newUserId = Object.keys(payload.newUser)[0];
    if (state.mainStream && currentUserId !== newUserId) {
      payload.newUser = addConnection(
        payload.newUser,
        state.currentUser,
        state.mainStream
      );
    }

    if (currentUserId === newUserId)
      payload.newUser[newUserId].currentUser = true;
    if (payload.newUser[newUserId].profileColor) {
      payload.newUser[newUserId].avatarColor = payload.newUser[newUserId].profileColor
    } else {
      payload.newUser[newUserId].avatarColor = generateColor(true);
    }
    let participants = { ...state.participants, ...payload.newUser };
    state = { ...state, participants };
    return state;
  } else if (action.type === SET_USER) {
    let payload = action.payload;
    let participants = { ...state.participants };
    const userId = Object.keys(payload.currentUser)[0];
    console.log('second', payload.currentUser[userId].profileColor);
    if (payload.currentUser[userId].profileColor) {
      payload.currentUser[userId].avatarColor = payload.newUser[userId].profileColor
    } else {
      payload.currentUser[userId].avatarColor = generateColor();
    }
    initializeListeners(userId);
    state = { ...state, currentUser: { ...payload.currentUser }, participants };
    return state;
  } else if (action.type === REMOVE_PARTICIPANT) {
    let payload = action.payload;
    let participants = { ...state.participants };
    delete participants[payload.id];
    state = { ...state, participants };
    return state;
  } else if (action.type === UPDATE_USER) {
    let payload = action.payload;
    if (!state.currentUser) {
      return state;
    }
    const userId = Object.keys(state.currentUser)[0];
    updatePreference(userId, payload.currentUser);
    state.currentUser[userId] = {
      ...state.currentUser[userId],
      ...payload.currentUser,
    };
    state = {
      ...state,
      currentUser: { ...state.currentUser },
    };
    return state;
  }
  else if (action.type === UPDATE_PARTICIPANT) {
    let payload = action.payload;
    const newUserId = Object.keys(payload.newUser)[0];

    payload.newUser[newUserId] = {
      ...state.participants[newUserId],
      ...payload.newUser[newUserId],
    };
    let participants = { ...state.participants, ...payload.newUser };
    state = { ...state, participants };
    return state;
  }
  return state;
};

const addConnection = (newUser, currentUser, stream) => {
  const peerConnection = new RTCPeerConnection(servers);
  stream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, stream);
  });
  const newUserId = Object.keys(newUser)[0];
  const currentUserId = Object.keys(currentUser)[0];

  const offerIds = [newUserId, currentUserId].sort((a, b) =>
    a.localeCompare(b)
  );

  newUser[newUserId].peerConnection = peerConnection;
  if (offerIds[0] !== currentUserId)
    createOffer(peerConnection, offerIds[0], offerIds[1]);
  return newUser;
};
````

## File: src/AppContext.js
````javascript
import { createContext, useRef, useState } from 'react';
const storedAppData = JSON.parse(localStorage.getItem("appData"));

export const AppContext = createContext({ 
  appState: {},
  setAppState: () => { },
  appData: {},
  setAppData: () => { },
  participantsData: {},
  setParticipantsData: () => { },
});

export default function AppContextProvider({ children }) {
  const userKeyRef = useRef(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));

  const [participantsData, setParticipantsData] = useState({
    id: '',
    name: '',
    isHost: false,
    participants: [{}]
  });
  
  const profileColor = storedAppData ? storedAppData.profileColor : '';
  
  const [appData, setAppData] = useState({
    transcriptionMsg: '',
    keyPoints: [],
    meetMode: 'Casual',
    profileColor: profileColor,
    googleData: {},
    notesLists: [],
  });

  const [appState, setAppState] = useState({
    model: {
      showModel: false,
      modelNeedInput: false,
      modelMsg: '',
      modelType: '',
    },
    loaderShow: false,
    loaderMsg: '',
    calendar: {
      showCalendar: false,
      calendarDate: '',
    },
    emailData: {
      emailTitle: "",
      emailMsg: "",
    },
  });

  const AppContextValues = {
    userKey: userKeyRef.current,
    appState,
    setAppState,
    participantsData,
    setParticipantsData,
    appData,
    setAppData
  };

  return (
    <AppContext.Provider value={AppContextValues}>
      {children}
    </AppContext.Provider>
  );
}
````

## File: README.md
````markdown
<h1 align="center">WeXpert-meet</h1> 

<p align="center"> 
 <img src="screenshots/logo.jpg" height="600px" width="1000">

  <p align="center">
    A Video Conference App with AI Plugins- WeXpert Meet
  </p>
</p>

## Abstract
<b>WeXpert Meet provides features like real-time transcription, automatic summary generation, noise cancellation, a chatbot for meeting interaction, and the ability to send the generated video call summary through email to participants in single button.
</b>

<!-- TABLE OF CONTENTS -->

## Table of Contents
- Features
- Usage
- Technology Stack
- Installation
- Demo

<!-- tutorial -->
# Features
## Office Mode
- Generate key points from meetings
- Share screens and documents
- Collaborative whiteboard
## Class Mode
- Generate quizzes and assessments
- Interactive whiteboard for teaching
- Student participation tracking
- Real-time polling
## Exam Mode
- Detect copied content and plagiarism
- Monitor students during exams with proctoring features
- Timer and submission management


<!-- Prerequisites -->
# Usage
## Office Mode
- Select "Office Mode" from the main menu.
- Start or join a meeting.
- Use the key points generator to summarize the meeting.
## Class Mode
- Generate quizzes and assessments
- Interactive whiteboard for teaching
- Student participation tracking
## Exam
- Detect copied content and plagiarism
- Monitor students during exams with proctoring features
- Timer and submission management

# Technology Stack
- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Python 
- **Database:** Firebase
- **Real-time Communication:** WebRTC (for video conferencing)
- The App can support upto 18 users without having any UI alignment issues and supports many with a little UI issues
# Installation 
<!-- install dependencies -->
## FontAwesome
```bash
npm install --save @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons
```

## XLSX for Excel file handling
```bash
npm install --save xlsx
```

## React Router
```bash
npm install --save react-router-dom
```

## React Redux
```bash
npm install --save react-redux redux
```

## React Tooltip
```bash
npm install --save react-tooltip
```

## React Calendar
```bash
npm install --save react-calendar
```
## Google Authentication Key
```bash
npm install react-google-login
```

## Firebase
```bash
npm install --save firebase
```

<!-- run below commands -->
- Run npm install.
- Add your firebase config details to Server/firebase.js.
- Run "npm run start" to start the app.

<!-- Demo -->

## Demo

### Demo Video Link
https://drive.google.com/file/d/1ab_xpvM2uC3r7pI69L5MSFAgyZT1fw1Q/view
<br/>
👆👆👆👆

### Demo Presentation Link
https://www.canva.com/design/DAGHdsTabMw/t4ZVZM6K-1Rvpby1GuCpXA/view?utm_content=DAGHdsTabMw&utm_campaign=designshare&utm_medium=link&utm_source=editor
<br/>
👆👆👆👆

### Demo Webpage Link

https://xpert-video-meet.vercel.app/
<br/>
👆👆👆👆

<!-- CONTACT -->

## Contact

Instagram - [@Instagram](https://www.instagram.com/amaan.m.k/) - syedkhalander66@gmail.com 

Project Link: [https://github.com/Amaan9136/xpert-meet](https://github.com/Amaan9136/xpert-meet)
````

## File: public/index.html
````html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Web site created using create-react-app" />
    <meta http-equiv="Permissions-Policy" content="display-capture=(self)">
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>Xpert Video Meet</title>
</head>
<body>
    <div id="app"></div>
</body>
</html>
````

## File: src/App.js
````javascript
// GOOGLE IMG ADDING 


// ai plugins for real time transcription 
// can join the meeting in the end and save clients time by providing summary
// can upload dynamic timetables

/*
The Breakdown:

1. Neural Networks (ANN): This is the foundational building block. It's a computational model inspired by the human brain, 
designed to recognize patterns. ANNs are the backbone for many AI applications, including language models.
2. Large Language Models (LLM): These are a specific type of neural network designed to process and generate human language. 
They are trained on vast amounts of text data and can perform tasks like translation, summarization, question answering, and more.
3. Generative Pre-trained Transformers (GPT): This is a specific architecture of LLMs that has become highly successful. 
GPT models use a transformer architecture, which is particularly effective at processing sequential data like text. 
They are pre-trained on massive datasets and can be fine-tuned for specific tasks.
4. Transformers are the neural network model which converts INPUT SEQUENCE to OUTPUT SEQUENCE

To Summarize:
All LLMs are neural networks.
Not all neural networks are LLMs.
GPTs are a type of LLM's with nicely trained for any response.
*/

// large-language-model , neural-network (ANN) & Generative Pre-trained Transformers 

// future enhance: upload notes into firebase and download it in client
// future enhance: timetable na dynamic upload using setting
// future enhance: student details na dynamic upload using setting
// future enhance: emended google auth
// https://youtu.be/HtJKUQXmtok?si=L4mA29MZJ5ko6Hvh google0auth

// userKey in AppContextValues
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import Home from './pages/Home/Home';
import Meet from './pages/Meet/Meet';
import { checkInternetConnection } from "./server/http";

export default function App() {
  const [userName, setUserName] = useState(null);

  const navigate = useNavigate();
  if (checkInternetConnection()) {
    navigate('/internet');
  }

  return (
    <>
      {userName ? (
        <Meet name={userName} />
      ) : (
        <Home setUserName={setUserName} />
      )}
    </>
  );
}
````

## File: src/index.css
````css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #1e0d3e;
  color: white;
}

*::-webkit-scrollbar {
  display: none;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

.transparent-background {
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
}

@keyframes slideInFromTop {
  0% {
    transform: translateY(-50%);
    opacity: 0;
  }

  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.from-top {
  align-items: center;
  justify-content: center;
  animation: slideInFromTop 0.5s ease forwards;
  backface-visibility: hidden;
}

@keyframes slideInFromLeft {
  0% {
    transform: translateX(50%);
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

.from-left {
  align-items: center;
  justify-content: center;
  animation: slideInFromLeft 0.5s cubic-bezier(0.42, 0, 0.58, 1) forwards;
  backface-visibility: hidden;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

.transition-opa {
  opacity: 0;
  animation: fadeIn 0.3s ease-in-out 0.3s forwards;
}

@keyframes rotateAnim {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
````

## File: src/index.js
````javascript
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { createStore } from "redux";
import AppContextProvider from "./AppContext";
import Loader from './AppLoader';
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { userReducer } from "./store/reducer";


export const store = createStore(userReducer);
// store has all the values of db

const routes = [
  {
    path: "/",
    component: React.lazy(() => import("./App.js")),
  },
  {
    path: "/summary",
    component: React.lazy(() => import("./pages/Summary/Summary.js")),
  },
  {
    path: "/internet",
    component: React.lazy(() => import("./pages/NoInternet/NoInternet.component.js")),
  },
];

const Root = () => (
  <Router>
    <Provider store={store}>
      <AppContextProvider>
        <Suspense fallback={<Loader />}>
          <Routes>
            {routes.map(({ path, component: Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Routes>
        </Suspense>
      </AppContextProvider>
    </Provider>
  </Router>
);


const app = ReactDOM.createRoot(document.getElementById("app"));
app.render(
    <Root />
);

reportWebVitals();
````

## File: .gitignore
````
/node_modules
/backend/gemini/.env
/.pnp
.pnp.js

/coverage

/build
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

.vercel

students.xlsx
.env
````

## File: package.json
````json
{
  "name": "react-video-meet",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@fortawesome/fontawesome-svg-core": "^6.6.0",
    "@fortawesome/free-brands-svg-icons": "^6.6.0",
    "@fortawesome/free-solid-svg-icons": "^6.5.1",
    "@fortawesome/react-fontawesome": "^0.2.2",
    "@react-oauth/google": "^0.12.1",
    "@tensorflow-models/handpose": "^0.1.0",
    "@tensorflow/tfjs": "^4.21.0",
    "@tensorflow/tfjs-backend-webgl": "^4.21.0",
    "@tensorflow/tfjs-core": "^4.21.0",
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^12.1.5",
    "@testing-library/user-event": "^13.5.0",
    "firebase": "^10.7.2",
    "gapi-script": "^1.2.0",
    "react": "^17.0.2",
    "react-calendar": "^4.8.0",
    "react-canvas-draw": "^1.2.1",
    "react-color": "^2.19.3",
    "react-dom": "^17.0.2",
    "react-google-login": "^5.2.2",
    "react-redux": "^9.1.0",
    "react-router-dom": "^6.21.3",
    "react-scripts": "5.0.1",
    "react-speech-recognition": "^3.10.0",
    "react-spinners": "^0.13.8",
    "react-tooltip": "^5.26.0",
    "react-webcam": "^7.2.0",
    "redux": "^5.0.1",
    "web-vitals": "^2.1.4",
    "xlsx": "^0.18.5"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
````
