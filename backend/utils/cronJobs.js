import cron from 'node-cron';
import Application from '../models/application.model.js';

const checkOverdueProjects = async () => {
  try {
    const now = new Date();
    
    // Mark overdue projects
    const overdueResult = await Application.updateMany(
      { 
        status: { $in: ['in_progress', 'revision_requested'] },
        dueDate: { $lt: now }
      },
      { status: 'overdue' }
    );
    
    // Auto-accept submissions if seller doesn't respond in 72 hours
    const autoAcceptResult = await Application.updateMany(
      { 
        status: 'submitted',
        reviewDeadline: { $lt: now }
      },
      { status: 'completed' }
    );
    
    if (overdueResult.modifiedCount > 0 || autoAcceptResult.modifiedCount > 0) {
      console.log(`Deadline check: ${overdueResult.modifiedCount} overdue, ${autoAcceptResult.modifiedCount} auto-accepted`);
    }
  } catch (error) {
    console.error('Cron job error:', error);
  }
};

cron.schedule('0 * * * *', checkOverdueProjects);

export { checkOverdueProjects };