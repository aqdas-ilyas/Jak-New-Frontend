import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Platform, SafeAreaView, Text, FlatList, TouchableOpacity, Pressable, StatusBar, RefreshControl, Image, ActivityIndicator, Animated, Easing } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hp, routes, wp } from "../../../services/constants";
import appStyles from "../../../services/utilities/appStyles";
import { appIcons, colors, fontFamily } from "../../../services";
import ListItem from "../../../components/ListItem";
import { LocalizationContext } from "../../../language/LocalizationContext";
import { useRTL } from "../../../language/useRTL";
import routs from "../../../api/routs";
import { callApi, Method } from "../../../api/apiCaller";
import { useDispatch, useSelector } from "react-redux";
import { saveCategoryOffers, saveMyOffer } from "../../../store/reducers/OfferSlice";
import { showMessage } from "react-native-flash-message";
import { saveFavourite } from "../../../store/reducers/FavoruiteOffersSlice";
import { resolveMessage } from "../../../language/helpers";

// Beautiful Animated Loader Component
const AnimatedLoader = () => {
    const spinValue = useRef(new Animated.Value(0)).current;
    const scaleValue1 = useRef(new Animated.Value(0.4)).current;
    const scaleValue2 = useRef(new Animated.Value(0.4)).current;
    const scaleValue3 = useRef(new Animated.Value(0.4)).current;
    const pulseValue = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Continuous rotating animation
        const spinAnimation = Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 1500,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        // Sequential pulsing animation for dots
        const createPulseAnimation = (scaleValue, delay) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(scaleValue, {
                        toValue: 1.2,
                        duration: 500,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleValue, {
                        toValue: 0.4,
                        duration: 500,
                        easing: Easing.in(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        const pulseAnimation1 = createPulseAnimation(scaleValue1, 0);
        const pulseAnimation2 = createPulseAnimation(scaleValue2, 200);
        const pulseAnimation3 = createPulseAnimation(scaleValue3, 400);

        // Outer circle pulse animation
        const outerPulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseValue, {
                    toValue: 1.1,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseValue, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );

        spinAnimation.start();
        pulseAnimation1.start();
        pulseAnimation2.start();
        pulseAnimation3.start();
        outerPulseAnimation.start();

        return () => {
            spinAnimation.stop();
            pulseAnimation1.stop();
            pulseAnimation2.stop();
            pulseAnimation3.stop();
            outerPulseAnimation.stop();
        };
    }, []);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.loaderContainer}>
            <View style={styles.loaderWrapper}>
                {/* Outer rotating circle with pulse */}
                <Animated.View
                    style={[
                        styles.outerCircle,
                        {
                            transform: [
                                { rotate: spin },
                                { scale: pulseValue },
                            ],
                        },
                    ]}
                >
                    <View style={[styles.circleSegment, { backgroundColor: colors.primaryColor, opacity: 0.8 }]} />
                    <View style={[styles.circleSegment, styles.circleSegment2, { backgroundColor: colors.primaryColor, opacity: 0.6 }]} />
                    <View style={[styles.circleSegment, styles.circleSegment3, { backgroundColor: colors.primaryColor, opacity: 0.4 }]} />
                    <View style={[styles.circleSegment, styles.circleSegment4, { backgroundColor: colors.primaryColor, opacity: 0.2 }]} />
                </Animated.View>

                {/* Inner pulsing dots */}
                <View style={styles.dotsContainer}>
                    <Animated.View
                        style={[
                            styles.dot,
                            {
                                backgroundColor: colors.primaryColor,
                                transform: [{ scale: scaleValue1 }],
                            },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.dot,
                            {
                                backgroundColor: colors.primaryColor,
                                transform: [{ scale: scaleValue2 }],
                            },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.dot,
                            {
                                backgroundColor: colors.primaryColor,
                                transform: [{ scale: scaleValue3 }],
                            },
                        ]}
                    />
                </View>
            </View>
        </View>
    );
};

export default Offer = (props) => {
    const { LocalizedStrings, appLanguage } = React.useContext(LocalizationContext);
    const { isRTL, rtlStyles } = useRTL();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch()
    const favorite = useSelector(state => state.favorite.favorite)
    const myOffer = useSelector(state => state.offer.myOffer)
    const CategoriesOffers = useSelector(state => state.offer.CategoriesOffers)
    const [isLoading, setIsLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [myOfferFilterArray, setMyOfferFilterArray] = useState('')
    const [checkboxes, setCheckboxes] = useState([]);

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

    // // Debug: Log banks array changes
    // useEffect(() => {
    //     console.log('Banks array updated:', banks.length, banks);
    // }, [banks]);

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
        // console.log('Extracted banks:', uniqueBanks.length, uniqueBanks);
        setBanks(uniqueBanks);
    };

    const getMyOfferCategory = () => {
        const onSuccess = (response) => {
            console.log('response get Map Category Home===', response?.categories);
            // setIsLoading(false);

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
            // setIsLoading(false);
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
            // Set loading to false immediately when response arrives
            setIsLoading(false);

            if (response?.data?.data && response?.data?.data.length > 0) {
                // Filter out expired offers
                const filteredOffers = filterExpiredOffers(response?.data?.data);
                dispatch(saveMyOffer(filteredOffers));
                // Always extract banks from ALL offers, not filtered ones
                extractBanks(filteredOffers);
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

        const endPoint = routs.getMyOffers + `user/all?language=${appLanguage === 'ar' ? 'arabic' : 'english'}`
        // const endPoint = routs.getMyOffers + `?language=${appLanguage === 'ar' ? 'arabic' : 'english'}`
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

                console.log('new-CustomeArray: ', newCustomeArray)
                dispatch(saveMyOffer(newCustomeArray));

                const toggledItem = newCustomeArray.find((item) => item._id === id);
                const newCustomeFavoriteID = toggledItem?.isLiked
                    ? [...favorite, toggledItem]
                    : favorite ? favorite.filter((item) => item._id !== id) : [];

                console.log('new-CustomeFavoriteID: ', newCustomeFavoriteID)
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

                console.log('new-CustomeCategoryOffersArray: ', newCustomeCategoryOffersArray)
                dispatch(saveCategoryOffers(newCustomeCategoryOffersArray));
            }
        };

        const onError = error => {
            setIsLoading(false);
            console.log('Error favourite===', error);
            // showMessage({ message: resolveMessage(LocalizedStrings, error?.message, LocalizedStrings.failed_to_update_favorite), type: 'danger' })
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
            // Set loading to false immediately when response arrives
            setIsLoading(false);
            // Filter out expired offers
            const filteredOffers = filterExpiredOffers(response?.data?.data || []);
            dispatch(saveCategoryOffers(filteredOffers));

            if (filteredOffers.length > 0) {
                // Use filtered offers instead of raw response data
                setMyOfferFilterArray(filteredOffers);

                // Extract banks from filtered offers when category is selected
                if (formattedCheckedStrings && !bankId) {
                    extractBanks(filteredOffers);
                }
            } else {
                setMyOfferFilterArray([]);
                showMessage({ message: LocalizedStrings.no_offers_found, type: 'danger' })
            }
        };

        const onError = error => {
            console.log('Error getMyOffers Home===', error);
            setIsLoading(false);
        };

        let endPoint = routs.getMyOffers + `user/all?language=${appLanguage === 'ar' ? 'arabic' : 'english'}`
        // let endPoint = routs.getMyOffers + `?language=${appLanguage === 'ar' ? 'arabic' : 'english'}`

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
            // Filter category offers by selected bank AND remove expired offers
            const bankFilteredOffers = CategoriesOffers.filter(offer =>
                offer?.employer?._id === bank.id
            );
            // Also filter out expired offers
            const filteredOffers = filterExpiredOffers(bankFilteredOffers);
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
                // Filter out expired offers
                const filteredOffers = filterExpiredOffers(response?.data?.data);
                dispatch(saveMyOffer(filteredOffers));
                // Always extract banks from ALL offers
                extractBanks(filteredOffers);
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

        const offersEndPoint = routs.getMyOffers + `user/all?language=${appLanguage === 'ar' ? 'arabic' : 'english'}`
        // const offersEndPoint = routs.getMyOffers + `?language=${appLanguage === 'ar' ? 'arabic' : 'english'}`
        callApi(Method.GET, offersEndPoint, {}, onOffersSuccess, onOffersError);
    };

    return (
        <>
            <StatusBar
                barStyle={'dark-content'}
                backgroundColor={Platform.OS === 'android' ? '#fff' : undefined}
                translucent={Platform.OS === 'android'}
            />
            <SafeAreaView style={[appStyles.safeContainer, rtlStyles.writingDirection, { paddingTop: Platform.OS === 'android' ? wp(10) : 0, marginHorizontal: wp(4), paddingBottom: 0 }]}>

                <View style={styles.tabTopView}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => props.navigation.navigate(routes.search, { discount: '', location: '', category: getCheckedLocalizedStrings() })}
                        style={styles.searchContainer}
                    >
                        <View style={styles.searchView}>
                            <Image
                                source={appIcons.search}
                                style={[styles.searchIcon, { tintColor: colors.BlackSecondary }]}
                                resizeMode="contain"
                            />
                            <Text style={[styles.searchPlaceholder, rtlStyles.writingDirection]}>
                                {LocalizedStrings.search}
                            </Text>
                            {/* <TouchableOpacity 
                                activeOpacity={0.7}
                                onPress={() => props.navigation.navigate(routes.search, { discount: '', location: '', category: getCheckedLocalizedStrings() })}
                                style={styles.filterButton}
                            >
                                <Image 
                                    source={appIcons.filter} 
                                    style={[styles.filterIcon, { tintColor: colors.primaryColor }]} 
                                    resizeMode="contain"
                                />
                            </TouchableOpacity> */}
                        </View>
                    </TouchableOpacity>

                    <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                        <FlatList
                            data={checkboxes}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={{
                                flexDirection: isRTL ? 'row-reverse' : 'row'
                            }}
                            renderItem={({ item, index }) => {
                                return (
                                    item.title != null && (
                                        <Pressable
                                            key={index}
                                            onPress={() => handleCheckboxChange(item.id)}
                                            style={{
                                                flexDirection: isRTL ? "row-reverse" : "row",
                                                alignItems: "center",
                                                marginHorizontal: wp(1),
                                                alignSelf: isRTL ? 'flex-end' : 'flex-start'
                                            }}>
                                            <View
                                                style={[
                                                    styles.filterView,
                                                    {
                                                        borderColor: item.checked ? colors.primaryColor : colors.borderColor,
                                                        borderWidth: 1,
                                                        flexDirection: isRTL ? "row-reverse" : "row"
                                                    }
                                                ]}>
                                                <Text style={[styles.filterText, { textAlign: isRTL ? 'right' : 'left' }]}>{item.title}</Text>
                                            </View>
                                        </Pressable>
                                    )
                                )
                            }}
                        />
                    </View>

                    {/* Banks List - Always visible */}
                    {banks.length > 0 && (
                        <View style={[styles.banksContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                            <FlatList
                                data={[{ id: 'all', name: LocalizedStrings.All, isAll: true }, ...banks]}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{
                                    flexDirection: isRTL ? 'row-reverse' : 'row'
                                }}
                                keyExtractor={(item, index) => item.isAll ? 'bank-all' : `bank-${item.id || index}-${item.name || ''}`}
                                removeClippedSubviews={false}
                                initialNumToRender={banks.length + 1}
                                maxToRenderPerBatch={banks.length + 1}
                                windowSize={5}
                                renderItem={({ item, index }) => {
                                    const isSelected = item.isAll ? !selectedBank : selectedBank === item.id;

                                    return (
                                        <Pressable
                                            key={item.isAll ? 'bank-pressable-all' : `bank-pressable-${item.id || index}`}
                                            onPress={() => handleBankSelect(item.isAll ? null : item)}
                                            style={{ alignSelf: isRTL ? 'flex-end' : 'flex-start' }}>
                                            <View style={[
                                                styles.bankView,
                                                {
                                                    flexDirection: isRTL ? 'row-reverse' : 'row',
                                                    borderColor: isSelected ? colors.primaryColor : colors.borderColor,
                                                    borderWidth: 1,
                                                    backgroundColor: isSelected ? colors.primaryColor + '10' : colors.fullWhite,
                                                    marginHorizontal: wp(1),
                                                    paddingVertical: (item.id == 'all' && appLanguage == 'ar' && Platform.OS == 'android') ? wp(1.3) : wp(0)
                                                }
                                            ]}>
                                                {item.isAll ? (
                                                    <Text style={[
                                                        styles.bankText,
                                                        {
                                                            paddingHorizontal: wp(3),
                                                            paddingVertical: isRTL ? wp(1) : wp(3),
                                                            color: isSelected ? colors.primaryColor : colors.BlackSecondary,
                                                            textAlign: isRTL ? 'right' : 'left'
                                                        }
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
                                                        {
                                                            paddingHorizontal: wp(3),
                                                            color: isSelected ? colors.primaryColor : colors.BlackSecondary,
                                                            textAlign: isRTL ? 'right' : 'left'
                                                        }
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
                        style={{ marginTop: wp(2) }}
                        data={(() => {
                            let offersToDisplay = [];
                            
                            if (selectedBank) {
                                // If bank is selected, use filtered array
                                offersToDisplay = myOfferFilterArray?.length > 0 ? myOfferFilterArray : [];
                            } else if (myOfferFilterArray?.length > 0) {
                                // If filter array has data, use it
                                offersToDisplay = myOfferFilterArray;
                            } else {
                                // Otherwise determine from category selection
                                const selectedCategory = checkboxes.find(cb =>
                                    cb.checked &&
                                    cb.title !== LocalizedStrings.All
                                );
                                offersToDisplay = selectedCategory && CategoriesOffers?.length > 0
                                    ? CategoriesOffers
                                    : myOffer;
                            }
                            
                            // Always filter out expired offers before displaying
                            return filterExpiredOffers(offersToDisplay || []);
                        })()}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={{
                            // paddingBottom: hp(10) + (insets.bottom > 0 ? insets.bottom * 0.35 : 0) + wp(8),
                        }}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[colors.primaryColor]}
                                tintColor={colors.primaryColor}
                            />
                        }
                        initialNumToRender={10}
                        ListEmptyComponent={
                            isLoading ? (
                                <View style={styles.emptyContainer}>
                                    <AnimatedLoader />
                                    {/* <Text style={styles.loadingText}>{LocalizedStrings['Loading...'] || 'Loading...'}</Text> */}
                                </View>
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptytext}>{LocalizedStrings['No Offers yet!']}</Text>
                                </View>
                            )
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
    searchContainer: {
        marginVertical: wp(2),
    },
    searchView: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.fullWhite,
        borderRadius: 15,
        paddingHorizontal: wp(4),
        paddingVertical: wp(3.5),
        width: wp(92),
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    searchIcon: {
        width: wp(5),
        height: wp(5),
        marginRight: wp(3),
    },
    searchPlaceholder: {
        flex: 1,
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.placeholderColor || colors.BlackSecondary,
    },
    filterButton: {
        padding: wp(1),
        marginLeft: wp(2),
    },
    filterIcon: {
        width: wp(5),
        height: wp(5),
    },
    emptytext: {
        fontSize: hp(1.6),
        lineHeight: 24,
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        textAlign: "center"
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: hp(20),
        minHeight: hp(50),
    },
    loadingText: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistMedium,
        color: colors.descriptionColor,
        textAlign: "center",
        marginTop: wp(3),
    },
    filterView: {
        paddingHorizontal: wp(3),
        height: wp(10),
        marginVertical: wp(5),
        backgroundColor: colors.fullWhite,
        borderRadius: wp(10),
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
        backgroundColor: colors.fullWhite,
        borderRadius: wp(10),
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
    loaderContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: wp(4),
    },
    loaderWrapper: {
        width: wp(24),
        height: wp(24),
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    outerCircle: {
        width: wp(24),
        height: wp(24),
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleSegment: {
        width: wp(4),
        height: wp(4),
        borderRadius: wp(2),
        position: 'absolute',
        top: 0,
        left: '50%',
        marginLeft: -wp(2),
    },
    circleSegment2: {
        right: 0,
        top: '50%',
        left: 'auto',
        marginTop: -wp(2),
        marginLeft: 0,
    },
    circleSegment3: {
        bottom: 0,
        left: '50%',
        top: 'auto',
        marginLeft: -wp(2),
        marginTop: 0,
    },
    circleSegment4: {
        left: 0,
        top: '50%',
        marginTop: -wp(2),
        marginLeft: 0,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        width: wp(3.5),
        height: wp(3.5),
        borderRadius: wp(1.75),
        marginHorizontal: wp(1.5),
        backgroundColor: colors.primaryColor,
    },
})