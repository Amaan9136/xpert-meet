import React, { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from '../../AppContext';
import Loader from '../../AppLoader';
import { handleSendMail, downloadVideo, generateSummary } from '../../server/http';
import './Summary.css';
import Chatbot from '../../components/Chatbot/Chatbot';
import Model from '../../components/Model/Model';
import { faClose, faDownload, faMessage, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Summary() {
  const { appState, setAppState, appData, participantsData } = useContext(AppContext);
  const [generate, setGenerate] = useState({});
  const messageRef = useRef(null);

  const toTranscribe = appData.transcriptionMsg + (appData.keyPoints.length !== 0 ? ' key points discussed: ' + appData.keyPoints.join(', ') : '');

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
    generateSummary(setGenerate, toTranscribe);
  }, []);

  return (
    <>
      {appState.model.showModel && (
        <Model />
      )}
      {appState.loaderShow ? (
        <Loader message="Heading to the Summary Page. Hold tight, we're almost there!" />
      ) : (
        <div className="flex flex-col justify-center items-center min-h-screen text-xl">
          <div ref={messageRef} className="p-10 rounded-xl max-w-screen-xl">
            <h1 className="text-5xl font-semibold mb-3 border-b-2 pb-3">Summary:</h1>
            {appData.keyPoints.length !== 0 && (
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
                  <>
                    <div className='my-3' dangerouslySetInnerHTML={{ __html: generate.generatedMsg }}></div>
                    <button className="btn" onClick={() => { generateSummary(setGenerate, toTranscribe) }}><FontAwesomeIcon icon={faRefresh} />&nbsp;&nbsp;Regenerate Description</button>
                  </>
                )}
            </div>
            <div className="flex gap-5 mt-3">
              {participantsData.isHost && <button className="btn" onClick={() => { handleSendMail(setAppState, "The Meeting Was Ended", messageRef.current.innerHTML); }}>Send Summary as Email</button>}
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
