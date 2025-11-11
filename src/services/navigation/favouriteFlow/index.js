import React, { useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { routes } from '../../constants';
import * as App from '../../../screens/appFlow';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../utilities';
import { wp } from '../../constants';

const FavoriteStack = createNativeStackNavigator();

export const FavouriteNavigation = () => {
    const insets = useSafeAreaInsets();
    const contentStyle = useMemo(() => ({
        backgroundColor: colors.fullWhite,
        paddingBottom: insets.bottom > 0 ? insets.bottom : wp(5),
    }), [insets.bottom]);

    return (
        <FavoriteStack.Navigator initialRouteName={routes.favourite} screenOptions={{ headerShown: false, gestureEnabled: false, contentStyle }}>
            <FavoriteStack.Screen name={routes.favourite} component={App.Favourite} />
        </FavoriteStack.Navigator>
    );
};
