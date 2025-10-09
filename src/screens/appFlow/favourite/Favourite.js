import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Platform, SafeAreaView, Image, ImageBackground, Text, FlatList, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
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
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import Geolocation from '@react-native-community/geolocation';
import { getLocationPermission } from "../../../common/HelpingFunc";
import { LocalizationContext } from "../../../language/LocalizationContext";
import { saveCategoryOffers, saveForAllOffers, saveMyOffer } from "../../../store/reducers/OfferSlice";

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

            dispatch(saveFavourite(response?.data?.data))
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
            showMessage({ message: response?.message, type: 'success' })

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

            showMessage({ message: response?.message, type: 'danger' })
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
        <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
            <Loader loading={isLoading} />
            <LogoHeader />

            <FlatList
                data={favorite && favorite.length > 0 && favorite}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                ListEmptyComponent={
                    <Text style={styles.emptytext}>{LocalizedStrings["No_Favorite's_Found!"]}</Text>
                }
                renderItem={({ item, index }) => {
                    return (
                        item != null && (
                            <ListItem buttonEnable item={item} IsFavourites={(fav) => IsFavourites(fav?._id)} />
                        ))
                }}
            />
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    emptytext: {
        fontSize: hp(1.6),
        lineHeight: 24,
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        marginVertical: wp(10),
        textAlign: "center"
    }
})