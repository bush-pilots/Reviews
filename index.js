const express = require('express');
const cors = require('cors');
const path = require('path');
const queries = require('./database/index.js');
const morgan = require('morgan')('dev');
const PORT = 3000;
const app = express();

app.use(morgan);
app.use(cors());
app.use(express.json());
// app.use(express.static(path.join(__dirname, '..', 'public')));

// this request will also include sort, page, and count query parameters
app.get('/test', queries.testQuery);
app.get('/reviews', queries.getReviews);
app.post('/reviews', queries.postReview);

app.listen(PORT, () => {
  console.log(`Server listening at localhost:${PORT}!`);
});