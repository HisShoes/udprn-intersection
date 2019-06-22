const { createStatsObject } = require('./UdprnStatsAnalyzer');

var path = require('path');
const dataPath = path.join(__dirname, '../data/');

var t = process.hrtime();

let fileStats = [
  createStatsObject(`${dataPath}A_f.csv`),
  createStatsObject(`${dataPath}B_f.csv`)
];

let fileAnalysisPromises = fileStats.map(stats => stats.analyzeFile());

Promise.all(fileAnalysisPromises)
  .then(() => {
    console.log('finished analyzing files');
    fileStats.forEach(stats => {
      console.log(`${stats.fileName}:`)
      console.log(`   - distinct udprns: ${stats.udprns.size}`);
      console.log(`   - total udprns: ${stats.totalUdprns}`);
    })
    let comparisonStats = fileStats[0].diff(fileStats[1]);

    console.log(`Comparison stats:`);
    console.log(`   - distinct overlap: ${comparisonStats.distinctOverlaps}`);
    console.log(`   - total overlap: ${comparisonStats.totalOverlaps}`);

    t = process.hrtime(t);
    console.log(`took: ${t[0]}.${t[1]}`);
  })
  .catch((err) => {
    console.log(`something went wrong while waiting for analysis to finish: ${err}`)
  });