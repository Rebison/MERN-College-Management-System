import Faculty from "../models/Faculty.js"
import Mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config({ path: "../.env" })

try {
  Mongoose.connect(process.env.MONGO_URI).then(
    console.log("MongoDB Connected")
  )
} catch (error) {
  console.log(error);
}

// const FacultyName = ['Dr. S. Neduncheliyan', 'Dr. S. Maruthu Perumal', 'Dr. K. P. Kaliyamurthie', 'Dr. C. Rajabhushanam', 'Dr. Anitha Karthi', 'Dr. K. Bala', 'Dr. L. Nalini Joseph', 'Dr. G. Rosline Nesakumari', 'Dr. P. Vasuki', 'Dr. T. Veeramani', 'Dr. S. Thaiyalnayaki', 'Dr. Thirupurasunsari D. R.', 'Dr. L. Godlin Atlas', 'Dr. B. Selvapriya', 'Dr. K. Baalaji', 'Dr. K. Sivaraman', 'Dr. K. Upendra Babu', 'Dr. K. V. Shiny', 'Mr. R. Muthu Venkata Krishnan', 'Mrs. J. Ranganayaki', 'Mrs. R. Jagadeeswari', 'Mrs. S. Jenita Christy', 'Mrs. K. Anuranjani', 'Mrs. K. Sathiya Priya', 'Mrs. R. Nivetha', 'Mrs. T. Usha', 'Mrs. E. Benitha Sowmiya', 'Mr. S. Nirmal Sam', 'Mrs. S. Poovitha', 'Mrs. B. N. Swarna Jyothi', 'Mrs. N. Anithaa Kingsly', 'Mrs. R. C. Dyana Priyadharshini', 'Mrs. R. Shamli', 'Ms. G. Nivetha Sri', 'Mr. R. Selva Ganesh', 'Mrs. M. Revathi', 'Mrs. H. Malini', 'Mr. K. Sudhakar', 'Mrs. S. Salini', 'Mr. V. Ethirajulu', 'Mr. R. Azhagusundaram', 'Mrs. T. Shakila', 'Mrs. N. Fathima Shrene Shifna', 'Mr. S. Ramadoss', 'Ms. R. Femimol', 'Ms. J. Janisha ', 'Ms. L. Shalini', 'Ms. G. Nandhini', 'Ms. Sarjun Beevi', 'Ms. K. Amutha', 'Ms. K. Muthulakshmi', 'Ms. Oormila L.', 'Ms. D. Bhavana', 'Ms. Lethisia Nithiya ', 'Mr. K. Keerthi', 'Ms. G. Mythili', 'Mr. Akash', 'Ms. N. Kameshwari', 'Ms. Saranya', 'Ms. V. Madhumitha'];

// const facultyPhone = ["9994560523", "9848772088", "9941118486", "9445159354", "9841557655", "7395980416", "9444751976", "8500455203", "9944150105", "9080381686", "9566208899", "8124035477", "9787304304", "9944809810", "9566765433", "9600644249", "9841050454", "9629955104", "9444870112", "8940956383", "9597522512", "9444263815", "7305638007", "9600654587", "8489473684", "7598615710", "9786898663", "9445761890", "9629498920", "9003247921", "8939535608", "9865059025", "8778562672", "9952522707", '8903566709', "9787173736", "9150247157", '9790174560', "8608676397", "9884460536", "7871358575", "9944994979", "7358983325", "9629183590", "9940463310", "9445452399", "8903483695", "8012269066", "9551235990", "8825701059", "9962912009", "9962306513", "9952912083", "9941048119", "9894285597", "9444251270", "8883051514", "9962603903", "8610390632", "8754670342"];

// let facultyCodes = [];
// for (let i = 1; i <= FacultyName.length; i++){
//   facultyCodes.push(`BIHERCSE${3000 + i}`);
// } 

// const facultyEmail = ['dean.cse@bharathuniv.ac.in', 'maruthu.cse@bharathuniv.ac.in ', 'kaliyamurthie.cse@bharathuniv.ac.in', 'rajabhushanamc.cse@bharathuniv.ac.in', 'anithakarthi.cse@bharathuniv.ac.in', 'bala.cse@bharathuniv.ac.in', 'nalinijoseph.cse.cbcs@bharathuniv.ac.in', 'roslinenesakumari.cse@bharathuniv.ac.in', 'vasuki.cse@bharathuniv.ac.in', 'veeramaniphd@gmail.com', 'thaiyalnayaki.cse@bharathuni.ac.in', 'thirupurasundari.cse@bharathuniv.ac.in', 'godlin88@gmail.com', 'selvapriya.cse@bharathuniv.ac.in', 'baalaji.cse@bharathuniv.ac.in', 'sivaraman.cse@bharathuniv.ac.in', 'upendedbabu.cse@bharathuniv.ac.in', 'kvshiny7@gmail.com', 'muthuvenkatakrishnan.cse@bharathuniv.ac.in', 'jranganayaki.cse@bharathuniv.ac.in', 'jagadeeswari.cse@bharathuniv.ac.in', 'jenitachristy.cse@bharathuniv.ac.in', 'anuranjani.cse@bharathuniv.ac.in', 'sathiyapriya.cse@bharathuniv.ac.in', 'nivetha.cse@bharathuniv.ac.in', 'usha.cse@bharathuniv.ac.in', 'benithasowmiya.cse@bharathuniv.ac.in', 'nirmalsam.cse@bharathuniv.ac.in', 'poovidha.cse@bharathuniv.ac.in', 'swarnajyothi.cse@bharathuniv.ac.in', 'anithaa.cse@bharathuniv.ac.in', 'dyanapriyatharsini.cse@bharathuniv.ac.in', 'shamli.cse@bharathuniv.ac.in', 'nivethasri.cse@bharathuniv.ac.in ', 'selvaganesh.cse@bharathuniv.ac.in', 'revathi.cse@bharathuniv.ac.in', 'malini.cse@bharathuniv.ac.in', 'sudhaakar.cse@bharathuniv.ac.in', 'salini.cse@bharathuniv.ac.in', 'ethirajulu.cse@bharathuniv.ac.in', 'azhagusundaram.cse@bharathuniv.ac.in', 'shakila.cse@bharathuniv.ac.in', 'fathimashrene.cse@bharathuniv.ac.in', 'ramadoss.cse@bharathuniv.ac.in', 'femimol.cse@bharathuniv.ac.in', 'janisha.cse@bharathuniv.ac.in', 'shalini.cse@bharathunivac.in', 'nandhini.cse@bharathuniv.ac.in', 'sarjunbeevi.cse@bharathuniv.ac.in', 'amutha.cse@bharathuniv.ac.in', 'muthulakshmi.cse@bharathuniv.ac.in', 'oormila.cse@bharathuniv.ac.in', 'bhavan91@gmail.com', 'lethisiahridhu@gmail.com', 'keerthi.kuppusamy@gmail.com', 'mythilysathishkumar@gmail.com', 'akashkiya@gmail.com', 'kameshwarinandakumar84@gmail.com', 'Saransivani5@gmail.com', 'mathucse04@gmail.com'];

// const facultyQualification = ['Ph.D', 'Ph.D', 'Ph.D', 'Ph.D', 'Ph.D', 'Ph.D', 'Ph.D', 'Ph.D', 'Ph.D', 'Ph.D', 'Ph.D', 'Ph.D', 'Ph.D', 'Ph.D', 'Ph.D', 'Ph.D', 'Ph.D', 'Ph.D', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech', 'M. Tech'];

// const role = ['dean', 'hod', 'faculty', 'faculty', 'assistantHod', 'faculty', 'assistantHod', 'assistantHod', 'faculty', 'faculty', 'faculty', 'assistantHod', 'faculty', 'faculty', 'faculty', 'faculty', 'assistantHod', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty', 'faculty'];


// for (let i = 0; i < FacultyName.length ; i++) {
//     const data_instance = {
//         name: FacultyName[i],
//         facultyID: facultyCodes[i],
//         role: role[i],
//         userType: "faculty",
//         department: "CSE",
//         joiningDate: new Date("2021-01-01"),
//         email: facultyEmail[i],
//         password: "$2b$10$Dj8DDjX9fzTyM5loXgghD.tbX2h5I4oryFnddGQwHZJgrDfBGVfUy",
//         phone: facultyPhone[i],

//         personalDetails: {
//             dob: new Date("1990-01-01"),
//             bloodGroup: "N/A",
//             maritalStatus: "N/A",
//             nationality: "Indian",
//             religion: "N/A"
//         },

//         education: {
//             qualification: facultyQualification[i],
//             subjectExpertise: "N/A",
//         },

//         otherDetails: {
//             isExternal: false,
//             isPartTime: false
//         }
//     }

//     try {
//         Faculty.insertOne(data_instance).then(
//             console.log(`Instance of name: ${data_instance.name} has been created`)
//         )
//     }catch(error){
//         console.log(error);
//     }
// }

const newFacultyNames = ["Mrs. Kavitha",
  "Ms. V. Kanchana",
  "Ms. K. Kotteswari",
  "Ms. R. Prathiba",
  "Ms. P. Abirami",
  "Mrs. R. Vaishali",
  "Mrs. Krithika",
  "Mrs. T. Nithya",
  "Mrs. S. K. Uma Maheshwari",
  "Mrs. S. Pavithra",
  "Ms. Poovizhi"
];

let newFacultyCodes = [];
for (let i = 1; i <= newFacultyNames.length; i++){
  newFacultyCodes.push(`BIHERCSE${3060 + i}`);
}

for (let i = 0; i < newFacultyNames.length; i++) {
  const data_instance = {
    name: newFacultyNames[i],
    facultyID: newFacultyCodes[i],
    role: "faculty",
    userType: "faculty",
    department: "CSE",
    joiningDate: new Date("2021-01-01"),
    email: `dummy${i}.cse@bharathuniv.ac.in`,
    password: "$2b$10$Dj8DDjX9fzTyM5loXgghD.tbX2h5I4oryFnddGQwHZJgrDfBGVfUy",
    phone: "NOT AVAILABLE",

    personalDetails: {
      dob: new Date("1990-01-01"),
      bloodGroup: "N/A",
      maritalStatus: "N/A",
      nationality: "Indian",
      religion: "N/A"
    },

    education: {
      qualification: "M. Tech",
      subjectExpertise: "N/A",
    },

    otherDetails: {
      isExternal: false,
      isPartTime: false
    }
  }

  try {
    Faculty.insertOne(data_instance).then(
      console.log(`Instance of name: ${data_instance.name} has been created`)
    )
  } catch (error) {
    console.log(error);
  }
}