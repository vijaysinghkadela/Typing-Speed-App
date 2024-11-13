import { useState, useEffect } from "react";

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
    setTimerLimit(Number(e.target.value)); // Set selected timer limit
    setTime(0); // Reset timer
    setIsTimerFinished(false); // Reset the timer finished state
    setUserInput(""); // Reset the input
    setIsTextLoaded(false); // Reload text
    setTimerStarted(false); // Stop the previous timer if any
  };

  return (
    <>
      <div className="w-screen overflow-hidden flex flex-col">
        <div>{/* Tip: {} */}</div>
        <h3 className="flex justify-center items-center font-mono text-2xl">
          Typing Speed App
        </h3>
        {isTyping && (
          <div className="mx-2 mt-3 gap-5 text-center flex font-mono justify-center">
            <p>WPM: {wpm}</p>
            <p>Accuracy: {accuracy}%</p>
            <p>Time: {time}s</p>
          </div>
        )}

        {/* Word Counter  */}
        <div className="flex flex-col items-center p-3 max-w-lg mx-auto">
          <div className="flex flex-row justify-between  items-center mb-3 mt-3">
            <label className="mb-2 font-mono w-[30rem]">
              Select Word Count:
              <select
                value={wordCount}
                onChange={handleWordCountChange}
                className="ml-2 p-1 border border-gray-300 rounded font-mono"
              >
                <option value={5}>5 words</option>
                <option value={10}>10 words</option>
                <option value={20}>20 words</option>
                <option value={30}>30 words</option>
                <option value={50}>50 words</option>
              </select>
            </label>

            <div className="flex flex-row justify-between items-center mb-3 mt-3">
              <label className="mb-2 font-mono w-[30rem]">
                Select Timer (Minutes):
                <select
                  value={timerLimit}
                  onChange={handleTimerLimitChange}
                  className="ml-2 p-1 border border-gray-300 rounded font-mono"
                >
                  <option value={2}>2 minutes</option>
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                </select>
              </label>
            </div>

            {/* Tip Section */}
            <div className="flex flex-col p-5 border-2 mx-4 w-[30rem]">
              <h3 className="font-mono text-lg mb-2">Typing Tip</h3>
              {isTipLoading ? (
                <p>Loading tip...</p>
              ) : (
                <p className="font-mono text-white">{typingTip}</p>
              )}
            </div>
          </div>

          <p
            className="text-lg mb-4 mt-2 justify-center items-center border-2 font-mono rounded-md p-5 w-[48rem]
          
          border-gray-300 "
          >
            {isTextLoaded ? currentText : "Loading text..."}
          </p>

          <input
            className="border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 font-mono text-lg p-3 w-full"
            type="text"
            value={userInput}
            onChange={handleInputChange}
            disabled={isTimerFinished || !isTextLoaded} // Disable input after timer ends
          />

          <div className="flex items-center gap-3 justify-between mt-4 mx-4">
            <button
              className="bg-gray-500-500 text-white font-semibold p-2 rounded font-mono hover:bg-red-600"
              onClick={handleRestart}
            >
              Restart Test
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white font-semibold p-2 rounded font-mono hover:bg-blue-600"
            >
              Submit
            </button>
          </div>
        </div>
        {/* Test completed Info */}
        {!isTyping && userInput && (
          <p className="text-center mt-4 text-green-600">Test completed!</p>
        )}

        {/* Timer Info */}
        <p className="mt-4">Time Left: {timerLimit * 60 - time}s</p>

        {/* On-screen keyboard layout (only visible on large screens) */}
        <div className="hidden lg:block mt-10">
          <div className="flex flex-col items-center ">
            {renderRow(["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"])}
            {renderRow(["a", "s", "d", "f", "g", "h", "j", "k", "l"])}
            {renderRow(["z", "x", "c", "v", "b", "n", "m"])}
          </div>
        </div>

        <div>
          <div className="w-screen flex flex-col items-center p-4">
            {/* Progress Bar */}
            <div className="w-full bg-gray-300 rounded h-4 mt-4 max-w-lg">
              <div
                style={{ width: `${progress}%` }}
                className="h-full bg-blue-500 rounded"
              ></div>
            </div>

            <div className="mt-2 text-center font-mono">
              Progress: {Math.round(progress)}%
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TypingSpeedTest;
