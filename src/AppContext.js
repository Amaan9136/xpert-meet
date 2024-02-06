// ANY CONTEXT VALUE THAT IS NEVER MENTIONED BUT IS SET SOMEWHERE CAN BE USED IN ANYWHERE BUT CANNOT USE WITHOUT SETTING IT
//  EXAMPLE: showChatbot of property appState used in Summary Page {appState.showChatbot} BUT NEVER SET SO THE INITIAL VALUE FOR appState.showChatbot WILL BE 'UNDEFINED'
//       THEREFORE appState.showChatbot, WHEN !appState.showChatbot GIVES 'TRUE' WHEN SET USING {setAppState(prev)=>...prev}, SO appState.showChatbot CAN BE USED WITHOUT DEFINING IT IN AppContext.js

import { createContext, useState } from 'react';

export const AppContext = createContext({
  appState: {},
  setAppState: () => { },
});

export default function AppContextProvider({ children }) {
  const [participantsData, setParticipantsData] = useState({
    id: '',
    name: '',
    isHost: false,
    participants: []
  });

  const [appData, setAppData] = useState({
    transcriptionMsg: '',
    keyPoints: []
  });

  const [appState, setAppState] = useState({
    model: {
      showModel: false,
      modelNeedInput: false,
      modelMsg: '',
      modelType: '',
    },
    loaderShow: false,
    calendar: {
      showCalendar: false,
      calendarDate: '',
    },
  });

  const AppContextValues = {
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
