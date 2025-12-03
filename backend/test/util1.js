import Faculty from "../models/Faculty.js"
import Mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config({path: "../.env"})

try {
    Mongoose.connect(process.env.MONGO_URI).then(
        console.log("MongoDB Connected")
    )
} catch (error) {
    console.log(error);
}

const names = ['Dr. S. Neduncheliyan', 'Dr. S. Maruthuperumal', 'Dr. K. P. Kaliyamurthie', 'Dr. C. Rajabhushanam', 'Dr. Anitha Karthi', 'Dr. K. Bala', 'Dr. Nalini Joseph', 'Dr. G. Rosline Nesakumari', 'Dr. P. Vasuki', 'Dr. T. Veeramani', 'Dr. S. Thaiyalnayaki', 'Dr. Thirupurasundari D. R.', 'Dr. L. Godlin Atlas', 'Dr. B. Selvapriya', 'Dr. K. Baalaji', 'Dr. K. Sivaraman', 'Dr. K. Upendra Babu', 'Dr. K. V. Shiny', 'Mr. R. MuthuVenkataKrishnan', 'Mrs. J. Ranganayaki', 'Mrs. R. Jagadeeswari', 'Mrs. S. Jenita Christy', 'Mrs. K. Anuranjani', 'Mrs. K. Sathiya Priya', 'Mrs. R. Nivetha', 'Mrs. T. Usha', 'Mrs. E. Benitha Sowmiya', 'Mr. S. Nirmal Sam', 'Mrs. S. Poovitha', 'Mrs. B. N. Swarna Jyothi', 'Mrs. N. Anithaa Kingsly', 'Mrs. R. C. Dyana Priyadharshini', 'Mrs. R. Shamli', 'Ms. G. Nivetha Sri', 'Mr. R. Selva Ganesh', 'Mrs. M. Revathi', 'Mrs. H. Malini', 'Mr. K. Sudhaakar', 'Mrs. S. Salini', 'Mr. V. Ethirajulu', 'Mr. R. Azhagusundaram', 'Ms. T. Shakila', 'Mrs. N. Fathima Shrene Shifna', 'Mr. S. Ramadoss', 'Ms. R. Femimol', 'Mrs. J. Janisha', 'Ms. L. Shalini', 'Ms. G. Nandhini', 'Mrs. S. Sarjun Beevi', 'Ms. K. Amutha', 'Ms. K. Muthulakshmi', 'Ms. Oormila L', 'Ms. D Bhavana', 'Ms. Lethisia Nithiya', 'Mr. K. Keerthi', 'Ms. G. Mythili', 'Mr. Akash', 'Ms. N. Kameshwari', 'Ms. Saranya', 'Ms. V. Madhumitha'];

const phones = ['9994560523', '9848772088', '9941118486', '9445159354', '9841557655', '7395980416', '9444751976', '8500455203', '9944150105', '9080381686', '9566208899', '8124035477', '9787304304', '9944809810', '9566765433', '9600644249', '9841050454', '9629955104', '9444870112', '8940956383', '9597522512', '9444263815', '7305638007', '9600654587', '8489473684', '7598615710', '9786898663', '9445761890', '9629498920', '9003247921', '8939535608', '9865059025', '8778562672', '9952522707', '89035 66709', '9787173736', '9150247157', '97901 74560', '8608676397', '9884460536', '7871358575', '9944994979', '7358983325', '9629183590', '9940463310', '9445452399', '8903483695', '8012269066', '9551235990', '8825701059', '9962912009', '9962306513', '9952912083', '9941048119', '9894285597', '9444251270', '8883051514', '9962603903', '8610390632', '8754670342'];

const emails = ['dean.cse@bharathuniv.ac.in', 'maruthu.cse@bharathuniv.ac.in', 'kaliyamurthie.cse@bharathuniv.ac.in', 'rajabhushanamc.cse@bharathuniv.ac.in', 'anithakarthi.cse@bharathuniv.ac.in', 'bala.cse@bharathuniv.ac.in', 'nalinijoseph.cse.cbcs@bharathuniv.ac.in', 'roslinenesakumari.cse@bharathuniv.ac.in', 'vasuki.cse@bharathuniv.ac.in', 'veeramaniphd@gmail.com', 'thaiyalnayaki.cse@bharathuni.ac.in', 'thirupurasundari.cse@bharathuniv.ac.in', 'godlin88@gmail.com', 'selvapriya.cse@bharathuniv.ac.in', 'baalaji.cse@bharathuniv.ac.in', 'sivaraman.cse@bharathuniv.ac.in', 'upendedbabu.cse@bharathuniv.ac.in', 'kvshiny7@gmail.com', 'muthuvenkatakrishnan.cse@bharathuniv.ac.in', 'jranganayaki.cse@bharathuniv.ac.in', 'jagadeeswari.cse@bharathuniv.ac.in', 'jenitachristy.cse@bharathuniv.ac.in', 'anuranjani.cse@bharathuniv.ac.in', 'sathiyapriya.cse@bharathuniv.ac.in', 'nivetha.cse@bharathuniv.ac.in', 'usha.cse@bharathuniv.ac.in', 'benithasowmiya.cse@bharathuniv.ac.in', 'nirmalsam.cse@bharathuniv.ac.in', 'poovidha.cse@bharathuniv.ac.in', 'swarnajyothi.cse@bharathuniv.ac.in', 'anithaa.cse@bharathuniv.ac.in', 'dyanapriyatharsini.cse@bharathuniv.ac.in', 'shamli.cse@bharathuniv.ac.in', 'nivethasri.cse@bharathuniv.ac.in', 'selvaganesh.cse@bharathuniv.ac.in', 'revathi.cse@bharathuniv.ac.in', 'malini.cse@bharathuniv.ac.in', 'sudhaakar.cse@bharathuniv.ac.in', 'salini.cse@bharathuniv.ac.in', 'ethirajulu.cse@bharathuniv.ac.in', 'azhagusundaram.cse@bharathuniv.ac.in', 'shakila.cse@bharathuniv.ac.in', 'fathimashrene.cse@bharathuniv.ac.in', 'ramadoss.cse@bharathuniv.ac.in', 'femimol.cse@bharathuniv.ac.in', 'janisha.cse@bharathuniv.ac.in', 'shalini.cse@bharathunivac.in', 'nandhini.cse@bharathuniv.ac.in', 'sarjunbeevi.cse@bharathuniv.ac.in', 'amutha.cse@bharathuniv.ac.in', 'muthulakshmi.cse@bharathuniv.ac.in', 'oormila.cse@bharathuniv.ac.in', 'bhavan91@gmail.com', 'lethisiahridhu@gmail.com', 'keerthi.kuppusamy@gmail.com', 'mythilysathishkumar@gmail.com', 'akashkiya@gmail.com', 'kameshwarinandakumar84@gmail.com', 'Saransivani5@gmail.com', 'mathucse04@gmail.com'];

const codes = [
  "BIHERCSE3045", "BIHERCSE3046", "BIHERCSE3047", "BIHERCSE3048", "BIHERCSE3049",
  "BIHERCSE3050", "BIHERCSE3051", "BIHERCSE3052", "BIHERCSE3053", "BIHERCSE3054",
  "BIHERCSE3055", "BIHERCSE3056", "BIHERCSE3057", "BIHERCSE3058", "BIHERCSE3059",
  "BIHERCSE3060", "BIHERCSE3061", "BIHERCSE3062", "BIHERCSE3063", "BIHERCSE3064",
  "BIHERCSE3065", "BIHERCSE3066", "BIHERCSE3067", "BIHERCSE3068", "BIHERCSE3069",
  "BIHERCSE3070", "BIHERCSE3071", "BIHERCSE3072", "BIHERCSE3073", "BIHERCSE3074",
  "BIHERCSE3075", "BIHERCSE3076", "BIHERCSE3077", "BIHERCSE3078", "BIHERCSE3079",
  "BIHERCSE3080", "BIHERCSE3081", "BIHERCSE3082", "BIHERCSE3083", "BIHERCSE3084",
  "BIHERCSE3085", "BIHERCSE3086", "BIHERCSE3087", "BIHERCSE3088", "BIHERCSE3089",
  "BIHERCSE3090", "BIHERCSE3091", "BIHERCSE3092", "BIHERCSE3093", "BIHERCSE3094",
  "BIHERCSE3095", "BIHERCSE3096", "BIHERCSE3097", "BIHERCSE3098", "BIHERCSE3099",
  "BIHERCSE3100"
];

let codeCount = 0;
const role = 'faculty';
const userType = 'faculty';
const password = "$2b$10$Dj8DDjX9fzTyM5loXgghD.tbX2h5I4oryFnddGQwHZJgrDfBGVfUy";
const dob = new Date("1970-01-01");
const bloodgroup = "N/A";
const maritalStatus = "N/A";
const nationality = "Indian";
const religion = "N/A";
const qualification = "M.Tech";
const subjectExpertise = "N/A";
const isExternal = false;
const isPartTime = false;

(async () => {
  for (let i = 0; i < names.length; i++) {
    try {
      const isFaculty = await Faculty.findOne({ name: names[i] });

      if (isFaculty) {
        const status = await Faculty.updateOne(
          { name: names[i] },
          { phone: phones[i], email: emails[i] }
        );

        if (status.modifiedCount > 0) {
          console.log(`Updated contact information of ${names[i]}`);
        } else {
          console.log(`No updates were made for ${names[i]}`);
        }
      } else {
        const facultyData = {
          name: names[i],
          facultyID: codes[codeCount],
          role: role,
          userType: userType,
          department: "CSE",
          joiningDate: new Date("1990-01-01"),
          email: emails[i],
          password: password,
          phone: phones[i],

          personalDetails: {
            dob: dob,
            bloodGroup: bloodgroup,
            maritalStatus: maritalStatus,
            nationality: nationality,
            religion: religion, 
          },

          education: {
            qualification: qualification,
            subjectExpertise: subjectExpertise,
          },

          otherDetails: {
            isExternal: isExternal,
            isPartTime: isPartTime,
          },
        };

        await Faculty.create(facultyData);
        console.log(`Created ${names[i]}`);
        codeCount++; 
      }
    } catch (error) {
      console.log(`Error processing ${names[i]}:`, error);
    }
  }
})();