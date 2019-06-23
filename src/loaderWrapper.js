const path = require('path');
const dataPath = path.join(__dirname, '../data/');

const { createStatsObject } = require('./UdprnStatsLoader');

//define structure of the results
const results = {
  totalOverlap: null,
  totalDistinctOverlap: null,
};

module.exports.createWrapper = (dbClient) => {

  const loadFiles = (fileNames) => {
    let fileStats = fileNames.map((name, index) => createStatsObject(`${name}`, `${dataPath}${name}.csv`, dbClient));
    //create an array for the promises returned for loading files to the db
    let fileAnalysisPromises = fileStats.map(stats => stats.loadFile());

    //wait for all the files to load then pass the fileStats to next function
    return Promise.all(fileAnalysisPromises).then(res => fileStats)
      .then(filestats => {
        //count the total overlap between the two tables
        return dbClient.query(`SELECT COUNT(a.udprn) FROM ${filestats[0].tableName} a INNER JOIN ${filestats[1].tableName} b ON a.udprn = b.udprn`)
          .then(totalOverlap => {
            results.totalOverlap = totalOverlap[0].count;
            return filestats;
          });
      })
      .then(filestats => {
        //count the distinct overlap between the two tables
        return dbClient.query(`SELECT COUNT(DISTINCT a.udprn) FROM ${filestats[0].tableName} a INNER JOIN ${filestats[1].tableName} b ON a.udprn = b.udprn`)
          .then(totalDistinctOverlap => {
            results.totalDistinctOverlap = totalDistinctOverlap[0].count;
            return filestats;
          });
      })
      .then(filestats => {
        //return the results and clean up unwanted tables
        filestats.forEach(file => {
          results[file.tableName] = file.getResults();
          dbClient.dropTable(file.tableName);
        })
        dbClient.insert('RESULTS', [{ fileA: `'${filestats[0].tableName}'`, fileB: `'${filestats[1].tableName}'`, results: `'${JSON.stringify(results)}'` }]);
        return results;
      })
      .catch(err => {
        //log error and close db connection
        throw new Error(err);
      });
  }
  //setup the results table 
  //for now just putting results in one column, wou - would want to split it out to proper data structure
  return dbClient.createTable('RESULTS', { fileA: 'VARCHAR(50)', fileB: 'VARCHAR(50)', results: 'VARCHAR(500)' })
    .then(res => {
      return loadFiles
    })
    .catch(err => {
      throw new Error(`failed to setup loader wrapper: ${err}`);
    })
}