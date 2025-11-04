import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Platform, SafeAreaView, Text, FlatList, TouchableOpacity, Pressable, StatusBar, RefreshControl } from "react-native";
import { hp, routes, wp } from "../../../services/constants";
import appStyles from "../../../services/utilities/appStyles";
import { appIcons, colors, fontFamily } from "../../../services";
import ListItem from "../../../components/ListItem";
import { LocalizationContext } from "../../../language/LocalizationContext";
import routs from "../../../api/routs";
import { callApi, Method } from "../../../api/apiCaller";
import { Loader } from "../../../components/loader/Loader";
import { useDispatch, useSelector } from "react-redux";
import { saveCategoryOffers, saveMyOffer } from "../../../store/reducers/OfferSlice";
import { showMessage } from "react-native-flash-message";
import { saveFavourite } from "../../../store/reducers/FavoruiteOffersSlice";
import { Input } from "../../../components/input";

export default Offer = (props) => {
    const { LocalizedStrings, appLanguage } = React.useContext(LocalizationContext);
    const dispatch = useDispatch()
    const favorite = useSelector(state => state.favorite.favorite)
    const myOffer = useSelector(state => state.offer.myOffer)
    const CategoriesOffers = useSelector(state => state.offer.CategoriesOffers)
    const [isLoading, setIsLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [myOfferFilterArray, setMyOfferFilterArray] = useState('')
    const [checkboxes, setCheckboxes] = useState([]);
    const refreshCounterRef = useRef(0);

    useEffect(() => {
        const fetchData = async () => {
            await getMyOfferCategory();
            await getMyOffers();
        };

        fetchData();
    }, []);

    // Reset to "All" filter when checkboxes are loaded
    useEffect(() => {
        if (checkboxes.length > 0) {
            const updatedCheckboxes = checkboxes.map((checkbox) =>
                checkbox.title === LocalizedStrings.All
                    ? { ...checkbox, checked: true }
                    : { ...checkbox, checked: false }
            );
            setCheckboxes(updatedCheckboxes);
        }
    }, [checkboxes.length]);

    const getMyOfferCategory = () => {
        const onSuccess = (response) => {
            console.log('response get Map Category Home===', response?.categories);
            setIsLoading(false);

            const categories = response?.categories;
            const uniqueCategories = Array.from(new Set(categories));
            const formattedCategories = uniqueCategories.map((category, index) => ({
                id: index + 1,
                title: category,
                checked: false
            }));

            const allItem = {
                id: 0,
                title: LocalizedStrings.All,
                checked: true
            };

            formattedCategories.unshift(allItem);
            setCheckboxes(formattedCategories);
        };

        const onError = error => {
            console.log('Error get Map Category Home===', error);
            setIsLoading(false);
        };

        let endPoint = routs.getMyOffers + `categories?language=${appLanguage === 'ar' ? 'arabic' : 'english'}`

        const method = Method.GET;
        const bodyParams = {};

        // setIsLoading(true);
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    }

    const getMyOffers = () => {
        const onSuccess = (response) => {
            console.log('response getMyOffers===', response?.data);
            setIsLoading(false);

            if (response?.data?.data && response?.data?.data.length > 0) {
                dispatch(saveMyOffer(response?.data?.data));
            } else {
                dispatch(saveMyOffer([]));
            }
        };

        const onError = error => {
            setIsLoading(false);
            console.log('Error getMyOffers===', error);
        };

        // const endPoint = routs.getMyOffers + `user/all?language=${appLanguage === 'ar' ? 'arabic' : 'english'}`
        const endPoint = routs.getMyOffers + `?language=${appLanguage === 'ar' ? 'arabic' : 'english'}`
        const method = Method.GET;
        const bodyParams = {};

        setIsLoading(true);
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    };

    const IsFavourites = (id) => {
        const onSuccess = (response) => {
            setIsLoading(false);
            console.log('response favourite===', response);
            showMessage({ message: response?.message, type: 'success' })

            if (myOffer && myOffer.length > 0) {
                const newCustomeArray = myOffer.map((item) => {
                    if (item._id === id) {
                        return {
                            ...item,
                            isLiked: !item?.isLiked
                        };
                    }
                    return item;
                });
                dispatch(saveMyOffer(newCustomeArray));

                const toggledItem = newCustomeArray.find((item) => item._id === id);
                const newCustomeFavoriteID = toggledItem?.isLiked
                    ? [...favorite, toggledItem]
                    : favorite.filter((item) => item._id !== id);
                dispatch(saveFavourite(newCustomeFavoriteID));
            }

            if (CategoriesOffers && CategoriesOffers.length > 0) {
                const newCustomeCategoryOffersArray = CategoriesOffers.map((item) => {
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
            console.log('Error favourite===', error);
            showMessage({ message: error?.message || 'Failed to update favorite', type: 'danger' })
        };

        const endPoint = routs.favourite + `/${id}`;
        const method = Method.POST;
        const bodyParams = {};

        setIsLoading(true);
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    };

    const getCheckedLocalizedStrings = () => {
        const checkedItems = checkboxes.filter(item => item.checked);
        return checkedItems.map(item => LocalizedStrings[item.title]).join(',');
    }

    const getMyOffersMore = () => {
        const formattedCheckedStrings = checkboxes.find(item => item.checked)?.title;

        const onSuccess = (response) => {
            console.log('response getMyOffers Home===', response?.data);
            setIsLoading(false);
            dispatch(saveCategoryOffers(response?.data?.data))

            if (response?.data?.data.length > 0) {
                setMyOfferFilterArray(response?.data?.data)
            } else {
                showMessage({ message: 'No Offers Found!', type: 'danger' })
            }
        };

        const onError = error => {
            console.log('Error getMyOffers Home===', error);
            setIsLoading(false);
        };

        // let endPoint = routs.getMyOffers + `user/all?language=${appLanguage === 'ar' ? 'arabic' : 'english'}`
        let endPoint = routs.getMyOffers + `?language=${appLanguage === 'ar' ? 'arabic' : 'english'}`

        if (formattedCheckedStrings) {
            endPoint += `&category=${formattedCheckedStrings}`;
        }

        const method = Method.GET;
        const bodyParams = {};

        setIsLoading(true);
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    };

    useEffect(() => {
        const updatedCheckboxes = checkboxes.filter((checkbox) => checkbox.checked && checkbox.title !== LocalizedStrings.All);
        if (updatedCheckboxes.length > 0) {
            getMyOffersMore()
        } else {
            setMyOfferFilterArray('')
        }
    }, [checkboxes]);

    const handleCheckboxChange = (checkboxId) => {
        const updatedCheckboxes = checkboxes.map((checkbox) =>
            checkbox.id === checkboxId
                ? { ...checkbox, checked: true }
                : { ...checkbox, checked: false }
        );
        setCheckboxes(updatedCheckboxes);
    };

    const onRefresh = () => {
        setRefreshing(true);
        refreshCounterRef.current = 0;

        const checkAndSetRefreshing = () => {
            refreshCounterRef.current += 1;
            if (refreshCounterRef.current >= 2) {
                setRefreshing(false);
            }
        };

        // Refresh categories
        const onCategorySuccess = (response) => {
            console.log('response get Map Category Home===', response?.categories);

            const categories = response?.categories;
            const uniqueCategories = Array.from(new Set(categories));
            const formattedCategories = uniqueCategories.map((category, index) => ({
                id: index + 1,
                title: category,
                checked: false
            }));

            const allItem = {
                id: 0,
                title: LocalizedStrings.All,
                checked: true
            };

            formattedCategories.unshift(allItem);
            setCheckboxes(formattedCategories);

            checkAndSetRefreshing();
        };

        const onCategoryError = (error) => {
            console.log('Error get Map Category Home===', error);
            checkAndSetRefreshing();
        };

        const categoryEndPoint = routs.getMyOffers + `categories?language=${appLanguage === 'ar' ? 'arabic' : 'english'}`
        callApi(Method.GET, categoryEndPoint, {}, onCategorySuccess, onCategoryError);

        // Refresh offers
        const onOffersSuccess = (response) => {
            console.log('response getMyOffers===', response?.data);

            if (response?.data?.data && response?.data?.data.length > 0) {
                dispatch(saveMyOffer(response?.data?.data));
            } else {
                dispatch(saveMyOffer([]));
            }

            checkAndSetRefreshing();
        };

        const onOffersError = (error) => {
            console.log('Error getMyOffers===', error);
            checkAndSetRefreshing();
        };

        // const offersEndPoint = routs.getMyOffers + `user/all?language=${appLanguage === 'ar' ? 'arabic' : 'english'}`
        const offersEndPoint = routs.getMyOffers + `?language=${appLanguage === 'ar' ? 'arabic' : 'english'}`
        callApi(Method.GET, offersEndPoint, {}, onOffersSuccess, onOffersError);
    };

    return (
        <>
            <StatusBar
                barStyle={'dark-content'}
                backgroundColor={Platform.OS === 'android' ? '#fff' : undefined}
                translucent={Platform.OS === 'android'}
            />
            <SafeAreaView style={[appStyles.safeContainer, { paddingTop: Platform.OS === 'android' ? wp(10) : 0, margin: wp(4) }]}>
                <Loader loading={isLoading} />

                <View style={styles.tabTopView}>
                    <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: "space-between" }}>
                        <TouchableOpacity activeOpacity={1} onPress={() => props.navigation.navigate(routes.search, { discount: '', location: '', category: getCheckedLocalizedStrings() })}>
                            <Input
                                editable={false}
                                placeholder={LocalizedStrings.search}
                                value={""}
                                leftIcon={appIcons.search}
                                onPressIcon={() => props.navigation.navigate(routes.search, { discount: '', location: '', category: getCheckedLocalizedStrings() })}
                                eyeValue={appIcons.filter}
                                shadow
                                rightIconColor={colors.primaryColor}
                                containerStyle={{
                                    borderRadius: 15,
                                    marginTop: -hp(5),
                                }}
                                WholeContainer={{
                                    borderRadius: 5,
                                    width: wp(92)
                                }}
                                touchable
                            />
                        </TouchableOpacity>
                    </View>

                    <View>
                        <FlatList
                            data={checkboxes}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item, index }) => {
                                return (
                                    item.title != null && (
                                        <Pressable key={index} onPress={() => handleCheckboxChange(item.id)} style={{ flexDirection: "row", alignItems: "center" }}>
                                            <View style={[styles.filterView, { borderColor: item.checked ? colors.primaryColor : colors.borderColor, borderWidth: 1 }]}>
                                                <Text style={[styles.filterText]}>{item.title}</Text>
                                            </View>
                                        </Pressable>
                                    )
                                )
                            }}
                        />
                    </View>

                    <FlatList
                        data={myOfferFilterArray?.length > 0 ? myOfferFilterArray : myOffer}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={{
                            paddingBottom: wp(5)
                        }}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[colors.primaryColor]}
                                tintColor={colors.primaryColor}
                            />
                        }
                        ListEmptyComponent={
                            !isLoading && !refreshing ? (
                                <Text style={styles.emptytext}>{LocalizedStrings['No Offers yet!']}</Text>
                            ) : null
                        }
                        renderItem={({ item, index }) => {
                            return (
                                <ListItem key={index} buttonEnable item={item} IsFavourites={(fav) => IsFavourites(fav?._id)} />
                            )
                        }}
                    />
                </View>
            </SafeAreaView>
        </>
    )
};

const styles = StyleSheet.create({
    tabTopView: {
        flex: 1,
    },
    emptytext: {
        fontSize: hp(1.6),
        lineHeight: 24,
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        marginVertical: wp(10),
        textAlign: "center"
    },
    filterView: {
        paddingHorizontal: wp(3),
        height: wp(10),
        marginVertical: wp(5),
        marginLeft: wp(2),
        backgroundColor: colors.fullWhite,
        borderRadius: wp(10),
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "space-between",
        borderColor: colors.primaryColor,
        borderWidth: 1
    },
    filterText: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistMedium,
        color: colors.primaryColor,
        textAlign: "center",
        marginRight: wp(1)
    },
})