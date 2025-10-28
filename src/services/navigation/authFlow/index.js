import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { routes } from '../../constants';
import * as Auth from '../../../screens/authFlow';
import * as App from '../../../screens/appFlow';

const AuthStack = createNativeStackNavigator();

export const AuthNavigation = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <AuthStack.Screen name={routes.splash} component={Auth.Splash} />
      <AuthStack.Screen name={routes.onboard} component={Auth.Onboarding} />
      <AuthStack.Screen name={routes.welcome} component={Auth.Welcome} />
      <AuthStack.Screen name={routes.login} component={Auth.SignIn} />
      <AuthStack.Screen name={routes.register} component={Auth.SignUp} />
      <AuthStack.Screen name={routes.forgotPassword} component={Auth.ForgetPassword} />
      <AuthStack.Screen name={routes.resetPassword} component={Auth.ResetPassword} />
      <AuthStack.Screen name={routes.otp} component={Auth.SendOtp} />
      <AuthStack.Screen name={routes.createProfile} component={Auth.CreateProfile} />
      <AuthStack.Screen name={routes.preferences} component={Auth.Preferences} />
      <AuthStack.Screen name={routes.subscription} component={Auth.Subscription} />
      <AuthStack.Screen name={routes.payment} component={Auth.Payment} />
      <AuthStack.Screen name={routes.card} component={Auth.Card} />
      <AuthStack.Screen name={routes.privacyPolicy} component={App.PrivacyPolicy} />
      <AuthStack.Screen name={routes.termsConditions} component={App.TermsConditions} />
    </AuthStack.Navigator>
  );
};
