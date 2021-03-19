const { Pool, Client } = require('pg')

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ratingsandreviews',
  password: 'postgres',
  port: 5432,
})

// DATABASE QUERY FUNCTIONS HERE:
const testQuery = (req, res) => {
  pool.query(`SELECT * FROM reviews WHERE id < 5;`)
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

// send back 'count' number of review for the requested product_id
// may need to perform some sorting here down the road to optimize the reviews that are sent back to the client
const getReviews = (req, res) => {
  console.log('queries in request: ', req.query);
  const product_id = req.query.product_id
  const count = Number(req.query.count);

  // query the database for 'count' number of reviews for the given product
  const queryString = `SELECT * from reviews
                       WHERE product_id=${product_id}
                       ORDER BY review_id LIMIT ${count};`

  pool.query(queryString)
    .then((response) => {
      // returns an array of review objects
      let reviews = response.rows;
      reviews.forEach((review) => review.photos = [])
      res.send(response.rows);
    }).catch((err) => {
      console.error(err);
      res.sendStatus(500);
    })
}

// adds a row to the reviews table using data provided in client request object
const postReview = (req, res) => {
  reviewObj = req.body;
  let fullDate = new Date();
  reviewObj.date = fullDate.toISOString().slice(0, 10);
  reviewObj.reported = false;
  reviewObj.helpfulness = 0;
  console.log('reviewObj: ', reviewObj);

  const queryString = `INSERT INTO reviews (
                          product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, helpfulness)
                          VALUES (${reviewObj.product_id}, ${reviewObj.rating}, '${reviewObj.date}', '${reviewObj.summary}', '${reviewObj.body}', ${reviewObj.recommend}, ${reviewObj.reported}, '${reviewObj.name}', '${reviewObj.email}', ${reviewObj.helpfulness})
                          RETURNING review_id;`

  console.log('queryString: ', queryString);
  pool.query(queryString)
    .then((response) => {
      res.send(response);
    }).catch((err) => {
      console.error('there was an error in the insert query: ', err);
      res.sendStatus(500);
    });

  // updates the ratings meta info accordingly
}

const reportReview = (req, res) => {
  const { review_id } = req.params;

  let queryString = `UPDATE reviews
                     SET reported = true
                     WHERE review_id=${review_id};`

  pool.query(queryString)
    .then((response) => {
      console.log('db response for reported: ', response);
      res.send(response);
    }).catch((err) => {
      console.log(err);
      res.sendStatus(500);
    })
}

const incrementHelpfulness = (req, res) => {
  const { review_id } = req.params;

  let queryString = `UPDATE reviews
                     SET helpfulness = helpfulness + 1
                     WHERE review_id=${review_id}
                     RETURNING helpfulness;`

  pool.query(queryString)
    .then((response) => {
      res.send(response);
    }).catch((err) => {
      console.log(err);
      res.sendStatus(500);
    })
}

const calculateMeta = (req, res) => {
  const { product_id } = req.query;

  /* needs to return an object with:
  characteristics: {Fit: {…}, Length: {…}, Comfort: {…}, Quality: {…}},
  product_id: "18112"
  ratings: {4: "1", 5: "1"}
  recommended: {true: "2"}
  */
 const returnObj = { product_id: product_id }

 var starMeta = {};
 var queries = [];
 var recommended = {};

  for (let i = 5; i > 0; i--) {
    queries.push(new Promise((resolve, reject) => {
      const queryString = `SELECT * FROM reviews
        WHERE product_id=${product_id} AND rating=${i}
        LIMIT 50;`;
      pool.query(queryString)
        .then((response) => {
          starMeta[i] = response.rows.length;
          resolve();
        }).catch((err) => {
          reject(err);
        });
    }));
  }

  queries.push(new Promise((resolve, reject) => {
    const queryString = `SELECT COUNT(recommend)
                          FROM reviews
                          WHERE product_id=${product_id} AND recommend=true;`
    pool.query(queryString)
    .then((response) => {
      recommended['true'] = response.rows[0].count;
      resolve();
    }).catch((err) => {
      reject(err);
    })
  }))

  queries.push(new Promise((resolve, reject) => {
    const queryString = `SELECT COUNT(recommend)
                          FROM reviews
                          WHERE product_id=${product_id} AND recommend=false;`
    pool.query(queryString)
    .then((response) => {
      recommended['false'] = response.rows[0].count;
      resolve();
    }).catch((err) => {
      reject(err);
    })
  }))

  Promise.all(queries).then((values) => {
    returnObj.ratings = starMeta;
    returnObj.recommended = recommended;
    res.send(returnObj);
  }).catch((err)=> console.log(err))
}

module.exports = {
  testQuery,
  getRatings,
  getReviews,
  postReview,
  reportReview,
  incrementHelpfulness,
  calculateMeta,
};
