import React from 'react'

const KeyVisualizer = ({ activeKey }) => {
  const rows = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
  ];

  return (
    <div className="flex flex-col items-center space-y-2 mt-4">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1">
          {row.map((key) => (
            <div
              key={key}
              className={`w-10 h-10 flex items-center justify-center border rounded ${
                activeKey === key ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {key.toUpperCase()}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};


export default KeyVisualizer;