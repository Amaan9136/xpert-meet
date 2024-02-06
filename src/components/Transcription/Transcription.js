import { faTimes, faUserFriends } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect } from "react";
import "./Transcription.css";
import { AppContext } from '../../AppContext';

const Transcription = ({ setMeetingState }) => {
  const { appData, setAppData , participantsData } = useContext(AppContext);
  const numberOfParticipants = Object.keys(participantsData.participants).length;

  const startRecognition = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = ['en-US', 'en-GB'];
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setAppData(prev => ({
            ...prev,
            transcriptionMsg: prev.transcriptionMsg + transcript + '.',
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
      ...prev,
      showTranscripts: !prev.showTranscripts,
    }));

    setAppData(prev => ({
      ...prev,
      transcriptionMsg: prev.transcriptionMsg,
    }));
  }

  return (
    <>
      <div className={`messenger-container from-left mx-2 my-3 rounded-md`}>
        <div className="border-b-2 pb-3 border-black sticky top-0 bg-white">
          <div className="messenger-header text-2xl">
            <p>Transcription</p>
            <FontAwesomeIcon
              className="icon transition-opa z-10"
              onClick={toggleTranscription}
              icon={faTimes}
            />
          </div>
          <div className="flex justify-center gap-3">
            <div className="">
              <FontAwesomeIcon className="" icon={faUserFriends} />
            </div>
            <p>Participants ({numberOfParticipants})</p>
          </div>
        </div>

        <div className="transcript-section pl-7 pr-3 text-left font-medium">
          {/* {hostDetails.isHost ? <p style={{ alignItems: 'center' }}>Host: {hostDetails.name}</p> : <p style={{ alignItems: 'center' }}>this not NOT host, Host: {hostDetails.name}</p>} */}
          {appData.transcriptionMsg || (
            <p className="animate-pulse infinite">Talk to display transcription...</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Transcription;
