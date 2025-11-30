import { Image, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { appIcons, appImages, colors, fontFamily, hp, routes, wp } from '../../services'
import { useNavigation } from '@react-navigation/native'
import Button from '../button'
import { LocalizationContext } from '../../language/LocalizationContext'
import { useRTL } from '../../language/useRTL';
import appStyles from '../../services/utilities/appStyles'

// const GEOCODING_API_KEY = 'AIzaSyCv3ww-4pSHJ0K9JXyQ6G64cf0uKfERgD8';

// const getCoordinates = async (address) => {
//     try {
//         const addressValid = address.replace(/\s+/g, '');
//         const response = await fetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(addressValid)}&inputtype=textquery&fields=geometry&locationbias=country:KSA&&key=${GEOCODING_API_KEY}`)
//         const data = await response.json();
//         if (data.status === 'OK') {
//             const location = data.candidates[0].geometry.location;
//             return location; // { lat: ..., lng: ... }
//         } else {
//             console.log('Geocoding API error: ' + JSON.stringify(data));
//             return false;
//         }
//     } catch (error) {
//         console.error(error);
//         return false;
//     }
// };

export default function ListItem({ buttonEnable, search, item, isLiked, IsFavourites }) {
    const { LocalizedStrings } = React.useContext(LocalizationContext);
    const { isRTL } = useRTL();
    const navigation = useNavigation()
    // const [hasCoordinates, setHasCoordinates] = useState(false);
    // const [coordinates, setCoordinates] = useState(null);
    // const [region, setRegion] = useState({
    //     latitude: 25.1523005,
    //     longitude: 55.2343772,
    //     latitudeDelta: 0.02,
    //     longitudeDelta: 0.02,
    // })

    // useEffect(() => {
    //     const fetchCoordinates = async () => {
    //         const result = await getCoordinates(item?.['store name']);
    //         if (result) {
    //             setHasCoordinates(true);
    //             setCoordinates(result)
    //             setRegion({
    //                 latitude: result?.lat,
    //                 longitude: result?.lng,
    //                 latitudeDelta: 0.02,
    //                 longitudeDelta: 0.02,
    //             })
    //         }
    //     };

    //     fetchCoordinates();
    // }, [item?.['store name']]);

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

    return (
        <View key={item?._id}>
            <TouchableOpacity activeOpacity={1} style={styles.itemContainer} onPress={() => navigation.navigate(routes.storeDetail, { item })}>
                <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: 'center' }}>
                    <Image
                        // source={appImages.itemCon}
                        resizeMode='contain'
                        source={{ uri: item?.logo }}
                        style={[styles.imageStyle, isRTL ? { marginLeft: wp(3) } : { marginRight: wp(3) }]}
                    />
                    <View style={{
                        width: buttonEnable ? wp(65) : search ? wp(65) : wp(62),
                        marginLeft: isRTL ? 0 : wp(3),
                        marginRight: isRTL ? wp(3) : 0,
                        justifyContent: "space-evenly"
                    }}>
                        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", justifyContent: "space-between", alignItems: "center" }}>
                            <Text style={[styles.mainTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                                {item?.['store name'].length > 20 ? item?.['store name'].slice(0, 12) + '...' : item?.['store name']}
                            </Text>

                            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: 'center' }}>
                                <TouchableOpacity 
                                    style={{ 
                                        padding: wp(2),
                                        marginTop: -hp(0.5),
                                        marginRight: isRTL ? 0 : wp(1.5),
                                        marginLeft: isRTL ? wp(1.5) : 0
                                    }} 
                                    activeOpacity={0.8} 
                                    onPress={() => IsFavourites(item)}
                                >
                                    <Image source={item?.isLiked ? appIcons.heartFill : appIcons.heartUnfill} style={[styles.IconStyle]} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        {/* <View style={{ flexDirection: "row", alignItems: 'center', marginVertical: wp(1) }}>
                            <Image source={appIcons.location} style={styles.IconStyle} />
                            <Text style={[styles.mainDes, { width: buttonEnable ? wp(62) : wp(55), fontSize: buttonEnable ? hp(1.4) : hp(1.6), marginLeft: wp(1), marginTop: buttonEnable ? 0 : wp(2) }]}>
                                {item?.location?.address}
                            </Text>
                        </View> */}

                        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: 'center' }}>
                                {/* <Text style={[styles.mainDes, { fontSize: buttonEnable ? hp(1.2) : hp(1.6) }]}>
                                    {LocalizedStrings.category}:
                                </Text> */}

                                <Text style={[styles.mainDes, {
                                    fontFamily: fontFamily.UrbanistMedium,
                                    color: colors.primaryColor,
                                    fontSize: hp(1.6),
                                    marginLeft: isRTL ? 0 : wp(1),
                                    marginRight: isRTL ? wp(1) : 0,
                                    textAlign: isRTL ? 'right' : 'left'
                                }]}>
                                    {item?.category}
                                </Text>
                            </View>

                            <View style={{
                                flexDirection: isRTL ? "row-reverse" : "row",
                                alignItems: 'center',
                                marginRight: wp(2)
                            }}>
                                <Text style={[styles.mainDes, {
                                    fontFamily: fontFamily.UrbanistMedium,
                                    color: colors.primaryColor,
                                    fontSize: hp(1.6),
                                    marginRight: isRTL ? 0 : wp(2),
                                    marginLeft: isRTL ? wp(2) : 0,
                                    textAlign: isRTL ? 'left' : 'right'
                                }]}>
                                    {item?.['discount %']} %
                                </Text>

                                <Image source={{ uri: item?.employer?.image }} style={{ width: wp(7), height: wp(6), borderRadius: wp(6) }} />
                            </View>
                        </View>

                        {/* {hasCoordinates && (
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <Text style={[styles.discount]}>{LocalizedStrings['Discount Offer']}: <Text style={{ fontFamily: fontFamily.MontserratSemiBold, color: colors.primaryColor }}>{item?.['discount %'] ? item?.['discount %'] : 0}%</Text></Text>
                                    <TouchableOpacity onPress={() => OpenMap()}>
                                        <Image source={appIcons.navigate} style={styles.mapIcon} />
                                    </TouchableOpacity>
                                </View>
                            )
                        } */}
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    itemContainer: {
        backgroundColor: colors.fullWhite,
        marginTop: wp(3),
        padding: wp(3),
        margin: wp(1),
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    imageStyle: {
        width: wp(16),
        height: wp(16),
        borderRadius: 10
    },
    IconStyle: {
        width: wp(5),
        height: wp(5),
        tintColor: colors.primaryColor
    },
    mapIcon: {
        width: wp(8),
        height: wp(8),
    },
    mainTitle: {
        fontSize: hp(1.8),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        textAlign: "left"
    },
    mainDes: {
        fontFamily: fontFamily.MontserratRegular,
        color: colors.descriptionColor,
        textAlign: "left"
    },
    discount: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.MontserratRegular,
        color: colors.descriptionColor,
        textAlign: "left"
    },
    line: {
        borderColor: colors.borderColor,
        borderWidth: 0.5,
        width: wp(80),
    },
})