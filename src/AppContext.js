import { createContext, useRef, useState } from 'react';
const storedAppData = JSON.parse(localStorage.getItem("appData"));

export const AppContext = createContext({ 
  appState: {},
  setAppState: () => { },
  appData: {},
  setAppData: () => { },
  participantsData: {},
  setParticipantsData: () => { },
});

export default function AppContextProvider({ children }) {
  const userKeyRef = useRef(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));

  const [participantsData, setParticipantsData] = useState({
    id: '',
    name: '',
    isHost: false,
    participants: [{}]
  });
  
  const profileColor = storedAppData ? storedAppData.profileColor : '';
  
  const [appData, setAppData] = useState({
    transcriptionMsg: '',
    keyPoints: [],
    meetMode: 'Casual',
    profileColor: profileColor,
    googleData: {},
    notesLists: [],
  });

  const [appState, setAppState] = useState({
    model: {
      showModel: false,
      modelNeedInput: false,
      modelMsg: '',
      modelType: '',
    },
    loaderShow: false,
    loaderMsg: '',
    calendar: {
      showCalendar: false,
      calendarDate: '',
    },
    emailData: {
      emailTitle: "",
      emailMsg: "",
    },
  });

  const AppContextValues = {
    userKey: userKeyRef.current,
    appState,
    setAppState,
    participantsData,
    setParticipantsData,
    appData,
    setAppData
  };

  return (
    <AppContext.Provider value={AppContextValues}>
      {children}
    </AppContext.Provider>
  );
}
