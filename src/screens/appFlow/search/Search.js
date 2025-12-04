import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet, Platform, SafeAreaView, Image, ImageBackground, Text, FlatList, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { heightPixel, hp, routes, wp } from "../../../services/constants";
import { appIcons, appImages } from "../../../services/utilities/assets";
import appStyles from "../../../services/utilities/appStyles";
import { colors, fontFamily } from "../../../services";
import { Input } from "../../../components/input";
import ListItem from "../../../components/ListItem";
import FilterModal from "../../../components/filter";
import { LocalizationContext } from "../../../language/LocalizationContext";
import routs from "../../../api/routs";
import { callApi, Method } from "../../../api/apiCaller";
import { debounce } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { Loader } from "../../../components/loader/Loader";
import { saveCategoryOffers, saveMyOffer, saveSearchOfferArray } from "../../../store/reducers/OfferSlice";
import { saveFavourite } from "../../../store/reducers/FavoruiteOffersSlice";
import { showMessage } from "react-native-flash-message";
import { resolveMessage } from "../../../language/helpers";
import { useRTL } from "../../../language/useRTL";

export default Search = (props) => {
    // const { discount, location, category } = props?.route?.params
    const dispatch = useDispatch()
    const user = useSelector(state => state.user.user.user)
    const favorite = useSelector(state => state.favorite.favorite)
    const myOffer = useSelector(state => state.offer.myOffer)
    const searchOfferArray = useSelector(state => state.offer.searchOfferArray)
    const CategoriesOffers = useSelector(state => state.offer.CategoriesOffers)
    const { LocalizedStrings, appLanguage } = React.useContext(LocalizationContext);
    const { rtlStyles } = useRTL();
    const [modalShow, setModalShow] = useState(false)
    const [search, setSearch] = useState('')
    const [searchArray, setSearchArray] = useState([])
    const [recentSearchArray, setRecentSearchArray] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingFull, setIsLoadingFull] = useState(false)

    useEffect(() => {
        getSearchHistory()

        dispatch(saveSearchOfferArray(null))
    }, []);

    // Helper function to filter out expired offers
    const filterExpiredOffers = (offers) => {
        if (!offers || !Array.isArray(offers)) {
            return [];
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

        return offers.filter((offer) => {
            const expiryDateStr = offer?.['expiry date'];

            if (!expiryDateStr) {
                // If no expiry date, include the offer
                return true;
            }

            try {
                // Try to parse the expiry date
                // Handle different date formats (DD/MM/YYYY, YYYY-MM-DD, etc.)
                let expiryDate;

                // Check if it's in DD/MM/YYYY format
                if (expiryDateStr.includes('/')) {
                    const parts = expiryDateStr.split('/');
                    if (parts.length === 3) {
                        // DD/MM/YYYY format
                        expiryDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                    } else {
                        // Try default date parsing
                        expiryDate = new Date(expiryDateStr);
                    }
                } else {
                    // Try default date parsing
                    expiryDate = new Date(expiryDateStr);
                }

                // Check if date is valid
                if (isNaN(expiryDate.getTime())) {
                    console.log('Invalid expiry date format:', expiryDateStr);
                    // If date is invalid, include the offer (don't filter it out)
                    return true;
                }

                expiryDate.setHours(0, 0, 0, 0); // Set to start of day

                // Include offer if expiry date is today or in the future
                return expiryDate >= today;
            } catch (error) {
                console.log('Error parsing expiry date:', expiryDateStr, error);
                // If there's an error parsing, include the offer (don't filter it out)
                return true;
            }
        });
    };

    const searchOffers = (str) => {
        const onSuccess = response => {
            console.log('response searchOffers===', response?.data);
            // Filter out expired offers
            const filteredOffers = filterExpiredOffers(response?.data?.data || []);
            setSearchArray(filteredOffers)
            dispatch(saveSearchOfferArray(filteredOffers))

            setIsLoading(false)
            getSearchHistory()
        };

        const onError = error => {
            console.log('Error searchOffers===', error);

            setIsLoading(false)
        };

        const endPoint = routs.getMyOffers + `user/all?search=${str.toLowerCase()}&language=${appLanguage === 'ar' ? 'arabic' : 'english'}` // &location=${userLocation.longitude},${userLocation.latitude}&km=${location}&discount=${discount}&category=${category}&myoffers=yes
        const method = Method.GET;
        const bodyParams = {};

        callApi(method, endPoint, bodyParams, onSuccess, onError);
    };

    const debouncedFetchData = useCallback(
        debounce(searchOffers, 500),
        [],
    );

    const handleDebouncedInput = (text) => {
        // Call the debounced search function when the input changes
        setIsLoading(true)
        debouncedFetchData(text);
    };

    // Get Recent History
    const getSearchHistory = () => {
        const onSuccess = response => {
            setIsLoadingFull(false);
            console.log('response getSearchHistory===', response?.data);
            setRecentSearchArray(response?.data?.data)
        };

        const onError = error => {
            setIsLoadingFull(false);
            console.log('Error getSearchHistory===', error);
        };

        const endPoint = routs.getSearchHistory + `?creator=${user?._id}&sort=-updatedAt`
        const method = Method.GET;
        const bodyParams = {};

        // setIsLoadingFull(true);
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    };

    // Clear One by One Recent History
    const clearSearchHistory = (obj) => {
        const onSuccess = response => {
            console.log('response clearSearchHistory===', response?.data);
            getSearchHistory()
        };

        const onError = error => {
            setIsLoadingFull(false);
            console.log('Error clearSearchHistory===', error);
        };

        // const endPoint = routs.getForAll
        const endPoint = routs.getSearchHistory + `${obj?._id}`
        const method = Method.DELETE;
        const bodyParams = {};

        setIsLoadingFull(true);
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    };

    // Clear all Recent History
    const AllSearchHistoryClear = () => {
        const idArray = recentSearchArray.map(item => item._id);

        const onSuccess = response => {
            console.log('response AllSearchHistoryClear===', response?.data);
            getSearchHistory()
        };

        const onError = error => {
            setIsLoadingFull(false);
            console.log('Error AllSearchHistoryClear===', error);
        };

        // const endPoint = routs.getForAll
        const endPoint = routs.getSearchHistory + 'deleteinbulk'
        const method = Method.POST;
        const bodyParams = {
            "histories": idArray
        };

        setIsLoadingFull(true);
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    };

    const IsFavourites = (id) => {
        const onSuccess = async (response) => {
            setIsLoadingFull(false);
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
                    newCustomeFavoriteID = favorite ? favorite.filter((item) => item._id !== id) : []
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

            const newCustomeSearchArray = await searchOfferArray.map((item) => {
                if (item._id === id) {
                    return {
                        ...item,
                        isLiked: !item?.isLiked
                    };
                }
                return item;
            });
            setSearchArray(newCustomeSearchArray)
            dispatch(saveSearchOfferArray(newCustomeSearchArray));
        };

        const onError = error => {
            setIsLoadingFull(false);
            console.log('Error favourite===', error);

            // showMessage({ message: resolveMessage(LocalizedStrings, error?.message), type: 'danger' })
        };

        const endPoint = routs.favourite + `/${id}`;
        const method = Method.POST;
        const bodyParams = {};

        setIsLoadingFull(true);
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    };

    return (
        <SafeAreaView style={[appStyles.safeContainer, rtlStyles.writingDirection, { margin: wp(4) }]}>
            <Loader loading={isLoadingFull} />

            <View style={[{ paddingTop: Platform.OS == 'android' ? wp(6) : 0, alignItems: "center" }, rtlStyles.row]}>
                <TouchableOpacity onPress={() => props.navigation.goBack()} style={{ paddingVertical: wp(2) }}>
                    <Image source={appIcons.back} style={[styles.back, rtlStyles.iconRotation]} />
                </TouchableOpacity>

                <Input
                    placeholder={LocalizedStrings.search}
                    value={search}
                    leftIcon={appIcons.search}
                    // rightIcon
                    // onPressIcon={() => setModalShow(!modalShow)}
                    // eyeValue={appIcons.filter}
                    onChangeText={(value) => [setSearch(value), handleDebouncedInput(value)]}
                    containerStyle={{
                        borderRadius: 15,
                        borderColor: colors.primaryColor,
                        borderWidth: 1,
                        backgroundColor: colors.primaryColorOpacity,
                        width: wp(85),
                        marginTop: Platform.OS == 'android' ? -wp(10) : -wp(4),
                        marginRight: wp(5),
                        marginLeft: wp(2),
                    }}
                    inputStyle={{
                        backgroundColor: colors.primaryColorOpacity,
                        height: wp(11)
                    }}
                    leftIconStyle={{
                        tintColor: colors.primaryColor
                    }}
                />
            </View>

            {
                (search.length == 0) ? (
                    <FlatList
                        data={recentSearchArray}
                        keyExtractor={(item, index) => index}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={
                            <View style={{ paddingTop: wp(2), paddingBottom: wp(5), borderBottomColor: colors.borderColor, borderBottomWidth: 1, flex: 1, alignItems: "center", justifyContent: 'space-between', marginVertical: wp(5), flexDirection: rtlStyles.rowBetween.flexDirection }}>
                                <Text style={[styles.resultText, rtlStyles.textAlign, rtlStyles.writingDirection, { fontFamily: fontFamily.UrbanistSemiBold, color: colors.fullBlack }]}>{LocalizedStrings.Recent}</Text>
                                <Text onPress={() => AllSearchHistoryClear()} style={[styles.resultNumber, rtlStyles.textAlign]}>{LocalizedStrings["Clear All"]}</Text>
                            </View>
                        }
                        ListEmptyComponent={
                            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginVertical: wp(5) }}>
                                <Image source={appImages.NotFound} style={{ width: wp(60), height: wp(60), marginVertical: wp(5) }} />
                                <Text style={styles.mainTitle}>{LocalizedStrings["Not Found"]}</Text>
                                <Text style={[styles.mainDes, { textAlign: "center", width: wp(70) }]}>{LocalizedStrings["Not Found Description"]}</Text>
                            </View>
                        }
                        renderItem={({ item, index }) => {
                            return (
                                <TouchableOpacity key={index} activeOpacity={0.8} onPress={() => [setSearch(item.text), handleDebouncedInput(item.text)]} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: index > 0 ? wp(5) : 0 }}>
                                    <Text style={styles.mainDes}>{item.text}</Text>
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => clearSearchHistory(item)}>
                                        <Image source={appIcons.crossSqure} style={{ width: wp(5), height: wp(5), tintColor: colors.descriptionColor }} />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            )
                        }}
                    />
                )
                    : (
                        <FlatList
                            data={searchOfferArray}
                            keyExtractor={(item, index) => index}
                            showsVerticalScrollIndicator={false}
                            ListHeaderComponent={
                                <View style={{ flex: 1, alignItems: "center", justifyContent: 'space-between', marginVertical: wp(5), flexDirection: rtlStyles.rowBetween.flexDirection }}>
                                    <Text style={[styles.resultText, rtlStyles.textAlign, rtlStyles.writingDirection, { fontFamily: fontFamily.UrbanistSemiBold, color: colors.fullBlack }]}>{LocalizedStrings["Result for"]} <Text style={{ fontFamily: fontFamily.UrbanistBold, color: colors.primaryColor }}>“{search}”</Text></Text>
                                    <Text style={[styles.resultNumber, rtlStyles.textAlign]}>{searchArray && searchArray.length}</Text>
                                </View>
                            }
                            ListEmptyComponent={
                                isLoading
                                    ? <ActivityIndicator size={'large'} color={colors.primaryColor} />
                                    : (
                                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginVertical: wp(5) }}>
                                            <Image source={appImages.NotFound} style={{ width: wp(60), height: wp(60), marginVertical: wp(5) }} />
                                            <Text style={styles.mainTitle}>{LocalizedStrings["Not Found"]}</Text>
                                            <Text style={[styles.mainDes, { textAlign: "center", width: wp(70) }]}>{LocalizedStrings["Not Found Description"]}</Text>
                                        </View>
                                    )
                            }
                            renderItem={({ item, index }) => {
                                return (
                                    <ListItem search item={item} IsFavourites={(favorite) => IsFavourites(favorite?._id)} />
                                )
                            }}
                        />
                    )
            }

            <FilterModal
                modalShow={modalShow}
                setModalShow={() => setModalShow(!modalShow)}
            />
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    back: {
        width: wp(5),
        height: wp(5),
        tintColor: colors.BlackSecondary
    },
    mainTitle: {
        fontSize: hp(2.4),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        textAlign: "center",
        marginVertical: wp(5)
    },
    mainDes: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.descriptionColor,
    },
    resultText: {
        fontSize: hp(1.6),
    },
    resultNumber: {
        fontSize: hp(1.4),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.primaryColor,
    }
});