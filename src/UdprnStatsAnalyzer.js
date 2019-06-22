const fs = require('fs');

class UDPRNStats {
  constructor(fileName) {
    this.fileName = fileName;
    this.udprns = new Map();
    this.totalUdprns = 0;
  }

  //takes in a different stats object
  //returns an object containing the overlap
  diff(comparison) {
    let totalOverlaps = 0, distinctOverlaps = 0;

    //create a intersection set to get the udprns that exist in both sets
    let intersection = new Set(
      [...this.udprns.keys()].filter(key => comparison.udprns.has(key))
    );
    distinctOverlaps = intersection.size;

    //loop through the records we know are in both
    //record the total number of possible overlaps
    intersection.forEach(key => {
      totalOverlaps += (this.udprns.get(key) * comparison.udprns.get(key))
    });

    return {
      totalOverlaps,
      distinctOverlaps
    }
  }

  //add/increment udprn to the map and increment total
  updateUdprn(udprn) {
    this.udprns.set(udprn, (this.udprns.get(udprn) || 0) + 1);
    this.totalUdprns += 1;
  }

  //returns a promise resolved when the file is finished streaming
  //splits chunks into individual udprns and updates stats for each
  analyzeFile() {
    return new Promise((resolve, reject) => {
      //stream the file in chunks
      const stream = fs.createReadStream(this.fileName);
      stream.on('data', (data) => {
        const chunk = data.toString();
        //split chunk to individual udprns
        const udprnsThisChunk = chunk.split(/\r?\n/);

        udprnsThisChunk.forEach((udprn) => {
          //ignore anything thats not a valid udprn
          if (udprn && udprn.length === 8) {
            this.updateUdprn(udprn);
          }
        });
      });

      stream.on('end', resolve);
      stream.on('error', reject);
    })
      .catch((err) => {
        console.log(`loading ${fileName} failed: ${err}`);
        throw (new Error(err));
      })
  }
}

module.exports.createStatsObject = (fileName) => {
  let stats = new UDPRNStats(fileName);
  return stats;
}