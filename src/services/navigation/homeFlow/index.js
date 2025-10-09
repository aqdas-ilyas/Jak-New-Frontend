import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { routes } from '../../constants';
import * as App from '../../../screens/appFlow';

const HomeStack = createNativeStackNavigator();

export const HomeNavigation = () => {
    return (
        <HomeStack.Navigator initialRouteName={routes.home} screenOptions={{ headerShown: false, gestureEnabled: false }}>
            <HomeStack.Screen name={routes.home} component={App.Home} />
            <HomeStack.Screen name={routes.storeList} component={App.StoreDetailList} />
        </HomeStack.Navigator>
    );
};
