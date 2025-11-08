import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Platform, SafeAreaView, Text, FlatList, TouchableOpacity, Pressable, StatusBar, RefreshControl, Image } from "react-native";
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
import { resolveMessage } from "../../../language/helpers";

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
    const [banks, setBanks] = useState([]);
    const [selectedBank, setSelectedBank] = useState(null);
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

    // Debug: Log banks array changes
    useEffect(() => {
        console.log('Banks array updated:', banks.length, banks);
    }, [banks]);

    // Extract unique banks from offers
    const extractBanks = (offers) => {
        if (!offers || offers.length === 0) {
            setBanks([]);
            return;
        }

        const bankMap = new Map();
        offers.forEach((offer) => {
            if (offer?.employer && offer?.employer?._id) {
                const bankId = offer.employer._id;
                const bankName = appLanguage === 'ar'
                    ? (offer.employer.nameArabic || offer.employer.name || offer.employer.nameEnglish)
                    : (offer.employer.nameEnglish || offer.employer.name || offer.employer.nameArabic);

                if (!bankMap.has(bankId)) {
                    bankMap.set(bankId, {
                        id: bankId,
                        name: bankName,
                        employer: offer.employer
                    });
                }
            }
        });

        const uniqueBanks = Array.from(bankMap.values());
        console.log('Extracted banks:', uniqueBanks.length, uniqueBanks);
        setBanks(uniqueBanks);
    };

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
                // Always extract banks from ALL offers, not filtered ones
                extractBanks(response?.data?.data);
            } else {
                dispatch(saveMyOffer([]));
                setMyOfferFilterArray('')
                setBanks([]);
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
            showMessage({ message: resolveMessage(LocalizedStrings, response?.message), type: 'success' })

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
            showMessage({ message: resolveMessage(LocalizedStrings, error?.message, LocalizedStrings.failed_to_update_favorite), type: 'danger' })
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

    const getMyOffersMore = (bankId = null) => {
        const formattedCheckedStrings = checkboxes.find(item => item.checked && item.title !== LocalizedStrings.Banks)?.title;

        const onSuccess = (response) => {
            console.log('response getMyOffers Home===', response?.data);
            setIsLoading(false);
            dispatch(saveCategoryOffers(response?.data?.data))

            if (response?.data?.data.length > 0) {
                setMyOfferFilterArray(response?.data?.data);

                // Extract banks from category filtered offers when category is selected
                if (formattedCheckedStrings && !bankId) {
                    extractBanks(response?.data?.data);
                }
            } else {
                showMessage({ message: LocalizedStrings.no_offers_found, type: 'danger' })
            }
        };

        const onError = error => {
            console.log('Error getMyOffers Home===', error);
            setIsLoading(false);
        };

        // let endPoint = routs.getMyOffers + `user/all?language=${appLanguage === 'ar' ? 'arabic' : 'english'}`
        let endPoint = routs.getMyOffers + `?language=${appLanguage === 'ar' ? 'arabic' : 'english'}`

        // If bank is selected, filter by employer/bank
        if (bankId) {
            endPoint += `&employer=${bankId}`;
        } else if (formattedCheckedStrings) {
            // Otherwise filter by category
            endPoint += `&category=${formattedCheckedStrings}`;
        }

        const method = Method.GET;
        const bodyParams = {};

        setIsLoading(true);
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    };

    useEffect(() => {
        const allChecked = checkboxes.find(cb => cb.checked && cb.title === LocalizedStrings.All);

        const updatedCheckboxes = checkboxes.filter((checkbox) => checkbox.checked && checkbox.title !== LocalizedStrings.All);
        if (updatedCheckboxes.length > 0) {
            // If a category is selected, reset bank selection and call API
            setSelectedBank(null);
            setMyOfferFilterArray('');
            getMyOffersMore()
        } else if (allChecked) {
            // If "All" is selected, extract banks from all offers and reset bank selection
            setSelectedBank(null);
            setMyOfferFilterArray('');
            if (myOffer && myOffer.length > 0) {
                extractBanks(myOffer);
            }
        }
    }, [checkboxes]);

    const handleCheckboxChange = (checkboxId) => {
        const updatedCheckboxes = checkboxes.map((checkbox) =>
            checkbox.id === checkboxId
                ? { ...checkbox, checked: true }
                : { ...checkbox, checked: false }
        );
        setCheckboxes(updatedCheckboxes);

        // Reset bank selection when category changes
        setSelectedBank(null);
    };

    const handleBankSelect = (bank) => {
        // If "All" bank is selected (bank is null or special "all" identifier)
        if (!bank || bank.id === 'all') {
            setSelectedBank(null);
            setMyOfferFilterArray('');
            return;
        }

        setSelectedBank(bank.id);

        // Check if a category is selected (not "All")
        const selectedCategory = checkboxes.find(cb =>
            cb.checked &&
            cb.title !== LocalizedStrings.All
        );

        // If a category is selected, filter from CategoriesOffers (category filtered offers)
        // Otherwise, filter from all offers (myOffer) or call API
        if (selectedCategory && CategoriesOffers?.length > 0) {
            // Filter category offers by selected bank
            const filteredOffers = CategoriesOffers.filter(offer =>
                offer?.employer?._id === bank.id
            );
            setMyOfferFilterArray(filteredOffers);

            if (filteredOffers.length === 0) {
                showMessage({ message: LocalizedStrings.no_offers_found, type: 'danger' });
            }
        } else {
            // If "All" is selected, call API to get offers filtered by bank/employer
            getMyOffersMore(bank.id);
        }
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
                // Always extract banks from ALL offers
                extractBanks(response?.data?.data);
            } else {
                dispatch(saveMyOffer([]));
                setMyOfferFilterArray('')
                setBanks([]);
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

                    {/* Banks List - Always visible */}
                    {banks.length > 0 && (
                        <View style={styles.banksContainer}>
                            <FlatList
                                data={[{ id: 'all', name: LocalizedStrings.All, isAll: true }, ...banks]}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(item, index) => item.isAll ? 'bank-all' : `bank-${item.id || index}-${item.name || ''}`}
                                removeClippedSubviews={false}
                                initialNumToRender={banks.length + 1}
                                maxToRenderPerBatch={banks.length + 1}
                                windowSize={5}
                                renderItem={({ item, index }) => {
                                    const isSelected = item.isAll ? !selectedBank : selectedBank === item.id;

                                    return (
                                        <Pressable key={item.isAll ? 'bank-pressable-all' : `bank-pressable-${item.id || index}`} onPress={() => handleBankSelect(item.isAll ? null : item)}>
                                            <View style={[
                                                styles.bankView,
                                                {
                                                    borderColor: isSelected ? colors.primaryColor : colors.borderColor,
                                                    borderWidth: 1,
                                                    backgroundColor: isSelected ? colors.primaryColor + '10' : colors.fullWhite
                                                }
                                            ]}>
                                                {item.isAll ? (
                                                    <Text style={[
                                                        styles.bankText,
                                                        { paddingHorizontal: wp(3), paddingVertical: appLanguage == 'en' ? wp(3) : wp(1), color: isSelected ? colors.primaryColor : colors.BlackSecondary }
                                                    ]}>
                                                        {item.name}
                                                    </Text>
                                                ) : item.employer?.image ? (
                                                    <View style={{ padding: wp(1.5) }}>
                                                        <Image
                                                            source={{ uri: item.employer.image }}
                                                            style={[styles.bankLogo]}
                                                            resizeMode="contain"
                                                        />
                                                    </View>
                                                ) : (
                                                    <Text style={[
                                                        styles.bankText,
                                                        { paddingHorizontal: wp(3), color: isSelected ? colors.primaryColor : colors.BlackSecondary }
                                                    ]}>
                                                        {item.name}
                                                    </Text>
                                                )}
                                            </View>
                                        </Pressable>
                                    );
                                }}
                            />
                        </View>
                    )}

                    <FlatList
                        data={
                            selectedBank
                                ? myOfferFilterArray?.length > 0 ? myOfferFilterArray : []
                                : myOfferFilterArray?.length > 0
                                    ? myOfferFilterArray
                                    : (() => {
                                        // If a category is selected, show CategoriesOffers
                                        const selectedCategory = checkboxes.find(cb =>
                                            cb.checked &&
                                            cb.title !== LocalizedStrings.All
                                        );
                                        return selectedCategory && CategoriesOffers?.length > 0
                                            ? CategoriesOffers
                                            : myOffer;
                                    })()
                        }
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
    banksContainer: {
        marginVertical: wp(1),
    },
    bankView: {
        marginLeft: wp(2),
        backgroundColor: colors.fullWhite,
        borderRadius: wp(10),
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "center",
        borderColor: colors.primaryColor,
        borderWidth: 1
    },
    bankText: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistMedium,
        textAlign: "center",
    },
    bankLogo: {
        width: wp(8),
        height: wp(8),
        borderRadius: wp(6),
    },
})