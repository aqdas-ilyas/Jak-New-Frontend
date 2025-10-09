import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    loyaltyCards: null,
};
export const loyaltySlice = createSlice({
    name: 'loyalty',
    initialState,
    reducers: {
        saveLoyaltyCards: (state, action) => {
            state.loyaltyCards = action.payload;
        },
    },
});
export const { saveLoyaltyCards } = loyaltySlice.actions;
export default loyaltySlice.reducer;
