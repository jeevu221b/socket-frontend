import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";


const card = {
  id: "card123",
  name: "Time Freeze",
  appliesTo: "opponent",
  type: "time-manipulator",
  ability: "add",
  value: 5,
}

const sessions = {
  sessionId123: {
    users: [
      {
        socketId: "socketId1",
        userId: "userId1",
        username: "PlayerOne",
        isOnline: true,
        score: 100,
        lastRound: 1,
        imageName: "player1.png",
        rank: 1,
        answerState: "notAnswered",
        lastQuestionScore: 0,
        streak: { score: 5, index: 2, streakIndex: 1 },
        isHost: true,
      },
      {
        socketId: "socketId2",
        userId: "userId2",
        username: "PlayerTwo",
        isOnline: true,
        score: 80,
        lastRound: 1,
        imageName: "player2.png",
        rank: 2,
        answerState: "notAnswered",
        lastQuestionScore: 0,
        streak: { score: 3, index: 1, streakIndex: -1 },
        isHost: false,
      },
      {
        socketId: "socketId1",
        userId: "123",
        username: "PlayerThree",
        isOnline: true,
        score: 100,
        lastRound: 1,
        imageName: "player3.png",
        rank: 3,
        answerState: "notAnswered",
        lastQuestionScore: 0,
        streak: { score: 5, index: 2, streakIndex: 1 },
        isHost: true,
      },
    ],
    round: 0,
    gameStatus: "running",
    hasPlayed: false,
    category: { name: "General Knowledge", value: "general" },
    subcategory: { name: "Science", value: "science" },
    level: { name: "Easy", value: "easy" },
  },
}





const SOCKET_URL = "http://localhost:5000/"; // Updated port to match
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InB1bmtAZ21haWwuY29tIiwidXNlcklkIjoiNjZkNDQ0ZWZkNDQ0MWE4ZDcyMzNlYmFlIiwiaWF0IjoxNzMwMjMwMDUwLCJleHAiOjE3MzE1MjYwNTB9.jzC4iEYC0D9IEJpAyKDnePK7eUU5mtrSuC_UMSwXYMA"

const socket = io(SOCKET_URL, {
  extraHeaders: {
    'Authorization': TOKEN
    // 'Custom-Header': 'custom-value'
  }
});

function App() {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isInLobby, setIsInLobby] = useState(true);
  const [users, setUsers] = useState([]);
  const [question, setQuestion] = useState("Question will appear here");
  const [timeLeft, setTimeLeft] = useState(7);
  const [pingMessage, setPingMessage] = useState("");
  const [showStartButton, setShowStartButton] = useState(false);

  // Function to join a room
  const joinRoom = () => {
    if (username && roomId) {
      socket.emit("joinRoom", {username, sessionId:roomId});
      socket.emit("use-card", card, roomId, "66d444efd4441a8d7233ebae", sessions)
    } else {
      alert("Please enter both username and room ID");
    }
  };

  // Function to start the game
  const startGame = () => {
    socket.emit("startGame", roomId);
  };


  // Ping button handler
  const handlePing = () => {
    socket.emit("pingButton", roomId, {
      username: "All the users in the room",
      message: "You've been pinged!",
    });
  };

  useEffect(() => {
    // Handle joining room confirmation
    socket.on("joinedRoom", () => {
      setIsInLobby(true);
      setShowStartButton(true);
    });

    // Handle user list updates
    socket.on("updateUserList", (users) => {
      setUsers(users);
    });

    // Handle receiving a new question
    socket.on("newQuestion", (question) => {
      setQuestion(question.question);
      setPingMessage(""); // Clear previous ping message
      setIsInLobby(false);
    });

    // Handle ping notifications
    socket.on("pinged", (message) => {
      console.log(message);
      setPingMessage(message.toString());
    });

    // Handle timer updates
    socket.on("timerUpdate", (timeLeft) => {
      setTimeLeft(timeLeft);
    });

    // Handle game over notifications
    socket.on("gameOver", (message) => {
      alert(message);
      window.location.reload(); // Reload the page to restart the game
    });

    return () => {
      socket.off("joinedRoom");
      socket.off("updateUserList");
      socket.off("newQuestion");
      socket.off("pinged");
      socket.off("timerUpdate");
      socket.off("gameOver");
    };
  }, []);

  return (
    <div className="App">
      <h1>Welcome to the Quiz Game!</h1>
      <div id="lobby" style={{ display: isInLobby ? "block" : "none" }}>
        <input
          type="text"
          id="username"
          placeholder="Enter Your Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="text"
          id="roomId"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button id="joinButton" onClick={joinRoom}>
          Join Room
        </button>
        {showStartButton && (
          <button id="startButton" onClick={startGame}>
            Play
          </button>
        )}
        <ul id="userList">
          {users.map((user, index) => (
            <li key={index}>{user.username}</li>
          ))}
        </ul>
      </div>
      <div id="game" style={{ display: isInLobby ? "none" : "block" }}>
        <h2 id="question">{question}</h2>
        <h3 id="timer">Time Left: {timeLeft}</h3>
        <button id="pingButton" onClick={handlePing}>
          Ping
        </button>
        <div 
          id="pingMessage" 
          style={{ 
            color: "red", 
            fontWeight: "bold" 
          }}
        >
          {pingMessage}
        </div>
      </div>
    </div>
  );
}

export default App;