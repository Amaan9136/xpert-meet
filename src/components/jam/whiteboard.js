import React, { useRef, useState, useEffect } from 'react';
import CanvasDraw from 'react-canvas-draw';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { SketchPicker } from 'react-color';
import '../components/whiteboard.css';

const Whiteboard = () => {
    const canvasRef = useRef(null);
    const [brushColor, setBrushColor] = useState('#000000');
    const [brushRadius, setBrushRadius] = useState(4);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [isEraser, setIsEraser] = useState(false);
    

        

    const saveDrawing = async () => {
        const drawing = canvasRef.current.getSaveData();
        try {
            await addDoc(collection(db, 'drawings'), {
                drawing,
                timestamp: new Date(),
            });
            console.log('Drawing saved!');
        } catch (error) {
            console.error('Error saving drawing: ', error);
        }
    };

    const clearDrawing = async () => {
        try {
            await addDoc(collection(db, 'drawings'), {
                drawing: "", // Empty drawing for clear
                timestamp: new Date(),
                isCleared: true,
            });
            canvasRef.current.clear();
            console.log('Drawing cleared and saved!');
        } catch (error) {
            console.error('Error saving drawing: ', error);
        }
    };

    const toggleEraser = () => {
        setIsEraser(!isEraser);
        setBrushColor(isEraser ? '#000000' : '#FFFFFF'); // Assuming white as the background color
    };

    return (
        <div className="whiteboard-container">
            <div className="canvas-wrapper">
                <CanvasDraw 
                    ref={canvasRef} 
                    brushColor={brushColor} 
                    brushRadius={brushRadius} 
                    canvasWidth={800} 
                    canvasHeight={400}
                />
            </div>
            <div className="controls">
                <button className="color-picker-button" onClick={() => setShowColorPicker(!showColorPicker)}>
                    {showColorPicker ? 'Close Color Picker' : 'Pick Color'}
                </button>
                {showColorPicker && (
                    <SketchPicker 
                        color={brushColor} 
                        onChangeComplete={(color) => setBrushColor(color.hex)} 
                    />
                )}
                <div>
                    <label>Brush Radius:</label>
                    <input 
                        type="number" 
                        value={brushRadius} 
                        onChange={(e) => setBrushRadius(parseInt(e.target.value, 10))} 
                        min="1" 
                        max="50" 
                    />
                </div>
                <button className={`eraser-button ${isEraser ? 'active' : ''}`} onClick={toggleEraser}>
                    {isEraser ? 'Use Brush' : 'Use Eraser'}
                </button>
                <button className="clear-button" onClick={clearDrawing}>Clear</button>
            </div>
        </div>
    );
};

export default Whiteboard;
