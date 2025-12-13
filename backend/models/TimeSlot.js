import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema({
    periodNumber: {
        type: String,
        required: true,
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    }
})

const TimeSlot = mongoose.models.TimeSlot || mongoose.model("TimeSlot", timeSlotSchema);

export default TimeSlot;