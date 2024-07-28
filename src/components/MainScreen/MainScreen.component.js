import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { setMainStream, updateUser } from "../../store/actioncreator";
import Chatbot from "../Chatbot/Chatbot";
import JamBoard from "../JamBoard/JamBoard";
import MeetingFooter from "../MeetingFooter/MeetingFooter.component";
import MeetingInfo from "../MeetingInfo/MeetingInfo";
import MessageBox from '../MessageBox/MessageBox';
import Participants from "../Participants/Participants.component";
import Transcription from "../Transcription/Transcription";
import "./MainScreen.css";

const MainScreen = (props) => {
  const participantRef = useRef(props.participants);
  const [meetingState, setMeetingState] = useState({
    meetingInfo: false,
    showTranscripts: window.innerWidth >= 768, 
    showChatbot: false,
    showMessage: false,
    showJam: false,
  });
  const onMicClick = (micEnabled) => {
    if (props.stream) {
      props.stream.getAudioTracks()[0].enabled = micEnabled;
      props.updateUser({ audio: micEnabled });
    }
  };
  const onVideoClick = (videoEnabled) => {
    if (props.stream) {
      props.stream.getVideoTracks()[0].enabled = videoEnabled;
      props.updateUser({ video: videoEnabled });
    }
  };

  useEffect(() => {
    participantRef.current = props.participants;
  }, [props.participants]);

  const updateStream = (stream) => {
    for (let key in participantRef.current) {
      const sender = participantRef.current[key];
      if (sender.currentUser) continue;
      const peerConnection = sender.peerConnection
        .getSenders()
        .find((s) => (s.track ? s.track.kind === "video" : false));
      peerConnection.replaceTrack(stream.getVideoTracks()[0]);
    }
    props.setMainStream(stream);
  };

  const onScreenShareEnd = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    localStream.getVideoTracks()[0].enabled = Object.values(
      props.currentUser
    )[0].video;

    updateStream(localStream);

    props.updateUser({ screen: false });
  };

  const onScreenClick = async () => {
    let mediaStream;
    if (navigator.getDisplayMedia) {
      mediaStream = await navigator.getDisplayMedia({ video: true });
    } else if (navigator.mediaDevices.getDisplayMedia) {
      mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
    } else {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { mediaSource: "screen" },
      });
    }

    mediaStream.getVideoTracks()[0].onended = onScreenShareEnd;
    updateStream(mediaStream);
    props.updateUser({ screen: true });
  };

  return (
    <div className="main-screen">
      <div className="meet-body">
        <div className="flex-1">
        {window.innerWidth <= 500 && (meetingState.showTranscripts || meetingState.showChatbot || meetingState.showMessage) ? null : <Participants />}
        </div> 
        {/* <Cheat/> */}
        {meetingState.showJam && <JamBoard />}
        {meetingState.meetingInfo && <MeetingInfo setMeetingState={setMeetingState} name={props.name} />}
        {meetingState.showTranscripts && <Transcription setMeetingState={setMeetingState} />}
        {meetingState.showChatbot && <div className="from-left mx-2 my-3"><Chatbot /></div>}
        {meetingState.showMessage && <MessageBox setMeetingState={setMeetingState} username={props.name}/>}
      </div>
        <MeetingFooter
          onScreenClick={onScreenClick}
          onMicClick={onMicClick}
          onVideoClick={onVideoClick}
          meetingState={meetingState}
          setMeetingState={setMeetingState}
        />
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    stream: state.mainStream,
    participants: state.participants,
    currentUser: state.currentUser,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setMainStream: (stream) => dispatch(setMainStream(stream)),
    updateUser: (user) => dispatch(updateUser(user)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MainScreen);
