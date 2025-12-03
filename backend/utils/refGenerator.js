import { Counter } from '#models/index.js';

export const getNextBonafideRef = async () => {
    const year = new Date().getFullYear();
    const Counter = await counter.findByIdAndUpdate(
        { _id: "bonafide_ref" },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
    );
    return `${String(Counter.value).padStart(4, '0')}/BIHER/BIST/Stud-Bonaf/${year}`;
};
