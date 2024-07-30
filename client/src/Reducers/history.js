const HistoryReducer=(state = {data:null},action)=>{
    switch (action.type)
    {
        case 'POST_HISTORY':
            console.log('POST_HISTORY action:', action);
            return { ...state, data: action?.data };
        case 'FETCH_ALL_HISTORY_VIDEOS':
            return {...state,data:action.payload};
        default:
            return state;
    }
    
}
export default HistoryReducer