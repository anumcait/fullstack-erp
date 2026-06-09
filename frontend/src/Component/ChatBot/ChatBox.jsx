import React, { useState, useEffect, useRef } from "react";
import axios from "axios"; // import axios
import "./ChatBot.css";
import { useNavigate } from "react-router-dom";

const ChatBox = ({ onClose }) => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! I am your HR Assistant. How can I help you today?",
      options: ["Apply for Leave", "On Duty Application", "Apply for Tour", "Check Attendance"]
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (overrideText = null) => {
    // If overrideText is an event object (from onClick), ignore it and use input state
    const textToSend = (typeof overrideText === "string") ? overrideText : input;
    if (!textToSend || typeof textToSend !== "string" || !textToSend.trim()) return;

    setMessages([...messages, { from: "user", text: textToSend }]);
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/gpt/query`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: textToSend })
        }
      );

      const data = await res.json();
      setMessages(prev => [...prev, { from: "bot", text: data.result, options: data.options || [], isError: data.isError }]);

      // Handle Automated Navigation
      if (data.navigate) {
        navigate(data.navigate);
        if (onClose) onClose();
      }
    } catch (err) {
      setMessages(prev => [...prev, { from: "bot", text: "Error generating response." }]);
    }

    setInput("");
    setLoading(false);
  };

  const handleOptionClick = (option) => {
    sendMessage(option);
  };

  return (
    <div className="chatbox">
      <div className="chatbox-header">
        <span>ChatBot</span>
        <button onClick={onClose}>X</button>
      </div>
      <div className="chatbox-body">
        {messages.map((msg, idx) => (
          <div key={idx} className="msg-container">
            <div className={`chat-msg ${msg.from} ${msg.isError ? "error-msg" : ""}`}>
              {msg.text}
            </div>
            {msg.from === "bot" && msg.options && msg.options.length > 0 && idx === messages.length - 1 && (
              <div className="options-container">
                {msg.options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    className="option-btn"
                    onClick={() => handleOptionClick(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && <div className="chat-msg bot">Loading...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatbox-footer">
        <input
          type="text"
          placeholder="Type your query..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button id="chat-send-btn" onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;


// import React, { useState } from "react";
// import "./ChatBot.css";

// const ChatBox = ({ onClose }) => {
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState([
//     { from: "bot", text: "Hi! What can I help you with today?" }
//   ]);

//   const sendMessage = () => {
//     if (!input.trim()) return;
//     setMessages([...messages, { from: "user", text: input }]);
//     setInput("");

//     // Simple bot reply logic
//     setTimeout(() => {
//       setMessages(prev => [
//         ...prev,
//         { from: "bot", text: "Thanks for your response!" }
//       ]);
//     }, 1000);
//   };

//   return (
//     <div className="chatbox">
//       <div className="chatbox-header">
//         <span>ChatBot</span>
//         <button onClick={onClose}>X</button>
//       </div>
//       <div className="chatbox-body">
//         {messages.map((msg, idx) => (
//           <div key={idx} className={`chat-msg ${msg.from}`}>
//             {msg.text}
//           </div>
//         ))}
//       </div>
//       <div className="chatbox-footer">
//         <input
//           type="text"
//           placeholder="Type your answer..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//         />
//         <button onClick={sendMessage}>Send</button>
//       </div>
//     </div>
//   );
// };

// export default ChatBox;
