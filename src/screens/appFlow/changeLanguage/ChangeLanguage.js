import React, { useEffect, useState } from 'react'
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, I18nManager } from 'react-native'
import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel } from '../../../services'
import appStyles from '../../../services/utilities/appStyles'
import Header from '../../../components/header'
import Button from '../../../components/button'
import string from '../../../language/LocalizedString'
import { LocalizationContext } from '../../../language/LocalizationContext'
import RNRestart from 'react-native-restart'; // Import package from node modules

const ChangeLanguage = (props) => {
    const { appLanguage, LocalizedStrings, setAppLanguage } = React.useContext(LocalizationContext);
    const [value, setValue] = useState(appLanguage == 'ar' ? 1 : 0)

    const languageArray = [
        { id: 1, name: LocalizedStrings.english },
        { id: 2, name: LocalizedStrings.arabic },
    ]

    const onChangeLng = async (lng) => {
        if (lng === 'en') {
            I18nManager.forceRTL(false)
            setValue(0)
            setAppLanguage(lng)
            RNRestart.Restart()
            return;
        }
        if (lng === 'ar') {
            I18nManager.forceRTL(true)
            setValue(1)
            setAppLanguage(lng)
            RNRestart.Restart()
            return;
        }
    }

    return (
        <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
            <Header leftIcon onleftIconPress={() => props.navigation.goBack()} title={LocalizedStrings.change_language} />
            <View style={{ flex: 1 }}>
                <Text style={[styles.mainDes, { marginVertical: wp(5) }]}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas pulvinar bibendum magna Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas pulvinar bibendum magna. consectetur adipiscing elit. Maecenas pulvinar bibendum magna</Text>

                <View>
                    <FlatList
                        data={languageArray}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={item => item.id}
                        renderItem={({ item, index }) => {
                            return (
                                <TouchableOpacity key={index} onPress={() => [onChangeLng(item.name == 'Arabic' ? 'ar' : 'en')]} activeOpacity={0.5} style={{ flexDirection: appLanguage == 'en' ? "row" : 'row-reverse', justifyContent: "space-between", alignItems: "center", marginTop: wp(4) }}>
                                    <Text style={[styles.languageText]}>{item.name}</Text>
                                    <View style={[styles.dotComponentActiveStyle, { borderWidth: 1 }]}>
                                        <View style={[styles.dotComponentStyle, { backgroundColor: value == index ? colors.primaryColor : 'transparent' }]} />
                                    </View>
                                </TouchableOpacity>
                            )
                        }}
                    />
                </View>

            </View>
            <View style={[appStyles.ph20, appStyles.mb5]}>
                <Button>{LocalizedStrings.save_changes}</Button>
            </View>
        </SafeAreaView>
    )
}

export default ChangeLanguage

const styles = StyleSheet.create({
    mainDes: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.descriptionColor,
        lineHeight: 24,
        textAlign: 'left'
    },
    languageText: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistMedium,
        color: colors.BlackSecondary,
        lineHeight: 24,
        textAlign: 'left'
    },
    dotComponentActiveStyle: {
        width: wp(5),
        height: wp(5),
        borderRadius: 10,
        backgroundColor: colors.fullWhite,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: colors.primaryColor,
    },
    dotComponentStyle: {
        width: wp(3.5),
        height: wp(3.5),
        borderRadius: 50,
    },
})