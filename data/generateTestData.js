const fs = require('fs');

let udprns = 'udprns' + '\r\n';
let mask = '00000000'
// for(let i = 7500000; i < 12500000; i++) {
//   let strNum = String(i)
//   let numLength = strNum.length
//   udprns += mask.slice(numLength) + strNum + '\r\n'
// }
for(let i = 0; i < 10000000; i++) {
  let strNum = String(i)
  let numLength = strNum.length
  udprns += mask.slice(numLength) + strNum + '\r\n'
}


// write to a new file named 2pac.txt
fs.writeFile('A_long.csv', udprns, (err) => {  
    // throws an error, you could also catch it here
    if (err) throw err;
});