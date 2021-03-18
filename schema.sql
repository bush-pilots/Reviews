-- Create table:
-- DROP DATABASE IF EXISTS ratingsandreviews;

-- CREATE DATABASE ratingsandreviews;
-- USE ratingsandreviews; THIS LINE DOESNT WORK...
-- DROP TABLE IF EXISTS reviews;

-- DROP TABLE IF EXISTS reviews CASCADE;
-- CREATE TABLE reviews(
--   id SERIAL PRIMARY KEY,
--   product_id integer,
--   rating smallint,
--   date date,
--   summary varchar(200),
--   body varchar(1000),
--   recommend boolean,
--   reported boolean,
--   reviewer_name varchar(100),
--   reviewer_email varchar(50),
--   response varchar(200),
--   helpfulness smallint
-- );

-- DROP TABLE IF EXISTS photos CASCADE;
-- CREATE TABLE photos(
--   id SERIAL PRIMARY KEY,
--   review_id integer,
--   url varchar(500),
--   CONSTRAINT review_id
--       FOREIGN KEY(review_id)
-- 	  REFERENCES reviews(id)
-- );
-- COPY photos FROM '/private/tmp/reviews_photos.csv' DELIMITER ',' CSV HEADER;

-- DROP TABLE IF EXISTS characteristics CASCADE ;
-- CREATE TABLE characteristics(
--   id integer PRIMARY KEY,
--   product_id integer,
--   name VARCHAR(25)
-- );

-- COPY characteristics FROM '/private/tmp/characteristics.csv' DELIMITER ',' CSV HEADER;


DROP TABLE IF EXISTS characteristics_reviews CASCADE;
CREATE TABLE characteristics_reviews(
  id SERIAL PRIMARY KEY,
  characteristic_id integer,
  review_id integer,
  value decimal,

  CONSTRAINT review_id
      FOREIGN KEY(review_id)
	  REFERENCES reviews(id),
  CONSTRAINT characteristic_id
    FOREIGN KEY(characteristic_id)
	REFERENCES characteristics(id)
);
COPY characteristics_reviews FROM '/private/tmp/characteristic_reviews.csv' DELIMITER ',' CSV HEADER;

-- DROP TABLE IF EXISTS ratings;
-- CREATE TABLE ratings(
--   product_id integer,
--   recommended_true integer,
--   recommended_false integer
-- );
-- INSERT INTO reviews (product_id, rating, recommend, response, summary, reviewer_name, body)
-- VALUES (88888, 4, true, 'response here', 'summary here', 'Scottland123', 'this is the body of my review');

-- Copy CSV data, with appropriate munging:
-- COPY reviews FROM '/private/tmp/reviews.csv' DELIMITER ',' CSV HEADER;