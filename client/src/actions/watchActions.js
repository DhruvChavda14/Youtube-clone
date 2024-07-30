import * as api from '../api'; 

export const fetchUserPoints = (userId) => async (dispatch) => {
    try {
        const { data } = await api.fetchUserPoints(userId);
        dispatch({
            type: 'FETCH_USER_POINTS_SUCCESS',
            payload: { points: data.points }
        });
    } catch (error) {
        dispatch({
            type: 'FETCH_USER_POINTS_FAILURE',
            payload: error.message || 'Failed to fetch user points',
        });
    }
};


export const watchVideo = (videoId, userId) => async (dispatch) => {
    try {
        dispatch({ type: 'WATCH_VIDEO_REQUEST' });
        const { data } = await api.watchVideo(videoId, userId);
        console.log("API Response:", data);  
        dispatch({
            type: 'WATCH_VIDEO_SUCCESS',
            payload: {
                totalPoints: data.totalPoints,
                pointsAdded: data.pointsAdded
            }
        });
        return {
            totalPoints: data.totalPoints,
            pointsAdded: data.pointsAdded
        };
    } catch (error) {
        console.error('Error in watchVideo action:', error.response?.data || error.message);
        dispatch({
            type: 'WATCH_VIDEO_FAILURE',
            payload: error.response?.data?.message || error.message || 'Failed to watch video',
        });
        throw error;
    }
};