-- Create table:
DROP DATABASE IF EXISTS RatingsAndReviews;

CREATE DATABASE RatingsAndReviews;

DROP TABLE IF EXISTS reviews;
CREATE TABLE reviews(
  review_id uuid,
  product_id integer,
  rating smallint,
  recommend boolean,
  response varchar(200),
  summary varchar(200),
  reviewer_name varchar(25),
  body varchar(1000),
  date date,
  PRIMARY KEY (review_id));

DROP TABLE IF EXISTS photos;
CREATE TABLE photos(
  -- how to connect foreign key?
  photo_id integer,
  url varchar(500),
  PRIMARY KEY (photo_id)
);

DROP TABLE IF EXISTS ratings;
CREATE TABLE ratings(
  product_id integer,
  recommended_true integer,
  recommended_false integer,
  characteristic_id integer
);

DROP TABLE IF EXISTS characteristics;
CREATE TABLE characteristics(
  -- how to connect foreign key?
  id integer,
  value decimal,
  PRIMARY KEY (id)
);

-- Copy CSV data, with appropriate munging:
-- COPY land_registry_price_paid_uk FROM '/path/to/pp-complete.csv' with (format csv, encoding 'win1252', header false, null '', quote '"', force_null (postcode, saon, paon, street, locality, city, district));