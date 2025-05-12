// src/components/AudioRecorder.jsx
import React, { useState, useRef, useEffect } from 'react';
import './AudioRecorder.css';

export default function AudioRecorder({ onSend, disabled }) {
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const [audioB64, setAudioB64] = useState('');
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    // Nettoyage si composant démonté
    return () => cancelAnimationFrame(animationRef.current);
  }, []);
  useEffect(() => {
  return () => audioUrl && URL.revokeObjectURL(audioUrl);
}, [audioUrl]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Création du contexte audio et de l'analyser
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    // Démarrage du dessin
    drawWaveform();

    const recorder = new MediaRecorder(stream);
    mediaRef.current = recorder;
    chunksRef.current = [];
    recorder.ondataavailable = e => chunksRef.current.push(e.data);
    recorder.start();
    setRecording(true);
  };

  const stopRecording = async () => {
    // Arrêt de l'animation
    cancelAnimationFrame(animationRef.current);

    mediaRef.current.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      const buf = await blob.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      setAudioB64(b64);
      setRecording(false);
    };
    mediaRef.current.stop();
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyser.getByteTimeDomainData(dataArray);
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#007bff';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      animationRef.current = requestAnimationFrame(draw);
    };
    draw();
  };

  return (
    <div className="audio-recorder">
      <canvas ref={canvasRef} width="300" height="80" className="waveform-canvas" />
      <button
        onClick={recording ? stopRecording : startRecording}
        className={`btn record-btn ${recording ? 'stop' : 'start'}`}
      >
        {recording ? 'Stop' : 'Record'}
      </button>
      {audioB64 && (
        <div className="post-record-controls">
          <button
            onClick={() => audioUrl && new Audio(audioUrl).play()}
            className="btn play-btn"
          >
            Play
          </button>
          <button
            onClick={() => onSend(audioB64)}
        className="btn encrypt-btn"
         disabled={!audioB64 || disabled}
          >
            Encrypt & Send
          </button>
        </div>
      )}
      
    </div>
  );
}
