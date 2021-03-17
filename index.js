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

// app.get('/ratings/:product_id', queries.getAll);
// app.post('/api/cows', queries.create);
// app.put('/api/cows/:id', queries.update);
// app.delete('/api/cows/:id', queries.deleteCow);

app.listen(PORT, () => {
  console.log(`Server listening at localhost:${PORT}!`);
});