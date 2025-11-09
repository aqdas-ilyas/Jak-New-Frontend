import React from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import { appIcons, wp } from '../../services';
import { useRTL } from '../../language/useRTL';

export default function LogoHeader() {
    const { isRTL } = useRTL();

    return (
        <View
            style={[
                styles.container,
                {
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    alignSelf: isRTL ? 'flex-end' : 'flex-start'
                }
            ]}>
            <Image
                source={appIcons.appLogo}
                style={[styles.logo, { marginLeft: isRTL ? wp(2) : 0, marginRight: isRTL ? 0 : wp(2) }]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: Platform.OS === 'android' ? wp(10) : 0,
        marginTop: -wp(2),
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        width: wp(20),
        height: wp(15),
        resizeMode: 'contain',
    },
});
