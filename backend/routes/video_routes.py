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
    cv2.VideoWriter(output_file, fourcc, 20.0, (screen_width, screen_height))
    
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