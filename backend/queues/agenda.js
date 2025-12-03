import Agenda from 'agenda';
import dotenv from 'dotenv';

dotenv.config({ path: "../.env" });

const agenda = new Agenda({
    db: { address: process.env.MONGO_URI, collection: 'exportJobsQueue' },
    processEvery: '30 seconds',
    maxConcurrency: 5
});

export default agenda;
