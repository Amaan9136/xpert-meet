import {
  faAlignLeft,
  faCamera,
  faComments,
  faDesktop,
  faKey,
  faLink,
  faLinkSlash,
  faMessage,
  faMicrophone,
  faMicrophoneSlash,
  faNoteSticky,
  faPhone,
  faSlash,
  faVideo,
  faVideoSlash
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { AppContext } from '../../AppContext';
import { onScreenshotClick, stopVideoRecording } from "../../server/http";
import Model from "../Model/Model";
import "./MeetingFooter.css";

const MeetingFooter = (props) => {
  const { appState, setAppState } = useContext(AppContext);
  const { meetingState, setMeetingState } = props;
  const navigate = useNavigate();
  const [streamState, setStreamState] = useState({
    mic: true,
    video: false,
    screen: false,
  });

  const handleEndCall = () => {
    stopVideoRecording();
    navigate('/summary');
  };

  const micClick = () => {
    setStreamState((currentState) => {
      return {
        ...currentState,
        mic: !currentState.mic,
      };
    });
  };

  const onVideoClick = () => {
    setStreamState((currentState) => {
      return {
        ...currentState,
        video: !currentState.video,
      };
    });
  };

  const onScreenClick = () => {
    props.onScreenClick(setScreenState);
  };

  const setScreenState = (isEnabled) => {
    setStreamState((currentState) => {
      return {
        ...currentState,
        screen: isEnabled,
      };
    });
  };

  function onClickIcon(modelType) {
    if(modelType==='keys'){
      setAppState({
        loaderShow: false,
        model: {
          showModel: true,
          modelNeedInput: true,
          modelType: 'keys',
          modelMsg: "Enter a Key Points on this meeting:"
        }
      });
    }else if(modelType==='notes'){
      setAppState({
        loaderShow: false,
        model: {
          showModel: true,
          modelType: 'notes',
          modelMsg: "Upload the notes or materials:"
        }
      });
    }
  }

  useEffect(() => {
    props.onMicClick(streamState.mic);
  }, [streamState.mic]);

  useEffect(() => {
    props.onVideoClick(streamState.video);
  }, [streamState.video]);

  return (
    <>
      <ReactTooltip id="tooltip" effect="solid" />
      {appState.model.showModel && (
        <Model />
      )}
      <div className="meeting-footer border-t">
        <div
          className={`meeting-icons ${!streamState.mic ? "active" : ""}`}
          title={streamState.mic ? "Mute Audio" : "Unmute Audio"}
          onClick={micClick}
        >
          <FontAwesomeIcon
            icon={!streamState.mic ? faMicrophoneSlash : faMicrophone}
          />
        </div>
        <div
          className={`meeting-icons ${!streamState.video ? "active" : ""}`}
          title={streamState.video ? "Hide Video" : "Show Video"}
          onClick={onVideoClick}
        >
          <FontAwesomeIcon icon={!streamState.video ? faVideoSlash : faVideo} />
        </div>
        <div className="meeting-icons" onClick={onScreenshotClick}
          title="Take Screenshot"
        >
          <FontAwesomeIcon icon={faCamera} />
        </div>
        <div
          className="meeting-icons"
          title="Share Screen"
          onClick={onScreenClick}
          disabled={streamState.screen}
        >
          <FontAwesomeIcon icon={faDesktop} />
        </div>
        <div className="meeting-icons active" onClick={handleEndCall}
          title="End Call">
          <FontAwesomeIcon icon={faPhone} />
        </div>
        <div
          className={`meeting-icons ${props.meetingState.meetingInfo ? "" : "active"}`}
          title={props.meetingState.meetingInfo ? "Close Link Info" : "Link Info"}
          onClick={() =>
            setMeetingState((prev) => ({
              ...prev,
              meetingInfo: !prev.meetingInfo,
            }))
          }
        >
          <FontAwesomeIcon
            icon={meetingState.meetingInfo ? faLink : faLinkSlash}
          />
        </div>
        <div className={`meeting-icons ${appState.model.showModel && appState.model.modelType === 'keys' ? "" : "active"}`} onClick={()=>onClickIcon('keys')}
          title="Key Points">
          {appState.model.showModel && appState.model.modelType === 'keys' ? (
            <FontAwesomeIcon icon={faKey} />
          ) : (
            <>
              <FontAwesomeIcon
                icon={faSlash}
                className="absolute mobile-hide"
              />
              <FontAwesomeIcon
                icon={faKey}
                className="relative"
              />
            </>
          )}
        </div>
        <div className={`meeting-icons ${appState.model.showModel && appState.model.modelType === 'notes' ? "" : "active"}`} onClick={()=>onClickIcon('notes')}
          title="Notes">
          {appState.model.showModel && appState.model.modelType === 'notes' ? (
            <FontAwesomeIcon icon={faNoteSticky} />
          ) : (
            <>
              <FontAwesomeIcon
                icon={faSlash}
                className="absolute mobile-hide"
              />
              <FontAwesomeIcon
                icon={faNoteSticky}
                className="relative"
              />
            </>
          )}
        </div>
        <div
          className={`meeting-icons ${meetingState.showTranscripts ? "" : "active"}`}
          title="Transcription"
          onClick={() =>
            setMeetingState((prev) => ({
              showTranscripts: !prev.showTranscripts,
            }))
          }
        >
          {meetingState.showTranscripts ? (
            <FontAwesomeIcon icon={faAlignLeft} />
          ) : (
            <>
              <FontAwesomeIcon
                icon={faSlash}
                className="absolute mobile-hide"
              />
              <FontAwesomeIcon
                icon={faAlignLeft}
                className="relative"
              />
            </>
          )}
        </div>
        <div
          className={`meeting-icons ${meetingState.showMessage ? "" : "active"}`}
          title="Message"
          onClick={() => {
            setMeetingState((prev) => ({
              showMessage: !prev.showMessage,
            }))
          }}
        >
          {meetingState.showMessage ? (
            <FontAwesomeIcon icon={faComments} />
          ) : (
            <>
              <FontAwesomeIcon
                icon={faSlash}
                className="absolute mobile-hide"
              />
              <FontAwesomeIcon
                icon={faComments}
                className="relative"
              />
            </>
          )}
        </div>
        <div
          className={`meeting-icons ${meetingState.showChatbot ? "" : "active"}`}
          title="Chatbot"
          onClick={() => {
            setMeetingState((prev) => ({
              showChatbot: !prev.showChatbot,
            }))
          }}
        >
          {meetingState.showChatbot ? (
            <FontAwesomeIcon icon={faMessage} />
          ) : (
            <>
              <FontAwesomeIcon
                icon={faSlash}
                className="absolute mobile-hide"
              />
              <FontAwesomeIcon
                icon={faMessage}
                className="relative"
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};


export default MeetingFooter;
