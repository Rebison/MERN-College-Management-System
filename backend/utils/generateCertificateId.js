import { CertificateCounter } from '#models/index.js';

const getNextCertificateId = async (type) => {
    const today = new Date();

    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const yyyy = today.getFullYear();
    const dateFormatted = `${dd}-${mm}-${yyyy}`; // "06-07-2025"

    const key = `${type}-${yyyy}${mm}${dd}`; // e.g., "bonafide-20250706"

    const counter = await certificateCounter.findByIdAndUpdate(
        key,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    const paddedSeq = String(counter.seq).padStart(3, '0'); // "002"
    const prefix = `BIHER${type.toUpperCase()}`; // "BIHERBONAFIDE"

    return `${prefix}${dateFormatted}-${paddedSeq}`; // "BIHERBONAFIDE06-07-2025-002"
};

export default getNextCertificateId;
