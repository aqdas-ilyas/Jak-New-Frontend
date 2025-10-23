import React, { useRef, useEffect, useState } from 'react'
import { View, StyleSheet, Platform, SafeAreaView, Image, ImageBackground, Text, FlatList, ScrollView, TouchableOpacity, Pressable, Alert, ActivityIndicator } from "react-native";
import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel, fontPixel, GOOGLE_API_KEY } from '../../../services'
import { appIcons, appImages } from "../../../services/utilities/assets";
import Header from "../../../components/header";
import appStyles from "../../../services/utilities/appStyles";
import { ImageProfileSelectandUpload, ImageProfileCameraUpload, uploadProfileImageOnS3 } from "../../../common/HelpingFunc";
import CountryInput from "../../../components/countryPicker/CountryPicker";
import { Input } from "../../../components/input";
import Button from "../../../components/button";
import DatePicker from 'react-native-date-picker'
import moment from 'moment';
import { LocalizationContext } from "../../../language/LocalizationContext";
import { useDispatch, useSelector } from "react-redux";
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
    const [dob, setDOB] = useState('');
    const [gender, setGender] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('');
    const [countryAbbreviationCode, setCountryAbbrivaitionCode] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [imageLoading, setImageLoading] = useState(false)
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
            if (user) {
                if (user?.isSocial) {
                    const nummber = parsePhoneNumber(`+${user.number}`);
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
                setImage({ uri: user?.image ? user?.image : 'https://wheelzconnect.s3.amazonaws.com/dummyUser.png' })
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

    // Show image picker options (Camera or Gallery)
    const showImagePickerOptions = () => {
        Alert.alert(
            LocalizedStrings.select_image_source || 'Select Image Source',
            LocalizedStrings.choose_image_source || 'Choose how you want to select your profile picture',
            [
                {
                    text: LocalizedStrings.camera || 'Camera',
                    onPress: () => openCamera(),
                },
                {
                    text: LocalizedStrings.gallery || 'Gallery',
                    onPress: () => openGallery(),
                },
                {
                    text: LocalizedStrings.cancel || 'Cancel',
                    style: 'cancel',
                },
            ],
            { cancelable: true }
        );
    }

    // Open Camera to Capture Image
    const openCamera = () => {
        ImageProfileCameraUpload((data) => {
            console.log("openGallery: ", data)

            if (data) {
                uploadImage(data)
            }
        })
    }

    // Open Gallery to Pick Image
    const openGallery = () => {
        ImageProfileSelectandUpload((data) => {
            console.log("openGallery: ", data)

            if (data) {
                uploadImage(data)
            }
        })
    }

    // BUtton Press to Update profile
    const updateUserProfile = async () => {
        if (user?.isSocial ? isPossiblePhoneNumber(`+${countryCode}` + phoneNumber) : true) {
            UpdateProfile()
        } else {
            showMessage({ message: "Please add Valid Phone Number", type: "danger" });
        }
    }

    const uploadImage = async (photo) => {
        try {
            setIsLoading(true);
            const uri = `file://${photo.uri}`;
            const fileName = photo.uri.substring(photo.uri.lastIndexOf('/') + 1);
            const fileType = fileName.split('.').pop();

            const data = {
                uri,
                type: `image/${fileType}`,
                name: fileName,
            };

            await uploadProfileImageOnS3(data, (res) => {
                setIsLoading(false);

                if (res) {
                    setImage({ uri: res });
                    showMessage({ message: 'Image uploaded successfully', type: 'success' });
                } else {
                    throw new Error('Image upload failed');
                }
            });
        } catch (error) {
            setIsLoading(false);
            handleImageError(error, 'Failed to upload image');
        }
    };

    const UpdateProfile = () => {
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
            "dob": dob,
            "image": image?.uri,
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
            body = { ...body, "number": countryCode + phoneNumber }
        } else {
            body = { ...body, "email": userEmail }
        }

        setIsLoading(true);
        callApi(method, endPoint, body, onSuccess, onError);
    }

    useEffect(() => {
        if (country && placesAutocompleteRef?.current) {
            try {
                placesAutocompleteRef.current.setAddressText(country);
            } catch (error) {
                console.log('Error setting address text:', error);
            }
        }
    }, [country]);

    return (
        <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
            <Loader loading={isLoading} />
            <Header leftIcon onleftIconPress={() => props.navigation.goBack()} title={LocalizedStrings.edit_profile} />
            <ScrollView keyboardShouldPersistTaps={"always"} bounces={false} style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <View style={{ marginVertical: wp(5) }}>
                    <View style={styles.imageTopView}>
                        <View style={styles.imageView}>
                            <Image
                                source={Object.keys(image).length !== 0 ? image : appImages.profile1}
                                style={[styles.imageStyle, { resizeMode: 'cover' }]}
                                onLoadStart={() => setImageLoading(true)}
                                onLoadEnd={() => setImageLoading(false)}
                                onError={() => setImageLoading(false)}
                            />
                            {imageLoading && (
                                <View style={styles.imageLoaderContainer}>
                                    <ActivityIndicator
                                        size="small"
                                        color={colors.primaryColor}
                                    />
                                </View>
                            )}
                        </View>
                        <TouchableOpacity style={styles.editIconView} onPress={() => showImagePickerOptions()}>
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
                            keyExtractor={(_, index) => index.toString()}
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
                            value={country}
                            onChangeText={(value) => setCountry(value)}
                        >
                            {LocalizedStrings.Location}
                        </Input>
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
        position: 'relative',
    },
    imageLoaderContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: widthPixel(100),
        justifyContent: 'center',
        alignItems: 'center',
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