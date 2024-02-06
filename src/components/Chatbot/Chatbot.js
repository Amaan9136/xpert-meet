import React, { useEffect, useRef, useState } from "react";
import "./Chatbot.css";
import { findResponse } from "./data/botMessagesHandle";
import { readStudentDatafromxl } from "./data/botFunctions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faRefresh } from "@fortawesome/free-solid-svg-icons";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { id: "bot", text: "Hello.. I'm listening! Go on..", },
    /*messages object has: id, text , typing, delay ,animate ,defaultClass*/
  ]);
  const inputRef = useRef(null);
  const messageContainerRef = useRef(null);
  const isAnyMessageAnimating = messages.some(message => message.animate);
  const usnexp = /\b[0-9]{1}[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}\b/i;

  function output(input) {
    userMessageSend({ text: input });
    const lowerInput = input.toLowerCase();
    const includesUsn = ["student", "rollno", "details", "usn"].some(keyword => lowerInput.includes(keyword));
    const usn = usnexp.test(lowerInput) ? lowerInput.match(usnexp)[0] : null;

    if (includesUsn || usn) {
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
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]); 

  return (
    <div className="chatbot">
      <div id="botheader">
        <h1>WeXpert Chatter!</h1>
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
            className={`message ${message.id === 'bot' && message.animate ? 'typing-animation' : ''}'`}
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
          onClick={() => handleInputSend("Check Student 📝")}
          disabled={isAnyMessageAnimating}
        >
          Check Student 📝
        </button>
        <button
          tabIndex="2"
          className="quickmessage"
          onClick={() => handleInputSend("Next Class 🏫")}
          disabled={isAnyMessageAnimating}
        >
          Next Class 🏫
        </button>
        <button
          tabIndex="3"
          className="quickmessage"
          onClick={() => handleInputSend("Time Table ⌛")}
          disabled={isAnyMessageAnimating}
        >
          Time Table ⌛
        </button>
        <button
          tabIndex="4"
          className="quickmessage"
          onClick={() => handleInputSend("Holidays? 🎅")}
          disabled={isAnyMessageAnimating}
        >
          Holidays? 🎅
        </button>
      </div>
      <div id="input-section" className="flex justify-between">
        <div className="w-full flex">
          <input
            ref={inputRef}
            className="flex-1 bg-gray-700 rounded-[1rem] ml-1 pl-4 text-white"
            type="text"
            placeholder="Type a message..."
            autoFocus="autofocus"
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
