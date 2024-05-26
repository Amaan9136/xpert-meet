import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faTimes,
  faUser,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import "./MeetingInfo.css";

const MeetingInfo = ({ setMeetingState, name }) => {
  const url = window.location.href;
  return (
    <div className="meeting-info-block">
      <div className="meeting-header">
        <h3>Grab Your Meet link</h3>
        <FontAwesomeIcon
          className="icon"
          icon={faTimes}
          onClick={() => {
            setMeetingState(prevState => ({
              ...prevState,
              meetingInfo: !prevState.meetingInfo,
            }));
          }}
        />
      </div>
      <button
        onClick={() => navigator.clipboard.writeText(url)}
        className="add-people-btn">
        <FontAwesomeIcon className="icon" icon={faUser} />
        Add Others
      </button>
      <p className="info-text py-3">
        Or share this meeting link with others you want in the meeting
      </p>
      <div className="meet-link">
        <span>{url}</span>
        <FontAwesomeIcon
          className="icon"
          icon={faCopy}
          onClick={() => navigator.clipboard.writeText(url)}
        />
      </div>
      <div className="permission-text py-3">
        <FontAwesomeIcon className="icon pr-1" icon={faShieldAlt} />
        <p className="small-text">
          People who use this meeting link must get your permission before they
          can join.
        </p>
      </div>
      <p className="small-text">Joined as {name}</p>
    </div>
  );
};

export default MeetingInfo;
