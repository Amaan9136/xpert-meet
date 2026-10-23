import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef, useState } from 'react';
import CanvasDraw from 'react-canvas-draw';
import { SketchPicker } from 'react-color';
import firepadRef from '../../server/firebase';

const JamBoard = ({ setMeetingState }) => {
  const canvasRef = useRef(null);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushRadius, setBrushRadius] = useState(4);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    const userStatusRef = firepadRef.child('drawings');

    // Listen for updates from Firebase
    userStatusRef.on('value', snapshot => {
      try {
        const data = snapshot.val();
        if (canvasRef.current && data && !isUpdating) {
          canvasRef.current.loadSaveData(data, true);
        }
      } catch (error) {
        console.error("Error loading data: ", error);
      }
    });

    // Set the disconnect event to remove the user's drawing data
    userStatusRef.onDisconnect().remove();

    return () => {
      userStatusRef.off();
    };
  }, [isUpdating]);

  const roundDataPoints = (data) => {
    const parsedData = JSON.parse(data);
    parsedData.lines.forEach(line => {
      line.points.forEach(point => {
        point.x = parseFloat(point.x.toFixed(4));
        point.y = parseFloat(point.y.toFixed(4));
      });
    });
    return JSON.stringify(parsedData);
  };

  const handleChange = () => {
    if (canvasRef.current) {
      // Clear the previous timeout if it exists
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set a new timeout to post data after 5 seconds
      const newTimeoutId = setTimeout(() => {
        try {
          const data = canvasRef.current.getSaveData();
          const roundedData = roundDataPoints(data);
          setIsUpdating(true);
          firepadRef.child('drawings').set(roundedData).then(() => {
            setIsUpdating(false);
          });
        } catch (error) {
          console.error("Error saving data: ", error);
        }
      }, 3000); // 3000 milliseconds = 3 seconds

      setTimeoutId(newTimeoutId);
    }
  };

  const handleClear = () => {
    canvasRef.current.clear();
  };

  return (
    <div className={`messenger-container w-[320px] from-left mx-2 my-3`}>
      <div className="messenger-header text-2xl">
        <h1>Xpert JamBoard</h1>
        <FontAwesomeIcon
          className="icon transition-opa z-10"
          onClick={()=>{
            setMeetingState((prev) => ({
              showJam: !prev.showJam,
            }))
          }}
          icon={faTimes}
        />
      </div>
      <hr />
      <div className="section">
        <div className='flex items-center justify-center m-4'>
          <button className='btn' onClick={() => setShowColorPicker(!showColorPicker)}>Color</button>
          <button className='btn' onClick={() => setIsEraser(!isEraser)}>Eraser</button>
          <button className='btn' onClick={handleClear}>Clear</button>
        </div>
        {showColorPicker && (
          <SketchPicker
            color={brushColor}
            onChangeComplete={(color) => setBrushColor(color.hex)}
          />
        )}
        <CanvasDraw
          ref={canvasRef}
          brushColor={isEraser ? '#FFFFFF' : brushColor}
          brushRadius={brushRadius}
          lazyRadius={0}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default JamBoard;
