import { createContext, useRef, useState } from 'react';
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
  });


  return (
    <AppContext.Provider value={AppContextValues}>
      {children}
    </AppContext.Provider>
  );
}
