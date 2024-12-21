import cron from 'node-cron';
import { firebaseAuth } from '../Config/firebaseConfig';
import UserModel from '../Models/UserModel';

const removeUnverifiedUsersJob = () => {
    cron.schedule('0 0 * * *', async () => { // Runs daily at midnight
        console.log('Running cron job: Removing unverified users');
        
        const unverifiedUsers = await UserModel.find({
            isVerified: false,
            createdAt: { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }, // Check for users created more than 3 days ago
        });

        for (const user of unverifiedUsers) {
            try {
                await firebaseAuth.deleteUser(user.firebaseUid); // Remove from Firebase
                await user.deleteOne(); // Remove from MongoDB
            } catch (error) {
                console.error(`Failed to remove user ${user.email}:`, error);
            }
        }

        console.log(`${unverifiedUsers.length} unverified users removed.`);
    });
};

export default removeUnverifiedUsersJob;
