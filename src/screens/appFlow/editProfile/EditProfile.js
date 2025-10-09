import React, { useRef, useEffect, useState } from 'react'
import { View, StyleSheet, Platform, SafeAreaView, Image, ImageBackground, Text, FlatList, ScrollView, TouchableOpacity, Pressable } from "react-native";
import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel, fontPixel, GOOGLE_API_KEY } from '../../../services'
import { appIcons, appImages } from "../../../services/utilities/assets";
import Header from "../../../components/header";
import appStyles from "../../../services/utilities/appStyles";
import { ImageProfileSelectandUpload } from "../../../common/HelpingFunc";
import CountryInput from "../../../components/countryPicker/CountryPicker";
import { Input } from "../../../components/input";
import Button from "../../../components/button";
import DatePicker from 'react-native-date-picker'
import moment from 'moment';
import { LocalizationContext } from "../../../language/LocalizationContext";
import { useDispatch, useSelector } from "react-redux";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { isPossiblePhoneNumber, parsePhoneNumber } from 'libphonenumber-js'
import { _fetchCountryAbbrevicationCode } from '../../../services/helpingMethods';
import routs from '../../../api/routs';
import { callApi, Method } from '../../../api/apiCaller';
import { setToken, updateUser } from '../../../store/reducers/userDataSlice';
import { getDeviceId } from 'react-native-device-info';
import { Loader } from '../../../components/loader/Loader';
import { showMessage } from 'react-native-flash-message';

export default EditProfile = (props) => {
    const placesAutocompleteRef = useRef(null);
    const dispatch = useDispatch()
    const user = useSelector(state => state.user.user.user)
    const { LocalizedStrings } = React.useContext(LocalizationContext);
    const genderArray = [
        { id: 1, title: LocalizedStrings.Male },
        { id: 2, title: LocalizedStrings.Female },
    ]

    const [name, setName] = useState('')
    const [userEmail, setEmail] = useState('')
    const [image, setImage] = useState({});
    const [imageUploaded, setImageUploaded] = useState(false);
    const [dob, setDOB] = useState('');
    const [gender, setGender] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('');
    const [countryAbbreviationCode, setCountryAbbrivaitionCode] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [country, setCountry] = useState('');
    const [latLng, setLatLng] = useState({});

    const fetchCountryAbbrivaition = async (code) => {
        try {
            const country = await _fetchCountryAbbrevicationCode(code);
            console.log("fetchCountryAbbrivaition: ", country)
            setCountryAbbrivaitionCode(country)
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (countryCode != '') {
            fetchCountryAbbrivaition(countryCode)
        }
    }, [countryCode])

    useEffect(() => {
        if (Object.values(user).length > 0) {
            console.log(JSON.stringify(user))
            if (user) {
                if (user?.isSocial) {
                    const nummber = parsePhoneNumber(user.number);
                    const countryCode = nummber?.countryCallingCode;
                    const nationalNumber = nummber?.nationalNumber;
                    setPhoneNumber(`${nationalNumber}`)
                    setCountryCode(`${countryCode}`)
                    // fetch Country againt CountryCode
                    fetchCountryAbbrivaition(countryCode)
                } else {
                    setEmail(user?.email)
                }

                setName(user?.name)
                setImage({ uri: user?.image })
                setDOB(user?.dob)
                setGender(user?.gender == 'Male' ? 1 : 2)
                setCountry(user?.location?.address)
                setLatLng({
                    latitude: user?.location?.coordinates[0],
                    longitude: user?.location?.coordinates[1]
                })
            }
        }
    }, [])

    // Open gallery
    const openGallary = () => {
        ImageProfileSelectandUpload((data) => {
            console.log(data)
            if (data) {
                setImage(data)
                setImageUploaded(true)
            }
        })
    }

    // handle Google Places
    const handlePlacePress = (data, details) => {
        const latitude = details.geometry?.location?.lat;
        const longitude = details.geometry?.location?.lng;
        setLatLng({ latitude: latitude, longitude: longitude });
        setCountry(details?.address_components[0]?.long_name)
    };

    // BUtton Press to Update profile
    const updateUserProfile = async () => {
        if (user?.isSocial ? isPossiblePhoneNumber(`+${countryCode}` + phoneNumber) : true) {
            if (imageUploaded) {
                await uploadImage()
            } else {
                UpdateProfile(image.uri)
            }
        } else {
            showMessage({ message: "Please add Valid Phone Number", type: "danger" });
        }
    }

    // Send Picture to AWS Server
    const uploadImage = async () => {
        const onSuccess = response => {
            setIsLoading(false);
            console.log('response uploadImage============', response);
            UpdateProfile(response.url)
        };
        const onError = error => {
            setIsLoading(false);
            console.log('Error uploadImage============', error);
            UpdateProfile(error.url)
        };
        const endPoint = routs.uploadFile;
        const method = Method.POST;
        const formData = new FormData();

        formData.append('file', {
            uri: image.uri,
            name: image.name,
            type: `image/${image.type}`,
        });

        setIsLoading(true);
        callApi(method, endPoint, formData, onSuccess, onError, null, true);
    }

    const UpdateProfile = (imageUri) => {
        const onSuccess = response => {
            console.log('Success while UpdateProfile====>', response);
            setIsLoading(false);
            dispatch(updateUser({ user: response?.data?.data }))
            showMessage({ message: 'Profile Updated!', type: "success" });
        };

        const onError = error => {
            setIsLoading(false);
            console.log('error while UpdateProfile====>', error);
        };

        const method = Method.PATCH;
        const endPoint = routs.updateProfile + `${user?._id}`

        let body = {
            "name": name,
            // "number": JSON.stringify(`+${countryCode}` + phoneNumber),
            "dob": dob,
            "image": imageUri,
            "gender": gender == 1 ? 'Male' : 'Female', // Female,Other
            "location": {
                "type": "Point",
                coordinates: [
                    latLng?.longitude,
                    latLng?.latitude,
                ],
                address: country,
            },
            "device": {
                id: getDeviceId(),
                deviceToken: "fcmToken"
            }
        }

        if (user?.isSocial) {
            body = { ...body, "number": JSON.stringify(`+${countryCode}` + phoneNumber) }
        } else {
            body = { ...body, "email": userEmail }
        }

        setIsLoading(true);
        callApi(method, endPoint, body, onSuccess, onError);
    }

    useEffect(() => {
        placesAutocompleteRef?.current?.setAddressText(country);
    }, [country]);

    return (
        <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
            <Loader loading={isLoading} />
            <Header leftIcon onleftIconPress={() => props.navigation.goBack()} title={LocalizedStrings.edit_profile} />
            <ScrollView keyboardShouldPersistTaps={"always"} bounces={false} style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <View style={{ marginVertical: wp(5) }}>
                    <View style={styles.imageTopView}>
                        <View style={styles.imageView}>
                            <Image source={Object.keys(image).length !== 0 ? { uri: image?.uri } : appImages.profile1} style={[styles.imageStyle, { resizeMode: 'cover' }]} />
                        </View>
                        <TouchableOpacity style={styles.editIconView} onPress={() => openGallary()}>
                            <Image source={appIcons.edit} style={styles.editIcon} />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.mainTitle, { marginVertical: wp(2) }]}>{LocalizedStrings.profile_picture}</Text>
                    <View>
                        <Input
                            placeholder={LocalizedStrings.full_name}
                            value={name}
                            onChangeText={(value) => setName(value)}
                        >
                            {LocalizedStrings.full_name}
                        </Input>

                        <Input
                            editable={false}
                            placeholder={'12/12/2001'}
                            value={dob}
                            rightIcon
                            onPressIcon={() => setShowDatePicker(true)}
                            eyeValue={appIcons.calender1}
                            rightIconColor={colors.primaryColor}
                        >
                            {LocalizedStrings.DOB}
                        </Input>

                        {
                            user && user?.isSocial ? (
                                <CountryInput phoneNumber={phoneNumber} countryCode={countryCode ? countryCode : '966'} countryAbbreviationCode={countryAbbreviationCode ? countryAbbreviationCode : 'SA'} setValue={setPhoneNumber} setSelectedCode={setCountryCode} layout={'first'} />
                            )
                                : (
                                    <View style={{ marginBottom: wp(5) }}>
                                        <Input
                                            placeholder={LocalizedStrings.email}
                                            value={userEmail}
                                            onChangeText={(value) => setEmail(value)}
                                            leftIcon={appIcons.message}
                                        >
                                            {LocalizedStrings.email}
                                        </Input>
                                    </View>
                                )
                        }


                        <FlatList
                            data={genderArray}
                            keyExtractor={(item, index) => index.toString()}
                            ListHeaderComponent={
                                <Text style={[styles.headerText]}>{LocalizedStrings.gender}</Text>
                            }
                            renderItem={({ item, index }) => {
                                return (
                                    <Pressable key={index} onPress={() => setGender(item.id)} style={{ flexDirection: "row", alignItems: "center", paddingVertical: wp(3) }}>
                                        <View style={[styles.dotComponentActiveStyle, { borderWidth: 2, marginRight: wp(3) }]}>
                                            <View style={[styles.dotComponentStyle, { backgroundColor: gender == item.id ? colors.primaryColor : 'transparent' }]} />
                                        </View>
                                        <Text style={styles.mainDes}>{item.title}</Text>
                                    </Pressable>
                                )
                            }}
                        />

                        <Input
                            placeholder={LocalizedStrings.location_Placeholder}
                            rightIcon
                            eyeValue={appIcons.location}
                            rightIconColor={colors.primaryColor}
                            hideInput
                        >
                            {LocalizedStrings.Location}
                        </Input>

                        <GooglePlacesAutocomplete
                            ref={placesAutocompleteRef}
                            styles={{
                                textInput: {
                                    flex: 2,
                                    fontFamily: fontFamily.UrbanistMedium,
                                    fontSize: hp(1.6),
                                    color: colors.BlackSecondary,
                                    backgroundColor: '#FAFAFA',
                                },
                                textInputContainer: {
                                    width: '98%',
                                    backgroundColor: '#FAFAFA',
                                    borderRadius: 10,
                                },
                                description: {
                                    fontFamily: fontFamily.UrbanistMedium,
                                    color: colors.BlackSecondary,
                                },
                                predefinedPlacesDescription: {
                                    color: colors.BlackSecondary,
                                },
                                row: {
                                    color: colors.BlackSecondary,
                                    backgroundColor: '#FAFAFA',
                                },
                            }}
                            placeholder='Country'
                            textInputProps={{
                                // value: country,
                                defaultValue: country,
                                placeholderTextColor: colors.placeholderColor,
                                returnKeyType: "search",
                            }}
                            returnKeyType={'search'}
                            enablePoweredByContainer={false}
                            autoFocus={false}
                            listViewDisplayed="false"
                            fetchDetails={true}
                            onPress={handlePlacePress}
                            query={{
                                key: GOOGLE_API_KEY,
                                language: 'en',
                            }}
                        />
                    </View>
                </View>

                <View style={[appStyles.ph20, appStyles.mt10]}>
                    <Button onPress={() => updateUserProfile()}>{LocalizedStrings.save_changes}</Button>
                </View>
            </ScrollView>

            <DatePicker
                modal
                open={showDatePicker}
                date={new Date()}
                mode='date'
                onConfirm={(date) => {
                    const formattedDate = moment(date).format('DD/MM/YYYY');
                    console.log("formattedDate: ", formattedDate);
                    setDOB(formattedDate)
                    setShowDatePicker(false)
                }}
                onCancel={() => {
                    setShowDatePicker(false)
                }}
            />
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    mainTitle: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistMedium,
        color: colors.BlackSecondary,
        textAlign: "center",
        lineHeight: 24
    },
    imageTopView: {
        marginTop: heightPixel(4),
        alignSelf: 'center',
        justifyContent: 'center'
    },
    imageView: {
        width: wp(25),
        height: wp(25),
        borderRadius: widthPixel(100),
    },
    imageStyle: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
        borderRadius: widthPixel(100),
        borderColor: '#cccccc',
        borderWidth: 2
    },
    editIconView: {
        width: widthPixel(32),
        position: 'absolute',
        bottom: 2,
        right: widthPixel(2),
        height: widthPixel(32),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: widthPixel(23),
    },
    editIcon: {
        width: widthPixel(30),
        height: widthPixel(30),
        resizeMode: 'contain',
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
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        lineHeight: 24,
    }
})