import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faVideo,
  faDesktop,
  faVideoSlash,
  faMicrophoneSlash,
  faLink,
  faLinkSlash,
  faAlignLeft,
  faSlash,
  faCamera,
  faPhone,
  faKey,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import "./MeetingFooter.css";
import { useNavigate } from "react-router-dom";
import Model from "../Model/Model";
import { useContext } from 'react';
import { AppContext } from '../../AppContext';
import { stopVideoRecording } from '../../server/http';

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
    // stopVideoRecording();
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

  const onScreenshotClick = async () => {
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

  function onKeyClick() {
    setAppState({
      loaderShow: false,
      model: {
        showModel: true,
        modelNeedInput: true,
        modelType: 'keys',
        modelMsg: "Enter a Key Points or short note:"
      }
    });
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
        <div className={`meeting-icons ${appState.model.showModel&&appState.model.modelType==='keys' ? "" : "active"}`} onClick={onKeyClick}
          title="Key Points">
          {appState.model.showModel&&appState.model.modelType==='keys' ? (
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
        <div
          className={`meeting-icons ${meetingState.showTranscripts ? "" : "active"}`}
          title="Transcription"
          onClick={() =>
            setMeetingState((prev) => ({
              ...prev,
              showChatbot: false,
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
          className={`meeting-icons ${meetingState.showChatbot ? "" : "active"}`}
          title="Chatbot"
          onClick={() => {
            setMeetingState((prev) => ({
              ...prev,
              showChatbot: !prev.showChatbot,
              showTranscripts: false,
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
