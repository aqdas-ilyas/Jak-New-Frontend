import React, { useEffect, useState } from 'react'
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native'
import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel, appImages } from '../../../services'
import appStyles from '../../../services/utilities/appStyles'
import Header from '../../../components/header'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { LocalizationContext } from '../../../language/LocalizationContext'
import { useDispatch, useSelector } from 'react-redux'
import routs from '../../../api/routs'
import { callApi, Method } from '../../../api/apiCaller'
import { Loader } from '../../../components/loader/Loader'
import { saveLoyaltyCards } from '../../../store/reducers/WalletSlice'

const SubscriptionArray = [
    { id: 1, imgSrc: appImages.wallet5 },
    { id: 2, imgSrc: appImages.wallet1 },
    { id: 3, imgSrc: appImages.wallet2 },
    { id: 4, imgSrc: appImages.wallet3 },
    { id: 5, imgSrc: appImages.wallet4 },
    { id: 6, imgSrc: appImages.wallet6 },
    { id: 7, imgSrc: appImages.wallet5 },
    { id: 8, imgSrc: appImages.wallet1 },
    { id: 9, imgSrc: appImages.wallet2 },
    { id: 10, imgSrc: appImages.wallet3 },
    { id: 11, imgSrc: appImages.wallet4 },
    { id: 12, imgSrc: appImages.wallet6 },
]

const AddLoyaltyCard = (props) => {
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
            <Header leftIcon onleftIconPress={() => props.navigation.goBack()} title={LocalizedStrings["Add Loyalty Cards"]} addButton onPressRightTitle={() => props.navigation.navigate(routes.airArabia)} />

            <FlatList
                data={loyaltyCards}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                keyExtractor={item => item.id}
                ListEmptyComponent={
                    <Text style={styles.imageText}>No Card Found!</Text>
                }
                renderItem={({ item, index }) => {
                    return (
                        <TouchableOpacity onPress={() => props.navigation.navigate(routes.airArabia, { item })} key={index} activeOpacity={0.8} style={{ marginHorizontal: wp(2), marginTop: wp(2) }}>
                            <Image source={{ uri: item.backImage }} style={[styles.imageStyle, { borderRadius: 10 }]} />
                            <View style={{ position: 'absolute', alignItems: "center", justifyContent: "center", top: 0, left: 0, right: 0, bottom: 0 }}>
                                <View style={{ backgroundColor: colors.primaryColor, borderRadius: 50, padding: wp(1) }}>
                                    <AntDesign name='plus' color={colors.fullWhite} size={wp(4)} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    )
                }}
            />
        </SafeAreaView>
    )
}

export default AddLoyaltyCard

const styles = StyleSheet.create({
    imageStyle: {
        width: wp(42),
        height: wp(28),
        // resizeMode: 'contain',
    },
    imageText: {
        fontSize: hp(1.6),
        lineHeight: 24,
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        marginVertical: wp(10),
        textAlign: 'center'
    }
})