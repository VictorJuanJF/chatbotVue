"use strict";
const pg = require("pg");
const db = require(".");
pg.defaults.ssl = true;

const listRegions = () => {
  return new Promise((resolve, reject) => {
    db.query(
      "select id,nombre as name from regiones ORDER BY nombre ASC; ",
      (err, res) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        resolve(res.rows);
      }
    );
  });
};

module.exports = {
  listRegions,
};
