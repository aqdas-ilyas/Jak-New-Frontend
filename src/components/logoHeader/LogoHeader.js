import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { appIcons, appImages, colors, fontFamily, hp, routes, wp } from '../../services'
import { useNavigation } from '@react-navigation/native'

export default function LogoHeader() {
    const navigation = useNavigation()
    return (
        <View style={{ paddingTop: Platform.OS == 'android' ? wp(10) : 0, marginTop: -wp(2), flexDirection: "row", justifyContent: 'space-between', alignItems: "center" }}>
            <Image source={appIcons.appLogo} style={styles.logo} />
            {/* <TouchableOpacity onPress={() => navigation.navigate(routes.notification)}>
                <Image source={appIcons.notification} style={styles.right} />
            </TouchableOpacity> */}
        </View>
    )
}

const styles = StyleSheet.create({
    logo: {
        width: wp(20),
        height: wp(15),
    },
    right: {
        width: wp(8),
        height: wp(8),
    },
})