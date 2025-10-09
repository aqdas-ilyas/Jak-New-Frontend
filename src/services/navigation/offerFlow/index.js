import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { routes } from '../../constants';
import * as App from '../../../screens/appFlow';

const OfferStack = createNativeStackNavigator();

export const OfferNavigation = () => {
    return (
        <OfferStack.Navigator initialRouteName={routes.offer} screenOptions={{ headerShown: false, gestureEnabled: false }}>
            <OfferStack.Screen name={routes.offer} component={App.Offer} />
        </OfferStack.Navigator>
    );
};
