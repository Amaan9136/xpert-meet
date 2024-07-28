import {
  ADD_PARTICIPANT,
  REMOVE_PARTICIPANT,
  SET_MAIN_STREAM,
  SET_USER,
  UPDATE_PARTICIPANT,
  UPDATE_USER,
} from "./actiontypes";

import {
  createOffer,
  initializeListeners,
  updatePreference,
} from "../server/peerConnection";

let defaultUserState = {
  mainStream: null,
  participants: {},
  currentUser: null,
};

const servers = {
  iceServers: [
    {
      urls: [
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302",
        "stun:stun.services.mozilla.com",
      ],
    },
  ],
  iceCandidatePoolSize: 10,
};

const generateColor = (isNewUser) => {
  if (isNewUser) {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  } else {
    const storedAppData = JSON.parse(localStorage.getItem('appData'));
    const storedProfileColor = storedAppData ? storedAppData.profileColor : '';
    return storedProfileColor || '';
  }
};


export const userReducer = (state = defaultUserState, action) => {
  if (action.type === SET_MAIN_STREAM) {
    let payload = action.payload;
    state = { ...state, ...payload };
    return state;
  } else if (action.type === ADD_PARTICIPANT) {
    let payload = action.payload;
    const currentUserId = Object.keys(state.currentUser)[0];
    const newUserId = Object.keys(payload.newUser)[0];
    if (state.mainStream && currentUserId !== newUserId) {
      payload.newUser = addConnection(
        payload.newUser,
        state.currentUser,
        state.mainStream
      );
    }

    if (currentUserId === newUserId)
      payload.newUser[newUserId].currentUser = true;
    if (payload.newUser[newUserId].profileColor) {
      payload.newUser[newUserId].avatarColor = payload.newUser[newUserId].profileColor
    } else {
      payload.newUser[newUserId].avatarColor = generateColor(true);
    }
    let participants = { ...state.participants, ...payload.newUser };
    state = { ...state, participants };
    return state;
  } else if (action.type === SET_USER) {
    let payload = action.payload;
    let participants = { ...state.participants };
    const userId = Object.keys(payload.currentUser)[0];
    console.log('second', payload.currentUser[userId].profileColor);
    if (payload.currentUser[userId].profileColor) {
      payload.currentUser[userId].avatarColor = payload.newUser[userId].profileColor
    } else {
      payload.currentUser[userId].avatarColor = generateColor();
    }
    initializeListeners(userId);
    state = { ...state, currentUser: { ...payload.currentUser }, participants };
    return state;
  } else if (action.type === REMOVE_PARTICIPANT) {
    let payload = action.payload;
    let participants = { ...state.participants };
    delete participants[payload.id];
    state = { ...state, participants };
    return state;
  } else if (action.type === UPDATE_USER) {
    let payload = action.payload;
    if (!state.currentUser) {
      return state;
    }
    const userId = Object.keys(state.currentUser)[0];
    updatePreference(userId, payload.currentUser);
    state.currentUser[userId] = {
      ...state.currentUser[userId],
      ...payload.currentUser,
    };
    state = {
      ...state,
      currentUser: { ...state.currentUser },
    };
    return state;
  }
  else if (action.type === UPDATE_PARTICIPANT) {
    let payload = action.payload;
    const newUserId = Object.keys(payload.newUser)[0];

    payload.newUser[newUserId] = {
      ...state.participants[newUserId],
      ...payload.newUser[newUserId],
    };
    let participants = { ...state.participants, ...payload.newUser };
    state = { ...state, participants };
    return state;
  }
  return state;
};

const addConnection = (newUser, currentUser, stream) => {
  const peerConnection = new RTCPeerConnection(servers);
  stream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, stream);
  });
  const newUserId = Object.keys(newUser)[0];
  const currentUserId = Object.keys(currentUser)[0];

  const offerIds = [newUserId, currentUserId].sort((a, b) =>
    a.localeCompare(b)
  );

  newUser[newUserId].peerConnection = peerConnection;
  if (offerIds[0] !== currentUserId)
    createOffer(peerConnection, offerIds[0], offerIds[1]);
  return newUser;
};
