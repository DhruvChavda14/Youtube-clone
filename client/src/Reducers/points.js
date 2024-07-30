const initialState = {
    points: 0,
    loading: false,
    error: null,
};

const pointsReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'FETCH_USER_POINTS_REQUEST':
            return {
                ...state,
                loading: true,
                error: null,
            };
        case 'FETCH_USER_POINTS_SUCCESS':
            return {
                ...state,
                points: action.payload.points,
                loading: false,
                error: null,
            };
        case 'WATCH_VIDEO_SUCCESS':
            return {
                ...state,
                points: action.payload.points,
                loading: false,
                error: null,
            };
        case 'WATCH_VIDEO_FAILURE':
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        default:
            return state;
    }
};

export default pointsReducer;