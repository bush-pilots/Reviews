const { Pool, Client } = require('pg')

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
})

// DATABASE QUERY FUNCTIONS HERE:
// SELECT NOW()
// SELECT datname FROM pg_database;
// SELECT * from information_schema.tables
const testQuery = (req, res) => {
  pool.query(`SELECT * FROM reviews;`)
    .then((response) => {
      console.log('SUCCESS!: ', response);
      res.send(response);
    }).catch((err) => {
      console.error('issue with testQuery: ', err);
      res.sendStatus(500);
    })
}

// getRatings
const getRatings = (product_id) => {
  // should return the following information for the input product:
    // # of recommended_true ratings
    // # of recommended_false ratings
    // avg comfort rating
    // avg fit rating
    // avg size rating
    // avg width rating
    // avg ____ rating (any other characteristic columns)
}

const getReviews = (product_id, count) => {
  // should return 'count' number of review objects for the input product_id


  // may need to perform some sorting here down the road to optimize the reviews that are sent back to the client
}

const postReview = (product_id, reviewObj) => {
  // adds a row to the reviews table with information in the reviewObj

  // updates the ratings meta info accordingly
}

module.exports = {
  // export query functions here
  testQuery,
  getRatings,
  getReviews,
  postReview,
};


// pool.query('SELECT NOW()', (err, res) => {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log('response from DB: ', res);
//   }
//   pool.end()
// })