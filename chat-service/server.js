const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const Redis = require("ioredis");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const redis = new Redis({
  host: "redis",
  port: 6379
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("chatMessage", (msg) => {
    redis.publish("chat", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Receive messages from Redis and broadcast
redis.subscribe("chat");
redis.on("message", (_, message) => {
  io.emit("chatMessage", message);
});

app.get("/", (req, res) => {
  res.send("Chat server running...");
});

server.listen(3000, () => console.log("Chat-service running on port 3000"));

