import express from 'express';
import { ExportJob } from '#models/index.js';
import agenda from '../../queues/agenda.js';
import path from 'path';
import fs from "fs";

const exportRouter = express.Router();

exportRouter.post('/', async (req, res) => {
    try {
        const { exportType, filters } = req.body;
        console.log(req.body);
        const facultyId = req.user.id;

        if (!exportType) {
            return res.status(400).json({ message: 'exportType is required' });
        }

        const newJob = await ExportJob.create({
            exportType,
            filters,
            requestedBy: facultyId,
            status: 'pending'
        });

        await agenda.now('export data', {
            exportId: newJob._id.toString(),
            exportType
        });

        res.json({
            message: 'Export job created successfully',
            exportId: newJob._id,
            statusUrl: `/export/status/${newJob._id}`
        });
    } catch (err) {
        console.error('Error creating export job:', err);
        res.status(500).json({ error: 'Failed to create export job' });
    }
});

exportRouter.get('/my-records', async (req, res) => {
    try {
        const facultyId = req.user.id;

        const jobs = await exportJob.find({ requestedBy: facultyId })
            .sort({ createdAt: -1 });

        res.json({ success: true, jobs });
    } catch (error) {
        console.error("Failed to fetch export jobs:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ✅ Get job status
exportRouter.get('/status/:exportId', async (req, res) => {
    try {
        const { exportId } = req.params;
        const facultyId = req.user.id;

        const job = await exportJob.findById(exportId);

        if (!job) {
            return res.status(404).json({ success: false, message: "Export job not found" });
        }

        if (job.requestedBy.toString() !== facultyId.toString()) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        res.json({
            success: true,
            status: job.status,
            completedAt: job.completedAt,
            filePath: job.filePath || null
        });
    } catch (error) {
        console.error("Failed to fetch export job status:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ✅ Download completed export file
exportRouter.get('/download/:exportId', async (req, res) => {
    try {
        const { exportId } = req.params;
        const facultyId = req.user.id;

        const job = await exportJob.findById(exportId);

        if (!job) {
            return res.status(404).json({ success: false, message: "Export job not found" });
        }

        if (job.requestedBy.toString() !== facultyId.toString()) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        if (job.status !== 'completed' || !job.filePath) {
            return res.status(400).json({ success: false, message: "Export not ready for download" });
        }

        const filePath = path.resolve(job.filePath);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: "File not found" });
        }

        res.download(filePath); // Triggers file download
    } catch (error) {
        console.error("Download error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Adityan worked here, if it breaks comment it out

exportRouter.post('/fee-not-started', async (req, res) => {
    try {
        const { filters } = req.body;
        const facultyId = req.user.id;

        const newJob = await exportJob.create({
            exportType: 'fee_not_started',
            filters,
            requestedBy: facultyId,
            status: 'pending'
        });

        await agenda.now('export data', {
            exportId: newJob._id.toString(),
            exportType: 'fee_not_started'
        });

        res.json({
            message: 'Fee-not-started export job created successfully',
            exportId: newJob._id,
            statusUrl: `/export/status/${newJob._id}`
        });
    } catch (err) {
        console.error('Error creating fee-not-started export job:', err);
        res.status(500).json({ error: 'Failed to create export job' });
    }
});

exportRouter.post('/fee-done-no-enrol', async (req, res) => {
    try {
        const { filters } = req.body;
        const facultyId = req.user.id;

        const newJob = await exportJob.create({
            exportType: 'fee_done_no_enrol',
            filters,
            requestedBy: facultyId,
            status: 'pending'
        });

        await agenda.now('export data', {
            exportId: newJob._id.toString(),
            exportType: 'fee_done_no_enrol'
        });

        res.json({
            message: 'Fee-done-no-enrol export job created successfully',
            exportId: newJob._id,
            statusUrl: `/export/status/${newJob._id}`
        });
    } catch (err) {
        console.error('Error creating fee-done-no-enrol export job:', err);
        res.status(500).json({ error: 'Failed to create export job' });
    }
});

exportRouter.post('/enrolment-pending', async (req, res) => {
    try {
        const { filters } = req.body;
        const facultyId = req.user.id;

        const newJob = await exportJob.create({
            exportType: 'enrol_pending',
            filters,
            requestedBy: facultyId,
            status: 'pending'
        });

        await agenda.now('export data', {
            exportId: newJob._id.toString(),
            exportType: 'enrol_pending'
        });

        res.json({
            message: 'Enrolment-pending export job created successfully',
            exportId: newJob._id,
            statusUrl: `/export/status/${newJob._id}`
        });
    } catch (err) {
        console.error('Error creating enrolment-pending export job:', err);
        res.status(500).json({ error: 'Failed to create export job' });
    }
});

export default exportRouter;
