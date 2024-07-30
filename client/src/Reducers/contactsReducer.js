const initialState = {
    contacts: [],
};

const contactsReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'ADD_CONTACT':
            return {
                ...state,
                contacts: [...state.contacts, action.payload],
            };
        case 'FETCH_CONTACTS':
            return {
                ...state,
                contacts: action.payload,
            };
        case 'UPDATE_CONTACT':
            const updatedContacts = state.contacts.map((contact) =>
                contact._id === action.payload._id ? action.payload : contact
            );
            return {
                ...state,
                contacts: updatedContacts,
            };
        case 'DELETE_CONTACT':
            const filteredContacts = state.contacts.filter((contact) => contact._id !== action.payload);
            return {
                ...state,
                contacts: filteredContacts,
            };
        default:
            return state;
    }
};

export default contactsReducer;