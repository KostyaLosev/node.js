const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const articlesRouter = require('./controllers/articlesController');
const http = require('http');
const path = require('path');
const socket = require('./socket');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const server = http.createServer(app);

const io = socket.init(server, { cors: { origin: '*' } });

app.use('/api/articles', articlesRouter);

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
