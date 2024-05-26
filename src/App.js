// https://youtu.be/HtJKUQXmtok?si=L4mA29MZJ5ko6Hvh google0auth
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import Home from './pages/Home/Home';
import Meet from './pages/Meet/Meet';
import { checkInternetConnection } from "./server/http";

export default function App() {
  const [userName, setUserName] = useState(null);

  const navigate = useNavigate();
  if (checkInternetConnection()) {
    navigate('/internet');
  }

  return (
    <>
      {userName ? (
        <Meet name={userName} />
      ) : (
        <Home setUserName={setUserName} />
      )}
    </>
  );
}
