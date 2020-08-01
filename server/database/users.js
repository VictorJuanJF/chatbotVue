"use strict";
const moment = require("moment");
const pg = require("pg");
pg.defaults.ssl = true;

const db = require(".");

let list = () => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT fb_id, nombres as first_name, apellidos as last_name,fecha_registro as date, estado_politicas_privacidad,hoja_informativa,num_documento as document_num  FROM chatbot_usuarios order by fecha_registro desc",
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

let listOne = (fbId) => {
  return new Promise((resolve, reject) => {
    console.log("el id: ", fbId);
    db.query(
      "select * from chatbot_usuarios where fb_id=$1",
      [fbId],
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

let create = (body) => {
  return new Promise((resolve, reject) => {
    let date = moment().format();
    console.log("creanbdo el usuario: ", body, date);
    db.query(
      "INSERT INTO chatbot_usuarios (fb_id, nombres, apellidos, imagen_perfil,fecha_registro) VALUES ($1, $2, $3, $4, $5)",
      [body.id, body.first_name, body.last_name, body.profile_pic, date],
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

const getPrivacyPolicyStatus = function (fbId) {
  return new Promise((resolve, reject) => {
    db.query(
      "select estado_politicas_privacidad as privacy_policy_status from chatbot_usuarios where fb_id=$1",
      [fbId],
      (err, res) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        resolve(res.rows[0].privacy_policy_status);
      }
    );
  });
};

const updatePrivacyPolicyStatus = (fbId) => {
  return new Promise((resolve, reject) => {
    db.query(
      "update chatbot_usuarios set estado_politicas_privacidad=true where fb_id=$1",
      [fbId],
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

const getDocumentNum = function (fbId) {
  return new Promise((resolve, reject) => {
    db.query(
      "select num_documento from chatbot_usuarios where fb_id=$1",
      [fbId],
      (err, res) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        console.log("el resultado: ", res.rows);
        resolve(res.rows[0].num_documento);
      }
    );
  });
};

const updateDocumentNum = (documentNum, userId) => {
  return new Promise((resolve, reject) => {
    db.query(
      "update chatbot_usuarios set num_documento=$1 where fb_id=$2",
      [documentNum, userId],
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

module.exports = {
  list,
  listOne,
  create,
  getPrivacyPolicyStatus,
  updatePrivacyPolicyStatus,
  getDocumentNum,
  updateDocumentNum,
};
