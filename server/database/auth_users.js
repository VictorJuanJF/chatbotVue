"use strict";
const pg = require("pg");
const db = require(".");
pg.defaults.ssl = true;
//bcrypt options
const bcrypt = require("bcrypt");
const saltRounds = 10;

const login = (user) => {
  return new Promise((resolve, reject) => {
    db.query(
      `select id,nombres as first_name,apellidos as first_name,correo as email,contrasena as password,rol as role,estado as status from sistema_usuarios where correo='${user.email}'`,
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

const registerUser = (user) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(user.password, saltRounds).then(function (hash) {
      db.query(
        `insert into sistema_usuarios(nombres,apellidos,correo,contrasena,rol,estado) values('${user.first_name}','${user.last_name}','${user.email}','${hash}','${user.role}','${user.status}')`,
        (err, res) => {
          if (err) {
            console.log(err);
            return reject(err);
          }
          resolve(user);
        }
      );
    });
  });
};
const list = () => {
  return new Promise((resolve, reject) => {
    db.query(
      `select id,nombres as first_name,apellidos as last_name,correo as email,rol as role,estado as status from sistema_usuarios`,
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
const updatePassword = (email, newPassword) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(newPassword, saltRounds).then(function (hash) {
      db.query(
        `update sistema_usuarios set contrasena='${hash}' where correo='${email}'`,
        (err, res) => {
          if (err) {
            console.log(err);
            return reject(err);
          }
          resolve(true);
        }
      );
    });
  });
};
const deleteUser = (email) => {
  return new Promise((resolve, reject) => {
    db.query(
      `update sistema_usuarios set estado='0' where correo='${email}'`,
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
const updateUser = (user) => {
  return new Promise((resolve, reject) => {
    db.query(
      `update sistema_usuarios set nombres='${user.first_name}',apellidos='${user.last_name}',correo='${user.email}',rol='${user.role}',estado='${user.status}' where correo='${user.email}'`,
      (err, res) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        resolve(user);
      }
    );
  });
};

module.exports = {
  registerUser,
  login,
  list,
  updatePassword,
  deleteUser,
  updateUser,
};
