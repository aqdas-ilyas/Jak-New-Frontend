import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  splash: false,
  user: {},
  token: null,
  refreshToken: null,
  isRemember: false,
  numberLogin: false,
  biometricEnabled: false,
  savedCredentials: {
    email: null,
    password: null,
    phoneNumber: null,
    countryCode: null,
    loginType: null,
    googleEmail: null,
    appleEmail: null,
  }
};
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Migration reducer to handle missing properties in persisted state
    migrateState: (state) => {
      // Ensure biometricEnabled exists
      if (state.biometricEnabled === undefined) {
        state.biometricEnabled = false;
      }
      // Ensure savedCredentials exists
      if (!state.savedCredentials) {
        state.savedCredentials = {
          email: null,
          password: null,
          phoneNumber: null,
          countryCode: null,
          loginType: null,
          googleEmail: null,
          appleEmail: null,
        };
      }
    },
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
      // Keep biometric settings and credentials for next login
    },
    completeLogout: state => {
      state.user = {};
      state.token = null;
      state.refreshToken = null;
      state.isRemember = false;
      state.biometricEnabled = false;
      state.savedCredentials = {
        email: null,
        password: null,
        phoneNumber: null,
        countryCode: null,
        loginType: null,
        googleEmail: null,
        appleEmail: null,
      };
    },
    saveNumberLogin: (state, action) => {
      state.numberLogin = action.payload;;
    },
    saveBiometricEnabled: (state, action) => {
      state.biometricEnabled = action.payload;
    },
    saveCredentials: (state, action) => {
      state.savedCredentials = action.payload;
    },
    clearCredentials: state => {
      state.savedCredentials = {
        email: null,
        password: null,
        phoneNumber: null,
        countryCode: null,
        loginType: null,
        googleEmail: null,
        appleEmail: null,
      };
    },
  },
});
export const { saveSplash, updateUser, saveLoginRemember, setToken, logout, completeLogout, saveNumberLogin, saveBiometricEnabled, saveCredentials, clearCredentials, migrateState } = userSlice.actions;
export default userSlice.reducer;
