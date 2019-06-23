const { Pool, Client } = require('pg');

// return basic functions required by the app interacting with the db
const dbInterface = (dbString) => {
  const pool = new Pool({ connectionString: dbString });

  //run a given query using the client and return a promise
  function query(queryString) {
    return pool.query(queryString)
    .then(res => {
      return res.rows;
    })
    .catch(err => {
      throw (new Error(`qs: ${queryString} failed with error: ${err}`));
    });
  }

  function createTable(table, tableParams) {
    let columns = Object.keys(tableParams).map(key => `${key} ${tableParams[key]}`).join(',');
    let queryString = `CREATE TABLE  IF NOT EXISTS ${table} (${columns})`;
    return query(queryString);
  }

  function dropTable(table) {
    return query(`DROP TABLE IF EXISTS ${table}`)
  }

  //input table name as string
  // params is an object with array of objects representing rows to insert
  //runs the query function to insert the row and returns the promise for it
  function insert(table, params) {
    return new Promise((resolve, reject) => {
      if (!params || !params.length || typeof params !== 'object') {
        reject('Invalid params passed in');
      } else {
        var columnNames = Object.keys(params[0]).map(key => `${key}`)
        var columns = columnNames.join(',');
        var values = params.map(row => '(' + columnNames.map(col => row[col]).join(',') + ')').join(',');
        let queryString = `INSERT INTO ${table} (${columns}) VALUES ${values}`;
        return query(queryString);
      }
    })
  }

  return {
    createTable,
    dropTable,
    query,
    insert
  }
}

module.exports.connect = (dbString) => {
  return new Promise((resolve, reject) => {
    resolve(dbInterface(dbString));
  });
}