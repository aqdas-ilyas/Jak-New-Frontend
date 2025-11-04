// export const BASE_URL = 'http://ec2-13-60-3-16.eu-north-1.compute.amazonaws.com/api/v1/';
// export const BASE_URL = 'https://api.jak-app.com/api/v1/';
export const BASE_URL = 'https://5ybkmffmxq.us-east-1.awsapprunner.com/api/v1/';

export default {
  // -----AUTH------//
  socialLogin: BASE_URL + 'user/socialLogin',
  signIn: BASE_URL + 'user/login',
  signUp: BASE_URL + 'user/signup',
  otpVerifyEmail: BASE_URL + 'user/verify',
  sendOTP: BASE_URL + 'user/sendOTP',
  uploadFile: BASE_URL + 'user/upload',
  accountSetup: BASE_URL + 'user/acount-setup',
  updateProfile: BASE_URL + 'user/',
  forgetPassword: BASE_URL + 'user/forgotPassword',
  verifyOTPResetPassword: BASE_URL + 'user/verifyOTPResetPassword',
  resetPassword: BASE_URL + 'user/resetPassword',
  updateMyPassword: BASE_URL + 'user/updateMyPassword',
  logout: BASE_URL + 'user/logout',

  // -----USER------//
  getUser: BASE_URL + 'user/me',
  getCompany: BASE_URL + 'employer/',
  getCards: BASE_URL + 'employer-card/',
  getLoyaltyProgram: BASE_URL + 'employer-loyalty-program/',
  createPreferences: BASE_URL + 'user/preferences-setup',
  favourite: BASE_URL + 'favourite/',
  getSubscriptions: BASE_URL + 'subscription/types',
  createSubscriptions: BASE_URL + 'subscription/create/',
  cancelSubscription: BASE_URL + 'subscription-cancel/create',
  getNotification: BASE_URL + 'user/mynotifications',
  contactUs: BASE_URL + 'contact-us',

  privacy: BASE_URL + 'privacy/',
  aboutUs: BASE_URL + 'about-us/',
  termsandcondition: BASE_URL + 'termsandcondition/',
  getLoyaltyCards: BASE_URL + 'loyalty-card/',
  createLoyaltyCards: BASE_URL + 'loyalty-card/create',
  updateLoyaltyCards: BASE_URL + 'loyalty-card',
  getForAll: BASE_URL + 'offer/',
  getMyOffers: BASE_URL + 'offer/',
  getSearchHistory: BASE_URL + 'history/',
};
