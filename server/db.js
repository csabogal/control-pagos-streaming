const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Rf0rc3#1",
  database: "control_pagos_streaming",
});

module.exports = pool;
