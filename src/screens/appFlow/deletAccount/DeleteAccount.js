import React, { useState } from 'react'
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native'
import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel, appIcons, appImages } from '../../../services'
import appStyles from '../../../services/utilities/appStyles'
import Header from '../../../components/header'
import { Input } from '../../../components/input'
import Button from '../../../components/button'
import { LocalizationContext } from '../../../language/LocalizationContext'

const DeleteAccount = (props) => {
    const { LocalizedStrings } = React.useContext(LocalizationContext);

    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(true)

    return (
        <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
            <Header leftIcon onleftIconPress={() => props.navigation.goBack()} title={LocalizedStrings.delete_account} />
            <View style={{ flex: 1 }}>
                <View style={[appStyles.row, { marginTop: wp(5) }]}>
                    <Image source={appIcons.Danger} style={styles.ImageStyle} />
                    <Text style={[styles.mainTitle, { marginLeft: wp(2) }]}>{LocalizedStrings.delete_your_account_will}:</Text>
                </View>
                <View>
                    <Text style={[styles.mainDes, { marginVertical: wp(3) }]}>{LocalizedStrings.deleteDes1}</Text>
                    <Text style={[styles.mainDes]}>{LocalizedStrings.deleteDes2}</Text>
                </View>

                <Input
                    placeholder={LocalizedStrings.password}
                    secureTextEntry={showPassword}
                    onPressEye={() => setShowPassword(!showPassword)}
                    value={password}
                    onChangeText={(value) => setPassword(value)}
                    eye={true}
                    leftIcon={appIcons.lock}
                >
                    {LocalizedStrings.password}
                </Input>

                <Text style={[styles.bottomText, { marginVertical: wp(3) }]}>{LocalizedStrings.deleteDes3}</Text>
            </View>

            <View style={[appStyles.ph20, appStyles.mb5]}>
                <Button onPress={() => props.navigation.navigate(routes.auth, { screen: routes.otp, params: { key: 'delete' } })}>{LocalizedStrings.delete_account}</Button>
            </View>
        </SafeAreaView>
    )
}

export default DeleteAccount

const styles = StyleSheet.create({
    mainDes: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistRegular,
        color: 'rgba(29, 25, 28, 1)',
        lineHeight: 24,
        textAlign: 'left'
    },
    mainTitle: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistMedium,
        color: 'red',
        lineHeight: 22
    },
    ImageStyle: {
        width: wp(5),
        height: wp(5),
    },
    bottomText: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistLight,
        color: 'rgba(158, 158, 158, 1)',
        lineHeight: 20,
        textAlign: 'left'
    }
})