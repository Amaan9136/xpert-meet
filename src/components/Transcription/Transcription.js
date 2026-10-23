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
