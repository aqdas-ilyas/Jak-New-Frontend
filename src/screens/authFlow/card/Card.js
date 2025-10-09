import React, { useState } from 'react'
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Pressable } from 'react-native'
import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel, appIcons } from '../../../services'
import appStyles from '../../../services/utilities/appStyles'
import Header from '../../../components/header'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Button from '../../../components/button'
import { Input } from '../../../components/input'
import CallModal from '../../../components/modal'
import { LocalizationContext } from '../../../language/LocalizationContext'

const Card = (props) => {
    const { LocalizedStrings } = React.useContext(LocalizationContext);

    const [cardName, setCardName] = useState('')
    const [cardNumber, setCardNumber] = useState('')
    const [expiryDate, setExpiryDate] = useState('')
    const [cvc, setCVC] = useState('')
    const [modalShow, setModalShow] = useState(false)

    const handleCardNumberChange = (input) => {
        // Remove all non-numeric characters from the input string
        const cleanedInput = input.replace(/\D/g, '');

        // Insert a space after every 4 characters
        const formattedInput = cleanedInput.replace(/(.{4})/g, '$1 ');

        return formattedInput;
    };

    return (
        <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
            <Header leftIcon onleftIconPress={() => props.navigation.goBack()} title={LocalizedStrings['Card Details']} />
            <View style={{ flex: 1 }}>
                <Text style={styles.mainDes}>{LocalizedStrings.cardDes}</Text>
                <View>
                    <Input
                        placeholder={LocalizedStrings['Card Name']}
                        value={cardName}
                        onChangeText={(value) => setCardName(value)}
                    >
                        {LocalizedStrings['Card Name']}
                    </Input>

                    <Input
                        placeholder={LocalizedStrings['Card Number']}
                        value={cardNumber}
                        onChangeText={(value) => setCardNumber(value)}
                    >

                        {LocalizedStrings['Card Number']}
                    </Input>

                    <View style={{ flexDirection: "row", justifyContent: 'space-between', alignItems: "center" }}>
                        <Input
                            editable={false}
                            placeholder={'DD/MM/YY'}
                            value={expiryDate}
                            onChangeText={(value) => setExpiryDate(value)}
                            WholeContainer={{
                                width: wp(43)
                            }}
                            rightIcon={true}
                            eyeValue={appIcons.calender}
                        >
                            {LocalizedStrings['Expiry Date']}
                        </Input>

                        <Input
                            placeholder={'XXX'}
                            value={cvc}
                            onChangeText={(value) => setCVC(value)}
                            WholeContainer={{
                                width: wp(43)
                            }}
                        >
                            CVV
                        </Input>
                    </View>
                </View>
            </View>

            <View style={[appStyles.ph20, appStyles.mb5]}>
                <Button onPress={() => setModalShow(!modalShow)}>{LocalizedStrings.continue}</Button>
            </View>

            <CallModal
                modalShow={modalShow}
                setModalShow={() => setModalShow(!modalShow)}
                title={LocalizedStrings['Subscription Purchased Successfully!']}
                subTitle={LocalizedStrings.modalDes}
            />
        </SafeAreaView>
    )
}

export default Card

const styles = StyleSheet.create({
    mainDes: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.descriptionColor,
        marginVertical: wp(5),
        lineHeight: 24,
        textAlign: 'left'
    },
})