import { faPaperPlane, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";
import "./Chatbot.css";

export default function Chatbot() {
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
