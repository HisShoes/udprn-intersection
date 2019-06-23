const path = require('path');
const argv = require('minimist')(process.argv.slice(2));

const { connect } = require('./db');
const { createStatsObject } = require('./UdprnStatsLoader');

//start timer
let t = process.hrtime();

//setup filenames and paths
const dataPath = path.join(__dirname, '../data/');
const fileNames = [];
fileNames.push(argv.a);
fileNames.push(argv.b);

const results = {};
let dbClient = null;

//connect to the database then do what we need to do
connect(process.env.DATABASE_URL)
  .then(client => {
    //when db is connected, create the stats object to load files
    dbClient = client;
    let fileStats = fileNames.map(name => createStatsObject(name, `${dataPath}${name}.csv`, dbClient));

    //create an array for the promises returned for loading files to the db
    let fileAnalysisPromises = fileStats.map(stats => stats.loadFile());

    //wait for all the files to load then pass the fileStats to next function
    return Promise.all(fileAnalysisPromises).then(res => fileStats);
  })
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
    //show the results
    filestats.forEach(file => {
      results[file.tableName] = file.getResults();
    })
    console.log('Total overlap is:');
    console.log(results.totalOverlap);
    console.log('Total distinct overlap is:');
    console.log(results.totalDistinctOverlap);
  })
  .then(res => {
    //end connection and timer
    t = process.hrtime(t);
    console.log('---');
    dbClient.end();
    console.log(`Took: ${t[0]}.${t[1]}`);
  })
  .catch(err => {
    //log error and close db connection
    console.log(`Something went wrong: ${err}`);
    console.log('closing connection');
    dbClient.end();
    return err;
  });