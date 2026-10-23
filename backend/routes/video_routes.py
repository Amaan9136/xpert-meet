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