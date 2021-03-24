/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
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

const calculateMeta = async (req, res) => {
  const returnObj = {};
  const { product_id } = req.query;

  const starMeta = {};
  const queries = [];
  const recommended = {};

  // calculate starMeta
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

  // calculate recommended counts
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

  // calculate characteristic averages for each characteristic of product
  const getCharacteristicAverages = () => {
    const charObj = {};
    const namedCharObj = {};

    queries.push(pool.query(`SELECT * FROM reviews WHERE product_id='${product_id}'`)
      .then((response) => {
        const reviews = response.rows;
        return Promise.all(reviews.map((review) => pool.query(`SELECT characteristic_id, value FROM characteristics_reviews WHERE review_id=${review.review_id}`)
          .then((joinRes) => {
            joinRes.rows.forEach((row) => {
              if (charObj[row.characteristic_id]) {
                // eslint-disable-next-line max-len
                charObj[row.characteristic_id] = (charObj[row.characteristic_id] + Number(row.value)) / 2;
              } else {
                charObj[row.characteristic_id] = Number(row.value);
              }
            });
            const charQueries = [];
            for (const key in charObj) {
              charQueries.push(
                pool.query(`SELECT id, name FROM characteristics WHERE id=${key}`),
              );
            }

            return (Promise.all(charQueries).then((resolved) => {
              for (let i = 0; i < resolved.length; i += 1) {
                namedCharObj[resolved[i].rows[0].name] = {
                  id: resolved[i].rows[0].id,
                  value: charObj[resolved[i].rows[0].id],
                };
              }
              returnObj.characteristics = namedCharObj;
            }));
          }).catch((err) => {
            console.error(err);
          })));
      }));
  };
  getCharacteristicAverages();

  Promise.all(queries).then(() => {
    returnObj.product_id = product_id;
    returnObj.ratings = starMeta;
    returnObj.recommended = recommended;
    res.send(returnObj);
  }).catch((err) => console.log(err));
};

module.exports = {
  getReviews,
  postReview,
  reportReview,
  incrementHelpfulness,
  calculateMeta,
};
