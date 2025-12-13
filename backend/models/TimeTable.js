import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema({
  section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
  schedule: [
    {
      weekday: {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      },
      slots: [
        {
          hour: { type: Number, min: 1, max: 10 },
          startTime: { type: String },
          endTime: { type: String },
          course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
          faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" }
        }
      ]
    }
  ]
}, { timestamps: true });

const TimeTable = mongoose.models.TimeTable || mongoose.model("TimeTable", timetableSchema);
export default TimeTable;
