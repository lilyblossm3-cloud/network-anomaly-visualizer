const fs = require('fs');
const csv = require('csv-parser');
const axios = require('axios');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
console.log('WebSocket server listening on ws://localhost:8080');

wss.on('connection', (ws) => {
  console.log('Dashboard connected');
});

function broadcast(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

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
  const destPort = row[' Destination Port'];

  try {
    const response = await axios.post('http://localhost:8000/predict', { features });
    const { is_anomaly, anomaly_score } = response.data;

    console.log(
      `Row ${rowCount}: real=${realLabel} | predicted_anomaly=${is_anomaly} | score=${anomaly_score.toFixed(3)}`
    );

    broadcast({
      row: rowCount,
      destPort,
      is_anomaly,
      anomaly_score,
      realLabel
    });
  } catch (err) {
    console.error(`Row ${rowCount}: request failed —`, err.message);
  }

  rowCount++;
  setTimeout(() => stream.resume(), 100);
});

stream.on('end', () => {
  console.log(`Simulation finished. Total rows: ${rowCount}`);
});