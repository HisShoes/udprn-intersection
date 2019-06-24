const path = require('path');
const dataPath = path.join(__dirname, '../data/');

const { createStatsObject } = require('./UdprnStatsLoader');


module.exports.createWrapper = (dbClient) => {

  const loadFiles = (fileNames) => {
    //declare results object to be returned
    const results = {};

    //init object to track each file
    let fileStats = fileNames.map((name, index) => createStatsObject(`${name}`, `${dataPath}${name}.csv`));
    //create an array for the promises returned for loading files to the db
    let fileAnalysisPromises = fileStats.map(stats => stats.loadFile());

    //wait for all the files to load then pass the fileStats to next function
    return Promise.all(fileAnalysisPromises).then(res => fileStats)
      .then(filestats => {
        let comparisonStats = fileStats[0].diff(fileStats[1]);
        results.totalOverlap = comparisonStats.totalOverlap;
        results.totalDistinctOverlap = comparisonStats.distinctOverlaps;
        //return the results and clean up unwanted tables
        filestats.forEach(file => {
          results[file.tableName] = file.getResults();
        })
        dbClient.insert('RESULTS', [{ fileA: `'${filestats[0].tableName}'`, fileB: `'${filestats[1].tableName}'`, results: `'${JSON.stringify(results)}'` }]);
        return results;
      })
      .catch(err => {
        console.log(err)
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