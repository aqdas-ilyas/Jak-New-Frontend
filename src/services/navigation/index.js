import React, { useEffect, useState } from 'react';
import { EventRegister } from 'react-native-event-listeners';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { colors, routes } from '..';
import { AuthNavigation } from './authFlow';
import themeContext from '../config/themeContext';
import theme from '../config/theme';
import { TabNavigation } from './tabFlow';
import * as App from '../../screens/appFlow';
import * as Auth from '../../screens/authFlow';

const MyStack = createNativeStackNavigator();

export const MainNavigator = () => {
  const [mode, setMode] = useState();

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
    <themeContext.Provider value={mode === true ? theme.dark : theme.light}>
      <NavigationContainer theme={MyTheme}>
        <MyStack.Navigator initialRouteName={routes.auth} screenOptions={{ headerShown: false, gestureEnabled: false }}>
          <MyStack.Screen name={routes.auth} component={AuthNavigation} />
          <MyStack.Screen name={routes.tab} component={TabNavigation} />

          <MyStack.Screen name={routes.preferences} component={Auth.Preferences} />
          <MyStack.Screen name={routes.subscription} component={Auth.Subscription} />
          <MyStack.Screen name={routes.payment} component={Auth.Payment} />
          <MyStack.Screen name={routes.card} component={Auth.Card} />

          {/* <MyStack.Screen name={routes.storeList} component={App.StoreDetailList} /> */}
          <MyStack.Screen name={routes.storeDetail} component={App.StoreDetail} />
          <MyStack.Screen name={routes.notification} component={App.Notification} />
          <MyStack.Screen name={routes.search} component={App.Search} />

          <MyStack.Screen name={routes.subscriptionPlan} component={App.SubscriptionPlan} />
          <MyStack.Screen name={routes.cancelSubscription} component={App.CancelSubscription} />
          <MyStack.Screen name={routes.changeLanguage} component={App.ChangeLanguage} />
          <MyStack.Screen name={routes.changePassword} component={App.ChangePassword} />
          <MyStack.Screen name={routes.aboutUs} component={App.AboutUs} />
          <MyStack.Screen name={routes.privacyPolicy} component={App.PrivacyPolicy} />
          <MyStack.Screen name={routes.terms} component={App.Terms} />
          <MyStack.Screen name={routes.contactUs} component={App.ContactUs} />
          <MyStack.Screen name={routes.deletAccount} component={App.DeleteAccount} />
          <MyStack.Screen name={routes.editProfile} component={App.EditProfile} />

          <MyStack.Screen name={routes.loyaltyCard} component={App.AddLoyaltyCard} />
          <MyStack.Screen name={routes.loyaltyCardList} component={App.LoyalyCardList} />
          <MyStack.Screen name={routes.airArabia} component={App.AirArabia} />
        </MyStack.Navigator>
      </NavigationContainer>
    </themeContext.Provider>
  );
};
