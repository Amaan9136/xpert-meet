import { faPaperPlane, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useContext, useRef, useState } from 'react';
import { AppContext } from '../../AppContext';
import './MessageBox.css';

export default function MessageBox({ setMeetingState, username }) {
  const [messages, setMessages] = useState([]);
  const inputRef = useRef(null);
  const messageContainerRef = useRef(null);
  const { userKey } = useContext(AppContext);

  return (
    <div className='message-box from-left mx-2 my-3'>
      <div className="msg-header text-2xl">
        <h1>Xpert Messenger!</h1>
        <div className="head-right">
          <FontAwesomeIcon
            className="icon transition-opa z-10"
            onClick={() => setMeetingState((prev) => ({
              showMessage: !prev.showMessage,
            }))}
            icon={faTimes}
          />
        </div>
      </div>
      <hr />

      <div
        id="message-section"
        ref={messageContainerRef}
        className="message-container"
      >
        {messages.map((message, index) => (
          <span
            className={`message ${message.userKey === userKey ? 'me' : 'them'}`}
            key={index}
            id={message.userKey === userKey ? 'me' : 'them'}
          >
            <span className={`${message.userKey === userKey ? 'me' : 'them'}`}>{message.name}:&nbsp;</span>
            <span>{message.text}</span>
          </span>
        ))}
      </div>

      <div className="chat-footer">
        <div id="input-section" className="flex justify-between">
          <div className="w-full flex">
            <input
              ref={inputRef}
              className="flex-1 bg-gray-700 rounded-[1rem] ml-1 pl-4 text-white"
              type="text"
              placeholder="Type a message..."
              tabIndex="3"
              onKeyDown={(e) => e.key === 'Enter' && handleInputSend()}
            />
          </div>
          <button
            type="submit"
            className="send"
            tabIndex="3"
            onClick={handleInputSend}
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
