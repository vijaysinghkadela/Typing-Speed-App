import { useState, useEffect } from "react";

const TypingSpeedTest = () => {
  const [currentText, setCurrentText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [time, setTime] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [wpm, setWPM] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [isTextLoaded, setIsTextLoaded] = useState(false);
  const [wordCount, setWordCount] = useState(5); // default word count

  // Fetch text from API based on word count
  useEffect(() => {
    fetchNewText(wordCount);
  }, [wordCount]);

  const fetchNewText = (count) => {
    fetch(
      `https://baconipsum.com/api/?type=all-meat&paras=1&sentences=${count}`
    )
      .then((response) => response.json())
      .then((data) => {
        setCurrentText(data[0]);
        setIsTextLoaded(true); // Ensure text is loaded before typing
      })
      .catch((error) => console.error("Error fetching text:", error));
  };

  const handleWordCountChange = (e) => {
    setWordCount(Number(e.target.value));
    setIsTextLoaded(false);
  };

  // Timer logic
  useEffect(() => {
    let timer;
    if (isTyping) {
      timer = setInterval(() => setTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isTyping]);

  const handleInputChange = (e) => {
    const input = e.target.value;
    setUserInput(input);

    // Start timer on first keystroke
    if (!isTyping && isTextLoaded) setIsTyping(true);

    // Real-time accuracy checking
    const correctChars = input
      .split("")
      .filter((char, i) => char === currentText[i]).length;
    const calculatedAccuracy =
      input.length > 0 ? Math.round((correctChars / input.length) * 100) : 0;
    setAccuracy(calculatedAccuracy);

    // Calculate WPM continuously
    calculateResults();

    // Stop typing when input matches the target text
    if (input === currentText) {
      setIsTyping(false);
      calculateResults();
    }
  };

  const calculateResults = () => {
    if (time === 0) return;

    const wordCount = currentText.split(" ").length;
    const minutes = time / 60;
    setWPM(Math.round(wordCount / minutes));
  };

  const handleRestart = () => {
    setUserInput("");
    setTime(0);
    setIsTyping(false);
    setWPM(0);
    setAccuracy(0);
    setIsTextLoaded(false);
    fetchNewText(wordCount);
  };

  const handleSubmit = () => {
    alert(`WPM: ${wpm}, Accuracy: ${accuracy}% , Timer: ${time}s`);
    setUserInput("");
    setTime(0);
    setIsTyping(false);
    setWPM(0);
    setAccuracy(0);
    setIsTextLoaded(false);
    fetchNewText(wordCount);
  };

  return (
    <>
      <div className="w-screen overflow-hidden flex flex-col">
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

        <div className="flex flex-col items-center p-3 max-w-lg mx-auto">
          <label className="mb-2 font-mono">
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
            </select>
          </label>

          <p className="text-lg mb-4 mt-2 justify-center items-center border-2 font-mono rounded-md p-5 border-gray-300">
            {isTextLoaded ? currentText : "Loading text..."}
          </p>

          <input
            className="border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 font-mono text-lg p-3 w-full"
            type="text"
            value={userInput}
            onChange={handleInputChange}
            disabled={!isTextLoaded}
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
              className="bg-blue-500 text-white font-semibold p-2 rounded font-mono  hover:bg-blue-600"
            >
              Submit
            </button>
          </div>
        </div>

        {!isTyping && userInput && (
          <p className="text-center mt-4 text-green-600">Test completed!</p>
        )}
      </div>
    </>
  );
};

export default TypingSpeedTest;
