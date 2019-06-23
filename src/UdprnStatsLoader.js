const fs = require('fs');

//class used to manage loading a single file to db and then getting some stats on data loaded
class UDPRNStats {
  constructor(tableName, fileName, client) {
    this.fileName = fileName;
    this.dbClient = client;
    this.tableName = tableName;
    this.distinctUdprns = null;
    this.totalUdprns = null;
  }

  //returns a promise resolved when the file is finished streaming
  //splits chunks into individual udprns and inserts each row to db
  insertFileToTable() {
    return new Promise((resolve, reject) => {
      //stream the file in chunks
      const stream = fs.createReadStream(this.fileName);
      stream.on('data', (data) => {
        const chunk = data.toString();
        //split chunk to individual udprns in the format required to insert to db
        const udprnsThisChunk = chunk.split(/\r?\n/).filter(udprn => (udprn && udprn.length === 8)).map(udprn => ({ udprn: udprn }));
        this.dbClient.insert(this.tableName, udprnsThisChunk);

      });

      stream.on('end', resolve);
      stream.on('error', reject);
    });
  }

  //retrieve the results (prints as well just to show in console)
  getResults() {
    return {
      distinctUdprns: this.distinctUdprns,
      totalUdprns: this.totalUdprns
    }
  }

  //setup the db as required to store the data then insert the file into it
  loadFile() {
    //drop the table in case it already exists before trying to create
    return this.dbClient.dropTable(this.tableName)
      .then(res => {
        return this.dbClient.createTable(this.tableName, { udprn: 'VARCHAR(8)' });
      })
      .then(res => {
        //stream the file and load to db
        return this.insertFileToTable();
      })
      .then(res => {
        //find total udprns
        return this.dbClient.query(`SELECT COUNT(udprn) FROM ${this.tableName}`);
      })
      .then(totalUdprns => {
        //find distinct udprns
        this.totalUdprns = totalUdprns[0].count;
        return this.dbClient.query(`SELECT COUNT(DISTINCT udprn) FROM ${this.tableName}`);
      })
      .then(distinctUdprns => {
        this.distinctUdprns = distinctUdprns[0].count;
      })
      .catch((err) => {
        console.log(`loading ${fileName} failed: ${err}`);
        throw (new Error(err));
      })
  }
}

//build a stats object to handle loading files + getting data on a loaded file
module.exports.createStatsObject = (tableName, fileName, client) => {
  let stats = new UDPRNStats(tableName, fileName, client);
  return stats;
}