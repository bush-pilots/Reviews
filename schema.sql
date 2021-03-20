-- Create table:
DROP DATABASE IF EXISTS ratingsandreviews;

CREATE DATABASE ratingsandreviews;
\c ratingsandreviews;

DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS characteristics CASCADE;
DROP TABLE IF EXISTS characteristics_reviews CASCADE;
DROP TABLE IF EXISTS ratings;

CREATE TABLE reviews(
  review_id SERIAL PRIMARY KEY,
  product_id integer,
  rating smallint,
  date date,
  summary varchar(200),
  body varchar(1000),
  recommend boolean,
  reported boolean,
  reviewer_name varchar(100),
  reviewer_email varchar(50),
  response varchar(200),
  helpfulness smallint
);

CREATE TABLE photos(
  id SERIAL PRIMARY KEY,
  review_id integer,
  url varchar(500),
  CONSTRAINT review_id
      FOREIGN KEY(review_id)
	  REFERENCES reviews(review_id)
);

CREATE TABLE characteristics(
  id integer PRIMARY KEY,
  product_id integer,
  name VARCHAR(25)
);

CREATE TABLE characteristics_reviews(
  id SERIAL PRIMARY KEY,
  characteristic_id integer,
  review_id integer,
  value decimal,

  CONSTRAINT review_id
      FOREIGN KEY(review_id)
	  REFERENCES reviews(review_id),
  CONSTRAINT characteristic_id
    FOREIGN KEY(characteristic_id)
	REFERENCES characteristics(id)
);

CREATE TABLE ratings(
  product_id integer,
  recommended_true integer,
  recommended_false integer
);

-- ON EC2 INSTANCE:
COPY reviews FROM '/home/ubuntu/reviews.csv' DELIMITER ',' CSV HEADER;
COPY photos FROM '/home/ubuntu/reviews_photos.csv' DELIMITER ',' CSV HEADER;
COPY characteristics FROM '/home/ubuntu/characteristics.csv' DELIMITER ',' CSV HEADER;
COPY characteristics_reviews FROM '/home/ubuntu/characteristic_reviews.csv' DELIMITER ',' CSV HEADER;

-- ON LOCAL MACHINE:
-- COPY reviews FROM '/private/tmp/reviews_' DELIMITER ',' CSV HEADER;
-- COPY photos FROM '/private/tmp/reviews_photos.csv' DELIMITER ',' CSV HEADER;
-- COPY characteristics FROM '/private/tmp/characteristics.csv' DELIMITER ',' CSV HEADER;
-- COPY characteristics_reviews FROM '/private/tmp/characteristic_reviews.csv' DELIMITER ',' CSV HEADER;

-- INDEXES
CREATE INDEX reviews_product_id_idx ON reviews (product_id);
CREATE INDEX reviews_review_id ON reviews (review_id);
CREATE INDEX characteristics_reviews_review_id_idx ON characteristics_reviews (review_id);