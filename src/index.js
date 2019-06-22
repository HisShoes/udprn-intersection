var fs = require('fs');

class Stats {
  constructor() {
    this.uprnCounter = {};
    this.totalUprns = 0;

  }

  analyzeFile(fileName) {
    const stream = fs.createReadStream(fileName);

    stream.on('data', function(data) {
      var chunk = data.toString();
      console.log(chunk);
    })
  }
}

createStatsObject = (fileName) => {
  let stats = new Stats();
  stats.analyzeFile(fileName);
  return stats;
}

console.log('started');

var path = require('path');
const dataPath = path.join(__dirname, '../data/');

let fileA = createStatsObject(`${dataPath}A_f.csv`)