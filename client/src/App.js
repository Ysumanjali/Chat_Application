import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:3000');

    ws.current.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    return () => {
      ws.current.close();
    };
  }, []);

  const handleSend = () => {
    if (username && message) {
      ws.current.send(JSON.stringify({ username, message }));
      setMessage('');
    }
  };

  return (
    <div className="chat-container">
      <h1>Real-Time Chat</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSend}>Send</button>
      <div className="chat-history">
        <h2>Chat History:</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>
              <strong>{msg.username}: </strong>{msg.message}
              <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
