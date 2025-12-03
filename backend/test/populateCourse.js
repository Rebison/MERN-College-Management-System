import mongoose from "mongoose";
import { courses } from "../models/index.js";
import dotenv from "dotenv"

dotenv.config({ path: "../.env" });

try {
  mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected");
} catch (error) {
  console.log(error);
}

async function populateCourses() {
  const IIYearCourses = [
    {
      "courseName": "Database Information Systems",
      "courseCode": "U20CSCJ06",
      "category": "Professional",
      "type": "Theory + Lab",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "IoT Programming",
      "courseCode": "U20CSCT06",
      "category": "Professional",
      "type": "Theory",
      "credits": 2,
      "department": "CSE"
    },
    {
      "courseName": "Microprocessor and Microcontrollers",
      "courseCode": "U20CSCT02",
      "category": "Professional",
      "type": "Theory",
      "credits": 3,
      "department": "ECE"
    },
    {
      "courseName": "NCC / NSS / Department Club Activities",
      "courseCode": "U20PDMT04",
      "category": "Elective",
      "type": "Theory",
      "credits": 0,
      "department": "NCC/NSS/CSE"
    },
    {
      "courseName": "Operating Systems",
      "courseCode": "U20CSCJ08",
      "category": "Professional",
      "type": "Theory + Lab",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "Probability and Queuing Theory",
      "courseCode": "U20MABT07",
      "category": "Professional",
      "type": "Theory",
      "credits": 4,
      "department": "Maths"
    },
    {
      "courseName": "Software Engineering and Program Management",
      "courseCode": "U20CSCJ10",
      "category": "Professional",
      "type": "Theory + Lab",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "Data Science",
      "courseCode": "U20CSCJ11",
      "category": "Professional",
      "type": "Theory + Lab",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "Cloud Computing",
      "courseCode": "U20CSCT12",
      "category": "Professional",
      "type": "Theory",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "Cyber Physical System",
      "courseCode": "U20CSCT11",
      "category": "Professional",
      "type": "Theory",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "Blockchain (IOA)",
      "courseCode": "U20CSST43",
      "category": "Elective",
      "type": "Theory",
      "credits": 3,
      "department": "IOA"
    },
    {
      "courseName": "Foundation of Chemistry",
      "courseCode": "U20CYBB01",
      "category": "Elective",
      "type": "Theory + Lab",
      "credits": 3,
      "department": "Chemistry"
    },
    {
      "courseName": "Foundation of Mathematics",
      "courseCode": "U20MABB01",
      "category": "Elective",
      "type": "Theory + Lab",
      "credits": 3,
      "department": "Maths"
    },
    {
      "courseName": "Data Visualization (IBM)",
      "courseCode": "U20CSSTS53",
      "category": "Elective",
      "type": "Theory + Lab",
      "credits": 3,
      "department": "IBM"
    },
    {
      "courseName": "Structured Query Language and Visualization (UpGrad)",
      "courseCode": "U20CSSTS62",
      "category": "Elective",
      "type": "Theory + Lab",
      "credits": 3,
      "department": "UpGrad"
    },
    {
      "courseName": "Big Data Analytics",
      "courseCode": "U20CSST02",
      "category": "Professional",
      "type": "Theory",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "Data Security",
      "courseCode": "U20CSST03",
      "category": "Professional",
      "type": "Theory",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "Data Warehousing and Mining",
      "courseCode": "U20CSST04",
      "category": "Professional",
      "type": "Theory",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "Embedded System Design Using Raspberry Pi",
      "courseCode": "U20ECOT03",
      "category": "Elective",
      "type": "Theory",
      "credits": 3,
      "department": "ECE"
    },
    {
      "courseName": "Internet and Mobile Programming",
      "courseCode": "U20CSCJ09",
      "category": "Professional",
      "type": "Theory + Lab",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "Indian Traditional Knowledge",
      "courseCode": "U20PDMT02",
      "category": "Professional",
      "type": "Theory",
      "credits": 0,
      "department": "CSE"
    },
    {
      "courseName": "Green Technology",
      "courseCode": "U20EEOT01",
      "category": "Elective",
      "type": "Theory",
      "credits": 3,
      "department": "ECE/EEE"
    },
    {
      "courseName": "Principles of Artificial Intelligence",
      "courseCode": "U20CSCT05",
      "category": "Professional",
      "type": "Theory",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "Road Safety",
      "courseCode": "U20EEOT03",
      "category": "Elective",
      "type": "Theory",
      "credits": 3,
      "department": "Civil"
    },
    {
      "courseName": "Industrial Safety",
      "courseCode": "U20MEOT02",
      "category": "Elective",
      "type": "Theory",
      "credits": 3,
      "department": "Mech"
    },
    {
      "courseName": "Engineering Mechanics",
      "courseCode": "U20MEET01",
      "category": "Elective",
      "type": "Theory",
      "credits": 3,
      "department": "Mech"
    },
    {
      "courseName": "AI Algorithmic Approach",
      "courseCode": "U20CSCT28",
      "category": "Professional",
      "type": "Theory",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "Computer Vision",
      "courseCode": "U20CSST24",
      "category": "Professional",
      "type": "Theory",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "Data Visualization Techniques",
      "courseCode": "U20CSCJ13",
      "category": "Professional",
      "type": "Theory + Lab",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "IoT Data Analytics",
      "courseCode": "U20CSST28",
      "category": "Professional",
      "type": "Theory",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "Machine Learning",
      "courseCode": "U20CSCJ12",
      "category": "Professional",
      "type": "Theory + Lab",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "Business Intelligence",
      "courseCode": "U20CSCT21",
      "category": "Professional",
      "type": "Theory",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "Cryptography Principles and Techniques",
      "courseCode": "U20CSCT13",
      "category": "Professional",
      "type": "Theory",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "Digital Image Processing",
      "courseCode": "U20CSST30",
      "category": "Professional",
      "type": "Theory",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "Block Chain Techniques",
      "courseCode": "U20CSST07",
      "category": "Professional",
      "type": "Theory",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "Data Warehousing and Business Intelligence",
      "courseCode": "U20CSCT31",
      "category": "Professional",
      "type": "Theory",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "Cyber Security",
      "courseCode": "U20CSST14",
      "category": "Professional",
      "type": "Theory",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "Cyber Forensics",
      "courseCode": "U20CSCT16",
      "category": "Professional",
      "type": "Theory",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "Ethical Hacking",
      "courseCode": "U20CSCT15",
      "category": "Professional",
      "type": "Theory",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "Software Development Security",
      "courseCode": "U20CSST18",
      "category": "Professional",
      "type": "Theory",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "Security and Risk Management",
      "courseCode": "U20CSST11",
      "category": "Professional",
      "type": "Theory",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "Augmented Reality (IOA)",
      "courseCode": "U20CSST45",
      "category": "Elective",
      "type": "Theory",
      "credits": 3,
      "department": "IOA"
    },
    {
      "courseName": "Internet of Things: Cloud Computing Business Implications (IOA)",
      "courseCode": "U20CSST44",
      "category": "Elective",
      "type": "Theory",
      "credits": 3,
      "department": "IOA"
    },
    {
      "courseName": "Compiler Design",
      "courseCode": "U20CSCT03",
      "category": "Professional",
      "type": "Theory",
      "credits": 3,
      "department": "CSE"
    },
    {
      "courseName": "Java Programming",
      "courseCode": "U20CSCJ05",
      "category": "Professional",
      "type": "Theory + Lab",
      "credits": 2,
      "department": "CSE"
    },
    {
      "courseName": "Development of Machine Learning Models (IBM)",
      "courseCode": "U20CSST56",
      "category": "Elective",
      "type": "Theory",
      "credits": 3,
      "department": "IBM"
    },
    {
      "courseName": "Business Intelligence (IBM)",
      "courseCode": "U20CSST55",
      "category": "Elective",
      "type": "Theory",
      "credits": 3,
      "department": "IBM"
    }
  ];


  try {
    await courses.insertMany(IIYearCourses);
    console.log("Courses populated successfully");
  } catch (error) {
    console.error("Error populating courses:", error);
  }
}

populateCourses();