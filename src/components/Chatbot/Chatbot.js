import { faPaperPlane, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../AppContext";
import { generateChatbotSummary } from '../../server/http';
import "./Chatbot.css";
import { readStudentDatafromxl, readTimeTableFile } from "./data/botFunctions";
import { findResponse } from "./data/botMessagesHandle";

export default function Chatbot() {
  const { appData } = useContext(AppContext);

  // without Transcription Message:
  // const toTranscribe = appData.keyPoints.length !== 0 ? ' key points discussed: ' + appData.keyPoints.join(', ') : '';
  
  // with Transcription Message:
  const toTranscribe = appData.transcriptionMsg + (appData.keyPoints.length !== 0 ? ' key points discussed: ' + appData.keyPoints.join(', ') : ''); 

  // Retrieve messages from local storage if available, otherwise use default messages
  const [messages, setMessages] = useState(() => {
    const storedMessages = localStorage.getItem('messages');
    return storedMessages ? JSON.parse(storedMessages) : [
      { id: "bot", text: "Hello.. I'm listening! Go on.." },
      // other default messages
    ];
  });
  const inputRef = useRef(null);
  const messageContainerRef = useRef(null);
  const isAnyMessageAnimating = messages.some(message => message.animate);
  const usnexp = /\b[0-9]{1}[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}\b/i;

  function output(input) {
    userMessageSend({ text: input });
    const lowerInput = input.toLowerCase();
    const includesUsn = ["student", "rollno", "details", "usn"].some(keyword => lowerInput.includes(keyword));
    const usn = usnexp.test(lowerInput) ? lowerInput.match(usnexp)[0] : null;

    const includesMeeting = ["meeting", "Talk about this meeting", "What is this meeting about"].some(keyword => lowerInput.includes(keyword));
    const includesTimeTable = ["time table", "time", "table"].some(keyword => lowerInput.includes(keyword));

    if (includesMeeting) {
      if (toTranscribe) {
        (async () => {
          const summary = await generateChatbotSummary(toTranscribe);
          await botMessageSend({ text: summary, typing: 'Analyzing and generating the response...' });
        })();
      }
      else {
        botMessageSend({ text: '<i>Unable to generate a summary. waiting for host to provide summary or key-points<i>' })
      }
    } else if (includesTimeTable) {
      readTimeTableFile()
        .then(message => { botMessageSend(message) })
    } else if (includesUsn || usn) {
      if (usn) {
        readStudentDatafromxl(usn)
          .then(message => { botMessageSend(message) })
      } else {
        botMessageSend({ text: "Enter Student Rollno 📝" });
      }
    } else {
      botMessageSend({ text: findResponse(lowerInput) });
    }
  }

  function userMessageSend(...messages) {
    const updatedMessages = messages.map((message) => {
      const { text, defaultClass } = message;
      const newMessage = { id: "user", text, defaultClass };
      return newMessage;
    });
    setMessages((prevMessages) => [...prevMessages, ...updatedMessages]);
  }

  function botMessageSend(...messages) {
    //  { text, typing, delay, defaultClass }
    const defaultTyping = 'Typing...';
    const defaultDelay = 1000;
    const updatedMessages = messages.map((message) => {
      const { text, typing, delay, defaultClass } = message;
      const typingValue = typing !== undefined ? typing : defaultTyping;
      const delayValue = delay !== undefined ? delay : defaultDelay;
      const newMessage = { id: "bot", text, typing: typingValue, delay: delayValue, animate: true, defaultClass };
      setTimeout(() => {
        newMessage.animate = false;
        setMessages((prevMessages) => [...prevMessages]);
      }, delayValue);
      return newMessage;
    });
    setMessages((prevMessages) => [...prevMessages, ...updatedMessages]);
  }

  function handleInputSend(btnMessage) {
    const messageToSend = typeof btnMessage === 'string' ? btnMessage : inputRef.current.value;
    if (messageToSend) {
      output(messageToSend);
      inputRef.current.value = "";
    }
  }

  function reset() {
    setMessages([{ id: "bot", text: "Hello.. I'm listening! Go on.." }]);
  }

  useEffect(() => {
    if (messageContainerRef.current) {
      localStorage.setItem('messages', JSON.stringify(messages));
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chatbot">
      <div id="botheader">
        <h1>Xpert Chatter!</h1>
        <button className="send" onClick={reset}>
          <div className="circle refresh">
            <FontAwesomeIcon className="icon-block" icon={faRefresh} />
          </div>
        </button>
      </div>
      <hr />
      <div
        id="message-section"
        ref={messageContainerRef}
        className="message-container"
      >
        {messages.map((message, index) => (
          <span
            className={`message ${message.id === 'bot' && message.animate ? 'typing-animation' : ''}`}
            key={index}
            id={message.id}
          >
            {message.animate ? (
              <span>{message.typing}</span>
            ) : (
              <span className={`${message.defaultClass && message.defaultClass}`}>
                <span dangerouslySetInnerHTML={{ __html: message.text }} />
              </span>
            )}
          </span>
        ))}
      </div>
      <div className="chat-footer">
        <div className="allquickbtn">
          <button
            tabIndex="1"
            className="quickmessage"
            onClick={() => handleInputSend("Talk about this meeting 📝")}
            disabled={isAnyMessageAnimating}
          >
            Talk about this meeting 📝
          </button>
          <button
            tabIndex="4"
            className="quickmessage"
            onClick={() => handleInputSend("What is this meeting about?🤔")}
            disabled={isAnyMessageAnimating}
          >
            What is this meeting about?🤔
          </button>
        </div>
        <div id="input-section" className="flex justify-between">
          <div className="w-full flex">
            <input
              ref={inputRef}
              className="flex-1 bg-gray-700 rounded-[1rem] ml-1 pl-4 text-white"
              type="text"
              placeholder="Type a message..."
              tabIndex="3"
              onKeyDown={(e) => e.key === 'Enter' && handleInputSend()}
              disabled={isAnyMessageAnimating}
            />
          </div>
          <button
            type="submit"
            className="send"
            onClick={handleInputSend}
            tabIndex="3"
            disabled={isAnyMessageAnimating}
          >
            <div className="circle">
              <FontAwesomeIcon className="icon-block" icon={faPaperPlane} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
