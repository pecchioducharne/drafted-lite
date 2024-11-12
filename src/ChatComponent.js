import React, { useEffect, useState } from "react";
import "./Chat.css";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Sample messages for now
    setMessages([
      { sender: "Quinn", text: "Hello, how are you?" },
      { sender: "You", text: "I'm good, thanks! How about you?" },
      { sender: "Quinn", text: "I'm doing well, thanks!" },
    ]);
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { sender: "You", text: newMessage }]);
      setNewMessage("");
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-window">
        <div className="chat-header">
          <h2>Quinn</h2>
          <p className="email">qcho@chapman.edu</p>
          <button className="send-email-button">Send Email</button>
        </div>

        <div className="messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.sender === "You" ? "my-message" : ""}`}
            >
              <p>{message.text}</p>
            </div>
          ))}
        </div>

        <div className="input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button onClick={handleSendMessage} className="send-button">Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
