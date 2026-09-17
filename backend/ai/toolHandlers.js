const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

async function getMyAppointments(patient) {
    const appointments = await Appointment.find({
        $or: [
            { patientId: patient._id },
            { patientContact: patient.contact }
        ]
    }).sort({
        date: 1,
        time: 1
    });

    return appointments;
}

async function getHospitalDepartments() {
    const departments = await Doctor.distinct("department");

    return departments
        .filter(department => department && department.trim())
        .sort();
}

async function getHospitalDoctors() {
    const doctors = await Doctor.find(
        {},
        {
            name: 1,
            department: 1
        }
    ).sort({
        department: 1,
        name: 1
    });

    return doctors;
}

async function getMyProfile(patient) {
    return {
        name: patient.name,
        contact: patient.contact,
        email: patient.email
    };
}

module.exports = {
    get_my_appointments: getMyAppointments,
    get_hospital_departments: getHospitalDepartments,
    get_hospital_doctors: getHospitalDoctors,
    get_my_profile: getMyProfile
};
