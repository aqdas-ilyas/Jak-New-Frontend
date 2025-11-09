import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native'
import { colors, hp, fontFamily, wp } from '../../../services'
import appStyles from '../../../services/utilities/appStyles'
import Header from '../../../components/header'
import Button from '../../../components/button'
import { LocalizationContext } from '../../../language/LocalizationContext'
import { useRTL } from '../../../language/useRTL';

const ChangeLanguage = (props) => {
    const { appLanguage, LocalizedStrings, setAppLanguage } = React.useContext(LocalizationContext);
    const { rtlStyles } = useRTL();
    const [selectedLanguage, setSelectedLanguage] = useState(appLanguage);

    useEffect(() => {
        setSelectedLanguage(appLanguage);
    }, [appLanguage]);

    const languageArray = [
        { id: 'en', name: LocalizedStrings.english, code: 'en' },
        { id: 'ar', name: LocalizedStrings.arabic, code: 'ar' },
    ];

    const onChangeLng = async (lng) => {
        setSelectedLanguage(lng);
        setAppLanguage(lng);
    }

    return (
        <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }, rtlStyles.writingDirection]}>
            <Header leftIcon onleftIconPress={() => props.navigation.goBack()} title={LocalizedStrings.change_language} />
            <View style={{ flex: 1 }}>
                <Text style={[styles.mainDes, rtlStyles.textAlign, { marginVertical: wp(5) }]}>{LocalizedStrings.change_language_description}</Text>

                <View>
                    <FlatList
                        data={languageArray}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={item => item.id}
                        renderItem={({ item, index }) => {
                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => onChangeLng(item.code)}
                                    activeOpacity={0.5}
                                    style={{
                                        flexDirection: selectedLanguage === 'ar' ? 'row-reverse' : 'row',
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginTop: wp(4)
                                    }}>
                                    <Text style={[styles.languageText, rtlStyles.textAlign, rtlStyles.writingDirection]}>{item.name}</Text>
                                    <View style={[styles.dotComponentActiveStyle, { borderWidth: 1 }]}>
                                        <View style={[styles.dotComponentStyle, { backgroundColor: selectedLanguage === item.code ? colors.primaryColor : 'transparent' }]} />
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