const socket = require('../socket');

function notifyArticleUpdate({ articleId, type, message }) {
  try {
    const io = socket.getIO();
    io.emit('article-updated', { articleId, type, message });
  } catch (err) {
    console.error('Failed to send socket notification', err.message || err);
  }
}

module.exports = { notifyArticleUpdate };
