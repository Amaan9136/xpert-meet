import { faChain, faKeyboard, faVideo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../AppContext';
import Loader from '../../AppLoader';
import Header from '../../components/Header/Header';
import Model from '../../components/Model/Model';
import firepadRef from '../../server/firebase';
import { checkInternetConnection } from "../../server/http";
import "./Home.css";

export default function Home({ setUserName }) {
  const navigate = useNavigate();
  if (checkInternetConnection()) {
    navigate('/internet');
  }
  const inputRef = useRef(null);
  const joinRef = useRef(null);
  const { appState, setAppState, participantsData } = useContext(AppContext);
  function handleCalendar() {
    setAppState((prevAppState) => ({
      ...prevAppState,
      calendar: {
        ...prevAppState.calendar,
        showCalendar: !prevAppState.calendar.showCalendar,
      },
    }));
  }

  function handleSettings() {
    setAppState({
      ...appState,
      model: {
        showModel: true,
        modelType: 'settings',
        modelMsg: "Settings:"
      },
    });
  }

  const handleCalendarChange = (selectedDate) => {
    const dateString = selectedDate.toISOString();
    localStorage.setItem('selectedDate', dateString);

    const currentDate = new Date();
    const selectedDateObj = new Date(dateString);

    const isPastDate = selectedDateObj.setHours(0, 0, 0, 0) < currentDate.setHours(0, 0, 0, 0);

    setAppState((prevAppState) => ({
      ...prevAppState,
      calendar: {
        showCalendar: !prevAppState.calendar.showCalendar,
        calendarDate: dateString,
      },
      loaderShow: false,
      model: {
        showModel: true,
        modelType: isPastDate ? 'invalid' : 'date',
        modelMsg: isPastDate
          ? 'Invalid date. Please select a future date.'
          : `Meeting Scheduled Successfully! 
            \n Join meeting on ${selectedDateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}`,
      },
    }));
  };

  const handleNewMeeting = () => {
    const name = inputRef.current.value.trim();
    const joinValue = joinRef.current.value.trim();
    const isValidInput = /^[a-zA-Z\s]*$/.test(name);
    if (!isValidInput || name === '') {
      setAppState({
        ...appState,
        loaderShow: false,
        model: {
          showModel: true,
          modelNeedInput: false,
          modelMsg: "Enter a valid Name!"
        }
      });
    } else if (joinValue) {
      setAppState({
        ...appState,
        loaderShow: false,
        model: {
          showModel: true,
          modelNeedInput: false,
          modelMsg: "You cannot join and host the meeting at same time!"
        }
      });
    } else {
      setAppState({
        loaderShow: false,
        model: {
          showModel: true,
          modelNeedInput: false,
          modelType: 'add-mail',
          modelMsg: "Would you like to send notifications via email? If yes, please upload the file having email in it."
        }
      });
      setUserName(name);
    }
  };

  const urlParams = new URLSearchParams(window.location.search);
  const joinKey = urlParams.get("id");
  useEffect(() => {
    if (joinKey) {
      joinRef.current.value = joinKey;
    }
    window.history.replaceState(null, "Meet", window.location.pathname);
  }, [joinKey]);

  const handleJoinClick = async () => {
    setAppState({ ...appState, loaderShow: true });
    const joinValue = joinRef.current.value;
    try {
      const snapshot = await firepadRef.root.once('value');
      const allKeys = snapshot.exists() ? Object.keys(snapshot.val()) : [];
      if (allKeys.includes(joinValue)) {
        setAppState(prevState => ({
          ...prevState,
          loaderShow: false,
          model: {
            showModel: true,
            modelNeedInput: true,
            modelType: 'join',
            modelMsg: 'Enter Name to Join Meeting:'
          }
        }));
      } else {
        setAppState(prevState => ({
          ...prevState,
          loaderShow: false,
          model: {
            showModel: true,
            modelNeedInput: false,
            modelMsg: 'Meeting ID is invalid!'
          }
        }));
        joinRef.current.value = '';
      }
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
      alert("Error fetching data from Firebase. Please check console for details.");
    }
  };


  return (
    <>
      {appState.loaderShow && <Loader message={"Getting Info..."} />}
      {(appState.model.showModel && appState.model.modelNeedInput) ? (
        // model for joiner
        <Model setUserName={setUserName} />
      ) : (
        appState.model.showModel && (
          <Model />
        )
      )}
      {appState.model.showModel && participantsData.isHost && (
        // send email to participants if this is host
        <Model />
      )}
      {appState.calendar && appState.calendar.showCalendar && (
        <div className="transparent-background">
        <div className="calendar from-top">
          <Calendar
            className='react-calendar'
            onChange={handleCalendarChange}
            value={appState.calendar.calendarDate || new Date()}
          />
          <button className="text-[1.2rem] px-4 py-2 from-left w-full border-t hover:bg-stone-800 transition duration-300" onClick={handleCalendar}>Close</button>
        </div>
        </div>
      )}
      <div className="home-page">
        <Header handleCalendar={handleCalendar} handleSettings={handleSettings} />
        <div className="home-body">
          <div className="left-side">
            <div className="lg:mr-10">
              <h2>Premium video meetings. Now free for everyone.</h2>
              <p className='mt-2'>
                We re-engineered the service we built for secure business
                meetings, Xpert Meet, to make it free and available for all.
              </p>
              <div className="input-block">
                <div className="input-section">
                  <FontAwesomeIcon className="icon-block" icon={faKeyboard} />
                  <input
                    ref={inputRef}
                    placeholder="Enter Name to Host"
                  />
                </div>
                <button className="btn" onClick={handleNewMeeting}>
                  <FontAwesomeIcon className="icon-block" icon={faVideo} />
                  New Meeting
                </button>
              </div>
              <div className="input-block">
                <div className="input-section">
                  <FontAwesomeIcon className="icon-block" icon={faKeyboard} />
                  <input
                    ref={joinRef}
                    placeholder="Enter a code or link"
                  />
                </div>
                <button className="btn" onClick={handleJoinClick}>
                  <FontAwesomeIcon className="icon-block" icon={faChain} />
                  Join Meeting
                </button>
              </div>
            </div>
            <div className="help-text">
              <Link to="/">Learn more</Link> about Xpert-Meet
            </div>
          </div>
          <div className="right-side hidden lg:block">
            <img src={process.env.PUBLIC_URL + '/assets/meetImg.jpg'} alt="Meet" />
          </div>
        </div>
      </div>
    </>
  );
}
