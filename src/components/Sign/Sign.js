import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../AppContext';

const islGifs = [
  'any questions', 'are you angry', 'are you busy', 'are you hungry', 'are you sick', 'be careful',
  'can we meet tomorrow', 'did you book tickets', 'did you finish homework', 'do you go to office', 'do you have money',
  'do you want something to drink', 'do you want tea or coffee', 'do you watch TV', 'dont worry', 'flower is beautiful',
  'good afternoon', 'good evening', 'good morning', 'good night', 'good question', 'had your lunch', 'happy journey',
  'hello what is your name', 'how many people are there in your family', 'i am a clerk', 'i am bore doing nothing',
  'i am fine', 'i am sorry', 'i am thinking', 'i am tired', 'i dont understand anything', 'i go to a theatre', 'i love to shop',
  'i had to say something but i forgot', 'i have headache', 'i like pink colour', 'i live in nagpur', 'lets go for lunch',
  'my mother is a homemaker', 'my name is john', 'nice to meet you', 'no smoking please', 'open the door',
  'please call me later', 'please clean the room', 'please give me your pen', 'please use dustbin dont throw garbage',
  'please wait for sometime', 'shall I help you', 'shall we go together tomorrow', 'sign language interpreter',
  'sit down', 'stand up', 'take care', 'there was traffic jam', 'wait I am thinking', 'what are you doing', 'what is the problem',
  'what is todays date', 'what is your father do', 'what is your job', 'what is your mobile number', 'what is your name',
  'whats up', 'when is your interview', 'when we will go', 'where do you stay', 'where is the bathroom', 'where is the police station',
  'you are wrong'
];

const Sign = ({ setMeetingState }) => {
  const [gifSrc, setGifSrc] = useState('');
  const [region, setRegion] = useState('Indian');
  const [letterSrc, setLetterSrc] = useState([]);
  const { appData } = useContext(AppContext);

  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

  useEffect(() => {
    if (appData.transcriptionMsg && region) {
      processSpeech();
    }
  }, [appData.transcriptionMsg, region]);

  const processSpeech = () => {
    const normalizedText = appData.transcriptionMsg.trim().toLowerCase();
    const matchedGifs = [];

    let startIndex = 0;
    islGifs.forEach(phrase => {
      const regex = new RegExp(`\\b${phrase}\\b`, 'g');
      let match;
      while ((match = regex.exec(normalizedText)) !== null) {
        if (match.index >= startIndex) {
          matchedGifs.push(phrase);
          startIndex = match.index + match[0].length;
        }
      }
    });

    const newestGif = matchedGifs.length > 0 ? matchedGifs[matchedGifs.length - 1] : null;

    if (newestGif) {
      const gifPath = `/assets/signs/ISL_Gifs/${newestGif.replace(/\s+/g, ' ')}.gif`;
      setGifSrc(gifPath);
    } else {
      setGifSrc('');
    }

    const letterImages = [];
    for (let char of normalizedText) {
      if (/^[a-z]$/i.test(char)) {
        const imagePath = region === 'Indian' ? 
          `/assets/signs/${region}/${char}.jpg` : 
          `/assets/signs/${region}/${char.toUpperCase()}.png`;
        letterImages.push(imagePath);
      } else if (char === ' ') {
        letterImages.push(`/assets/signs/space.png`);
      }
    }

    setLetterSrc(letterImages);  
  };

  return (
    <div className={`messenger-container w-full from-left mx-2 my-3`}>
      <div className="messenger-header text-2xl">
        <h1>Xpert Sign Language</h1>
        <select
          className='select from-left'
          onChange={(event) => setRegion(event.target.value)}
          value={region}
        >
          <option value="Indian">Indian</option>
          <option value="British">British</option>
          <option value="American">American</option>
        </select>
        <FontAwesomeIcon
          className="icon transition-opa z-10"
          onClick={() => {
            setMeetingState((prev) => ({
              showSign: !prev.showSign,
            }));
          }}
          icon={faTimes}
        />
      </div>
      <hr />
      <div className="section pt-1 text-left m-4">
        {appData.transcriptionMsg && gifSrc && (
          <div className="gif-container mb-3">
            <img src={gifSrc} alt="Sign Language GIF" />
          </div>
        )}
        {/* Display individual letter signs regardless of whether a phrase was found */}
        {letterSrc.length > 0 && (
          <div className="letters-container mb-3 flex gap-2 flex-wrap items-center justify-center">
            {letterSrc.map((src, index) => (
              <img key={index} src={src} alt={`letter-${index}`} className="letter border rounded-md" width={'144px'} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sign;
