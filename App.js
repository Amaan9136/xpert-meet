// ai plugins for real time transcription 
// can join the meeting in the end and save clients time by providing summary
// can upload dynamic timetables

/*
The Breakdown:

1. Neural Networks (ANN): This is the foundational building block. It's a computational model inspired by the human brain, 
designed to recognize patterns. ANNs are the backbone for many AI applications, including language models.
2. Large Language Models (LLM): These are a specific type of neural network designed to process and generate human language. 
They are trained on vast amounts of text data and can perform tasks like translation, summarization, question answering, and more.
3. Generative Pre-trained Transformers (GPT): This is a specific architecture of LLMs that has become highly successful. 
GPT models use a transformer architecture, which is particularly effective at processing sequential data like text. 
They are pre-trained on massive datasets and can be fine-tuned for specific tasks.

To Summarize:
All LLMs are neural networks.
Not all neural networks are LLMs.
GPTs are a type of LLM's with nicely trained for any response.
*/

// large-language-model , neural-network (ANN) & Generative Pre-trained Transformers 

// future enhance: upload notes into firebase and download it in client
// future enhance: timetable na dynamic upload using setting
// future enhance: student details na dynamic upload using setting
// future enhance: emended google auth
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
