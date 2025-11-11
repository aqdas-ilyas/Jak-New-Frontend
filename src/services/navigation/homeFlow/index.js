import React, { useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { routes } from '../../constants';
import * as App from '../../../screens/appFlow';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../utilities';
import { wp } from '../../constants';

const HomeStack = createNativeStackNavigator();

export const HomeNavigation = () => {
    const insets = useSafeAreaInsets();
    const contentStyle = useMemo(() => ({
        backgroundColor: colors.fullWhite,
        paddingBottom: insets.bottom > 0 ? insets.bottom : wp(5),
    }), [insets.bottom]);

    return (
        <HomeStack.Navigator initialRouteName={routes.home} screenOptions={{ headerShown: false, gestureEnabled: false, contentStyle }}>
            <HomeStack.Screen name={routes.home} component={App.Home} />
            <HomeStack.Screen name={routes.storeList} component={App.StoreDetailList} />
        </HomeStack.Navigator>
    );
};
