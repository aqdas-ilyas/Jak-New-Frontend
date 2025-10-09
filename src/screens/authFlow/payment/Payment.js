import React, { useState } from 'react'
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Pressable } from 'react-native'
import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel, appIcons } from '../../../services'
import appStyles from '../../../services/utilities/appStyles'
import Header from '../../../components/header'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Button from '../../../components/button'
import { LocalizationContext } from '../../../language/LocalizationContext'

const Payment = (props) => {
    const { LocalizedStrings } = React.useContext(LocalizationContext);

    const SubscriptionArray = [
        {
            id: 1,
            type: LocalizedStrings['Credit / Debit / Mada Card'],
            srcIMG: appIcons.card
        },
        {
            id: 2,
            type: LocalizedStrings['Google Pay'],
            srcIMG: appIcons.google
        },
        {
            id: 3,
            type: LocalizedStrings['Apple Pay'],
            srcIMG: appIcons.apple
        },
        {
            id: 4,
            type: LocalizedStrings.paypal,
            srcIMG: appIcons.paypal
        },
    ]

    const [selectPayment, setSelectPayment] = useState(SubscriptionArray[0]);


    return (
        <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
            <Header leftIcon onleftIconPress={() => props.navigation.goBack()} title={LocalizedStrings['Select Payment Method']} />
            <View style={{ flex: 1 }}>
                <Text style={styles.mainTitle}>{LocalizedStrings.cardDes}</Text>
                <FlatList
                    data={SubscriptionArray}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => {
                        return (
                            <View key={index}>
                                <TouchableOpacity onPress={() => setSelectPayment(item)} style={styles.Item}>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <Image source={item.srcIMG} style={styles.Icon} />
                                        <Text style={[styles.mainDes]}>{item.type}</Text>
                                    </View>
                                    <View style={[styles.dotComponentActiveStyle, { borderWidth: 1 }]}>
                                        <View style={[styles.dotComponentStyle, { backgroundColor: selectPayment.id == item.id ? colors.primaryColor : 'transparent' }]} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )
                    }}
                />
            </View>

            <View style={[appStyles.ph20, appStyles.mb5]}>
                <Button onPress={() => props.navigation.navigate(routes.card)}>{LocalizedStrings.continue}</Button>
            </View>
        </SafeAreaView>
    )
}

export default Payment

const styles = StyleSheet.create({
    Item: {
        borderColor: colors.borderColor,
        borderWidth: 1,
        borderRadius: 15,
        marginTop: wp(5),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: wp(5),
        paddingVertical: wp(6)
    },
    mainTitle: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.descriptionColor,
        marginVertical: wp(5),
        lineHeight: 24,
        textAlign: 'left'
    },
    mainDes: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        marginLeft: wp(4),
    },
    Icon: {
        width: hp(2.5),
        height: hp(2.5),
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
        width: wp(3.6),
        height: wp(3.6),
        borderRadius: 50,
    },
})