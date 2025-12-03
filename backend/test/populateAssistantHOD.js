import AssistantHOD from "../models/AssistantHOD.js";
import Section from "../models/Section.js";
import Faculty from "../models/Faculty.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const rosline = await Faculty.findOne({ name: "Dr. G. Rosline Nesakumari" }, { _id: 1 });
    const anitha = await Faculty.findOne({ name: "Dr. Anitha Karthi" }, { _id: 1 });
    const nalini = await Faculty.findOne({ name: "Dr. L. Nalini Joseph" }, { _id: 1 });
    const upendra = await Faculty.findOne({ name: "Dr. K. Upendra Babu" }, { _id: 1 });
    const thiru = await Faculty.findOne({ name: "Dr. Thirupurasunsari D. R." }, { _id: 1 });

    let data = [];

    // Rosline (U23 only)
    const roslineSections = await Section.find({
      batch: "U23",
      name: { $in: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M'] }
    });
    data.push({
      assistantHodID: rosline._id,
      sectionsCoordinated: roslineSections.map(section => section._id)
    });

    // Thiru (U22 only)
    const thiruSections = await Section.find({
      batch: "U22",
      name: { $in: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N'] }
    });
    data.push({
      assistantHodID: thiru._id,
      sectionsCoordinated: thiruSections.map(section => section._id)
    });

    // Anitha - Merge U23 & U22 without mixing distinct sections
    const anithaSectionsU23 = await Section.find({
      batch: "U23",
      name: { $in: ["AI + DS + IOT", "AIML"] }
    });
    const anithaSectionsU22 = await Section.find({
      batch: "U22",
      name: { $in: ["AI", "AIML"] }
    });
    data.push({
      assistantHodID: anitha._id,
      sectionsCoordinated: [...anithaSectionsU23, ...anithaSectionsU22].map(section => section._id)
    });

    // Nalini - Merge U23 & U22 without mixing distinct sections
    const naliniSectionsU23 = await Section.find({
      batch: "U23",
      name: { $in: ["CS"] }
    });
    const naliniSectionsU22 = await Section.find({
      batch: "U22",
      name: { $in: ["CS", "DS", "IOT"] }
    });
    data.push({
      assistantHodID: nalini._id,
      sectionsCoordinated: [...naliniSectionsU23, ...naliniSectionsU22].map(section => section._id)
    });

    // Upendra - Merge U23 & U22 without mixing distinct sections
    const upendraSectionsU23 = await Section.find({
      batch: "U23",
      name: { $in: ["IOA-1","IOA-2","IBM + UPGRAD"] }
    });
    const upendraSectionsU22 = await Section.find({
      batch: "U22",
      name: { $in: ["IOA", "IBM"] }
    });
    data.push({
      assistantHodID: upendra._id,
      sectionsCoordinated: [...upendraSectionsU23, ...upendraSectionsU22].map(section => section._id)
    });

    await AssistantHOD.insertMany(data);
    console.log(`Instance of AssistantHOD inserted`);
  } catch (error) {
    console.log(error);
  } finally {
    mongoose.connection.close();
  }
}

main();
