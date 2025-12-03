import { notificationQueue } from './queue.js';

async function checkWorker() {
  try {
    // Get counts of jobs in the queue
    const counts = await notificationQueue.getJobCounts();

    console.log('Queue Status:', counts);

    // Check if there are active jobs
    if (counts.active > 0) {
      console.log('✅ Worker is running and processing jobs.');
    } else if (counts.waiting > 0) {
      console.log('⚠ Worker is idle. Jobs are waiting to be processed.');
    } else {
      console.log('⚠ Worker may not be running, no active jobs.');
    }
  } catch (err) {
    console.error('❌ Failed to check queue:', err.message);
  } finally {
    process.exit();
  }
}

checkWorker();
