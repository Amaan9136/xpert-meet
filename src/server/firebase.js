import firebase from 'firebase/compat/app';
import 'firebase/compat/database';


var firebaseConfig = {
  apiKey: "AIzaSyAcvzFXEUPBpUe69uERDTpPh_zXGglmGwI", // Add API Key
  databaseURL:"https://vivid-alchemy-399203-default-rtdb.firebaseio.com/" // Add databaseURL
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const db = firebase;
 
var firepadRef = firebase.database().ref();

export const userName = prompt("What's your name?");
const urlparams = new URLSearchParams(window.location.search);
const roomId = urlparams.get("id");

if (roomId) {
  firepadRef = firepadRef.child(roomId);
} else {
  firepadRef = firepadRef.push();
  window.history.replaceState(null, "Meet", "?id=" + firepadRef.key);
}

export default firepadRef;
