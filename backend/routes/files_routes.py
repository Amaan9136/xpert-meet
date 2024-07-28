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