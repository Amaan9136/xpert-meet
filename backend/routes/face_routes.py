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
