import React, { useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { routes } from '../../constants';
import * as Auth from '../../../screens/authFlow';
import * as App from '../../../screens/appFlow';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../utilities';
import { wp } from '../../constants';

const AuthStack = createNativeStackNavigator();

export const AuthNavigation = () => {
  const insets = useSafeAreaInsets();
  const paddedContentStyle = useMemo(() => ({
    backgroundColor: colors.fullWhite,
    paddingBottom: insets.bottom > 0 ? insets.bottom: wp(5),
  }), [insets.bottom]);

  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <AuthStack.Screen name={routes.splash} component={Auth.Splash} options={{ contentStyle: { backgroundColor: colors.fullWhite } }} />
      <AuthStack.Screen name={routes.onboard} component={Auth.Onboarding} options={{ contentStyle: paddedContentStyle }} />
      <AuthStack.Screen name={routes.welcome} component={Auth.Welcome} options={{ contentStyle: paddedContentStyle }} />
      <AuthStack.Screen name={routes.login} component={Auth.SignIn} options={{ contentStyle: paddedContentStyle }} />
      <AuthStack.Screen name={routes.register} component={Auth.SignUp} options={{ contentStyle: paddedContentStyle }} />
      <AuthStack.Screen name={routes.forgotPassword} component={Auth.ForgetPassword} options={{ contentStyle: paddedContentStyle }} />
      <AuthStack.Screen name={routes.resetPassword} component={Auth.ResetPassword} options={{ contentStyle: paddedContentStyle }} />
      <AuthStack.Screen name={routes.otp} component={Auth.SendOtp} options={{ contentStyle: paddedContentStyle }} />
      <AuthStack.Screen name={routes.createProfile} component={Auth.CreateProfile} options={{ contentStyle: paddedContentStyle }} />
      <AuthStack.Screen name={routes.preferences} component={Auth.Preferences} options={{ contentStyle: paddedContentStyle }} />
      <AuthStack.Screen name={routes.subscription} component={Auth.Subscription} options={{ contentStyle: paddedContentStyle }} />
      <AuthStack.Screen name={routes.payment} component={Auth.Payment} options={{ contentStyle: paddedContentStyle }} />
      <AuthStack.Screen name={routes.card} component={Auth.Card} options={{ contentStyle: paddedContentStyle }} />
      <AuthStack.Screen name={routes.privacyPolicy} component={App.PrivacyPolicy} options={{ contentStyle: paddedContentStyle }} />
      <AuthStack.Screen name={routes.termsConditions} component={App.TermsConditions} options={{ contentStyle: paddedContentStyle }} />
    </AuthStack.Navigator>
  );
};
