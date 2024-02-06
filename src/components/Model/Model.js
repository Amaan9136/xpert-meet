import React, { useContext, useRef } from 'react';
import { AppContext } from '../../AppContext';
import { handleSendMail } from '../../server/http';
import './Model.css';

export default function Model({ setUserName }) {
  const { appState, setAppState, appData, setAppData } = useContext(AppContext);
  const inputRef = useRef();
  const handleConfirm = () => {
    if (appState.model.modelType === 'join') {
      // set username for joiner
      const name = inputRef.current.value.trim();
      const isValidInput = /^[a-zA-Z\s]*$/.test(name);
      if (!isValidInput || name === '') {
        setAppState({
          ...appState,
          model: {
            ...appState.model,
            showModel: true,
            modelNeedInput: false,
            modelMsg: "Enter a valid Name!"
          }
        });
      } else {
        setUserName(name);
        setAppState({ ...appState, model: { ...appState.model, showModel: false } });
      }
    } else if (appState.model.modelType === 'keys') {
      // to add key points
      const keyPointsValue = inputRef.current.value.trim();
      if (keyPointsValue) {
        inputRef.current.value = '';
        const capitalizedValue = keyPointsValue.charAt(0).toUpperCase() + keyPointsValue.slice(1);
        setAppData((prev) => ({ ...prev, keyPoints: [...prev.keyPoints, capitalizedValue] }));
      }
      
    } else if (appState.model.modelType === 'check-email') {
      const meetingLink = window.location.href;
      const emailTitle = 'Join the Meeting Now!';
      const emailBody = `
<div style="color: blue;">
  <p>Dear Attendee,</p>
  <p>The meeting has commenced. Your presence is required.</p>
  <p style="color: red;">Description: ${inputRef.current.value}</p>
  <p>Please click the link below to join the meeting:</p>
  <p><a href="${meetingLink}">${meetingLink}</a></p>
</div>
`;
      // changes made to show model
      handleSendMail(setAppState, emailTitle, emailBody);
      setAppState({ ...appState, model: { ...appState.model, showModel: false } });
    }
  };

  const handleCancel = () => {
    setAppState({ ...appState, model: { ...appState.model, showModel: false } });
  };

  return (
    <div className="transparent-background">
      <div className="max-w-2xl from-top bg-gray-800 rounded-lg shadow-md px-8 py-3 font-semibold">
        <div className='message text-lg font-semibold'>
          {appState.model.modelMsg}
          <br />
          {appState.model.modelType === 'date' && appState.calendar?.calendarDate && (
            <p>
              {new Date(appState.calendar.calendarDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}

        </div>
        {(appState.model.modelNeedInput) && (
          <div className='operation'>
            <input
              className="text-[1.2rem] w-full border-gray-700 rounded px-3 py-2 mt-2 outline-none font-normal focus:border-emerald-500 border-[3px] bg-gray-900"
              ref={inputRef}
            />
          </div>
        )}
        <div className={`py-3 flex justify-${appState.model.modelNeedInput ? 'end' : 'center'}`}>
          <button
            className={`text-white border border-white px-4 py-2 rounded ${appState.model.modelNeedInput ? 'mr-4' : ''} hover:bg-gray-600 hover:border-gray-600`}
            onClick={handleCancel}
          >
            Cancel
          </button>
          {appState.model.modelNeedInput && (
            <button
              onClick={handleConfirm}
              className="bg-emerald-500 border border-emerald-500 px-4 py-2 rounded hover:bg-emerald-700 hover:border-emerald-700 text-white shadow-md"
            >
              {appState.model.modelType === 'keys' ? 'Add' : (appState.model.modelType === 'check-email' ? 'Send' : 'Confirm')}
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
