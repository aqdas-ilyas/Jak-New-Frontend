import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Platform, SafeAreaView, Image, ImageBackground, Text, FlatList, ScrollView, TouchableOpacity, RefreshControl, StatusBar } from "react-native";
import { heightPixel, hp, routes, wp } from "../../../services/constants";
import { appIcons, appImages } from "../../../services/utilities/assets";
import Header from "../../../components/header";
import appStyles from "../../../services/utilities/appStyles";
import { colors, fontFamily } from "../../../services";
import AntDesign from "react-native-vector-icons/AntDesign";
import LogoHeader from "../../../components/logoHeader/LogoHeader";
import ListItem from "../../../components/ListItem";
import routs from "../../../api/routs";
import { callApi, Method } from "../../../api/apiCaller";
import { Loader } from "../../../components/loader/Loader";
import { useDispatch, useSelector } from "react-redux";
import { saveFavourite } from "../../../store/reducers/FavoruiteOffersSlice";
import { showMessage } from "react-native-flash-message";
import { LocalizationContext } from "../../../language/LocalizationContext";
import { saveCategoryOffers, saveForAllOffers, saveMyOffer } from "../../../store/reducers/OfferSlice";
import { resolveMessage } from "../../../language/helpers";

export default Favourite = (props) => {
    const { appLanguage, LocalizedStrings } = React.useContext(LocalizationContext);
    const dispatch = useDispatch()
    const favorite = useSelector(state => state.favorite.favorite)
    const myOffer = useSelector(state => state.offer.myOffer)
    const CategoriesOffers = useSelector(state => state.offer.CategoriesOffers)
    const user = useSelector(state => state?.user?.user?.user)
    const [isLoading, setIsLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await getFavourites()
        setRefreshing(false);
    };


    const getFavourites = () => {
        const onSuccess = response => {
            console.log('response favourite===', response?.data);
            setIsLoading(false);

            // Handle null data properly
            const favoriteData = response?.data?.data;
            if (favoriteData && favoriteData.length > 0 && favoriteData[0] !== null) {
                // Filter out null values
                const validFavorites = favoriteData.filter(item => item !== null);
                dispatch(saveFavourite(validFavorites));
            } else {
                // If no valid data, set empty array
                dispatch(saveFavourite([]));
            }
        };

        const onError = error => {
            setIsLoading(false);
            console.log('Error favourite===', error);
        };

        const endPoint = routs.favourite + `?creator=${user?.id}&language=${appLanguage === 'ar' ? 'arabic' : 'english'}`;
        const method = Method.GET;
        const bodyParams = {};

        console.log(endPoint)

        setIsLoading(true);
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    };

    const IsFavourites = (id) => {
        const onSuccess = async (response) => {
            setIsLoading(false);
            console.log('response favourite===', response);
            showMessage({ message: resolveMessage(LocalizedStrings, response?.message), type: 'success' })

            if (myOffer && myOffer.length > 0) {
                const newCustomeArray = await myOffer.map((item) => {
                    if (item._id === id) {
                        return {
                            ...item,
                            isLiked: !item?.isLiked
                        };
                    }
                    return item;
                });
                dispatch(saveMyOffer(newCustomeArray));

                // ****************** Update favorite array based on the new isLiked status ******************
                const toggledItem = newCustomeArray.find((item) => item._id === id);
                let newCustomeFavoriteID;
                if (toggledItem?.isLiked) {
                    // Add to favorites if isLiked is true
                    newCustomeFavoriteID = [...favorite, toggledItem];
                } else {
                    // Remove from favorites if isLiked is false
                    newCustomeFavoriteID = favorite.filter((item) => item._id !== id);
                }
                dispatch(saveFavourite(newCustomeFavoriteID));
            }

            if (CategoriesOffers && CategoriesOffers.length > 0) {
                const newCustomeCategoryOffersArray = await CategoriesOffers.map((item) => {
                    if (item._id === id) {
                        return {
                            ...item,
                            isLiked: !item?.isLiked
                        };
                    }
                    return item;
                });
                dispatch(saveCategoryOffers(newCustomeCategoryOffersArray));
            }
        };

        const onError = error => {
            setIsLoading(false);
            console.log('Is Favoirte Error favourite===', error);

            // showMessage({ message: resolveMessage(LocalizedStrings, error?.message), type: 'danger' })
        };

        const endPoint = routs.favourite + `/${id}`;
        const method = Method.POST;
        const bodyParams = {};

        setIsLoading(true);
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    };

    useEffect(() => {
        getFavourites() // Get Favourite
    }, [])

    return (
        <>
            <StatusBar 
                barStyle={'dark-content'} 
                backgroundColor={Platform.OS === 'android' ? '#fff' : undefined}
                translucent={Platform.OS === 'android'}
            />
            <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
                <Loader loading={isLoading} />
                <LogoHeader />

                <FlatList
                data={favorite && favorite.length > 0 ? favorite.filter(item => item !== null) : []}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primaryColor]}
                        tintColor={colors.primaryColor}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>{LocalizedStrings["No_Favorite's_Found!"]}</Text>
                        <Text style={styles.emptyMessage}>{LocalizedStrings["no_favorites_message"]}</Text>
                    </View>
                }
                renderItem={({ item, index }) => {
                    return (
                        item && item !== null ? (
                            <ListItem buttonEnable item={item} IsFavourites={(fav) => IsFavourites(fav?._id)} />
                        ) : null
                    )
                }}
            />
        </SafeAreaView>
        </>
    )
};

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: wp(15),
        paddingHorizontal: wp(5),
    },
    emptyTitle: {
        fontSize: hp(2.2),
        fontFamily: fontFamily.UrbanistBold,
        color: colors.BlackSecondary,
        textAlign: "center",
        marginBottom: wp(3),
    },
    emptyMessage: {
        fontSize: hp(1.6),
        lineHeight: 24,
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.descriptionColor,
        textAlign: "center",
        marginTop: wp(2),
    },
    emptytext: {
        fontSize: hp(1.6),
        lineHeight: 24,
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        marginVertical: wp(10),
        textAlign: "center"
    }
})