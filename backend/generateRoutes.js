// backend/generateRoutes.js — Tamil Nadu real train routes seeder
const mongoose = require('mongoose');
const Transport = require('./models/Transport');
require('dotenv').config();

// 55 real Tamil Nadu & nearby cities served by Indian Railways
const cities = [
  'Chennai',       'Coimbatore',     'Madurai',         'Tiruchirappalli', 'Salem',
  'Erode',         'Tirunelveli',    'Vellore',          'Thoothukudi',     'Dindigul',
  'Thanjavur',     'Kumbakonam',     'Cuddalore',        'Nagercoil',       'Kanyakumari',
  'Tirupur',       'Karur',          'Namakkal',         'Pudukkottai',     'Sivaganga',
  'Virudhunagar',  'Ramanathapuram', 'Tenkasi',          'Tiruvannamalai',  'Vellore',
  'Villupuram',    'Kallakurichi',   'Ranipet',          'Chengalpattu',    'Kanchipuram',
  'Thiruvallur',   'Ariyalur',       'Perambalur',       'Nagapattinam',    'Mayiladuthurai',
  'Karaikudi',     'Sivakasi',       'Kovilpatti',       'Sankarankovil',   'Srirangam',
  'Manapparai',    'Pollachi',       'Palani',           'Oddanchatram',    'Batlagundu',
  'Paramakudi',    'Mudukulathur',   'Tiruvottiyur',     'Ambattur',        'Avadi',
  'Bangalore',     'Kochi',          'Thiruvananthapuram','Hyderabad',       'Mysuru'
];

// Real Indian Express / Mail train names used in Tamil Nadu
const realTrainNames = [
  'Chennai Express',       'Cheran Express',        'Nilgiri Express',
  'Vaigai Express',        'Pandian Express',        'Nellai Express',
  'Madurai Express',       'Rockfort Express',       'Kaveri Express',
  'Pearl City Express',    'Cholan Express',         'Sethu Express',
  'Kanyakumari Express',   'Coromandel Express',     'Ananthapuri Express',
  'Cape Express',          'Navyug Express',         'Tambaram Express',
  'Island Express',        'Ernakulam Express',      'Dindigul Express',
  'Palani Express',        'Tirunelveli Express',    'Pollachi Express',
  'Vellore Express',       'Salem Express',          'Erode Express',
  'Kumbakonam Express',    'Thanjavur Express',      'Nagapattinam Express',
  'Karur Express',         'Namakkal Express',       'Tirupur Express',
  'Cuddalore Express',     'Pondicherry Express',    'Kanchipuram Express',
  'Chengalpattu Express',  'Villupuram Express',     'Ariyalur Express',
  'Mayiladuthurai Express','Karaikudi Express',      'Sivakasi Express',
  'Kovilpatti Express',    'Paramakudi Express',     'Ramnad Express',
  'Srirangam Express',     'Manapparai Express',     'Batlagundu Express',
  'Sankarankovil Express', 'Tenkasi Express'
];

// Realistic departure times
const departureTimes = [
  '05:00','05:30','06:00','06:30','07:00','07:30','08:00','08:30',
  '09:00','09:30','10:00','11:00','12:00','13:00','14:00','15:00',
  '16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'
];

// Fare table by approximate distance bracket (minutes of travel)
function fareForDuration(mins) {
  if (mins < 120)  return Math.floor(80  + Math.random() * 70);   // short  < 2h
  if (mins < 240)  return Math.floor(150 + Math.random() * 150);  // medium 2-4h
  if (mins < 360)  return Math.floor(300 + Math.random() * 200);  // long   4-6h
  return Math.floor(500 + Math.random() * 400);                   // very long 6h+
}

function randomDuration() {
  // 1h 10m  to  10h 30m  expressed in minutes
  return 70 + Math.floor(Math.random() * 560);
}

function addMinutes(time, mins) {
  const [h, m] = time.split(':').map(Number);
  const total  = h * 60 + m + mins;
  const nh     = Math.floor(total / 60) % 24;
  const nm     = total % 60;
  return `${String(nh).padStart(2,'0')}:${String(nm).padStart(2,'0')}`;
}

function randomCapacity() { return [72, 96, 120, 200, 320][Math.floor(Math.random() * 5)]; }

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Build realistic named train routes between every pair of cities
function buildTrainRoutes() {
  const routes = [];
  let numIdx = 1;

  for (let i = 0; i < cities.length; i++) {
    for (let j = 0; j < cities.length; j++) {
      if (i === j) continue;

      const src  = cities[i];
      const dst  = cities[j];
      const duration     = randomDuration();
      const departure    = pickRandom(departureTimes);
      const arrival      = addMinutes(departure, duration);
      const capacity     = randomCapacity();
      const fare         = fareForDuration(duration);
      const trainName    = pickRandom(realTrainNames);
      const trainNumber  = `TN${String(numIdx).padStart(4, '0')}`;

      routes.push({
        transportType : 'train',
        name          : trainName,
        number        : trainNumber,
        capacity      : capacity,
        availableSeats: Math.floor(capacity * (0.1 + Math.random() * 0.9)),
        source        : src,
        destination   : dst,
        departureTime : departure,
        arrivalTime   : arrival,
        duration      : duration,
        fare          : fare,
        schedule      : []
      });

      numIdx++;
    }
  }
  return routes;
}

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/public_transport_db',
    { useNewUrlParser: true, useUnifiedTopology: true }
  );
  console.log('MongoDB connected.');

  // Clear existing train routes so re-running is safe
  const deleted = await Transport.deleteMany({ transportType: 'train' });
  console.log(`Removed ${deleted.deletedCount} old train routes.`);

  const routes = buildTrainRoutes();

  // insertMany in batches of 500 to avoid hitting document-size limits
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < routes.length; i += BATCH) {
    const batch = routes.slice(i, i + BATCH);
    await Transport.insertMany(batch);
    inserted += batch.length;
    console.log(`  Inserted ${inserted} / ${routes.length} routes...`);
  }

  console.log(`\nDone! Total train routes inserted: ${routes.length}`);
  console.log(`Cities covered: ${cities.length}`);
  console.log(`Route pairs: ${cities.length} x ${cities.length - 1} = ${cities.length * (cities.length - 1)}`);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });