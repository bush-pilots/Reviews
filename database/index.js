const { Pool, Client } = require('pg')

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ratingsandreviews',
  password: 'postgres',
  port: 5432,
})
pool.query('SELECT NOW()', (err, res) => {
  console.log(err, res)
  pool.end()
})

// DATABASE QUERY FUNCTIONS HERE:

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
  getRatings,
  getReviews,
  postReview,
};
