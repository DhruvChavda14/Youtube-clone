import users from '../models/auth.js'
import History from '../models/History.js';

// export const watchVideo = async (req, res) => {
//     const { userId, videoId } = req.params;

//     try {
//         const user = await users.findById(userId);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const lastHistoryEntry = await History.findOne({ userId }).sort({ watchedAt: -1 });

//         const now = new Date();
//         const lastWatched = lastHistoryEntry ? lastHistoryEntry.watchedAt : null;

//         const pointsToAdd = (now - lastWatched < 30000) ? 10 : 5; // 300000 ms = 5 minutes
//         //console.log("Points to add : ", pointsToAdd)
//         if(pointsToAdd===10) pointsToAdd/=2
//         user.points += pointsToAdd;

//         await user.save();

//         const newHistoryEntry = new History({
//             userId,
//             videoId,
//             watchedAt: now
//         });

//         await newHistoryEntry.save();

//         res.status(200).json({ points: user.points });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error });
//     }
// };



export const watchVideo = async (req, res) => {
    const { userId, videoId } = req.params;

    try {
        console.log(`Attempting to process video watch for user ${userId} and video ${videoId}`);

        const user = await users.findById(userId);
        if (!user) {
            console.log(`User not found: ${userId}`);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`User found: ${user.username}`);

        const lastThreeHistoryEntries = await History.find({ userId })
            .sort({ watchedAt: -1 })
            .limit(4);
        console.log(`Last three entry : ${lastThreeHistoryEntries}`)
        const now = new Date();
        const lastWatched = lastThreeHistoryEntries.length > 0 ? lastThreeHistoryEntries[3].watchedAt : null;
        console.log(`Last watched: ${lastWatched}`);
        console.log(`Now: ${now}`);

        const timeDifference = lastWatched ? now - lastWatched : Infinity;
        let pointsToAdd = timeDifference < 30000 ? 10 : 5;
        //if(pointsToAdd===10) pointsToAdd/=2
        console.log(`Time difference: ${timeDifference}ms, Points to add: ${pointsToAdd}`);

        user.points = (user.points || 0) + pointsToAdd;
        console.log(`Updated user points: ${user.points}`);

        await user.save();

        const newHistoryEntry = new History({
            userId,
            videoId,
            watchedAt: now
        });

        await newHistoryEntry.save();
        console.log(`New history entry saved`);

        res.status(200).json({
            totalPoints: user.points,
            pointsAdded: pointsToAdd
        });
    } catch (error) {
        console.error('Error in watchVideo:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            stack: error.stack
        });
    }
};
