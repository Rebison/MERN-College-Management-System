import { notificationQueue } from './queue.js';

async function retryFailedNotifications() {
  const failedJobs = await notificationQueue.getFailed();

  console.log(`Found ${failedJobs.length} failed jobs.`);

  for (const job of failedJobs) {
    console.log(`Retrying notification job: ${job.id}`);
    await job.retry();
  }

  console.log("✅ All failed jobs have been retried.");
}

retryFailedNotifications().catch(err => console.error(err));
