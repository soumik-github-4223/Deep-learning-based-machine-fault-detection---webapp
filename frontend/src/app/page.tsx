"use client";

import { useEffect, useRef, useState } from "react";

import Recorder from "recorder-js";
import Image from "next/image";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);

  const [recordingTime, setRecordingTime] = useState(0);

  const [loading, setLoading] = useState(false);

  const [prediction, setPrediction] = useState("");

  const [confidence, setConfidence] = useState<number | null>(null);

  const [error, setError] = useState("");

  const [spectrogram, setSpectrogram] = useState("");

  const recorderRef = useRef<InstanceType<any> | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);

  const streamRef = useRef<MediaStream | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // =====================================================
  // WAVEFORM REFS
  // =====================================================

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const analyserRef = useRef<AnalyserNode | null>(null);

  const animationRef = useRef<number | null>(null);

  // =====================================================
  // TIMER
  // =====================================================

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  // =====================================================
  // LIVE WAVEFORM DRAWING
  // =====================================================

  const drawWaveform = () => {
    const canvas = canvasRef.current;

    const analyser = analyserRef.current;

    if (!canvas || !analyser) return;

    const canvasCtx = canvas.getContext("2d");

    if (!canvasCtx) return;

    // Set responsive canvas size
    canvas.width = canvas.offsetWidth;

    canvas.height = 200;

    // Better waveform resolution
    analyser.fftSize = 2048;

    const bufferLength = analyser.frequencyBinCount;

    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      // DEBUG
      // Uncomment temporarily if needed
      // console.log(dataArray[0]);

      // Background
      canvasCtx.fillStyle = "#000000";

      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      // Waveform style
      canvasCtx.lineWidth = 2;

      canvasCtx.lineCap = "round";

      canvasCtx.lineJoin = "round";

      canvasCtx.strokeStyle = "#00ffcc";

      canvasCtx.beginPath();

      const sliceWidth = canvas.width / bufferLength;

      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;

        const y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      // Smooth ending
      canvasCtx.lineTo(canvas.width, canvas.height / 2);

      canvasCtx.stroke();
    };

    draw();
  };

  // =====================================================
  // START RECORDING
  // =====================================================

  const startRecording = async () => {
    try {
      setError("");

      setSpectrogram("");

      setPrediction("");

      setConfidence(null);

      setRecordingTime(0);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      // =============================================
      // AUDIO CONTEXT
      // =============================================

      const audioContext = new AudioContext();

      audioContextRef.current = audioContext;

      // VERY IMPORTANT
      await audioContext.resume();

      // =============================================
      // ANALYSER FOR LIVE WAVEFORM
      // =============================================

      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 2048;

      analyser.smoothingTimeConstant = 0.85;

      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);

      source.connect(analyser);

      // =============================================
      // RECORDER
      // =============================================

      const recorder = new Recorder(audioContext);

      recorderRef.current = recorder;

      await recorder.init(stream);

      await recorder.start();

      // START WAVEFORM ONLY AFTER AUDIO STARTS
      drawWaveform();

      setIsRecording(true);
    } catch (err) {
      console.error(err);

      setError("Microphone access denied");
    }
  };

  // =====================================================
  // STOP RECORDING
  // =====================================================

  const stopRecording = async () => {
    try {
      if (!recorderRef.current) return;

      setIsRecording(false);

      setLoading(true);

      // =============================================
      // STOP WAVEFORM ANIMATION
      // =============================================

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      const { blob } = await recorderRef.current.stop();

      // Stop microphone stream
      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });

      // Close audio context
      await audioContextRef.current?.close();

      const wavFile = new File([blob], "recording.wav", {
        type: "audio/wav",
      });

      const formData = new FormData();

      formData.append("file", wavFile);

      const response = await fetch("https://deep-learning-based-machine-fault.onrender.com/predict-audio", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      console.log(data);

      if (data.error) {
        setError(data.error);
      } else {
        setPrediction(data.prediction);

        setConfidence(data.confidence);

        setSpectrogram(data.spectrogram);
      }
    } catch (err) {
      console.error(err);

      setError("Failed to analyze audio");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <main
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-black
        text-white
        p-6
      "
    >
      <div
        className="
          w-full
          max-w-2xl
          bg-gray-900
          rounded-2xl
          shadow-2xl
          p-8
          text-center
        "
      >
        <h1 className="text-4xl font-bold mb-8">Machine Fault Detection</h1>

        {/* ========================================= */}
        {/* RECORD BUTTON */}
        {/* ========================================= */}

        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={loading}
            className="
              w-full
              bg-green-600
              hover:bg-green-700
              transition
              py-4
              rounded-xl
              text-xl
              font-semibold
            "
          >
            🎤 Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="
              w-full
              bg-red-600
              hover:bg-red-700
              transition
              py-4
              rounded-xl
              text-xl
              font-semibold
            "
          >
            ⏹ Stop Recording
          </button>
        )}

        {/* ========================================= */}
        {/* RECORDING STATUS */}
        {/* ========================================= */}

        {isRecording && (
          <div className="mt-6">
            <p
              className="
                text-red-400
                text-2xl
                font-bold
                animate-pulse
              "
            >
              Recording... {recordingTime}s
            </p>
          </div>
        )}

        {/* ========================================= */}
        {/* LIVE WAVEFORM */}
        {/* ========================================= */}

        {/* {isRecording && (
          <div
            className="
              mt-8
              bg-black
              border
              border-green-500
              rounded-xl
              p-4
            "
          >
            <h2 className="text-xl font-bold mb-4">Live Audio Waveform</h2>

            <canvas
              ref={canvasRef}
              width={800}
              height={200}
              className="
                w-full
                rounded-lg
                bg-black
              "
            />
          </div>
        )} */}

        {/* ========================================= */}
        {/* LOADING */}
        {/* ========================================= */}

        {loading && (
          <div className="mt-8">
            <p
              className="
                text-blue-400
                text-xl
                animate-pulse
              "
            >
              Analyzing audio...
            </p>
          </div>
        )}

        {/* ========================================= */}
        {/* RESULT */}
        {/* ========================================= */}

        {prediction && !loading && (
          <div
            className="
              mt-10
              bg-black
              border
              border-gray-700
              rounded-xl
              p-6
            "
          >
            <h2 className="text-2xl font-bold mb-6">Prediction Result</h2>

            <div className="mb-4">
              <p className="text-gray-400 text-lg">Fault Type</p>

              <p
                className="
                  text-3xl
                  font-bold
                  text-green-400
                  mt-2
                "
              >
                {prediction}
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-lg">Confidence Score</p>

              <p
                className="
                  text-2xl
                  font-bold
                  mt-2
                "
              >
                {confidence}%
              </p>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* SPECTROGRAM */}
        {/* ========================================= */}

        {spectrogram && (
          <div
            className="
              mt-10
              bg-black
              border
              border-gray-700
              rounded-xl
              p-6
            "
          >
            <h2 className="text-2xl font-bold mb-6">Generated Spectrogram</h2>

            <Image
              src={`data:image/png;base64,${spectrogram}`}
              alt="Spectrogram"
              width={800}
              height={450}
              className="rounded-xl"
              unoptimized
            />
          </div>
        )}

        {/* ========================================= */}
        {/* ERROR */}
        {/* ========================================= */}

        {error && (
          <div
            className="
              mt-8
              bg-red-900
              border
              border-red-500
              rounded-lg
              p-4
            "
          >
            <p className="text-red-300">{error}</p>
          </div>
        )}
      </div>
    </main>
  );
}
