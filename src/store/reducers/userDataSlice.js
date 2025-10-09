import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  splash: false,
  user: {},
  token: null,
  refreshToken: null,
  isRemember: false,
  numberLogin: false
};
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    saveSplash: (state, action) => {
      state.splash = action.payload;
    },
    updateUser: (state, action) => {
      state.user = action.payload;;
    },
    setToken: (state, action) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    },
    saveLoginRemember: (state, action) => {
      state.isRemember = action.payload;;
    },
    logout: state => {
      state.user = {};
      state.token = null;
      state.refreshToken = null;
      state.isRemember = false;
      state.numberLogin = false
    },
    saveNumberLogin: (state, action) => {
      state.numberLogin = action.payload;;
    },
  },
});
export const { saveSplash, updateUser, saveLoginRemember, setToken, logout, saveNumberLogin } = userSlice.actions;
export default userSlice.reducer;
