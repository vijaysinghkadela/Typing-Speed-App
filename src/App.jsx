import { useState, useEffect } from "react";
import KeyVisualizer from "./components/KeyVisualizer";
import FetchNewText from "./components/FetchNewText";

const TypingSpeedTest = () => {
  const [currentText, setCurrentText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [time, setTime] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [wpm, setWPM] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [isTextLoaded, setIsTextLoaded] = useState(false);
  const [wordCount, setWordCount] = useState(30);
  const [activeKey, setActiveKey] = useState(null);
  const [typingTip, setTypingTip] = useState("");
  const [isTipLoading, setIsTipLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [timerLimit, setTimerLimit] = useState(2);
  const [timerStarted, setTimerStarted] = useState(false);
  const [isTimerFinished, setIsTimerFinished] = useState(false);

  // Fetch text from API based on word count
  useEffect(() => {
    fetchNewText(wordCount);
  }, [wordCount]);

  const fetchNewText = (count) => {
    const sentences = Math.ceil(count / 10);
    fetch(
      `https://baconipsum.com/api/?type=all-meat&paras=1&sentences=${sentences}`
    )
      .then((response) => response.json())
      .then((data) => {
        setCurrentText(data[0].split(" ").slice(0, count).join(" "));
        setIsTextLoaded(true);
      })
      .catch((error) => {
        console.error("Error fetching text:", error);
        setCurrentText("Sample text for testing purposes.");
        setIsTextLoaded(true);
      });
  };

  // Fetch typing tips from an API (placeholder URL for example)
  useEffect(() => {
    const fetchTypingTip = () => {
      setIsTipLoading(true);
      fetch("https://api.typingtips.com/getTip") // Replace with a real API endpoint or use predefined tips
        .then((response) => response.json())
        .then((data) => {
          setTypingTip(data.tip);
          setIsTipLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching typing tip:", error);
          setTypingTip(
            "Practice regularly and focus on accuracy before speed."
          );
          setIsTipLoading(false);
        });
    };
    fetchTypingTip();
  }, []);

  const handleWordCountChange = (e) => {
    setWordCount(Number(e.target.value));
    setIsTextLoaded(false);
  };

  useEffect(() => {
    let timer;
    if (isTyping && time < timerLimit * 60) {
      timer = setInterval(() => setTime((prev) => prev + 1), 1000);
    } else if (time >= timerLimit * 60) {
      setIsTimerFinished(true);
      setIsTyping(false); // Stop typing when timer ends
    }
    return () => clearInterval(timer);
  }, [isTyping, time, timerLimit]);

  const handleInputChange = (e) => {
    if (isTimerFinished) return; // Prevent input if timer is finished

    const input = e.target.value;
    setUserInput(input);

    if (!isTyping && isTextLoaded) setIsTyping(true);

    const correctChars = input
      .split("")
      .filter((char, i) => char === currentText[i]).length;
    const calculatedAccuracy =
      input.length > 0 ? Math.round((correctChars / input.length) * 100) : 0;
    setAccuracy(calculatedAccuracy);

    if (input === currentText) {
      setIsTyping(false);
      calculateResults();
    }
  };

  const calculateResults = () => {
    if (time === 0) return;
    const wordsTyped = currentText.split(" ").length;
    const minutes = time / 60;
    setWPM(Math.round(wordsTyped / minutes));
  };

  const handleRestart = () => {
    setUserInput("");
    setTime(0);
    setIsTyping(false);
    setWPM(0);
    setAccuracy(0);
    setIsTextLoaded(false);
    setIsTimerFinished(false);
    fetchNewText(wordCount);
  };

  const handleSubmit = () => {
    if (!isTyping && userInput === currentText) {
      calculateResults();
    }
    alert(`WPM: ${wpm}, Accuracy: ${accuracy}%, Timer: ${time}s`);
    handleRestart();
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      setActiveKey(event.key.toLowerCase());
    };

    const handleKeyUp = () => {
      setActiveKey(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const renderKey = (key) => (
    <div
      key={key}
      className={`w-12 h-12 flex items-center font-mono justify-center border rounded ${
        activeKey === key ? "bg-blue-500 text-white" : "bg-gray-800"
      }`}
    >
      {key.toUpperCase()}
    </div>
  );

  const renderRow = (keys) => (
    <div className="flex gap-1 justify-center mb-1">
      {keys.map((key) => renderKey(key))}
    </div>
  );

  // Update progress based on user input length
  useEffect(() => {
    const calculateProgress = () => {
      if (currentText.length > 0) {
        const progressPercentage = Math.min(
          (userInput.length / currentText.length) * 100,
          100
        );
        setProgress(progressPercentage);
      }
    };
    calculateProgress();
  }, [userInput, currentText]);

  const handleTimerLimitChange = (e) => {
    setTimerLimit(Number(e.target.value)); // Update the timer limit
    setTime(0); // Reset the timer
    setIsTimerFinished(false); // Clear the "timer finished" state
    setUserInput(""); // Clear the user's input
    setIsTextLoaded(false); // Fetch fresh text
    setTimerStarted(false); // Stop any ongoing timer
  };


  return (
    <>
      <div className="w-screen flex flex-col items-center p-4 space-y-6">
        {/* Header */}
        <h1 className="font-mono text-2xl md:text-3xl text-center">
          Typing Speed Test
        </h1>

        {/* Word Count and Timer Selection */}
        <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Word Count */}
          <div>
            <label className="font-mono text-sm md:text-base">
              Select Word Count:
            </label>
            <select
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="w-full p-2 rounded-md border bg-gray-800 text-white"
            >
              <option value={50}>50 words</option>
              <option value={80}>80 words</option>
              <option value={100}>100 words</option>
              <option value={200}>200 words</option>
              <option value={500}>500 words</option>
            </select>
          </div>

          {/* Timer Limit */}
          <div>
            <label className="font-mono text-sm md:text-base">
              Select Timer (Minutes):
            </label>
            <select
              value={timerLimit}
              onChange={handleTimerLimitChange}
              className="w-full p-2 rounded-md border bg-gray-800 text-white"
            >
              <option value={2}>2 minutes</option>
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
            </select>
          </div>
        </div>

        {/* Typing Area */}
        <div className="w-full max-w-lg">
          <p className="font-mono text-sm md:text-base mb-4 text-center border p-4 rounded-md bg-gray-800 text-white">
            {isTextLoaded ? currentText : "Loading text..."}
          </p>
          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            disabled={isTimerFinished || !isTextLoaded}
            className="w-full p-3 border-b-2 text-sm md:text-base focus:outline-none focus:border-blue-500"
            placeholder="Start typing here..."
          />
        </div>

        {/* Stats and Actions */}
        <div className="w-full max-w-lg space-y-4">
          <div className="flex justify-around font-mono text-sm md:text-base">
            <p>WPM: {wpm}</p>
            <p>Accuracy: {accuracy}%</p>
            <p>Time Left: {Math.max(timerLimit * 60 - time, 0)}s</p>
          </div>

          {/* Buttons */}
          <div className="flex justify-around">
            <button
              className="bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-600"
              onClick={handleRestart}
            >
              Restart
            </button>
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-lg">
          <div className="bg-gray-300 rounded h-4">
            <div
              style={{ width: `${progress}%` }}
              className="bg-blue-500 h-full rounded"
            ></div>
          </div>
          <p className="text-center font-mono mt-2">
            Progress: {Math.round(progress)}%
          </p>
        </div>
      </div>
    </>
  );
};

export default TypingSpeedTest;
