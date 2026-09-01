const fs = require('fs');
const csv = require('csv-parser');

const stream = fs.createReadStream('../ml-engine/data/Wednesday-workingHours.pcap_ISCX.csv')
  .pipe(csv());

let rowCount = 0;

stream.on('data', (row) => {
  stream.pause(); 

  console.log(`Row ${rowCount}:`, row[' Label']);
  rowCount++;

  setTimeout(() => {
    stream.resume(); 
  }, 100);
});

stream.on('end', () => {
  console.log(`Simulation finished. Total rows: ${rowCount}`);
});