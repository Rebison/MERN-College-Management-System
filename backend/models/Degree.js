import mongoose from 'mongoose';

const degreeSchema = new mongoose.Schema({
    name: {
        type: String,   // e.g., "Bachelor of Technology"
        required: true,
    },
    shortName: {
        type: String,   // e.g., "B.Tech", "M.Tech"
        required: true, 
    },
    level: {
        type: String,
        enum: ['UG', 'PG', 'PhD'],
        required: true,
    },
    durationInYears: { 
        type: Number,   // e.g., 2 (MBA), 3 (B.Sc), 4 (B.Tech)
        required: true 
    },
});

degreeSchema.index({ name: 1, shortName: 1 }, { unique: true });

const Degree = mongoose.models.Degree || mongoose.model("Degree", degreeSchema);

export default Degree;