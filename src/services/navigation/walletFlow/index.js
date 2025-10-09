import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { routes } from '../../constants';
import * as App from '../../../screens/appFlow';

const WalletStack = createNativeStackNavigator();

export const WalletNavigation = () => {
    return (
        <WalletStack.Navigator initialRouteName={routes.loyaltyCard} screenOptions={{ headerShown: false, gestureEnabled: false }}>
            {/* <WalletStack.Screen name={routes.wallet} component={App.Wallet} /> */}
            {/* <WalletStack.Screen name={routes.loyaltyCardList} component={App.LoyalyCardList} /> */}
            <WalletStack.Screen name={routes.loyaltyCard} component={App.AddLoyaltyCard} />
        </WalletStack.Navigator>
    );
};
