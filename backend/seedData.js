const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Transport = require('./models/Transport');

// Simple test data with 20 routes
const sampleTransports = [
  {
    transportType: 'bus',
    name: 'Express Bus Service',
    number: 'EXP-101',
    capacity: 50,
    availableSeats: 15,
    fare: 350,
    source: 'Coimbatore',
    destination: 'Erode',
    departureTime: '08:00 AM',
    arrivalTime: '10:30 AM',
    duration: 150,
    schedule: [
      { stopName: 'Coimbatore Central', stopOrder: 1, arrivalTime: '08:00 AM', departureTime: '08:00 AM', lat: 11.0081, lng: 76.9874 },
      { stopName: 'Kuniyamuthur', stopOrder: 2, arrivalTime: '08:30 AM', departureTime: '08:32 AM', lat: 11.0381, lng: 76.9574 },
      { stopName: 'Erode Junction', stopOrder: 3, arrivalTime: '10:30 AM', departureTime: '10:30 AM', lat: 11.3441, lng: 77.7064 }
    ]
  },
  {
    transportType: 'bus',
    name: 'City Bus Rapid',
    number: 'CBR-205',
    capacity: 45,
    availableSeats: 20,
    fare: 300,
    source: 'Coimbatore',
    destination: 'Erode',
    departureTime: '09:00 AM',
    arrivalTime: '11:30 AM',
    duration: 150,
    schedule: [
      { stopName: 'Coimbatore Central', stopOrder: 1, arrivalTime: '09:00 AM', departureTime: '09:00 AM', lat: 11.0081, lng: 76.9874 },
      { stopName: 'Peelamedu', stopOrder: 2, arrivalTime: '09:35 AM', departureTime: '09:37 AM', lat: 11.0181, lng: 76.9674 },
      { stopName: 'Erode Junction', stopOrder: 3, arrivalTime: '11:30 AM', departureTime: '11:30 AM', lat: 11.3441, lng: 77.7064 }
    ]
  },
  {
    transportType: 'train',
    name: 'Express Train Service',
    number: 'TR-501',
    capacity: 200,
    availableSeats: 75,
    fare: 400,
    source: 'Coimbatore',
    destination: 'Erode',
    departureTime: '10:00 AM',
    arrivalTime: '11:00 AM',
    duration: 60,
    schedule: [
      { stopName: 'Coimbatore Station', stopOrder: 1, arrivalTime: '10:00 AM', departureTime: '10:00 AM', lat: 11.0081, lng: 76.9874 },
      { stopName: 'Erode Station', stopOrder: 2, arrivalTime: '11:00 AM', departureTime: '11:00 AM', lat: 11.3441, lng: 77.7064 }
    ]
  },
  {
    transportType: 'bus',
    name: 'Swift Travels',
    number: 'SWT-302',
    capacity: 55,
    availableSeats: 10,
    fare: 380,
    source: 'Coimbatore',
    destination: 'Salem',
    departureTime: '07:30 AM',
    arrivalTime: '10:45 AM',
    duration: 195,
    schedule: [
      { stopName: 'Coimbatore Central', stopOrder: 1, arrivalTime: '07:30 AM', departureTime: '07:30 AM', lat: 11.0081, lng: 76.9874 },
      { stopName: 'Ooty Road', stopOrder: 2, arrivalTime: '08:30 AM', departureTime: '08:32 AM', lat: 11.1581, lng: 76.8574 },
      { stopName: 'Salem Bus Stand', stopOrder: 3, arrivalTime: '10:45 AM', departureTime: '10:45 AM', lat: 11.6643, lng: 78.1460 }
    ]
  },
  {
    transportType: 'bus',
    name: 'Comfort Coach',
    number: 'CC-103',
    capacity: 60,
    availableSeats: 25,
    fare: 320,
    source: 'Coimbatore',
    destination: 'Chennai',
    departureTime: '06:00 AM',
    arrivalTime: '11:00 AM',
    duration: 300,
    schedule: [
      { stopName: 'Coimbatore Central', stopOrder: 1, arrivalTime: '06:00 AM', departureTime: '06:00 AM', lat: 11.0081, lng: 76.9874 },
      { stopName: 'Krishnagiri', stopOrder: 2, arrivalTime: '08:15 AM', departureTime: '08:20 AM', lat: 12.5064, lng: 78.5092 },
      { stopName: 'Chennai Central', stopOrder: 3, arrivalTime: '11:00 AM', departureTime: '11:00 AM', lat: 13.0827, lng: 80.2707 }
    ]
  },
  {
    transportType: 'bus',
    name: 'Night Express',
    number: 'NX-401',
    capacity: 40,
    availableSeats: 8,
    fare: 450,
    source: 'Erode',
    destination: 'Bangalore',
    departureTime: '10:00 PM',
    arrivalTime: '05:30 AM',
    duration: 420,
    schedule: [
      { stopName: 'Erode Junction', stopOrder: 1, arrivalTime: '10:00 PM', departureTime: '10:00 PM', lat: 11.3441, lng: 77.7064 },
      { stopName: 'Dharmapuri', stopOrder: 2, arrivalTime: '12:45 AM', departureTime: '12:50 AM', lat: 12.1733, lng: 78.5644 },
      { stopName: 'Bangalore', stopOrder: 3, arrivalTime: '05:30 AM', departureTime: '05:30 AM', lat: 12.9716, lng: 77.5946 }
    ]
  },
  {
    transportType: 'train',
    name: 'Shatabdi Express',
    number: 'SHB-301',
    capacity: 220,
    availableSeats: 45,
    fare: 550,
    source: 'Coimbatore',
    destination: 'Bangalore',
    departureTime: '08:30 AM',
    arrivalTime: '02:30 PM',
    duration: 360,
    schedule: [
      { stopName: 'Coimbatore Station', stopOrder: 1, arrivalTime: '08:30 AM', departureTime: '08:30 AM', lat: 11.0081, lng: 76.9874 },
      { stopName: 'Bangalore Station', stopOrder: 2, arrivalTime: '02:30 PM', departureTime: '02:30 PM', lat: 12.9716, lng: 77.5946 }
    ]
  },
  {
    transportType: 'bus',
    name: 'Premium Travels',
    number: 'PRM-501',
    capacity: 50,
    availableSeats: 30,
    fare: 280,
    source: 'Salem',
    destination: 'Bangalore',
    departureTime: '09:00 AM',
    arrivalTime: '02:30 PM',
    duration: 330,
    schedule: [
      { stopName: 'Salem Bus Stand', stopOrder: 1, arrivalTime: '09:00 AM', departureTime: '09:00 AM', lat: 11.6643, lng: 78.1460 },
      { stopName: 'Krishnagiri', stopOrder: 2, arrivalTime: '10:30 AM', departureTime: '10:35 AM', lat: 12.5064, lng: 78.5092 },
      { stopName: 'Bangalore', stopOrder: 3, arrivalTime: '02:30 PM', departureTime: '02:30 PM', lat: 12.9716, lng: 77.5946 }
    ]
  },
  {
    transportType: 'bus',
    name: 'Metro Bus',
    number: 'MB-601',
    capacity: 45,
    availableSeats: 18,
    fare: 420,
    source: 'Chennai',
    destination: 'Bangalore',
    departureTime: '11:00 PM',
    arrivalTime: '06:00 AM',
    duration: 420,
    schedule: [
      { stopName: 'Chennai Central', stopOrder: 1, arrivalTime: '11:00 PM', departureTime: '11:00 PM', lat: 13.0827, lng: 80.2707 },
      { stopName: 'Vellore', stopOrder: 2, arrivalTime: '02:30 AM', departureTime: '02:35 AM', lat: 12.9689, lng: 79.1288 },
      { stopName: 'Bangalore', stopOrder: 3, arrivalTime: '06:00 AM', departureTime: '06:00 AM', lat: 12.9716, lng: 77.5946 }
    ]
  },
  {
    transportType: 'train',
    name: 'Rajdhani Express',
    number: 'RJ-201',
    capacity: 250,
    availableSeats: 60,
    fare: 650,
    source: 'Bangalore',
    destination: 'Delhi',
    departureTime: '02:00 PM',
    arrivalTime: '10:00 AM',
    duration: 1440,
    schedule: [
      { stopName: 'Bangalore Station', stopOrder: 1, arrivalTime: '02:00 PM', departureTime: '02:00 PM', lat: 12.9716, lng: 77.5946 },
      { stopName: 'Delhi Station', stopOrder: 2, arrivalTime: '10:00 AM', departureTime: '10:00 AM', lat: 28.7041, lng: 77.1025 }
    ]
  },
  {
    transportType: 'bus',
    name: 'Royal Coach',
    number: 'RC-701',
    capacity: 55,
    availableSeats: 22,
    fare: 520,
    source: 'Hyderabad',
    destination: 'Bangalore',
    departureTime: '04:00 PM',
    arrivalTime: '11:00 PM',
    duration: 420,
    schedule: [
      { stopName: 'Hyderabad Bus Stand', stopOrder: 1, arrivalTime: '04:00 PM', departureTime: '04:00 PM', lat: 17.3850, lng: 78.4867 },
      { stopName: 'Kurnool', stopOrder: 2, arrivalTime: '07:30 PM', departureTime: '07:35 PM', lat: 15.8281, lng: 78.1197 },
      { stopName: 'Bangalore', stopOrder: 3, arrivalTime: '11:00 PM', departureTime: '11:00 PM', lat: 12.9716, lng: 77.5946 }
    ]
  },
  {
    transportType: 'bus',
    name: 'Express Bus Service',
    number: 'EXP-102',
    capacity: 50,
    availableSeats: 12,
    fare: 380,
    source: 'Erode',
    destination: 'Salem',
    departureTime: '07:00 AM',
    arrivalTime: '09:30 AM',
    duration: 150,
    schedule: [
      { stopName: 'Erode Junction', stopOrder: 1, arrivalTime: '07:00 AM', departureTime: '07:00 AM', lat: 11.3441, lng: 77.7064 },
      { stopName: 'Gobichettipalayam', stopOrder: 2, arrivalTime: '08:00 AM', departureTime: '08:05 AM', lat: 11.4833, lng: 77.3333 },
      { stopName: 'Salem Bus Stand', stopOrder: 3, arrivalTime: '09:30 AM', departureTime: '09:30 AM', lat: 11.6643, lng: 78.1460 }
    ]
  },
  {
    transportType: 'train',
    name: 'Express Train',
    number: 'EXP-401',
    capacity: 180,
    availableSeats: 50,
    fare: 480,
    source: 'Chennai',
    destination: 'Delhi',
    departureTime: '08:00 PM',
    arrivalTime: '08:00 AM',
    duration: 1440,
    schedule: [
      { stopName: 'Chennai Central', stopOrder: 1, arrivalTime: '08:00 PM', departureTime: '08:00 PM', lat: 13.0827, lng: 80.2707 },
      { stopName: 'Delhi Station', stopOrder: 2, arrivalTime: '08:00 AM', departureTime: '08:00 AM', lat: 28.7041, lng: 77.1025 }
    ]
  },
  {
    transportType: 'bus',
    name: 'Swift Travels',
    number: 'SWT-303',
    capacity: 55,
    availableSeats: 28,
    fare: 250,
    source: 'Coimbatore',
    destination: 'Kochi',
    departureTime: '06:00 AM',
    arrivalTime: '12:00 PM',
    duration: 360,
    schedule: [
      { stopName: 'Coimbatore Central', stopOrder: 1, arrivalTime: '06:00 AM', departureTime: '06:00 AM', lat: 11.0081, lng: 76.9874 },
      { stopName: 'Palakkad', stopOrder: 2, arrivalTime: '08:30 AM', departureTime: '08:35 AM', lat: 10.7867, lng: 76.6548 },
      { stopName: 'Kochi Bus Stand', stopOrder: 3, arrivalTime: '12:00 PM', departureTime: '12:00 PM', lat: 9.9312, lng: 76.2673 }
    ]
  },
  {
    transportType: 'bus',
    name: 'Comfort Coach',
    number: 'CC-104',
    capacity: 60,
    availableSeats: 35,
    fare: 290,
    source: 'Salem',
    destination: 'Chennai',
    departureTime: '12:00 PM',
    arrivalTime: '04:00 PM',
    duration: 240,
    schedule: [
      { stopName: 'Salem Bus Stand', stopOrder: 1, arrivalTime: '12:00 PM', departureTime: '12:00 PM', lat: 11.6643, lng: 78.1460 },
      { stopName: 'Krishnagiri', stopOrder: 2, arrivalTime: '01:30 PM', departureTime: '01:35 PM', lat: 12.5064, lng: 78.5092 },
      { stopName: 'Chennai Central', stopOrder: 3, arrivalTime: '04:00 PM', departureTime: '04:00 PM', lat: 13.0827, lng: 80.2707 }
    ]
  },
  {
    transportType: 'train',
    name: 'Rapid Service',
    number: 'RST-302',
    capacity: 190,
    availableSeats: 65,
    fare: 380,
    source: 'Coimbatore',
    destination: 'Kochi',
    departureTime: '09:00 AM',
    arrivalTime: '01:00 PM',
    duration: 240,
    schedule: [
      { stopName: 'Coimbatore Station', stopOrder: 1, arrivalTime: '09:00 AM', departureTime: '09:00 AM', lat: 11.0081, lng: 76.9874 },
      { stopName: 'Kochi Station', stopOrder: 2, arrivalTime: '01:00 PM', departureTime: '01:00 PM', lat: 9.9312, lng: 76.2673 }
    ]
  },
  {
    transportType: 'bus',
    name: 'Night Express',
    number: 'NX-402',
    capacity: 40,
    availableSeats: 5,
    fare: 520,
    source: 'Bangalore',
    destination: 'Mumbai',
    departureTime: '09:00 PM',
    arrivalTime: '07:00 AM',
    duration: 600,
    schedule: [
      { stopName: 'Bangalore', stopOrder: 1, arrivalTime: '09:00 PM', departureTime: '09:00 PM', lat: 12.9716, lng: 77.5946 },
      { stopName: 'Pune', stopOrder: 2, arrivalTime: '03:00 AM', departureTime: '03:30 AM', lat: 18.5204, lng: 73.8567 },
      { stopName: 'Mumbai', stopOrder: 3, arrivalTime: '07:00 AM', departureTime: '07:00 AM', lat: 19.0760, lng: 72.8777 }
    ]
  },
  {
    transportType: 'bus',
    name: 'Premium Travels',
    number: 'PRM-502',
    capacity: 50,
    availableSeats: 16,
    fare: 380,
    source: 'Erode',
    destination: 'Chennai',
    departureTime: '01:00 AM',
    arrivalTime: '08:00 AM',
    duration: 420,
    schedule: [
      { stopName: 'Erode Junction', stopOrder: 1, arrivalTime: '01:00 AM', departureTime: '01:00 AM', lat: 11.3441, lng: 77.7064 },
      { stopName: 'Krishnagiri', stopOrder: 2, arrivalTime: '04:30 AM', departureTime: '04:35 AM', lat: 12.5064, lng: 78.5092 },
      { stopName: 'Chennai Central', stopOrder: 3, arrivalTime: '08:00 AM', departureTime: '08:00 AM', lat: 13.0827, lng: 80.2707 }
    ]
  },
  {
    transportType: 'train',
    name: 'Express Train Service',
    number: 'TR-502',
    capacity: 200,
    availableSeats: 88,
    fare: 420,
    source: 'Salem',
    destination: 'Chennai',
    departureTime: '03:30 PM',
    arrivalTime: '06:30 PM',
    duration: 180,
    schedule: [
      { stopName: 'Salem Station', stopOrder: 1, arrivalTime: '03:30 PM', departureTime: '03:30 PM', lat: 11.6643, lng: 78.1460 },
      { stopName: 'Chennai Central', stopOrder: 2, arrivalTime: '06:30 PM', departureTime: '06:30 PM', lat: 13.0827, lng: 80.2707 }
    ]
  },
  {
    transportType: 'train',
    name: 'Vande Bharat Express',
    number: 'VB-2024',
    capacity: 400,
    availableSeats: 120,
    fare: 1500,
    source: 'Coimbatore',
    destination: 'Chennai',
    departureTime: '06:00 AM',
    arrivalTime: '11:50 AM',
    duration: 350,
    schedule: [
      { stopName: 'Coimbatore Station', stopOrder: 1, arrivalTime: '06:00 AM', departureTime: '06:00 AM', lat: 11.0081, lng: 76.9874 },
      { stopName: 'Tiruppur', stopOrder: 2, arrivalTime: '06:40 AM', departureTime: '06:45 AM', lat: 11.1085, lng: 77.3411 },
      { stopName: 'Erode Junction', stopOrder: 3, arrivalTime: '07:30 AM', departureTime: '07:35 AM', lat: 11.3441, lng: 77.7064 },
      { stopName: 'Salem Junction', stopOrder: 4, arrivalTime: '08:40 AM', departureTime: '08:45 AM', lat: 11.6643, lng: 78.1460 },
      { stopName: 'Chennai Central', stopOrder: 5, arrivalTime: '11:50 AM', departureTime: '11:50 AM', lat: 13.0827, lng: 80.2707 }
    ]
  },
  {
    transportType: 'train',
    name: 'Kerala Express',
    number: 'KE-12626',
    capacity: 800,
    availableSeats: 250,
    fare: 850,
    source: 'Thiruvananthapuram',
    destination: 'Coimbatore',
    departureTime: '11:15 AM',
    arrivalTime: '07:30 PM',
    duration: 495,
    schedule: [
      { stopName: 'Thiruvananthapuram Central', stopOrder: 1, arrivalTime: '11:15 AM', departureTime: '11:15 AM', lat: 8.4875, lng: 76.9525 },
      { stopName: 'Kochi (Ernakulam)', stopOrder: 2, arrivalTime: '03:00 PM', departureTime: '03:10 PM', lat: 9.9312, lng: 76.2673 },
      { stopName: 'Thrissur', stopOrder: 3, arrivalTime: '04:30 PM', departureTime: '04:35 PM', lat: 10.5276, lng: 76.2144 },
      { stopName: 'Coimbatore Station', stopOrder: 4, arrivalTime: '07:30 PM', departureTime: '07:30 PM', lat: 11.0081, lng: 76.9874 }
    ]
  },
  {
    transportType: 'train',
    name: 'Rockfort Express',
    number: 'RE-12653',
    capacity: 650,
    availableSeats: 180,
    fare: 450,
    source: 'Chennai',
    destination: 'Tiruchirappalli',
    departureTime: '11:30 PM',
    arrivalTime: '05:40 AM',
    duration: 370,
    schedule: [
      { stopName: 'Chennai Egmore', stopOrder: 1, arrivalTime: '11:30 PM', departureTime: '11:30 PM', lat: 13.0784, lng: 80.2608 },
      { stopName: 'Villupuram', stopOrder: 2, arrivalTime: '02:10 AM', departureTime: '02:15 AM', lat: 11.9401, lng: 79.4861 },
      { stopName: 'Tiruchirappalli Junction', stopOrder: 3, arrivalTime: '05:40 AM', departureTime: '05:40 AM', lat: 10.7905, lng: 78.7047 }
    ]
  },
  {
    transportType: 'train',
    name: 'Hussainsagar Express',
    number: 'HE-12702',
    capacity: 700,
    availableSeats: 125,
    fare: 650,
    source: 'Hyderabad',
    destination: 'Pune',
    departureTime: '02:45 PM',
    arrivalTime: '01:00 AM',
    duration: 615,
    schedule: [
      { stopName: 'Hyderabad Deccan', stopOrder: 1, arrivalTime: '02:45 PM', departureTime: '02:45 PM', lat: 17.3930, lng: 78.4682 },
      { stopName: 'Kalaburagi', stopOrder: 2, arrivalTime: '07:15 PM', departureTime: '07:20 PM', lat: 17.3297, lng: 76.8343 },
      { stopName: 'Solapur', stopOrder: 3, arrivalTime: '09:00 PM', departureTime: '09:05 PM', lat: 17.6599, lng: 75.9064 },
      { stopName: 'Pune Junction', stopOrder: 4, arrivalTime: '01:00 AM', departureTime: '01:00 AM', lat: 18.5283, lng: 73.8744 }
    ]
  },
  {
    transportType: 'train',
    name: 'Island Express',
    number: 'IE-16526',
    capacity: 750,
    availableSeats: 210,
    fare: 900,
    source: 'Bangalore',
    destination: 'Thiruvananthapuram',
    departureTime: '08:10 PM',
    arrivalTime: '01:10 PM',
    duration: 1020,
    schedule: [
      { stopName: 'Bangalore Station', stopOrder: 1, arrivalTime: '08:10 PM', departureTime: '08:10 PM', lat: 12.9716, lng: 77.5946 },
      { stopName: 'Coimbatore Station', stopOrder: 2, arrivalTime: '04:15 AM', departureTime: '04:20 AM', lat: 11.0081, lng: 76.9874 },
      { stopName: 'Kochi (Ernakulam)', stopOrder: 3, arrivalTime: '08:45 AM', departureTime: '08:50 AM', lat: 9.9312, lng: 76.2673 },
      { stopName: 'Thiruvananthapuram Central', stopOrder: 4, arrivalTime: '01:10 PM', departureTime: '01:10 PM', lat: 8.4875, lng: 76.9525 }
    ]
  },
  {
    transportType: 'train',
    name: 'Charminar Express',
    number: 'CE-12759',
    capacity: 850,
    availableSeats: 300,
    fare: 750,
    source: 'Chennai',
    destination: 'Hyderabad',
    departureTime: '06:10 PM',
    arrivalTime: '08:00 AM',
    duration: 830,
    schedule: [
      { stopName: 'Chennai Central', stopOrder: 1, arrivalTime: '06:10 PM', departureTime: '06:10 PM', lat: 13.0827, lng: 80.2707 },
      { stopName: 'Vijayawada', stopOrder: 2, arrivalTime: '01:10 AM', departureTime: '01:20 AM', lat: 16.5062, lng: 80.6480 },
      { stopName: 'Warangal', stopOrder: 3, arrivalTime: '04:30 AM', departureTime: '04:32 AM', lat: 17.9689, lng: 79.5941 },
      { stopName: 'Hyderabad Deccan', stopOrder: 4, arrivalTime: '08:00 AM', departureTime: '08:00 AM', lat: 17.3930, lng: 78.4682 }
    ]
  },
  {
    transportType: 'bus',
    name: 'KSRTC Volvo',
    number: 'KA-V-120',
    capacity: 45,
    availableSeats: 20,
    fare: 1200,
    source: 'Bangalore',
    destination: 'Pune',
    departureTime: '07:00 PM',
    arrivalTime: '09:00 AM',
    duration: 840,
    schedule: [
      { stopName: 'Bangalore', stopOrder: 1, arrivalTime: '07:00 PM', departureTime: '07:00 PM', lat: 12.9716, lng: 77.5946 },
      { stopName: 'Hubballi', stopOrder: 2, arrivalTime: '01:30 AM', departureTime: '01:45 AM', lat: 15.3647, lng: 75.1240 },
      { stopName: 'Pune', stopOrder: 3, arrivalTime: '09:00 AM', departureTime: '09:00 AM', lat: 18.5204, lng: 73.8567 }
    ]
  },
  {
    transportType: 'bus',
    name: 'SETC Non-Stop',
    number: 'TN-S-991',
    capacity: 40,
    availableSeats: 15,
    fare: 400,
    source: 'Tiruchirappalli',
    destination: 'Salem',
    departureTime: '10:00 AM',
    arrivalTime: '01:30 PM',
    duration: 210,
    schedule: [
      { stopName: 'Tiruchirappalli Central Bus Stand', stopOrder: 1, arrivalTime: '10:00 AM', departureTime: '10:00 AM', lat: 10.8050, lng: 78.6853 },
      { stopName: 'Namakkal', stopOrder: 2, arrivalTime: '12:00 PM', departureTime: '12:05 PM', lat: 11.2189, lng: 78.1678 },
      { stopName: 'Salem Bus Stand', stopOrder: 3, arrivalTime: '01:30 PM', departureTime: '01:30 PM', lat: 11.6643, lng: 78.1460 }
    ]
  }
];

async function seedDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully');

    console.log('🗑️ Clearing existing transports...');
    await Transport.deleteMany({});
    console.log('✅ Cleared existing transports');

    console.log('📝 Inserting sample transports...');
    const inserted = await Transport.insertMany(sampleTransports);
    console.log(`✅ Inserted ${inserted.length} sample transports`);
    
    console.log('\n📋 Sample routes inserted:');
    inserted.forEach((t, i) => {
      console.log(`${i + 1}. ${t.source} → ${t.destination} (${t.number}) | ₹${t.fare} | ${t.departureTime}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}