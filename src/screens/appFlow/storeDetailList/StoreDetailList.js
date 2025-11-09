import React, { useEffect, useRef, useState } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { View, StyleSheet, Platform, SafeAreaView, Image, ImageBackground, Text, FlatList, TouchableOpacity, Dimensions, Animated, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps'
import { heightPixel, hp, routes, wp } from "../../../services/constants";
import { appIcons, appImages } from "../../../services/utilities/assets";
import { Input } from '../../../components/input'
import Header from "../../../components/header";
import { colors } from "../../../services";
import ListItem from "../../../components/ListItem";
import { LocalizationContext } from "../../../language/LocalizationContext";
import { useRTL } from "../../../language/useRTL";
import { useDispatch, useSelector } from "react-redux";
import { showMessage } from "react-native-flash-message";
import routs from "../../../api/routs";
import { callApi, Method } from "../../../api/apiCaller";
import { Loader } from "../../../components/loader/Loader";
import { saveCategoryMyOfferPageNo, saveCategoryOffers, saveMyOffer, saveTotalCategoryMyOfferPagesCount } from "../../../store/reducers/OfferSlice";
import { saveFavourite } from "../../../store/reducers/FavoruiteOffersSlice";
import { resolveMessage } from "../../../language/helpers";

export default StoreDetailList = (props) => {
    const { item, category } = props?.route?.params
    const { appLanguage, LocalizedStrings } = React.useContext(LocalizationContext);
    const { rtlStyles } = useRTL();

    const mapRef = useRef();
    const navigation = useNavigation()
    const dispatch = useDispatch()
    const IsFocused = useIsFocused()
    const favorite = useSelector(state => state.favorite.favorite)
    const myOffer = useSelector(state => state.offer.myOffer)
    const CategoriesOffers = useSelector(state => state.offer.CategoriesOffers)
    const categoryMyOfferPageNo = useSelector(state => state.offer.categoryMyOfferPageNo)
    const totalCategoryMyOfferPagesCount = useSelector(state => state.offer.totalCategoryMyOfferPagesCount)
    const user = useSelector(state => state?.user?.user?.user)
    const [userLocation, setUserLocation] = useState({ latitude: 0, longitude: 0 })
    const [isLoading, setIsLoading] = useState(false)
    const [isBottomLoading, setIsBottomLoading] = useState(false)

    const [region, setRegion] = useState({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    })

    const getMoreOffers = async (str) => {
        const onSuccess = async (response) => {
            console.log('response getMyOffers===', response?.data);
            setIsBottomLoading(false)

            if (response?.data?.data.length > 0 && response?.data?.totalPages >= categoryMyOfferPageNo) {
                dispatch(saveCategoryMyOfferPageNo(categoryMyOfferPageNo + 1));

                let myOfferArray
                if (CategoriesOffers && CategoriesOffers.length > 0) {
                    myOfferArray = [...CategoriesOffers]
                    myOfferArray.push(...response?.data?.data);
                } else {
                    myOfferArray = []
                    myOfferArray.push(...response?.data?.data);
                };

                dispatch(saveCategoryOffers(myOfferArray))
            }
        };

        const onError = error => {
            setIsBottomLoading(false)
            console.log('Error getMyOffers===', error);
        };

        let endPoint = routs.getMyOffers + `user/all?myoffers=yes&limit=10&page=1&category=${category}&language=${appLanguage === 'ar' ? 'arabic' : 'english'}`
        const method = Method.GET;
        const bodyParams = {};

        console.log(endPoint)

        setIsBottomLoading(true)
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    };

    // useEffect(() => {
    //     getMyOffers()
    // }, []);

    // const getMyOffers = () => {
    //     const onSuccess = async (response) => {
    //         console.log('response getMyOffers Home===', response?.data);
    //         setIsLoading(false);
    //         dispatch(saveMyOffer(response?.data?.data))

    //         const dataArray = await response?.data?.data.length > 0 && response?.data?.data.filter(i => i._id == item?._id)
    //         setData(dataArray[0])
    //     };

    //     const onError = error => {
    //         console.log('Error getMyOffers Home===', error);
    //         setIsLoading(false);
    //     };

    //     let endPoint = routs.getMyOffers + `user/all?myoffers=yes`

    //     const method = Method.GET;
    //     const bodyParams = {};

    //     setIsLoading(true);
    //     callApi(method, endPoint, bodyParams, onSuccess, onError);
    // };

    // const Markers = React.memo(({ markers }) => {
    //     return markers.map((i, index) => {
    //         return (
    //             <Marker
    //                 key={index}
    //                 title={i?.name}
    //                 // description={i?.description}
    //                 coordinate={{
    //                     latitude: i?.location?.coordinates[1],
    //                     longitude: i?.location?.coordinates[0],
    //                 }}>
    //                 <ImageBackground tintColor={i?._id == item?._id ? 'red' : colors.primaryColor} source={appIcons.otherMarker} style={index % 2 === 0 ? styles.markerImageEvenBackground : styles.markerImageBackground}>
    //                     <Image source={{ uri: i.image }} style={index % 2 === 0 ? [styles.markerEvenImage, { margin: wp(0.7), borderRadius: 50 }] : [styles.markerImage, { margin: wp(1), borderRadius: 50, resizeMode: 'cover' }]} />
    //                 </ImageBackground>
    //             </Marker>
    //         );
    //     });
    // });

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
                    newCustomeFavoriteID = [...favorite, toggledItem]
                } else {
                    // Remove from favorites if isLiked is false
                    newCustomeFavoriteID = favorite.filter((item) => item._id !== id)
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

            showMessage({ message: resolveMessage(LocalizedStrings, error?.message), type: 'danger' })
        };

        const endPoint = routs.favourite + `/${id}`;
        const method = Method.POST;
        const bodyParams = {};

        setIsLoading(true);
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    };

    return (
        <View style={styles.container}>
            <Loader loading={isLoading} />

            <MapView
                ref={mapRef}
                // showsUserLocation={true}
                // showsMyLocationButton={true}
                showsCompass={false}
                showsIndoors={false}
                zoomEnabled={true}
                zoomTapEnabled={true}
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                region={region}>
                {/* {
                    offers.length > 0 && (
                        <Markers markers={offers} />
                    )
                } */}

                {userLocation?.latitude !== 0 &&
                    <Marker
                        coordinate={{
                            latitude: userLocation?.latitude,
                            longitude: userLocation?.longitude,
                        }}
                        title={user?.name}
                    >
                        <ImageBackground source={appIcons.currentMarker} style={styles.currentMarkerImageBackground}>
                            <Image source={{ uri: user?.image }} style={[styles.markerImage, { resizeMode: 'cover', borderRadius: 50 }]} />
                        </ImageBackground>
                        <Image source={appIcons.line} style={styles.markerImage} />
                    </Marker>
                }
            </MapView>

            <SafeAreaView style={{ margin: wp(4) }}>
                {/* <Header leftIcon onleftIconPress={() => props.navigation.goBack()} title={LocalizedStrings.store_detail} /> */}

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS == 'android' ? wp(6) : 0, }}>
                    <TouchableOpacity onPress={() => props.navigation.goBack()}>
                        <Image source={appIcons.back} style={[styles.back, rtlStyles.iconRotation]} />
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={1} onPress={() => props.navigation.navigate(routes.search)}>
                        <Input
                            editable={false}
                            placeholder={LocalizedStrings.search}
                            value={""}
                            leftIcon={appIcons.search}
                            // rightIcon
                            // onPressIcon={() => setModalShow(!modalShow)}
                            eyeValue={appIcons.filter}
                            shadow
                            rightIconColor={colors.primaryColor}
                            containerStyle={{
                                borderRadius: 15,
                                marginTop: -hp(5),
                            }}
                            WholeContainer={{
                                width: wp(82),
                                borderRadius: 5
                            }}
                        />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <View style={{ position: "absolute", bottom: Platform.OS == 'android' ? wp(25) : wp(20) }}>
                <FlatList
                    data={item.length > 0 ? CategoriesOffers : []}
                    horizontal
                    keyExtractor={(item, index) => index.toString()}
                    onEndReached={() => totalCategoryMyOfferPagesCount > categoryMyOfferPageNo ? getMoreOffers() : console.log('No Data!')}
                    ListFooterComponent={
                        isBottomLoading && (
                            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                                <ActivityIndicator size={'small'} color={colors.primaryColor} style={{ alignSelf: 'center' }} />
                            </View>
                        )
                    }
                    contentContainerStyle={{
                        paddingVertical: wp(2)
                    }}
                    renderItem={({ item, index }) => {
                        return (
                            <ListItem item={item} IsFavourites={(fav) => IsFavourites(fav?._id)} />
                        )
                    }}
                />
            </View>
        </View>
    )
};

const styles = StyleSheet.create({
    back: {
        width: wp(5),
        height: wp(5),
        tintColor: colors.BlackSecondary
    },
    container: {
        ...StyleSheet.absoluteFillObject,
        height: Dimensions.get('screen').height / 1.01,
        width: wp(100),
        zIndex: 100,
        position: 'absolute',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    pinIcon: {
        width: hp(10),
        height: hp(10),
        resizeMode: 'contain'
    },
    currentMarkerImageBackground: {
        width: wp(15),
        height: wp(15),
        resizeMode: 'contain',
        alignItems: "center",
        justifyContent: "center"
    },
    markerImage: {
        width: wp(12.5),
        height: wp(12.6),
        resizeMode: 'contain',
        alignSelf: "center"
    },
    markerImageEvenBackground: {
        width: wp(10),
        height: wp(12.5),
        resizeMode: 'contain',
    },
    markerEvenImage: {
        width: wp(8),
        height: wp(8),
        resizeMode: 'contain',
        alignSelf: "center"
    },
    markerImageBackground: {
        width: wp(15),
        height: wp(18.8),
        resizeMode: 'contain',
    },
});