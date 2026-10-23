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
