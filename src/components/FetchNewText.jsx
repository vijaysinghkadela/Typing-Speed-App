import React from "react";

const FetchNewText = ({ count, setText, setIsTextLoaded }) => {
  const fetchNewText = () => {
    const sentences = Math.ceil(count / 10); // Calculate required sentences
    fetch(
      `https://baconipsum.com/api/?type=all-meat&paras=1&sentences=${sentences}`
    )
      .then((response) => response.json())
      .then((data) => {
        setText(data[0].split(" ").slice(0, count).join(" "));
        setIsTextLoaded(true);
      })
      .catch((error) => {
        console.error("Error fetching text:", error);
        setText("Sample text for testing purposes.");
        setIsTextLoaded(true);
      });
  };

  React.useEffect(() => {
    fetchNewText();
  }, [count]); // Run the fetch when the `count` changes

  return null; // This component is functional and does not render anything
};

export default FetchNewText;
