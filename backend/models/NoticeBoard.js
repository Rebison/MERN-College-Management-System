import mongoose from "mongoose";

const noticeBoardSchema = new mongoose.Schema({
    noticeTitle: { type: String, required: true },
    noticeDate: { type: Date, required: true },
    noticeDescription: { type: String, required: true },
    noticeCreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
}, { timestamps: true });

const NoticeBoard = mongoose.models.NoticeBoard || mongoose.model("NoticeBoard", noticeBoardSchema);

export default NoticeBoard;
