const fs = require('fs');
const csv = require('csv-parser');
const axios = require('axios');

const stream = fs.createReadStream('../ml-engine/data/Wednesday-workingHours.pcap_ISCX.csv')
  .pipe(csv());

let rowCount = 0;

function cleanRow(row) {
  const cleaned = {};
  for (const key in row) {
    const cleanKey = key.trim();
    if (cleanKey === 'Label') continue; 
    cleaned[cleanKey] = parseFloat(row[key]) || 0;
  }
  return cleaned;
}

stream.on('data', async (row) => {
  stream.pause();

  const features = cleanRow(row);
  const realLabel = row[' Label']; 

  try {
    const response = await axios.post('http://localhost:8000/predict', { features });
    const { is_anomaly, anomaly_score } = response.data;

    console.log(
      `Row ${rowCount}: real=${realLabel} | predicted_anomaly=${is_anomaly} | score=${anomaly_score.toFixed(3)}`
    );
  } catch (err) {
    console.error(`Row ${rowCount}: request failed —`, err.message);
  }

  rowCount++;
  setTimeout(() => stream.resume(), 100);
});

stream.on('end', () => {
  console.log(`Simulation finished. Total rows: ${rowCount}`);
});