import React, { useState } from "react";
import axios from "axios"; // import axios
import "./ChatBot.css";

const ChatBox = ({ onClose }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! What can I help you with today?" }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
  if (!input.trim()) return;

  setMessages([...messages, { from: "user", text: input }]);
  setLoading(true);

  try {
    const res = await fetch(
  `${import.meta.env.VITE_API_URL}/api/gpt/query`, 
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: input })
  }
);

    const data = await res.json();
    setMessages(prev => [...prev, { from: "bot", text: data.result }]);
  } catch (err) {
    setMessages(prev => [...prev, { from: "bot", text: "Error generating response." }]);
  }

  setInput("");
  setLoading(false);
};

  return (
    <div className="chatbox">
      <div className="chatbox-header">
        <span>ChatBot</span>
        <button onClick={onClose}>X</button>
      </div>
      <div className="chatbox-body">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-msg ${msg.from}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="chat-msg bot">Loading...</div>}
      </div>
      <div className="chatbox-footer">
        <input
          type="text"
          placeholder="Type your query..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} disabled={loading}>
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
