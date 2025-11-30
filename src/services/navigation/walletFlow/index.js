import React, { useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { routes } from '../../constants';
import * as App from '../../../screens/appFlow';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../utilities';
import { wp } from '../../constants';

const WalletStack = createNativeStackNavigator();

export const WalletNavigation = () => {
    const insets = useSafeAreaInsets();
    const contentStyle = useMemo(() => ({
        backgroundColor: colors.fullWhite,
        // paddingBottom: insets.bottom > 0 ? insets.bottom : wp(5),
    }), [insets.bottom]);

    return (
        <WalletStack.Navigator initialRouteName={routes.loyaltyCard} screenOptions={{ headerShown: false, gestureEnabled: false, contentStyle }}>
            {/* <WalletStack.Screen name={routes.wallet} component={App.Wallet} /> */}
            {/* <WalletStack.Screen name={routes.loyaltyCardList} component={App.LoyalyCardList} /> */}
            <WalletStack.Screen name={routes.loyaltyCard} component={App.AddLoyaltyCard} />
        </WalletStack.Navigator>
    );
};
