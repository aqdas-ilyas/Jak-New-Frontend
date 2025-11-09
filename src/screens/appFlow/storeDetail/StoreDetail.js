import React, { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, StyleSheet, Platform, SafeAreaView, Image, ImageBackground, Text, FlatList, ScrollView, TouchableOpacity, Linking } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps'
import { heightPixel, hp, routes, wp } from "../../../services/constants";
import Geolocation from '@react-native-community/geolocation';
import { getLocationPermission } from "../../../common/HelpingFunc";
import { appIcons, appImages } from "../../../services/utilities/assets";
import { Input } from '../../../components/input'
import Header from "../../../components/header";
import { colors, fontFamily } from "../../../services";
import ListItem from "../../../components/ListItem";
import appStyles from "../../../services/utilities/appStyles";
import Button from "../../../components/button";
import { LocalizationContext } from "../../../language/LocalizationContext";
import moment from "moment";
import { showMessage } from "react-native-flash-message";
import { saveFavourite } from "../../../store/reducers/FavoruiteOffersSlice";
import { useDispatch, useSelector } from "react-redux";
import routs from "../../../api/routs";
import { callApi, Method } from "../../../api/apiCaller";
import { Loader } from "../../../components/loader/Loader";
import { saveCategoryOffers, saveForAllOffers, saveMyOffer, saveSearchOfferArray } from "../../../store/reducers/OfferSlice";
import { resolveMessage } from "../../../language/helpers";

// const GEOCODING_API_KEY = 'AIzaSyCv3ww-4pSHJ0K9JXyQ6G64cf0uKfERgD8';
// const GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

// const getCoordinates = async (address) => {
//     try {
//         const addressValid = address.replace(/\s+/g, '');
//         // const response = await fetch(`${GEOCODING_API_URL}?address=${addressValid}&key=${GEOCODING_API_KEY}`);
//         const response = await fetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(addressValid)}&inputtype=textquery&fields=geometry&locationbias=country:SA&&key=${GEOCODING_API_KEY}`)
//         const data = await response.json();
//         if (data.status === 'OK') {
//             const location = data.candidates[0].geometry.location;
//             return location; // { lat: ..., lng: ... }
//         } else {
//             console.log('Geocoding API error: ' + data.status);
//         }
//     } catch (error) {
//         console.error(error);
//         throw error;
//     }
// };

export default StoreDetailList = (props) => {
    const { item } = props?.route?.params
    const mapRef = useRef();
    const dispatch = useDispatch()
    const favorite = useSelector(state => state.favorite.favorite)
    const myOffer = useSelector(state => state.offer.myOffer)
    const CategoriesOffers = useSelector(state => state.offer.CategoriesOffers)
    const searchOfferArray = useSelector(state => state.offer.searchOfferArray)
    const { LocalizedStrings, appLanguage } = React.useContext(LocalizationContext);
    const isRTL = appLanguage === 'ar';
    const [isLoading, setIsLoading] = useState(false)
    const [isLiked, setIsLiked] = useState(item?.isLiked)
    const [coordinates, setCoordinates] = useState(null);
    const [distance, setDistance] = useState(null);
    const [region, setRegion] = useState({
        latitude: 25.1523005,
        longitude: 55.2343772,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
    })

    // const openWhatsAppChat = (whatsApp) => {
    //     // Construct the deep link to open WhatsApp with the phone number
    //     const url = `whatsapp://send?phone=${whatsApp}`;

    //     // Check if the WhatsApp app is installed and open the chat
    //     Linking.canOpenURL(url).then(supported => {
    //         if (supported) {
    //             return Linking.openURL(url);
    //         } else {
    //             console.log("WhatsApp is not installed on this device.");
    //         }
    //     }).catch(error => {
    //         console.error("An error occurred while opening WhatsApp:", error);
    //     });
    // };

    // const OpenMap = () => {
    //     const scheme = Platform.select({ ios: 'maps://0,0?q=', android: 'geo:0,0?q=' });
    //     const latLng = `${coordinates.lat},${coordinates.lng}`;
    //     const label = item?.['store name'];
    //     const url = Platform.select({
    //         ios: `${scheme}${label}@${latLng}`,
    //         android: `${scheme}${latLng}(${label})`,
    //     });

    //     Linking.canOpenURL(url).then(supported => {
    //         if (supported) {
    //             return Linking.openURL(url);
    //         } else {
    //             return Linking.openURL(url);
    //         }
    //     });
    // };

    const IsFavourites = (id) => {
        const onSuccess = async (response) => {
            setIsLoading(false);
            console.log('response favourite===', response);
            showMessage({ message: resolveMessage(LocalizedStrings, response?.message), type: 'success' })

            setIsLiked(!isLiked)

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

            if (searchOfferArray && searchOfferArray.length > 0) {
                const newCustomeSearchArray = await searchOfferArray.map((item) => {
                    if (item._id === id) {
                        return {
                            ...item,
                            isLiked: !item?.isLiked
                        };
                    }
                    return item;
                });
                dispatch(saveSearchOfferArray(newCustomeSearchArray));
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

    useEffect(() => {
        // getMyLocation()
    }, [])

    // Function to calculate distance between two coordinates
    // const calculateDistance = (coord1, coord2) => {
    //     const toRadians = (degrees) => degrees * (Math.PI / 180);
    //     const R = 6371; // Radius of the Earth in KM

    //     const dLat = toRadians(coord2.lat - coord1.lat);
    //     const dLng = toRadians(coord2.lng - coord1.lng);

    //     const a =
    //         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    //         Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) *
    //         Math.sin(dLng / 2) * Math.sin(dLng / 2);

    //     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    //     const distance = R * c; // Distance in KM
    //     return distance;
    // };

    // const getMyLocation = async () => {
    //     let permission = await getLocationPermission();
    //     if (permission) {
    //         Geolocation.getCurrentPosition(
    //             async (position) => {
    //                 var coords = position?.coords;
    //                 if (coords.latitude != undefined || coords != '') {
    //                     var userLocation = {
    //                         lat: coords.latitude,
    //                         lng: coords.longitude,
    //                     };
    //                 }

    //                 const endCoordinates = await getCoordinates(item?.['store name']);
    //                 setCoordinates(endCoordinates);
    //                 setRegion({
    //                     latitude: endCoordinates?.lat,
    //                     longitude: endCoordinates?.lng,
    //                     latitudeDelta: 0.02,
    //                     longitudeDelta: 0.02,
    //                 })

    //                 if (userLocation && endCoordinates) {
    //                     const distance = calculateDistance(userLocation, endCoordinates);
    //                     console.log(`Distance: ${distance.toFixed(2)} KM`);

    //                     setDistance(distance.toFixed(2))
    //                 } else {
    //                     console.log('Could not retrieve coordinates for one or both addresses.');
    //                 }
    //             },
    //             error => {
    //                 console.log(error)
    //             },
    //             { enableHighAccuracy: false, timeout: 20000, maximumAge: 3600000 },
    //         );
    //     }
    // }

    return (
        <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
            <Loader loading={isLoading} />
            <Header leftIcon onleftIconPress={() => props.navigation.goBack()} title={LocalizedStrings.store_detail} rightIcon={isLiked ? appIcons.heartFill : appIcons.heartUnfill} onrightIconPress={() => IsFavourites(item?._id)} />

            <ScrollView showsVerticalScrollIndicator={false} style={appStyles.mt30}>
                <Image source={{ uri: item.logo }} style={styles.imageStyle} />

                <View style={{ marginVertical: wp(5), flexDirection: isRTL ? "row-reverse" : "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={[styles.mainTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                        {/* {LocalizedStrings["The Emporium Mall"]} */}
                        {item?.['store name']}
                    </Text>
                    {/* {
                        distance && (
                            <Text style={styles.mainDes}>{distance} {LocalizedStrings["km away"]}</Text>
                        )
                    } */}
                    <Image source={{ uri: item?.employer?.image }} style={{ width: wp(7), height: wp(7), borderRadius: wp(6) }} />
                </View>
                <Text style={[styles.shortDes, { textAlign: isRTL ? 'right' : 'left' }]}>{item?.['offer text']}</Text>
                <View style={styles.line} />

                <View style={{ flexDirection: isRTL ? "row-reverse" : "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ width: wp(35), alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                        <Text style={[styles.mainTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{LocalizedStrings.Discount}</Text>
                        <Text onPress={() => Linking.openURL(item?.['offer link'])} style={[styles.shortDes, { textDecorationLine: 'underline', color: '#2036F8', textAlign: isRTL ? 'right' : 'left' }]}>{item?.['discount %'] ? item?.['discount %'] : 0}%</Text>
                    </View>

                    <View style={{ width: wp(35), alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                        <Text style={[styles.mainTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{LocalizedStrings["Expiry Date"]}</Text>
                        <Text style={[styles.shortDes, { textAlign: isRTL ? 'right' : 'left' }]}>{item?.["expiry date"]}</Text>
                        {/* <Text style={styles.shortDes}>{moment(item?.["expiry date"]).format('DD/MM/YYYY')}</Text> */}
                    </View>

                    <View style={{ width: wp(50), alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                        <Text style={[styles.mainTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{LocalizedStrings.category}</Text>
                        <Text style={[styles.shortDes, { textAlign: isRTL ? 'right' : 'left' }]}>{item?.category}</Text>
                    </View>
                </View>

                <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: 'center', marginVertical: wp(4) }}>
                    {/* <Image source={appIcons.location} style={styles.IconStyle} /> */}
                    <Text style={[styles.locationText, { textAlign: isRTL ? 'right' : 'left' }]}>
                        {item?.['terms and conditions']}
                    </Text>
                </View>

                {/* {
                    coordinates && (
                        <View style={styles.container}>
                            <View style={styles.mapContainer}>
                                <MapView
                                    ref={mapRef}
                                    zoomEnabled={true}
                                    zoomTapEnabled={true}
                                    style={styles.map}
                                    provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                                    region={region}>
                                    <Marker coordinate={region}>
                                        <ImageBackground source={appIcons.otherMarker} style={styles.markerImageEvenBackground}>
                                            <Image source={{ uri: item.logo }} style={styles.markerEvenImage} />
                                        </ImageBackground>
                                    </Marker>
                                </MapView>
                            </View>
                        </View>
                    )
                } */}

                {/* <TouchableOpacity activeOpacity={0.8} onPress={() => openWhatsAppChat(item?.whatsApp)}>
                    <Image source={appIcons.whatsapp} style={styles.whatsappIcon} />
                </TouchableOpacity> */}
            </ScrollView>

            {/* {
                coordinates ? (
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: wp(5) }}>
                        <Button
                            onPress={() => Linking.openURL(item?.['offer link'])}
                            skip
                            containerStyle={{
                                width: wp(44),
                            }}>
                            {LocalizedStrings["Go to Website"]}
                        </Button>
                        <Button
                            onPress={() => OpenMap()}
                            containerStyle={{
                                width: wp(44),
                            }}>
                            {LocalizedStrings["Start Navigate"]}
                        </Button>
                    </View>
                ) : (
                    <Button
                        onPress={() => Linking.openURL(item?.['offer link'])}
                        skip
                    >
                        {LocalizedStrings["Go to Website"]}
                    </Button>
                )
            } */}
            <Button
                onPress={() => Linking.openURL(item?.['offer link'])}
                skip
            >
                {LocalizedStrings["Go to Website"]}
            </Button>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    container: {
        height: hp(22),
        width: wp(92),
        overflow: 'hidden',
        marginTop: wp(5)
    },
    mapContainer: {
        flex: 1,
        borderRadius: 10,
        overflow: 'hidden',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    imageStyle: {
        width: wp(92),
        height: wp(55),
        borderRadius: 15,
    },
    IconStyle: {
        width: wp(5),
        height: wp(5)
    },
    mainTitle: {
        fontSize: hp(1.8),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        textAlign: 'left'
    },
    mainDes: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.primaryColor,
        textAlign: 'left'
    },
    shortDes: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.descriptionColor,
        lineHeight: 24,
        letterSpacing: 0.1,
        textAlign: 'left'
    },
    line: {
        borderColor: colors.borderColor,
        borderWidth: 0.5,
        width: wp(90),
        marginVertical: wp(4)
    },
    locationText: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.descriptionColor,
        lineHeight: 24,
        letterSpacing: 0.1,
        marginLeft: wp(2),
        textAlign: 'left'
    },
    markerEvenImage: {
        width: heightPixel(34),
        height: heightPixel(34),
        resizeMode: 'cover',
        alignSelf: "center",
        borderRadius: 50,
        marginTop: wp(0.5)
    },
    markerImageEvenBackground: {
        width: heightPixel(40),
        height: heightPixel(50),
        resizeMode: 'contain',
    },
    whatsappIcon: {
        width: heightPixel(50),
        height: heightPixel(50),
        resizeMode: 'contain',
        alignSelf: "flex-end",
        marginTop: -wp(7)
    },
});