import { store } from "../index";
import firepadRef from "./firebase";

const participantRef = firepadRef.child("participants");

export const updatePreference = (userId, preference) => {
  const currentParticipantRef = participantRef.child(userId).child("preferences");
  setTimeout(() => {
    currentParticipantRef.update(preference);
  },50);
};

export const createOffer = (peerConnection, receiverId, createdID) => {
  const currentParticipantRef = participantRef.child(receiverId);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      currentParticipantRef
        .child("offerCandidates")
        .push({ ...event.candidate.toJSON(), userId: createdID });
    }
  };

  return peerConnection.createOffer()
    .then((offerDescription) => {
      return peerConnection.setLocalDescription(offerDescription)
        .then(() => {
          const offer = {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
            userId: createdID,
          };
          return currentParticipantRef.child("offers").push().set({ offer });
        });
    });
};

export const initializeListeners = (userId) => {
  const currentUserRef = participantRef.child(userId);

  currentUserRef.child("offers").on("child_added", (snapshot) => {
    const data = snapshot.val();
    if (data?.offer) {
      const pc = store.getState().participants[data.offer.userId].peerConnection;
      pc.setRemoteDescription(new RTCSessionDescription(data.offer))
        .then(() => createAnswer(data.offer.userId, userId));
    }
  });

  currentUserRef.child("offerCandidates").on("child_added", (snapshot) => {
    const data = snapshot.val();
    if (data.userId) {
      const pc = store.getState().participants[data.userId].peerConnection;
      pc.addIceCandidate(new RTCIceCandidate(data));
    }
  });

  currentUserRef.child("answers").on("child_added", (snapshot) => {
    const data = snapshot.val();
    if (data?.answer) {
      const pc = store.getState().participants[data.answer.userId].peerConnection;
      const answerDescription = new RTCSessionDescription(data.answer);
      pc.setRemoteDescription(answerDescription);
    }
  });

  currentUserRef.child("answerCandidates").on("child_added", (snapshot) => {
    const data = snapshot.val();
    if (data.userId) {
      const pc = store.getState().participants[data.userId].peerConnection;
      pc.addIceCandidate(new RTCIceCandidate(data));
    }
  });
};

const createAnswer = (otherUserId, userId) => {
  const pc = store.getState().participants[otherUserId].peerConnection;
  const participantRef1 = participantRef.child(otherUserId);

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      participantRef1
        .child("answerCandidates")
        .push({ ...event.candidate.toJSON(), userId: userId });
    }
  };

  return pc.createAnswer()
    .then((answerDescription) => {
      return pc.setLocalDescription(answerDescription)
        .then(() => {
          const answer = {
            type: answerDescription.type,
            sdp: answerDescription.sdp,
            userId: userId,
          };
          return participantRef1.child("answers").push().set({ answer });
        });
    });
};
