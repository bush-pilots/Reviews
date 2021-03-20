const express = require('express');
const cors = require('cors');
const morgan = require('morgan')('dev');
const path = require('path');
const queries = require('./database/index.js');

const PORT = 3000;
const app = express();

app.use(morgan);
app.use(cors());
app.use(express.json());
// app.use(express.static(path.join(__dirname, '..', 'public')));

// this request will also include sort, page, and count query parameters
app.get('/reviews', queries.getReviews);
app.get('/reviews/meta', queries.calculateMeta);
app.post('/reviews', queries.postReview);
app.put('/reviews/:review_id/report', queries.reportReview);
app.put('/reviews/:review_id/helpful', queries.incrementHelpfulness);

app.listen(PORT, () => {
  console.log(`Server listening at localhost:${PORT}!`);
});
