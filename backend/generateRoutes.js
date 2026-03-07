// backend/generateRoutes.js
const mongoose = require('mongoose');
const Transport = require('./models/Transport'); // adjust path if needed
require('dotenv').config();

const cities = [
  'Coimbatore','Erode','Salem','Bangalore','Chennai',
  'Tiruchirappalli','Kochi','Thiruvananthapuram','Hyderabad','Pune'
];

function randomFare() { return Math.floor(200 + Math.random()*800); }
function randomDuration() { return (3 + Math.floor(Math.random()*8)) * 60 + Math.floor(Math.random()*60); } // returns duration in minutes
function randomCapacity() { return 40 + Math.floor(Math.random()*60); }
function getTransportName(type, number) { return type === 'bus' ? `Bus ${number}` : `Train ${number}`; }

async function main(){
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/public_transport_db', { useNewUrlParser:true, useUnifiedTopology:true });
  const routes = [];
  let id = 1;
  for (const src of cities){
    for (const dst of cities){
      if (src === dst) continue;
      const transportType = Math.random() < 0.7 ? 'bus' : 'train';
      const number = `R${id}`;
      const capacity = randomCapacity();
      routes.push({
        transportType: transportType,
        name: getTransportName(transportType, number),
        number: number,
        capacity: capacity,
        availableSeats: Math.floor(capacity * (0.3 + Math.random() * 0.7)), // 30-100% availability
        source: src,
        destination: dst,
        schedule: [], 
        fare: randomFare(),
        duration: randomDuration(),
      });
      id++;
    }
  }

  // Optionally clear existing matching routes (uncomment if desired)
  // await Transport.deleteMany({ source: { $in: cities }, destination: { $in: cities } });

  await Transport.insertMany(routes);
  console.log(`Inserted ${routes.length} routes`);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });