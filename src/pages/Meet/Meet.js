import { useContext, useEffect } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppContext } from '../../AppContext';
import Loader from '../../AppLoader';
import MainScreen from "../../components/MainScreen/MainScreen.component";
import firepadRef, { db } from "../../server/firebase";
import { checkInternetConnection, startVideoRecording } from "../../server/http";
import {
  addParticipant,
  removeParticipant,
  setMainStream,
  setUser,
  updateParticipant,
} from "../../store/actioncreator";
import "./Meet.css";

function Meet(props) {
  const navigate = useNavigate();
  if (checkInternetConnection()) {
    navigate('/internet');
  }
  const { appState, setAppState, appData, setParticipantsData } = useContext(AppContext);
  useEffect(() => {
    setAppState((prevAppState) => ({
      ...prevAppState,
      loaderShow: true,
      loaderMsg: 'Arranging Meeting...',
    }));
    const loaderTimeout = setTimeout(() => {
      setAppState((prevAppState) => ({
        ...prevAppState,
        loaderShow: false,
      }));
    }, 1500);

    return () => {
      clearTimeout(loaderTimeout);
    };
  }, [setAppState]);

  const { name, setMainStream, setUser, addParticipant, removeParticipant, updateParticipant } = props;
  const getUserStream = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    return localStream;
  };

  useEffect(() => {
    let isSubscribed = true;
    const fetchData = async () => {
      try {
        const stream = await getUserStream();
        if (isSubscribed) {
          stream.getVideoTracks()[0].enabled = false;
          setMainStream(stream);
          const connectedRef = await db.database().ref(".info/connected");
          const participantRef = firepadRef.child("participants");
          const snapshot = await participantRef.once("value");
          const participantsArray = Object.values(snapshot.val() || {});
          const isHostExists = participantsArray.some(participant => participant.isHost);
          const hostRef = firepadRef.child("host");
          const hostSnapshot = await hostRef.once("value");

          connectedRef.on("value", (snap) => {
            if (snap.val()) {
              const defaultPreference = {
                audio: true,
                video: false,
                screen: false,
              };
              const userStatusRef = participantRef.push({
                userName: name,
                preferences: defaultPreference,
                isHost: !isHostExists,
                profileColor: appData.profileColor
              });
              setUser({
                [userStatusRef.key]: { name, ...defaultPreference },
              });

              if (!isHostExists) {
                // !isHostExists means - HOST not exist, set this as HOST
                const hostStatusRef = firepadRef.child("host").push({
                  id: userStatusRef.key,
                  userName: name,
                });
                setParticipantsData((prevData) => ({
                  ...prevData,
                  id: userStatusRef.key,
                  name,
                  isHost: !isHostExists,
                }));
                hostStatusRef.onDisconnect().remove();
              } else {
                // this is NOT HOST, get Existing HOST data
                const dbHostDataArray = Object.values(hostSnapshot.val() || {});
                const dbHostData = dbHostDataArray[0];
                if (dbHostData) {
                  setParticipantsData((prevData) => ({
                    ...prevData,
                    id: dbHostData.id,
                    name: dbHostData.userName,
                    isHost: !isHostExists,
                  }));
                }
              }
              userStatusRef.onDisconnect().remove();
            }
          });
          participantRef.on("child_added", (snap) => {
            const preferenceUpdateEvent = participantRef.child(snap.key).child("preferences");
            preferenceUpdateEvent.on("child_changed", (preferenceSnap) => {
              updateParticipant({
                [snap.key]: {
                  [preferenceSnap.key]: preferenceSnap.val(),
                },
              });
            });
            const { userName: name, preferences = {}, profileColor } = snap.val();
            addParticipant({
              [snap.key]: {
                name,
                ...preferences,
                profileColor
              },
            });
          });
          participantRef.on("child_removed", (snap) => {
            removeParticipant(snap.key);
          });
          window.history.replaceState(null, "Meet", "?id=" + firepadRef.key);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    return () => {
      isSubscribed = false;
    };
  }, [name, setMainStream, setUser, addParticipant, removeParticipant, updateParticipant, setParticipantsData]);

  useEffect(() => {
    startVideoRecording();
  }, []);

  return (
    <>
      {appState.loaderShow ? (
        <Loader message={appState.loaderMsg ? appState.loaderMsg : 'Loading...'} />
      ) : (
        <MainScreen name={name} />
      )}
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    stream: state && state.mainStream ? state.mainStream : null,
    user: state && state.currentUser ? state.currentUser : null,
  };
};

const mapDispatchToProps = {
  setMainStream,
  addParticipant,
  setUser,
  removeParticipant,
  updateParticipant,
};

export default connect(mapStateToProps, mapDispatchToProps)(Meet);
