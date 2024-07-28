import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

var firebaseConfig = {
  apiKey: "AIzaSyAcvzFXEUPBpUe69uERDTpPh_zXGglmGwI",
  databaseURL: "https://vivid-alchemy-399203-default-rtdb.firebaseio.com/",
};

firebase.initializeApp(firebaseConfig);
export const db = firebase;
var firepadRef = firebase.database().ref();

const urlparams = new URLSearchParams(window.location.search);
const roomId = urlparams.get("id");

if (roomId) {
  firepadRef = firepadRef.child(roomId);
} else {
  firepadRef = firepadRef.push();
}

export default firepadRef;