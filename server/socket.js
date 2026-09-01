// Simple singleton so any controller can emit events without
// needing a direct reference to the HTTP server / io instance.
let ioInstance = null;
let onlineCount = 0;

function initIO(server) {
  const { Server } = require("socket.io");
  ioInstance = new Server(server, {
    cors: { origin: "*" },
  });

  ioInstance.on("connection", (socket) => {
    onlineCount += 1;
    ioInstance.emit("presence:count", onlineCount);

    socket.on("disconnect", () => {
      onlineCount = Math.max(0, onlineCount - 1);
      ioInstance.emit("presence:count", onlineCount);
    });
  });

  return ioInstance;
}

function getIO() {
  if (!ioInstance) throw new Error("Socket.io not initialized yet");
  return ioInstance;
}

module.exports = { initIO, getIO };
