/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
/* eslint-disable camelcase */
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ratingsandreviews',
  password: 'postgres',
  port: 5432,
});

const getRatings = (product_id) => {
  /*
    Should return the following information for the given product_id:
      # of recommended_true ratings
      # of recommended_false ratings
      avg comfort rating
      avg fit rating
      avg size rating
      avg width rating
      avg ____ rating (any other characteristic columns)
  */
};

// Sends to client a specified number of reviews for a specified product_id
// Note: may need to perform some sorting here to optimize the reviews that are sent back
const getReviews = (req, res) => {
  const { product_id } = req.query;
  const count = Number(req.query.count);

  const reviewQuery = `SELECT *
                       FROM reviews
                       WHERE product_id='${product_id}'
                       LIMIT '${count}';`;

  pool.query(reviewQuery)
    .then((reviewsResponse) => {
      const promises = [];
      const reviews = reviewsResponse.rows;

      // Query db for associated photos
      reviews.forEach((review) => {
        promises.push(new Promise((resolve, reject) => {
          pool.query(`SELECT id, url FROM photos WHERE photos.review_id='${review.review_id}'`)
            .then((response) => {
              review.photos = response.rows;
              resolve();
            }).catch((err) => {
              console.error(err);
              reject();
            });
        }));
      });

      // Query db for associated characteristics and ratings
      reviews.forEach((review) => {
        const charQuery = `SELECT characteristic_id INTO TEMPORARY temp
                             FROM characteristics_reviews
                             WHERE characteristics_reviews.review_id='${review.review_id}';

                             SELECT value FROM characteristics_reviews
                             WHERE characteristics_reviews.review_id='${review.review_id}';

                             SELECT name, id FROM characteristics
                             WHERE id IN (SELECT characteristic_id FROM temp);

                             DROP TABLE temp;`;

        const characteristics = pool.query(charQuery)
          .then((response) => {
            const valueEntries = response[1].rows;
            review.characteristics = response[2].rows;
            // associate values from join table to corresponding characteristic
            for (let i = 0; i < valueEntries.length; i += 1) {
              review.characteristics[i].value = valueEntries[i].value;
            }
          });
        promises.push(characteristics);
      });

      // Execute all queries, wait for them to resolve, then send the reviews object back to client
      Promise.all(promises).then(() => {
        res.send(reviews);
      }).catch((err) => {
        console.log(err);
        res.sendStatus(500);
      });
    });
};

// Adds a row to the reviews table using data provided in client request object
const postReview = (req, res) => {
  const reviewObj = req.body;
  const fullDate = new Date();
  reviewObj.date = fullDate.toISOString().slice(0, 10);
  reviewObj.reported = false;
  reviewObj.helpfulness = 0;

  const queryString = `INSERT INTO reviews (
                       product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, helpfulness)
                       VALUES ('${reviewObj.product_id}', '${reviewObj.rating}', '${reviewObj.date}', '${reviewObj.summary}', '${reviewObj.body}', '${reviewObj.recommend}', '${reviewObj.reported}', '${reviewObj.name}', '${reviewObj.email}', '${reviewObj.helpfulness}')
                       RETURNING review_id;`;

  pool.query(queryString)
    .then((response) => {
      res.send(response);
    }).catch((err) => {
      console.error('there was an error in the insert query: ', err);
      res.sendStatus(500);
    });
};

const reportReview = (req, res) => {
  const { review_id } = req.params;

  const queryString = `UPDATE reviews
                     SET reported = true
                     WHERE review_id='${review_id}';`;

  pool.query(queryString)
    .then((response) => {
      console.log('db response for reported: ', response);
      res.send(response);
    }).catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
};

const incrementHelpfulness = (req, res) => {
  const { review_id } = req.params;

  const queryString = `UPDATE reviews
                     SET helpfulness = helpfulness + 1
                     WHERE review_id=${review_id}
                     RETURNING helpfulness;`;

  pool.query(queryString)
    .then((response) => {
      res.send(response);
    }).catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
};

const calculateMeta = (req, res) => {
  const { product_id } = req.query;

  /* Function incomplete -ultimately needs to return an object with:
      characteristics: {Fit: {…}, Length: {…}, Comfort: {…}, Quality: {…}},
      product_id: "18112"
      ratings: {4: "1", 5: "1"}
      recommended: {true: "2"}
  */
  const returnObj = { product_id };

  const starMeta = {};
  const queries = [];
  const recommended = {};

  for (let i = 5; i > 0; i -= 1) {
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
                          WHERE product_id=${product_id} AND recommend=true;`;
    pool.query(queryString)
      .then((response) => {
        recommended.true = response.rows[0].count;
        resolve();
      }).catch((err) => {
        reject(err);
      });
  }));

  queries.push(new Promise((resolve, reject) => {
    const queryString = `SELECT COUNT(recommend)
                          FROM reviews
                          WHERE product_id=${product_id} AND recommend=false;`;
    pool.query(queryString)
      .then((response) => {
        recommended.false = response.rows[0].count;
        resolve();
      }).catch((err) => {
        reject(err);
      });
  }));

  Promise.all(queries).then(() => {
    returnObj.ratings = starMeta;
    returnObj.recommended = recommended;
    res.send(returnObj);
  }).catch((err) => console.log(err));
};

module.exports = {
  getRatings,
  getReviews,
  postReview,
  reportReview,
  incrementHelpfulness,
  calculateMeta,
};
