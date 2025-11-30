import React, { useEffect, useMemo, useState } from 'react';
import { EventRegister } from 'react-native-event-listeners';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { colors, routes, wp } from '..';
import { AuthNavigation } from './authFlow';
import themeContext from '../config/themeContext';
import theme from '../config/theme';
import { TabNavigation } from './tabFlow';
import * as App from '../../screens/appFlow';
import * as Auth from '../../screens/authFlow';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FlashMessage from 'react-native-flash-message';

const MyStack = createNativeStackNavigator();

export const MainNavigator = () => {
  const [mode, setMode] = useState();
  const insets = useSafeAreaInsets();

  const paddedContentStyle = useMemo(() => ({
    backgroundColor: colors.fullWhite,
    paddingBottom: insets.bottom > 0 ? insets.bottom : wp(5),
  }), [insets.bottom]);

  useEffect(() => {
    let eventListener = EventRegister.addEventListener('changeTheme', (data) => setMode(data));

    return () => EventRegister.removeEventListener(eventListener);
  });

  const MyTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: mode === true ? colors.fullBlack : colors.fullWhite,
    },
  };

  return (
    <>
      <FlashMessage position='bottom' style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : wp(5) }} />

      <themeContext.Provider value={mode === true ? theme.dark : theme.light}>
        <NavigationContainer theme={MyTheme}>
          <MyStack.Navigator initialRouteName={routes.auth} screenOptions={{ headerShown: false, gestureEnabled: false }}>
            <MyStack.Screen name={routes.auth} component={AuthNavigation} />
            <MyStack.Screen name={routes.tab} component={TabNavigation} />

            <MyStack.Screen name={routes.preferences} component={Auth.Preferences} options={{ contentStyle: paddedContentStyle }} />
            <MyStack.Screen name={routes.subscription} component={Auth.Subscription} options={{ contentStyle: paddedContentStyle }} />
            <MyStack.Screen name={routes.payment} component={Auth.Payment} options={{ contentStyle: paddedContentStyle }} />
            <MyStack.Screen name={routes.card} component={Auth.Card} options={{ contentStyle: paddedContentStyle }} />

            {/* <MyStack.Screen name={routes.storeList} component={App.StoreDetailList} /> */}
            <MyStack.Screen name={routes.storeDetail} component={App.StoreDetail} options={{ contentStyle: paddedContentStyle }} />
            <MyStack.Screen name={routes.notification} component={App.Notification} options={{ contentStyle: paddedContentStyle }} />
            <MyStack.Screen name={routes.search} component={App.Search} options={{ contentStyle: paddedContentStyle }} />

            <MyStack.Screen name={routes.subscriptionPlan} component={App.SubscriptionPlan} options={{ contentStyle: paddedContentStyle }} />
            <MyStack.Screen name={routes.cancelSubscription} component={App.CancelSubscription} options={{ contentStyle: paddedContentStyle }} />
            <MyStack.Screen name={routes.changeLanguage} component={App.ChangeLanguage} options={{ contentStyle: paddedContentStyle }} />
            <MyStack.Screen name={routes.changePassword} component={App.ChangePassword} options={{ contentStyle: paddedContentStyle }} />
            <MyStack.Screen name={routes.aboutUs} component={App.AboutUs} options={{ contentStyle: paddedContentStyle }} />
            <MyStack.Screen name={routes.privacyPolicy} component={App.PrivacyPolicy} options={{ contentStyle: paddedContentStyle }} />
            <MyStack.Screen name={routes.termsConditions} component={App.TermsConditions} options={{ contentStyle: paddedContentStyle }} />
            <MyStack.Screen name={routes.contactUs} component={App.ContactUs} options={{ contentStyle: paddedContentStyle }} />
            <MyStack.Screen name={routes.deletAccount} component={App.DeleteAccount} options={{ contentStyle: paddedContentStyle }} />
            <MyStack.Screen name={routes.editProfile} component={App.EditProfile} options={{ contentStyle: paddedContentStyle }} />

            <MyStack.Screen name={routes.loyaltyCard} component={App.AddLoyaltyCard} options={{ contentStyle: paddedContentStyle }} />
            <MyStack.Screen name={routes.loyaltyCardList} component={App.LoyalyCardList} options={{ contentStyle: paddedContentStyle }} />
            <MyStack.Screen name={routes.airArabia} component={App.AirArabia} options={{ contentStyle: paddedContentStyle }} />
          </MyStack.Navigator>
        </NavigationContainer>
      </themeContext.Provider>
    </>
  );
};
