import React, { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, StyleSheet, Platform, SafeAreaView, Image, ImageBackground, Text, FlatList, ScrollView, TouchableOpacity, Linking } from "react-native";
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps'
import { heightPixel, hp, routes, wp, APP_STORE_LINK, PLAY_STORE_LINK } from "../../../services/constants";
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

    const openGoogleMaps = () => {
        const storeName = item?.['store name'] || '';
        const searchQuery = encodeURIComponent(storeName);

        // Simple Google Maps search URL - ye bas search bar mein text dalega
        // Suggestions list aayegi, but koi auto-select/pin/map move nahi hoga
        // Jaise user manually type karta hai waise hi behavior hoga
        const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;

        // Direct open - Google Maps app ya browser mein khulega
        // Search bar mein store name already likha hoga
        // Sirf suggestions list aayegi, user manually select kar sakta hai
        Linking.openURL(googleMapsSearchUrl).catch(err => {
            console.log('Error opening Google Maps:', err);
            showMessage({
                message: LocalizedStrings["Error opening Google Maps"] || 'Error opening Google Maps',
                type: 'danger',
            });
        });
    };

    const shareOffer = async () => {
        try {
            setIsLoading(true);
            const storeName = item?.['store name'] || '';
            const discount = item?.['discount %'] || 0;
            const offerText = item?.['offer text'] || '';
            const offerLink = item?.['offer link'] || '';
            const expiryDate = item?.['expiry date'] || '';
            const storeLogo = item?.logo || '';

            // Create a formatted message for sharing
            // Format: Offer text -> Expiry Date -> Offer Link -> App Store Link -> Play Store Link
            // Category, Store Name, and Discount are removed as per requirements
            let shareMessage = '';

            if (offerText) {
                shareMessage += `📝 ${offerText}\n\n`;
            }

            if (expiryDate) {
                shareMessage += `📅 ${LocalizedStrings["Expiry Date"] || 'Expiry Date'}: ${expiryDate}\n\n`;
            }

            shareMessage += `🔗 ${offerLink}\n\n`;

            // Add App Store and Play Store links with language-specific text
            if (appLanguage === 'ar') {
                // Arabic format - Apple logo Unicode (U+F8FF)
                const appleLogo = String.fromCharCode(0xF8FF);
                shareMessage += `${appleLogo} تحميل التطبيق لأجهزة الايفون:\n${APP_STORE_LINK}\n\n`;
                shareMessage += `🅶 تحميل التطبيق لأجهزة اندرويد:\n${PLAY_STORE_LINK}`;
            } else {
                // English format - Apple logo Unicode (U+F8FF)
                const appleLogo = String.fromCharCode(0xF8FF);
                shareMessage += `${appleLogo} App Store\n${APP_STORE_LINK}\n\n`;
                shareMessage += `🅶 Play Store\n${PLAY_STORE_LINK}`;
            }

            let imageUrl = null;

            // // Download image if available
            // if (storeLogo) {
            //     try {
            //         const imageExtension = storeLogo.split('.').pop().split('?')[0] || 'jpg';
            //         const imagePath = `${RNFS.CachesDirectoryPath}/store_logo_${Date.now()}.${imageExtension}`;

            //         const downloadResult = await RNFS.downloadFile({
            //             fromUrl: storeLogo,
            //             toFile: imagePath,
            //         }).promise;

            //         if (downloadResult.statusCode === 200) {
            //             // Check if file exists and get the correct path
            //             const fileExists = await RNFS.exists(imagePath);
            //             if (fileExists) {
            //                 // For iOS, use file:// prefix, for Android use the path directly
            //                 imageUrl = Platform.OS === 'ios' ? `file://${imagePath}` : imagePath;
            //             }
            //         }
            //     } catch (imageError) {
            //         console.log('Error downloading image:', imageError);
            //         // Continue without image if download fails
            //     }
            // }

            // Prepare share options
            const shareOptions = {
                title: storeName,
                message: shareMessage,
            };

            // // Add image if available, otherwise add URL
            // if (imageUrl) {
            //     shareOptions.url = imageUrl;
            //     shareOptions.type = 'image/jpeg';
            //     // Include the website link in the message if we're sharing image
            //     shareOptions.message = `${shareMessage}\n\n${offerLink}`;
            // } else {
            //     shareOptions.url = offerLink;
            // }

            setIsLoading(false);

            const result = await Share.open(shareOptions);
            console.log('Share result:', result);

            // // Clean up downloaded image after sharing
            // if (imageUrl) {
            //     try {
            //         const filePath = Platform.OS === 'ios' ? imageUrl.replace('file://', '') : imageUrl;
            //         const fileExists = await RNFS.exists(filePath);
            //         if (fileExists) {
            //             await RNFS.unlink(filePath);
            //         }
            //     } catch (cleanupError) {
            //         console.log('Error cleaning up image:', cleanupError);
            //     }
            // }

            showMessage({
                message: LocalizedStrings["Offer shared successfully"] || 'Offer shared successfully',
                type: 'success',
            });
        } catch (error) {
            setIsLoading(false);
            console.error('Error sharing offer:', error);

            // Don't show error if user dismissed the share sheet
            if (error.message !== 'User did not share' && error.message !== 'User cancelled') {
                showMessage({
                    message: LocalizedStrings["Error sharing offer"] || 'Error sharing offer',
                    type: 'danger',
                });
            }
        }
    };

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

            // showMessage({ message: resolveMessage(LocalizedStrings, error?.message), type: 'danger' })
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
            <View style={[{ paddingTop: Platform.OS == 'android' ? wp(10) : 0 }, { flexDirection: isRTL ? "row-reverse" : "row", justifyContent: "space-between", alignItems: "center", marginBottom: wp(3) }]}>
                <TouchableOpacity onPress={() => props.navigation.goBack()} style={{ paddingVertical: wp(1) }}>
                    <Image
                        source={appIcons.back}
                        style={[styles.headerIcon, { transform: [{ scaleX: isRTL ? -1 : 1 }] }]}
                    />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{LocalizedStrings.store_detail}</Text>
                <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center" }}>
                    <TouchableOpacity onPress={shareOffer} activeOpacity={0.7} style={{ marginRight: isRTL ? 0 : wp(4), marginLeft: isRTL ? wp(4) : 0 }}>
                        <View style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}>
                            <MaterialCommunityIcons
                                name="share-variant"
                                size={wp(5)}
                                color={colors.BlackSecondary}
                            />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => IsFavourites(item?._id)} activeOpacity={0.7}>
                        <Image source={isLiked ? appIcons.heartFill : appIcons.heartUnfill} style={[styles.headerIcon, { tintColor: !isLiked ? colors.BlackSecondary : null }]} />
                    </TouchableOpacity>
                </View>
            </View>

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
                    {
                        item?.['discount %'] > 0 && (
                            <View style={{ width: wp(35), alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                                <Text style={[styles.mainTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{LocalizedStrings.Discount}</Text>
                                <Text onPress={() => Linking.openURL(item?.['offer link'])} style={[styles.shortDes, { textDecorationLine: 'underline', color: '#2036F8', textAlign: isRTL ? 'right' : 'left' }]}>{item?.['discount %'] ? item?.['discount %'] : 0}%</Text>
                            </View>
                        )
                    }

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

            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", justifyContent: "space-between", alignItems: "center", marginTop: wp(5), marginBottom: wp(2) }}>
                <Button
                    onPress={() => Linking.openURL(item?.['offer link'])}
                    skip
                    containerStyle={{
                        width: wp(44),
                    }}>
                    {LocalizedStrings["Offer Details"]}
                </Button>
                <Button
                    onPress={openGoogleMaps}
                    containerStyle={{
                        width: wp(44),
                    }}>
                    <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", justifyContent: "center" }}>
                        <Image source={appIcons.navigate} style={{ width: wp(5), height: wp(5), marginRight: isRTL ? 0 : wp(2), marginLeft: isRTL ? wp(2) : 0 }} />
                        <Text style={{ color: colors.fullWhite, fontFamily: fontFamily.UrbanistSemiBold, fontSize: hp(1.6) }}>
                            {LocalizedStrings["Store Location"]}
                        </Text>
                    </View>
                </Button>
            </View>
            <Text style={[styles.disclaimerText, { textAlign: isRTL ? 'right' : 'left', marginBottom: wp(3) }]}>
                {LocalizedStrings["Map locations may not be accurate; recheck before navigating."]}
            </Text>
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
        height: wp(58),
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
    mapButtonIcon: {
        width: wp(5),
        height: wp(5),
    },
    headerIcon: {
        width: wp(5),
        height: wp(5),
    },
    headerTitle: {
        fontFamily: fontFamily.UrbanistSemiBold,
        fontSize: hp(1.8),
        color: colors.BlackSecondary,
        flex: 1,
        textAlign: 'center',
        marginHorizontal: wp(4)
    },
    disclaimerText: {
        fontSize: hp(1.4),
        fontFamily: fontFamily.UrbanistRegular,
        color: colors.descriptionColor,
        lineHeight: 20,
        marginTop: wp(2),
        paddingHorizontal: wp(2),
    },
});