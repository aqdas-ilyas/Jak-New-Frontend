import React, { useEffect, useState } from 'react'
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
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

const AddLoyaltyCard = (props) => {
    const dispatch = useDispatch()
    const loyaltyCards = useSelector(state => state.loyalty.loyaltyCards)
    const user = useSelector(state => state.user.user.user)
    const { LocalizedStrings } = React.useContext(LocalizationContext);
    const [isLoading, setIsLoading] = useState(false)
    const [imageLoadingStates, setImageLoadingStates] = useState({})

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
                keyExtractor={(item, index) => item?._id || item?.id || index.toString()}
                ListEmptyComponent={
                    <Text style={styles.imageText}>{LocalizedStrings['No Card Found!']}</Text>
                }
                renderItem={({ item, index }) => {
                    const imageKey = item?._id || item?.id || index.toString();
                    const isImageLoading = imageLoadingStates[imageKey] !== undefined ? imageLoadingStates[imageKey] : true;
                    
                    return (
                        <TouchableOpacity onPress={() => props.navigation.navigate(routes.airArabia, { item })} key={index} activeOpacity={0.8} style={{ marginHorizontal: wp(2), marginTop: wp(2) }}>
                            <View style={styles.imageContainer}>
                                {isImageLoading && (
                                    <View style={styles.imageLoaderContainer}>
                                        <ActivityIndicator size="large" color={colors.primaryColor} />
                                    </View>
                                )}
                                <Image 
                                    source={{ uri: item?.backImage }} 
                                    style={[styles.imageStyle, { borderRadius: 10 }]}
                                    onLoadStart={() => {
                                        setImageLoadingStates(prev => ({ ...prev, [imageKey]: true }));
                                    }}
                                    onLoadEnd={() => {
                                        setImageLoadingStates(prev => ({ ...prev, [imageKey]: false }));
                                    }}
                                    onError={() => {
                                        setImageLoadingStates(prev => ({ ...prev, [imageKey]: false }));
                                    }}
                                    resizeMode="cover"
                                />
                            </View>
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
    imageContainer: {
        width: wp(42),
        height: wp(28),
        position: 'relative',
    },
    imageStyle: {
        width: wp(42),
        height: wp(28),
        // resizeMode: 'contain',
    },
    imageLoaderContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
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