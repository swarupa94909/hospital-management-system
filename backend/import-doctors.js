require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const doctors = require('./data/doctors.json');

async function importDoctors() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB connected');

    const formattedDoctors = doctors.map(doctor => {
      const timeSlots = [];

      for (let i = 0; i < doctor.timeSlots.length - 1; i++) {
        timeSlots.push({
          start: doctor.timeSlots[i],
          end: doctor.timeSlots[i + 1]
        });
      }

      return {
        name: doctor.name,
        department: doctor.department,
        timeSlots,
        fee: doctor.fee
      };
    });

    await Doctor.deleteMany({});

    await Doctor.insertMany(formattedDoctors);

    console.log('Doctors imported successfully');
    console.log(formattedDoctors);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

importDoctors();
