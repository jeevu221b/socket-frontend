import React, { useState, useEffect } from "react";
import "./App.css";
import io from "socket.io-client";
import Login from "./components/Login";
import { useLogin } from "./contexts/LoginContext";


const card = {
  id: "card123",
  name: "Time Freeze",
  appliesTo: "opponent",
  type: "time-manipulator",
  ability: "add",
  value: 5,
}

const card1 = {
  id: "card345",
  name: "Hide Question",
  appliesTo: "opponent",
  type: "power-card",
  ability: "subtract",
  value: 10,
}

// const sessions = {
//   sessionId123: {
//     users: [
//       {
//         socketId: "socketId1",
//         userId: "userId1",
//         username: "PlayerOne",
//         isOnline: true,
//         score: 100,
//         lastRound: 1,
//         imageName: "player1.png",
//         rank: 1,
//         answerState: "notAnswered",
//         lastQuestionScore: 0,
//         streak: { score: 5, index: 2, streakIndex: 1 },
//         isHost: true,
//       },
//       {
//         socketId: "socketId2",
//         userId: "userId2",
//         username: "PlayerTwo",
//         isOnline: true,
//         score: 80,
//         lastRound: 1,
//         imageName: "player2.png",
//         rank: 2,
//         answerState: "notAnswered",
//         lastQuestionScore: 0,
//         streak: { score: 3, index: 1, streakIndex: -1 },
//         isHost: false,
//       },
//       {
//         socketId: "socketId1",
//         userId: "123",
//         username: "PlayerThree",
//         isOnline: true,
//         score: 100,
//         lastRound: 1,
//         imageName: "player3.png",
//         rank: 3,
//         answerState: "notAnswered",
//         lastQuestionScore: 0,
//         streak: { score: 5, index: 2, streakIndex: 1 },
//         isHost: true,
//       },
//     ],
//     round: 0,
//     gameStatus: "running",
//     hasPlayed: false,
//     category: { name: "General Knowledge", value: "general" },
//     subcategory: { name: "Science", value: "science" },
//     level: { name: "Easy", value: "easy" },
//   },
// }

let sessions


function App() {
  
  const SOCKET_URL = "http://localhost:5000/"; // Updated port to match
const { token } = useLogin();
const [socket, setSocket] = useState(null);

// Initialize socket connection
useEffect(() => {
  const newSocket = io(SOCKET_URL, {
    extraHeaders: {
      'Authorization': token
    }
  });
  setSocket(newSocket);

  // Cleanup on unmount
  return () => {
    if (newSocket) newSocket.disconnect();
  };
}, [token]); // Only re-run if token changes

// Move all socket event listeners to a separate useEffect that depends on socket
useEffect(() => {
  if (!socket) return; // Guard clause if socket isn't initialized yet

  // Handle joining room confirmation
  socket.on("joinedRoom", () => {
    setIsInLobby(true);
    setShowStartButton(true);
  });

  // Handle user list updates
  socket.on("roomUsers", (users) => {
    sessions = users
    setUsers(users);
    // console.log(sessions)
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

  socket.on("card-used", (text)=>{
    console.log("-------------card-used------------")
  })    
  // Handle game over notifications
  socket.on("gameOver", (message) => {
    alert(message);
    window.location.reload(); // Reload the page to restart the game
  });

  // Add new listener for score updates
  socket.on("scoreUpdate", (updatedUsers) => {
    setUsers(updatedUsers);
  });

  socket.on("onAnswer", (updatedUsers) => {
    setUsers(updatedUsers);
  });

  return () => {
    socket.off("joinedRoom");
    socket.off("roomUsers");
    socket.off("newQuestion");
    socket.off("pinged");
    socket.off("timerUpdate");
    socket.off("gameOver");
    socket.off("scoreUpdate");
    socket.off("onAnswer");
  };
}, [socket]);

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
    if (!socket) return;
    if (username && roomId) {
      socket.emit("joinRoom", {username, sessionId:roomId});
      console.log("Room Joined")
      socket.emit("isReadyNow", {sessionId:roomId})
    } else {
      alert("Please enter both username and room ID");
    }
  };

  // Function to start the game
  const startGame = () => {
  };
  
  //Function to emit useAbility event
  const useAbility = ()=>{
    socket.emit("startGame", roomId);
    socket.emit("use-card", card1, roomId,"66d444efd4441a8d7233ebae", sessions)
  }

  const onAnswer = ()=>{
    socket.emit("onAnswer", {sessionId:roomId, answer:true})
  }

  const onIncorrectAnswer = ()=>{
    socket.emit("onAnswer", {sessionId:roomId, answer:false})
  }
  // Ping button handler
  const handlePing = () => {
    socket.emit("pingButton", roomId, {
      username: "All the users in the room",
      message: "You've been pinged!",
    });
  };

  return (
    <div className="App">
      <h1>Welcome to the Quiz Game!</h1>
      <h2>{token || "NOT SET"}</h2>
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
          {users?.users?.map((user, index) => (
            <li key={index}>
              {user.username} - Score: {user.score || 0}
            </li>
          ))}
        </ul>
        <button onClick= {useAbility}>Use Ability</button>
        <button onClick= {onAnswer}>Answer</button>
        <button onClick= {onIncorrectAnswer}>Incorrect Answer</button>
          <Login />
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