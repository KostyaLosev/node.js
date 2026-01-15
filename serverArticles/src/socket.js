let ioInstance = null;

function init(server, opts = {}) {
  const { Server } = require('socket.io');
  if (ioInstance) return ioInstance;
  ioInstance = new Server(server, opts);

  ioInstance.on('connection', socket => {
    console.log('Socket connected:', socket.id);
    socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
  });

  return ioInstance;
}

function getIO() {
  if (!ioInstance) throw new Error('Socket.io not initialized. Call init(server) first.');
  return ioInstance;
}

module.exports = { init, getIO };
