const { Type } = require("@google/genai");

const tools = [
    {
        name: "get_my_appointments",
        description:
            "Get the authenticated patient's appointments. Use this when the patient asks about their appointments, upcoming appointments, scheduled visits, or appointment history.",
        parameters: {
            type: Type.OBJECT,
            properties: {},
        },
    },
    {
        name: "get_hospital_departments",
        description:
            "Get the list of departments available in the hospital. Use this when the patient asks how many departments there are, what departments are available, or asks for a list of hospital departments.",
        parameters: {
            type: Type.OBJECT,
            properties: {},
        },
    },
    {
        name: "get_hospital_doctors",
        description:
            "Get information about doctors available in the hospital. Use this when the patient asks how many doctors there are, asks for a list of doctors, or asks about available doctors.",
        parameters: {
            type: Type.OBJECT,
            properties: {},
        },
    },

    {
        name: "get_my_profile",
        description:
            "Get the authenticated patient's own profile information, including their name, contact number, and email. Use this when the patient asks about their own name, profile, contact number, or email.",
        parameters: {
            type: Type.OBJECT,
            properties: {},
        },
    },
];

module.exports = tools;
