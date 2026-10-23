import { faEllipsisV, faMicrophoneSlash, faUserTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useState } from "react";
import { AppContext } from "../../../AppContext";
import firepadRef from "../../../server/firebase";
import {
  removeParticipant
} from "../../../store/actioncreator";
import Card from "../../Shared/Card/Card.component";
import "./Participant.css";

export const Participant = (props) => {
  const { participantsData, appData } = useContext(AppContext);
  const {
    curentIndex,
    currentParticipant,
    hideVideo,
    videoRef,
    showAvatar,
    currentUser,
  } = props;
  const [isHovered, setIsHovered] = useState(false);
  const [showBox, setShowBox] = useState(false);
  function removeUser(participantName) {
    // remove by using the user id (try not to use name since it remove all users by the same name)
    const participantRef = firepadRef.child("participants");

    const participantKey = Object.keys(participantsData.participants).find(key => {
      return participantsData.participants[key].name === participantName;
    });

    if (participantKey) {
      participantRef.child(participantKey).remove();
      removeParticipant(participantKey);

    } else {
      console.error('Participant not found');
    }
  }

  if (!currentParticipant) return <></>;

  return (
    <div
      className={`participant ${hideVideo ? "hide" : ""} border`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card>
        <video
          ref={videoRef}
          className="video"
          id={`participantVideo${curentIndex}`}
          autoPlay
          playsInline
        ></video>
        {!currentParticipant.audio && (
          <FontAwesomeIcon
            className="muted"
            icon={faMicrophoneSlash}
            title="Muted"
          />
        )}
        {/* {(appData.googleData?.imageUrl && showAvatar) ?
          <img
            src={appData.googleData.imageUrl}
            className="avatar-img" />
          :
          <div
            style={{ background: currentParticipant.avatarColor }}
            className="avatar"
          >
            {currentParticipant.name[0]}
          </div>
        } */}

        {showAvatar && (
          <div
            style={{ background: currentParticipant.avatarColor }}
            className="avatar"
          >
            {currentParticipant.name[0]}
          </div>
        )}
        <div className="name">
          {currentParticipant.name}
          {currentUser ? "(You)" : ""}
        </div>
        {(isHovered && participantsData.isHost) && (
          <div className="card-menu flex gap-3">
            {showBox &&
              <div className="card-menu-box">
                {(!currentUser && "(You)") && <p className="card-menu-btn" onClick={() => removeUser(currentParticipant.name)}>Remove {currentParticipant.name} <FontAwesomeIcon icon={faUserTimes} /></p>}
              </div>}
            <FontAwesomeIcon icon={faEllipsisV} onMouseEnter={() => setShowBox(!showBox)} />
          </div>
        )}
      </Card>
    </div>
  );
};
