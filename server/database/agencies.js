"use strict";
const pg = require("pg");
const db = require(".");
pg.defaults.ssl = true;

const getAgency = (agencyName) => {
  return new Promise((resolve, reject) => {
    db.query(
      "select * from agencias inner join regiones on agencias.region=regions.id where nombre=$1",
      [agencyName],
      (err, res) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        resolve(res.rows[0]);
      }
    );
  });
};
const listAgencies = () => {
  return new Promise((resolve, reject) => {
    db.query(
      "select agencias.id as agency_id,agencias.nombre as agency_name,region,horario as schedule,direccion as address,referencia as reference,regiones.nombre as name,sinonimos as synonyms,agencias.url,agencias.imagen as image from agencias inner join regiones on agencias.region=regiones.id where agencias.estado='1' ORDER BY regiones.nombre ASC",
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

const createAgency = (agency) => {
  return new Promise((resolve, reject) => {
    db.query(
      "insert into agencias (nombre,region,horario,direccion,referencia,url,imagen,sinonimos,estado) values($1,$2,$3,$4,$5,$6,$7,$8,$9);",
      [
        agency.agency_name,
        agency.region,
        agency.schedule,
        agency.address,
        agency.reference,
        agency.url,
        agency.image,
        agency.synonyms,
        agency.status,
      ],
      (err, res) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        resolve(true);
      }
    );
  });
};
const updateAgency = (id, agency) => {
  return new Promise((resolve, reject) => {
    db.query(
      `update agencias set direccion='${agency.address}',nombre='${agency.agency_name}',referencia='${agency.reference}',region='${agency.region}',horario='${agency.schedule}',sinonimos='${agency.synonyms}',imagen='${agency.image}',url='${agency.url}' where id='${id}'`,
      (err, res) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        resolve(true);
      }
    );
  });
};

const deleteAgency = (id) => {
  return new Promise((resolve, reject) => {
    db.query(`update agencias set estado='0' where id='${id}'`, (err, res) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      resolve(true);
    });
  });
};

const listAgenciesByRegion = (region) => {
  return new Promise((resolve, reject) => {
    db.query(
      `select agencias.nombre as agency_name,direccion as address,agencias.url,agencias.imagen as image from agencias inner join regiones on agencias.region=regiones.id where regiones.nombre='${region}'`,
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
  getAgency,
  listAgencies,
  createAgency,
  listAgenciesByRegion,
  deleteAgency,
  updateAgency,
};

// listAgencies((err, response) => {
//     console.log("la respuesta es: ", response);
// })
