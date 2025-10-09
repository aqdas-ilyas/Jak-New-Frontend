import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Platform, SafeAreaView, Image, ImageBackground, Text, FlatList, ScrollView, TouchableOpacity, ActivityIndicator, Pressable } from "react-native";
import { heightPixel, hp, routes, widthPixel, wp } from "../../../services/constants";
import appStyles from "../../../services/utilities/appStyles";
import { appIcons, colors, fontFamily } from "../../../services";
import LogoHeader from "../../../components/logoHeader/LogoHeader";
import ListItem from "../../../components/ListItem";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { LocalizationContext } from "../../../language/LocalizationContext";
import routs from "../../../api/routs";
import { callApi, Method } from "../../../api/apiCaller";
import { Loader } from "../../../components/loader/Loader";
import { useDispatch, useSelector } from "react-redux";
import { saveCategoryMyOfferPageNo, saveCategoryOffers, saveForAllOffers, saveMyOffer, saveMyOfferPageNo, saveTotalCategoryMyOfferPagesCount, saveTotalMyOfferPagesCount } from "../../../store/reducers/OfferSlice";
import { getLocationPermission } from "../../../common/HelpingFunc";
import Geolocation from "@react-native-community/geolocation";
import { useFocusEffect, useIsFocused, useNavigation } from "@react-navigation/native";
import { showMessage } from "react-native-flash-message";
import { saveFavourite } from "../../../store/reducers/FavoruiteOffersSlice";
import ActionSheet from "react-native-actions-sheet";
import { Input } from "../../../components/input";

const Tab = createMaterialTopTabNavigator();

export default Offer = (props) => {
    const { LocalizedStrings, appLanguage } = React.useContext(LocalizationContext);
    const dispatch = useDispatch()
    const refFilterCategorySheet = useRef();
    const forAllOffers = useSelector(state => state.offer.forAllOffers)
    const favorite = useSelector(state => state.favorite.favorite)
    const myOffer = useSelector(state => state.offer.myOffer)
    const CategoriesOffers = useSelector(state => state.offer.CategoriesOffers)
    const myOfferPageNo = useSelector(state => state.offer.myOfferPageNo)
    const totalMyOfferPagesCount = useSelector(state => state.offer.totalMyOfferPagesCount)
    const categoryMyOfferPageNo = useSelector(state => state.offer.categoryMyOfferPageNo)
    const [isLoading, setIsLoading] = useState(false)
    const [isBottomLoading, setIsBottomLoading] = useState(false)
    const flatListRef = useRef(null);
    const [categoryFilter, setCategoryFilter] = useState('')
    const [categoryFilterArray, setCategoryFilterArray] = useState('')
    const [myOfferFilterArray, setMyOfferFilterArray] = useState('')
    const [checkboxes, setCheckboxes] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            await getMyOfferCategory();
            await getMyOffers();
        };

        fetchData();
    }, []);

    const getMoreOffer = () => {
        if (myOffer && myOffer.length > 0) {
            if (totalMyOfferPagesCount > myOfferPageNo) {
                getMyOffers('bottom')
            } else {
                console.log('No Data!')
            }
        }
    }

    const getMyOfferCategory = () => {
        const onSuccess = async (response) => {
            console.log('response get Map Category Home===', response?.categories);
            setIsLoading(false);

            const categories = response?.categories;
            // Use a Set to filter out duplicate titles
            const uniqueCategories = Array.from(new Set(categories));
            const formattedCategories = uniqueCategories.map((category, index) => {
                return {
                    id: index + 1,
                    title: category,
                    checked: false
                };
            });
            // Create the 'All' item
            const allItem = {
                id: 0, // You can choose an appropriate ID, here 0 is used to indicate it is at the start
                title: LocalizedStrings.All,
                checked: true
            };
            // Add 'All' at the start of the array
            formattedCategories.unshift(allItem);
            // Update the state with the new array
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

    const getMyOffers = async (str) => {
        const onSuccess = async (response) => {
            console.log('response getMyOffers===', response?.data);
            str == 'bottom' ? setIsBottomLoading(false) : setIsLoading(false)

            dispatch(saveTotalMyOfferPagesCount(response?.data?.totalPages))

            if (response?.data?.totalPages == 0) {
                dispatch(saveMyOffer(null));
            }

            if (response?.data?.data.length > 0 && response?.data?.totalPages >= myOfferPageNo) {
                dispatch(saveMyOfferPageNo(myOfferPageNo + 1));

                let myOfferArray
                if (myOffer && myOffer.length > 0) {
                    myOfferArray = [...myOffer]
                    myOfferArray.push(...response?.data?.data);
                } else {
                    myOfferArray = []
                    myOfferArray.push(...response?.data?.data);
                };

                const uniqueOffer = Array.from(new Set(myOfferArray));

                dispatch(saveMyOffer(uniqueOffer)); // Assuming `saveMyOffer` is the action to update the offers state

                // Extract categories
                const categories = myOfferArray.map(item => item.category);
                // Ensure categories are unique
                const uniqueCategories = [...new Set(categories)];
                // Remove undefined or null values
                const cleanedCategories = await uniqueCategories.filter(category => category !== undefined && category !== null);
                // Add "all" at the start of the array
                cleanedCategories.unshift(LocalizedStrings["All"]);

                setCategoryFilterArray(uniqueOffer);
            }
        };

        const onError = error => {
            str == 'bottom' ? setIsBottomLoading(false) : setIsLoading(false)

            console.log('Error getMyOffers===', error);
        };

        const endPoint = routs.getMyOffers + `user/all?myoffers=yes&limit=10&page=${myOfferPageNo}&language=${appLanguage === 'ar' ? 'arabic' : 'english'}`
        const method = Method.GET;
        const bodyParams = {};

        str == 'bottom' ? setIsBottomLoading(true) : setIsLoading(true)
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    };

    const getForAll = () => {
        const onSuccess = response => {
            console.log('response getForAll===', response?.data);
            setIsLoading(false);

            dispatch(saveForAllOffers(response?.data?.data))
        };

        const onError = error => {
            setIsLoading(false);
            console.log('Error getForAll===', error);
        };

        const endPoint = routs.getMyOffers + `user/all?myoffers=no&language=${appLanguage === 'ar' ? 'arabic' : 'english'}`
        const method = Method.GET;
        const bodyParams = {};

        // setIsLoading(true);
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
            console.log('Error favourite===', error);

            showMessage({ message: response?.message, type: 'danger' })
        };

        const endPoint = routs.favourite + `/${id}`;
        const method = Method.POST;
        const bodyParams = {};

        setIsLoading(true);
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    };

    const My_Offer = () => {
        return (
            <FlatList
                data={myOffer}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                onEndReached={() => getMoreOffer()}
                ListEmptyComponent={
                    <Text style={styles.emptytext}>{LocalizedStrings['No Offers yet!']}</Text>
                }
                ListFooterComponent={
                    isBottomLoading && (
                        <ActivityIndicator size={'small'} color={colors.primaryColor} />
                    )
                }
                renderItem={({ item, index }) => {
                    return (
                        <ListItem key={index} buttonEnable item={item} IsFavourites={(fav) => IsFavourites(fav?._id)} />
                    )
                }}
            />
        );
    };

    const For_All = () => {
        return (
            <FlatList
                data={forAllOffers}
                showsVerticalScrollIndicator={false}
                keyExtractor={(i) => i._id}
                ListEmptyComponent={
                    <Text style={styles.emptytext}>{LocalizedStrings['No Offers yet!']}</Text>
                }
                renderItem={({ item, index }) => {
                    return (
                        <ListItem buttonEnable item={item} IsFavourites={(fav) => IsFavourites(fav?._id)} />
                    )
                }}
            />
        );
    };

    const handleListCategory = async (item) => {
        setCategoryFilter(item)

        const cleanedCategories = await myOffer.filter(i => i?.category === item);

        if (item == LocalizedStrings['All']) {
            setMyOfferFilterArray([])
        } else {
            setMyOfferFilterArray(cleanedCategories)
        }
    }

    const getCheckedLocalizedStrings = async () => {
        // Filter out checked items
        const checkedItems = await checkboxes.filter(item => item.checked);

        // Map to LocalizedStrings format and join with commas
        const localizedCheckedItems = await checkedItems.map(item => LocalizedStrings[item.title]).join(',');

        return localizedCheckedItems;
    }

    const getMyOffersMore = async () => {
        const formattedCheckedStrings = await (checkboxes.filter(item => item.checked))[0]?.title;

        const onSuccess = async (response) => {
            console.log('response getMyOffers Home===', response?.data);
            setIsLoading(false);
            dispatch(saveCategoryOffers(response?.data?.data))

            if (response?.data?.data.length > 0) {
                dispatch(saveTotalCategoryMyOfferPagesCount(response?.data?.totalPages))
                dispatch(saveCategoryMyOfferPageNo(categoryMyOfferPageNo + 1));

                setMyOfferFilterArray(response?.data?.data)
            } else {
                showMessage({ message: 'No Offers Found!', type: 'danger' })
            }
        };

        const onError = error => {
            console.log('Error getMyOffers Home===', error);
            setIsLoading(false);
        };

        let endPoint = routs.getMyOffers + `user/all?myoffers=yes&limit=10&page=1&language=${appLanguage === 'ar' ? 'arabic' : 'english'}`

        if (formattedCheckedStrings != '') {
            endPoint += `&category=${formattedCheckedStrings}`;
        }

        const method = Method.GET;
        const bodyParams = {};

        console.log('end Point: ', endPoint)

        setIsLoading(true);
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    };

    useEffect(() => {
        const updatedCheckboxes = checkboxes.filter((checkbox) => checkbox.checked && checkbox.title != LocalizedStrings.All);
        if (updatedCheckboxes.length > 0) {
            getMyOffersMore()
        } else {
            setMyOfferFilterArray('')
        }
    }, [checkboxes]);

    const handleCheckboxChange = (checkboxId) => {
        // ******************* Multiple Selection Code *******************
        // const updatedCheckboxes = checkboxes.map((checkbox) =>
        //     checkbox.id === checkboxId ? { ...checkbox, checked: !checkbox.checked } : checkbox
        // );

        // ******************* Single Selection Code *******************
        const updatedCheckboxes = checkboxes.map((checkbox) =>
            checkbox.id === checkboxId
                ? { ...checkbox, checked: true }
                : { ...checkbox, checked: false }
        );

        setCheckboxes(updatedCheckboxes);
    };

    return (
        <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
            <Loader loading={isLoading} />
            {/* <LogoHeader /> */}

            <View style={styles.tabTopView}>
                {/* <Tab.Navigator
                    sceneContainerStyle={{ backgroundColor: colors.fullWhite }}
                    initialRouteName={LocalizedStrings.my_offers}
                    initialLayout={LocalizedStrings.my_offers}
                    screenOptions={{
                        tabBarPressColor: 'transparent',
                        tabBarScrollEnabled: true,
                        tabBarItemStyle: styles.tabBarItemHeight,
                        tabBarActiveTintColor: colors.primaryColor,
                        tabBarInactiveTintColor: '#9E9E9E',
                        tabBarIndicatorStyle: styles.indicatorStyle,
                        tabBarLabelStyle: styles.tabBarTextStyle,
                    }}>
                    <Tab.Screen name={LocalizedStrings.my_offers} component={My_Offer} />
                    <Tab.Screen name={LocalizedStrings.for_all} component={For_All} />
                </Tab.Navigator> */}

                {/* {
                    myOffer?.length > 0 && (
                        <TouchableOpacity activeOpacity={0.9} onPress={() => refFilterCategorySheet.current.show()} style={[styles.filterView, { width: appLanguage == 'en' ? wp(40) : wp(30), }]}>
                            <Text style={styles.filterText}>{LocalizedStrings['Select Category']}</Text>
                            <Image source={appIcons.arrowDownFilter} style={styles.arrowDown} />
                        </TouchableOpacity>
                    )
                } */}

                <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: "space-between" }}>
                    <TouchableOpacity activeOpacity={1} onPress={() => props.navigation.navigate(routes.search, { discount: '', location: '', category: getCheckedLocalizedStrings() })}>
                        <Input
                            editable={false}
                            placeholder={LocalizedStrings.search}
                            value={""}
                            leftIcon={appIcons.search}
                            // rightIcon
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
                                width: wp(78)
                            }}
                            touchable
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => props.navigation.navigate(routes.notification)}>
                        <Image source={appIcons.notification} style={styles.rightIcon} />
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
                    ref={flatListRef}
                    data={myOfferFilterArray?.length > 0 ? myOfferFilterArray : myOffer}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{
                        paddingBottom: wp(5)
                    }}
                    onEndReached={() => getMoreOffer()}
                    ListEmptyComponent={
                        <Text style={styles.emptytext}>{LocalizedStrings['No Offers yet!']}</Text>
                    }
                    ListFooterComponent={
                        isBottomLoading && (
                            <ActivityIndicator size={'small'} color={colors.primaryColor} />
                        )
                    }
                    renderItem={({ item, index }) => {
                        return (
                            <ListItem key={index} buttonEnable item={item} IsFavourites={(fav) => IsFavourites(fav?._id)} />
                        )
                    }}
                />
            </View>

            {/* <ActionSheet ref={refFilterCategorySheet} headerAlwaysVisible={true}>
                <FlatList
                    data={categoryFilterArray?.length > 0 ? categoryFilterArray : []}
                    keyExtractor={(item, index) => index.toString()}
                    ListHeaderComponent={
                        <Text style={[styles.headerText, { marginBottom: wp(5) }]}>{LocalizedStrings['Select Category']}</Text>
                    }
                    renderItem={({ item, index }) => {
                        return (
                            <Pressable key={index} onPress={() => handleListCategory(item)} style={{ flexDirection: "row", alignItems: "center", borderTopColor: colors.borderColor, borderTopWidth: 1, marginHorizontal: wp(3), paddingVertical: wp(3) }}>
                                <View style={[styles.dotComponentActiveStyle, { borderWidth: 1.5, marginRight: wp(3) }]}>
                                    <View style={[styles.dotComponentStyle, { backgroundColor: categoryFilter == item ? colors.primaryColor : 'transparent' }]} />
                                </View>
                                <Text style={styles.mainDes}>{item}</Text>
                            </Pressable>
                        )
                    }}
                />
            </ActionSheet> */}
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    tabTopView: {
        flex: 1,
    },
    tabBarItemHeight: {
        //  width: wp(45),
        width: wp(92),
    },
    tabBarTextStyle: {
        fontFamily: fontFamily.UrbanistSemiBold,
        fontSize: hp(1.6),
        textTransform: "none"
    },
    indicatorStyle: {
        borderWidth: 1,
        backgroundColor: colors.primaryColor,
        borderColor: colors.primaryColor
    },
    emptytext: {
        fontSize: hp(1.6),
        lineHeight: 24,
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        marginVertical: wp(10),
        textAlign: "center"
    },
    arrowDown: {
        width: wp(5),
        height: wp(5),
        resizeMode: 'contain'
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
    dotComponentActiveStyle: {
        width: wp(5),
        height: wp(5),
        borderRadius: 10,
        backgroundColor: colors.fullWhite,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: colors.primaryColor,
    },
    dotComponentStyle: {
        width: wp(3),
        height: wp(3),
        borderRadius: 50,
    },
    mainDes: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        textAlign: "center",
        lineHeight: 24,
    },
    headerText: {
        fontSize: hp(1.8),
        fontFamily: fontFamily.UrbanistBold,
        color: colors.BlackSecondary,
        textAlign: "center",
        lineHeight: 24,
    },
    rightIcon: {
        width: wp(8),
        height: wp(8),
        // alignSelf: "flex-end"
    },
})