import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { routes } from '../../constants';
import * as App from '../../../screens/appFlow';
import { colors } from '../../utilities';
import { LocalizationContext } from '../../../language/LocalizationContext';
import ScreenBackPressWrapper from '../../../components/screenWrapper';

const OfferStack = createNativeStackNavigator();

const OfferScreenWithExitConfirm = props => {
    const { LocalizedStrings } = React.useContext(LocalizationContext);

    return (
        <ScreenBackPressWrapper
            enabled
            title={LocalizedStrings.exit_confirmation_title}
            message={LocalizedStrings.exit_confirmation_message}
            cancelText={LocalizedStrings.cancel}
            confirmText={LocalizedStrings.yes}
        >
            <App.Offer {...props} />
        </ScreenBackPressWrapper>
    );
};

export const OfferNavigation = () => {
    const contentStyle = {
        backgroundColor: colors.fullWhite,
    };

    return (
        <OfferStack.Navigator initialRouteName={routes.offer} screenOptions={{ headerShown: false, gestureEnabled: false, contentStyle }}>
            <OfferStack.Screen name={routes.offer} component={OfferScreenWithExitConfirm} />
        </OfferStack.Navigator>
    );
};
