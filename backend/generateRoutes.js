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

const CITY_COORDINATES = {
  Chennai: [13.0827, 80.2707],
  Coimbatore: [11.0168, 76.9558],
  Madurai: [9.9252, 78.1198],
  Tiruchirappalli: [10.7905, 78.7047],
  Salem: [11.6643, 78.1460],
  Erode: [11.3410, 77.7172],
  Tirunelveli: [8.7139, 77.7567],
  Vellore: [12.9165, 79.1325],
  Thoothukudi: [8.7642, 78.1348],
  Dindigul: [10.3673, 77.9803],
  Thanjavur: [10.7867, 79.1378],
  Kumbakonam: [10.9601, 79.3845],
  Cuddalore: [11.7447, 79.7680],
  Nagercoil: [8.1833, 77.4119],
  Kanyakumari: [8.0883, 77.5385],
  Tirupur: [11.1085, 77.3411],
  Karur: [10.9577, 78.0766],
  Namakkal: [11.2194, 78.1674],
  Pudukkottai: [10.3833, 78.8000],
  Sivaganga: [9.8470, 78.4836],
  Virudhunagar: [9.5851, 77.9579],
  Ramanathapuram: [9.3639, 78.8395],
  Tenkasi: [8.9590, 77.3152],
  Tiruvannamalai: [12.2253, 79.0747],
  Villupuram: [11.9401, 79.4861],
  Kallakurichi: [11.7401, 78.9596],
  Ranipet: [12.9273, 79.3332],
  Chengalpattu: [12.6918, 79.9766],
  Kanchipuram: [12.8342, 79.7036],
  Thiruvallur: [13.1439, 79.9085],
  Ariyalur: [11.1385, 79.0756],
  Perambalur: [11.2333, 78.8833],
  Nagapattinam: [10.7656, 79.8428],
  Mayiladuthurai: [11.1035, 79.6550],
  Karaikudi: [10.0666, 78.7672],
  Sivakasi: [9.4496, 77.7970],
  Kovilpatti: [9.1717, 77.8689],
  Sankarankovil: [9.1732, 77.5416],
  Srirangam: [10.8624, 78.6932],
  Manapparai: [10.6076, 78.4252],
  Pollachi: [10.6582, 77.0082],
  Palani: [10.4503, 77.5200],
  Oddanchatram: [10.4853, 77.7480],
  Batlagundu: [10.1635, 77.7582],
  Paramakudi: [9.5463, 78.5907],
  Mudukulathur: [9.3415, 78.5132],
  Tiruvottiyur: [13.1609, 80.3009],
  Ambattur: [13.1143, 80.1548],
  Avadi: [13.1147, 80.1018],
  Bangalore: [12.9716, 77.5946],
  Kochi: [9.9312, 76.2673],
  Thiruvananthapuram: [8.5241, 76.9366],
  Hyderabad: [17.3850, 78.4867],
  Mysuru: [12.2958, 76.6394]
};

// Realistic departure times
const departureTimes = [
  '05:00','05:30','06:00','06:30','07:00','07:30','08:00','08:30',
  '09:00','09:30','10:00','11:00','12:00','13:00','14:00','15:00',
  '16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'
];

function toRad(value) {
  return value * (Math.PI / 180);
}

function estimateDistanceKm(source, destination) {
  const src = CITY_COORDINATES[source];
  const dst = CITY_COORDINATES[destination];

  if (!src || !dst) {
    return 120 + Math.floor(Math.random() * 420);
  }

  const [lat1, lon1] = src;
  const [lat2, lon2] = dst;

  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.max(40, Math.round(earthRadiusKm * c * 1.25));
}

function roundToNearestTen(value) {
  return Math.max(40, Math.round(value / 10) * 10);
}

function estimateTrainDuration(distanceKm) {
  const averageSpeedKmph = 58;
  const operationalBuffer = 20 + Math.min(90, distanceKm * 0.08);
  return Math.max(60, Math.round((distanceKm / averageSpeedKmph) * 60 + operationalBuffer));
}

function estimateBusDuration(distanceKm) {
  const averageSpeedKmph = 44;
  const breakBuffer = 15 + Math.min(120, distanceKm * 0.12);
  return Math.max(75, Math.round((distanceKm / averageSpeedKmph) * 60 + breakBuffer));
}

function estimateTrainFare(distanceKm) {
  // Approx mixed-class pricing for Indian intercity trains.
  let base = 35;
  let perKm = 1.15;

  if (distanceKm > 150) perKm = 1.35;
  if (distanceKm > 350) perKm = 1.55;
  if (distanceKm > 700) perKm = 1.85;

  const dynamicFactor = 0.92 + Math.random() * 0.18;
  return roundToNearestTen((base + (distanceKm * perKm)) * dynamicFactor);
}

function estimateBusFare(distanceKm, serviceType) {
  const perKmByType = {
    'Express': 1.55,
    'Deluxe': 1.75,
    'AC Sleeper': 2.25,
    'Semi Sleeper': 1.95,
    'Non-Stop': 1.7
  };

  const perKm = perKmByType[serviceType] || 1.7;
  const base = serviceType === 'AC Sleeper' ? 80 : 50;
  const dynamicFactor = 0.9 + Math.random() * 0.22;
  return roundToNearestTen((base + (distanceKm * perKm)) * dynamicFactor);
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

      const distanceKm   = estimateDistanceKm(src, dst);
      const duration     = estimateTrainDuration(distanceKm);
      const departure    = pickRandom(departureTimes);
      const arrival      = addMinutes(departure, duration);
      const capacity     = randomTrainCapacity();
      const fare         = estimateTrainFare(distanceKm);
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

      const distanceKm  = estimateDistanceKm(src, dst);
      const duration    = estimateBusDuration(distanceKm);
      const departure   = pickRandom(departureTimes);
      const arrival     = addMinutes(departure, duration);
      const capacity    = randomBusCapacity();
      const serviceType = pickRandom(busServiceTypes);
      const fare        = estimateBusFare(distanceKm, serviceType);
      const busName     = `${pickRandom(realBusNames)} ${serviceType}`;
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
    const deletedTrain = await Transport.deleteMany({ transportType: 'train' });
    console.log(`Removed ${deletedTrain.deletedCount} old train routes.`);
    routeGroups.push({ label: 'train', routes: buildTrainRoutes() });
  }

  if (generationMode === 'bus' || generationMode === 'both') {
    const deletedBus = await Transport.deleteMany({ transportType: 'bus' });
    console.log(`Removed ${deletedBus.deletedCount} old bus routes.`);
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