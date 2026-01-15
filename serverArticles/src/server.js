const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const articlesRouter = require('./controllers/articlesController');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

app.use('/api/articles', articlesRouter);

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
