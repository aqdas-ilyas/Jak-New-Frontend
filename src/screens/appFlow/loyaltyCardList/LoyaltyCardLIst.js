import React, { useState, useEffect } from 'react'
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native'
import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel, appImages } from '../../../services'
import appStyles from '../../../services/utilities/appStyles'
import Header from '../../../components/header'
import { LocalizationContext } from '../../../language/LocalizationContext'
import { saveLoyaltyCards } from '../../../store/reducers/WalletSlice'
import { useDispatch, useSelector } from 'react-redux'
import { Loader } from '../../../components/loader/Loader'
import { callApi, Method } from '../../../api/apiCaller'
import routs from '../../../api/routs'

const SubscriptionArray = [
    { id: 1, imgSrc: appImages.wallet5 },
    { id: 2, imgSrc: appImages.wallet1 },
]

const LoyalyCardList = (props) => {
    const dispatch = useDispatch()
    const loyaltyCards = useSelector(state => state.loyalty.loyaltyCards)
    const user = useSelector(state => state.user.user.user)
    const { LocalizedStrings } = React.useContext(LocalizationContext);
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        getLoyaltyCards()
    }, [])

    const getLoyaltyCards = () => {
        const onSuccess = response => {
            console.log('response getLoyaltyCards===', JSON.stringify(response?.data, ' ', 2));
            setIsLoading(false);

            dispatch(saveLoyaltyCards(response?.data?.data))
        };

        const onError = error => {
            setIsLoading(false);
            console.log('Error getLoyaltyCards===', error);
        };

        const endPoint = routs.getLoyaltyCards + `?creator=${user?._id}`;
        const method = Method.GET;
        const bodyParams = {};

        setIsLoading(true);
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    };

    return (
        <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
            <Loader loading={isLoading} />
            <Header leftIcon onleftIconPress={() => props.navigation.goBack()} title={LocalizedStrings["Loyalty Cards"]} addButton onPressRightTitle={() => props.navigation.navigate(routes.loyaltyCard)} />

            <FlatList
                data={loyaltyCards}
                numColumns={2}
                contentContainerStyle={{ alignSelf: "center", marginVertical: wp(5) }}
                showsVerticalScrollIndicator={false}
                keyExtractor={item => item.id}
                ListEmptyComponent={
                    <Text style={styles.imageText}>{LocalizedStrings['No Card Found!']}</Text>
                }
                renderItem={({ item, index }) => {
                    return (
                        <View key={index} style={{ marginHorizontal: wp(2), marginTop: wp(2) }}>
                            <Image source={{ uri: item.backImage }} style={[styles.imageStyle, { borderRadius: 10 }]} />
                        </View>
                    )
                }}
            />
        </SafeAreaView>
    )
}

export default LoyalyCardList

const styles = StyleSheet.create({
    imageStyle: {
        width: wp(42),
        height: wp(28),
        // resizeMode: 'contain'
    },
    imageText: {
        fontSize: hp(1.6),
        lineHeight: 24,
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        marginVertical: wp(2)
    }
})