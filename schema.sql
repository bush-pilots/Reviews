-- Create table:
-- DROP DATABASE IF EXISTS ratingsandreviews;

-- CREATE DATABASE ratingsandreviews;
-- USE ratingsandreviews;
-- DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS reviews CASCADE;
CREATE TABLE reviews(
  id SERIAL PRIMARY KEY,
  product_id integer,
  rating smallint,
  recommend boolean,
  response varchar(200),
  summary varchar(200),
  reviewer_name varchar(25),
  body varchar(1000),
  date date
);

DROP TABLE IF EXISTS photos CASCADE;
CREATE TABLE photos(
  id SERIAL PRIMARY KEY,
  url varchar(500),
  review_id integer,
  CONSTRAINT review_id
      FOREIGN KEY(review_id)
	  REFERENCES reviews(id)
);

DROP TABLE IF EXISTS characteristics CASCADE ;
CREATE TABLE characteristics(
  id SERIAL PRIMARY KEY,
  product_id integer,
  name VARCHAR(15),
  value decimal
);


DROP TABLE IF EXISTS characteristics_reviews CASCADE;
CREATE TABLE characteristics_reviews(
  id SERIAL PRIMARY KEY,
  review_id integer,
  characteristic_id integer,

  CONSTRAINT review_id
      FOREIGN KEY(review_id)
	  REFERENCES reviews(id),
  CONSTRAINT characteristic_id
    FOREIGN KEY(characteristic_id)
	REFERENCES characteristics(id)
);

DROP TABLE IF EXISTS ratings;
CREATE TABLE ratings(
  product_id integer,
  recommended_true integer,
  recommended_false integer
);
-- INSERT INTO reviews (product_id, rating, recommend, response, summary, reviewer_name, body)
-- VALUES (88888, 4, true, 'response here', 'summary here', 'Scottland123', 'this is the body of my review');

-- Copy CSV data, with appropriate munging:
-- COPY land_registry_price_paid_uk FROM '/path/to/pp-complete.csv' with (format csv, encoding 'win1252', header false, null '', quote '"', force_null (postcode, saon, paon, street, locality, city, district));