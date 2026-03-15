// backend/generateRoutes.js — Tamil Nadu train/bus route seeder
const mongoose = require('mongoose');
const Transport = require('./models/Transport');
require('dotenv').config();

const modeArg = (process.argv[2] || 'both').toLowerCase();
const generationMode = ['train', 'bus', 'both'].includes(modeArg) ? modeArg : 'both';

// 55 listed cities (54 unique after dedupe) across Tamil Nadu and nearby connectivity hubs
const rawCities = [
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

const cities = [...new Set(rawCities)];

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

const realBusNames = [
  'SETC Ultra Deluxe',      'TNSTC Express',        'KPN Travels',
  'Parveen Travels',        'SRS Travels',          'ABT Express',
  'Orange Tours',           'YBM Travels',          'Royal Travels',
  'VRL Coach',              'Kallada Express',      'SRS Non-Stop',
  'Kumaran Bus Service',    'Anand Bus Lines',      'Comfort Coach'
];

const busServiceTypes = ['Express', 'Deluxe', 'AC Sleeper', 'Semi Sleeper', 'Non-Stop'];

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

function busFareForDuration(mins) {
  if (mins < 120)  return Math.floor(60  + Math.random() * 80);
  if (mins < 240)  return Math.floor(120 + Math.random() * 140);
  if (mins < 360)  return Math.floor(220 + Math.random() * 180);
  return Math.floor(350 + Math.random() * 320);
}

function randomTrainDuration() {
  // 1h 10m  to  10h 30m  expressed in minutes
  return 70 + Math.floor(Math.random() * 560);
}

function randomBusDuration() {
  // buses are usually slower for the same city pairs
  return 90 + Math.floor(Math.random() * 620);
}

function addMinutes(time, mins) {
  const [h, m] = time.split(':').map(Number);
  const total  = h * 60 + m + mins;
  const nh     = Math.floor(total / 60) % 24;
  const nm     = total % 60;
  return `${String(nh).padStart(2,'0')}:${String(nm).padStart(2,'0')}`;
}

function randomTrainCapacity() { return [72, 96, 120, 200, 320][Math.floor(Math.random() * 5)]; }
function randomBusCapacity() { return [30, 40, 45, 50, 55][Math.floor(Math.random() * 5)]; }

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Build realistic named train routes between every pair of cities
function buildTrainRoutes() {
  const routes = [];
  let numIdx = 1;

  for (const src of cities) {
    for (const dst of cities) {
      if (src === dst) continue;

      const duration     = randomTrainDuration();
      const departure    = pickRandom(departureTimes);
      const arrival      = addMinutes(departure, duration);
      const capacity     = randomTrainCapacity();
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

function buildBusRoutes() {
  const routes = [];
  let numIdx = 1;

  for (const src of cities) {
    for (const dst of cities) {
      if (src === dst) continue;

      const duration    = randomBusDuration();
      const departure   = pickRandom(departureTimes);
      const arrival     = addMinutes(departure, duration);
      const capacity    = randomBusCapacity();
      const fare        = busFareForDuration(duration);
      const busName     = `${pickRandom(realBusNames)} ${pickRandom(busServiceTypes)}`;
      const busNumber   = `BUS${String(numIdx).padStart(4, '0')}`;

      routes.push({
        transportType : 'bus',
        name          : busName,
        number        : busNumber,
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

async function insertInBatches(routes, label) {
  const BATCH = 500;
  let inserted = 0;

  for (let i = 0; i < routes.length; i += BATCH) {
    const batch = routes.slice(i, i + BATCH);
    await Transport.insertMany(batch);
    inserted += batch.length;
    console.log(`  Inserted ${inserted} / ${routes.length} ${label} routes...`);
  }
}

async function main() {
  console.log(`Mode: ${generationMode.toUpperCase()}`);
  console.log('Connecting to MongoDB...');
  await mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/public_transport_db',
    { useNewUrlParser: true, useUnifiedTopology: true }
  );
  console.log('MongoDB connected.');

  const routeGroups = [];

  if (generationMode === 'train' || generationMode === 'both') {
    const deletedTrain = await Transport.deleteMany({ number: /^TN\d{4}$/ });
    console.log(`Removed ${deletedTrain.deletedCount} old generated train routes.`);
    routeGroups.push({ label: 'train', routes: buildTrainRoutes() });
  }

  if (generationMode === 'bus' || generationMode === 'both') {
    const deletedBus = await Transport.deleteMany({ number: /^BUS\d{4}$/ });
    console.log(`Removed ${deletedBus.deletedCount} old generated bus routes.`);
    routeGroups.push({ label: 'bus', routes: buildBusRoutes() });
  }

  let totalInserted = 0;
  for (const group of routeGroups) {
    await insertInBatches(group.routes, group.label);
    console.log(`Done inserting ${group.routes.length} ${group.label} routes.`);
    totalInserted += group.routes.length;
  }

  console.log(`\nDone! Total routes inserted: ${totalInserted}`);
  console.log(`Unique cities covered: ${cities.length}`);
  console.log(`Route pairs per transport type: ${cities.length} x ${cities.length - 1} = ${cities.length * (cities.length - 1)}`);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });