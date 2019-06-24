const fs = require('fs');

//class used to manage loading a single file to db and then getting some stats on data loaded
class UDPRNStats {
  constructor(tableName, fileName) {
    this.fileName = fileName;
    this.udprns = new Map();
    this.totalUdprns = 0;
    this.tableName = tableName;
    this.totalUdprns = null;
  }

  //retrieve the results (prints as well just to show in console)
  getResults() {
    return {
      distinctUdprns: this.udprns.size,
      totalUdprns: this.totalUdprns
    }
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
  loadFile() {
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
        console.log(`loading ${this.fileName} failed: ${err}`);
        throw (new Error(err));
      })
  }
}

//build a stats object to handle loading files + getting data on a loaded file
module.exports.createStatsObject = (tableName, fileName) => {
  let stats = new UDPRNStats(tableName, fileName);
  return stats;
}