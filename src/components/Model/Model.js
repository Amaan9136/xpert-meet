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
