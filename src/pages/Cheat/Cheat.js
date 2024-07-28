import React, { useEffect, useState } from 'react';

function Cheat() {
  const [copyStatus, setCopyStatus] = useState('Fetching data...');

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetch('http://localhost:5000/is_copying')
        .then(response => response.json())
        .then(data => {
          const { isCopying, copyDirection, copyCount } = data;
          setCopyStatus(`Is copying: ${isCopying}, Copy direction: ${copyDirection}, Copy Count: ${copyCount}`);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          setCopyStatus('Error fetching data');
        });
    }, 300);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
    <img src="http://localhost:5000/video_feed" width="640" height="480" />
      <div id="copy-status">{copyStatus}</div>
    </div>
  );
}

export default Cheat;
