import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { routes } from '../../constants';
import * as App from '../../../screens/appFlow';

const FavoriteStack = createNativeStackNavigator();

export const FavouriteNavigation = () => {
    return (
        <FavoriteStack.Navigator initialRouteName={routes.favourite} screenOptions={{ headerShown: false, gestureEnabled: false }}>
            <FavoriteStack.Screen name={routes.favourite} component={App.Favourite} />
        </FavoriteStack.Navigator>
    );
};
