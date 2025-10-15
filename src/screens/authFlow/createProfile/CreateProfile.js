import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, Platform, SafeAreaView, Image, ImageBackground, Text, FlatList, ScrollView, TouchableOpacity, Pressable, Alert } from "react-native";
import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel, fontPixel, GOOGLE_API_KEY, emailFormat } from '../../../services'
import { appIcons, appImages } from '../../../services/utilities/assets'
import appStyles from '../../../services/utilities/appStyles'
import Button from '../../../components/button';
import Header from '../../../components/header'
import { Input } from '../../../components/input'
import { ImageProfileSelectandUpload, ImageProfileCameraUpload } from '../../../common/HelpingFunc';
import CountryInput from '../../../components/countryPicker/CountryPicker'
import { LocalizationContext } from '../../../language/LocalizationContext'
import DatePicker from 'react-native-date-picker'
import moment from 'moment';
import routs from '../../../api/routs';
import { callApi, Method } from '../../../api/apiCaller';
import { Loader } from '../../../components/loader/Loader';
import { isPossiblePhoneNumber } from 'libphonenumber-js'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { useDispatch } from 'react-redux';
import { setToken, updateUser } from '../../../store/reducers/userDataSlice';
import { showMessage } from 'react-native-flash-message';
import { getDeviceId } from 'react-native-device-info';
import { _fetchCountryAbbrevicationCode } from '../../../services/helpingMethods';

const CreateProfile = (props) => {
    const { number, email } = props?.route?.params ?? {}
    const dispatch = useDispatch()
    const { LocalizedStrings } = React.useContext(LocalizationContext);
    const placesAutocompleteRef = useRef(null);

    const genderArray = [
        { id: 1, title: LocalizedStrings.Male },
        { id: 2, title: LocalizedStrings.Female },
    ]

    const [name, setName] = useState('')
    const [userEmail, setEmail] = useState('')
    const [image, setImage] = useState({});
    const [dob, setDOB] = useState('');
    const [gender, setGender] = useState(genderArray[0].title);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('966');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [country, setCountry] = useState('');
    const [latLng, setLatLng] = useState({});
    const [countryAbbreviationCode, setCountryAbbrivaitionCode] = useState('');

    // Fetch and set the State's
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
    const openCamera = async () => {
        ImageProfileCameraUpload((data, val) => {
            if (data) {
                setImage(data)
            }
        })
    }

    // Open Gallery to Pick Image
    const openGallery = async () => {
        ImageProfileSelectandUpload((data, val) => {
            if (data) {
                setImage(data)
            }
        })
    }
   
    // BUtton Press to Create profile
    const createUserProfile = async () => {
        if (validate()) {
            await uploadImage()
        }
    }

    const validate = () => {
        const emailValue = emailFormat.test(userEmail) || userEmail === ' ' ? true : false;

        if (/\d/.test(name)) {
            showMessage({ message: "Name can only consists of alphabets between A to Z or a to z", type: "danger" });
            return false;
        }

        if (name.length < 2) {
            showMessage({ message: "Please enter a valid name", type: "danger" });
            return false;
        }

        if (dob.length < 2) {
            showMessage({ message: "Please select your Date of Birth", type: "danger" });
            return false;
        }

        // Validate age - must be 15 years or older
        if (dob) {
            const today = new Date();
            const birthDate = moment(dob, 'DD/MM/YYYY').toDate();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            // Check if birthday hasn't occurred this year
            const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
                ? age - 1 
                : age;

            if (actualAge < 15) {
                showMessage({ 
                    message: LocalizedStrings.age_validation_error || "You must be at least 15 years old to create a profile", 
                    type: "danger" 
                });
                return false;
            }
        }

        if (email) {
            if (!isPossiblePhoneNumber(`+${countryCode}` + phoneNumber)) {
                showMessage({ message: "Please add Valid Phone Number", type: "danger" });
                return false;
            }
        } else {
            if (!emailValue) {
                showMessage({ message: "Invalid Email", type: "danger" });
                return false;
            }
        }

        if (country.length < 2) {
            showMessage({ message: "Please Enter Valid Country", type: "danger" });
            return false;
        }

        // if (!image?.uri) {
        //     showMessage({ message: "Please Upload a Profile Picture", type: "danger" });
        //     return false;
        // }
        return true
    }

    // Send Picture to AWS Server
    const uploadImage = async () => {
        const onSuccess = response => {
            console.log('response uploadImage============', response);
            UpdateProfile(response.url)
        };
        const onError = error => {
            setIsLoading(false);
            console.log('Error uploadImage============', error);
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
        await callApi(method, endPoint, formData, onSuccess, onError, null, true);
    }

    const UpdateProfile = (imageUri) => {
        const onSuccess = response => {
            setIsLoading(false);
            console.log('Success while UpdateProfile====>', response);
            showMessage({ message: 'Profile Created Successfully!', type: 'success' })
            dispatch(updateUser(response?.data))
            dispatch(setToken({
                token: response?.data?.token,
                refreshToken: response?.data?.refreshToken,
            }))

            props?.navigation?.navigate(routes.preferences);
        };

        const onError = error => {
            setIsLoading(false);
            console.log('error while UpdateProfile====>', error);
            showMessage({ message: error?.message, type: 'danger' })
        };

        const method = Method.POST;
        const endPoint = routs.accountSetup

        let body = {
            "name": name,
            "dob": dob,
            "image": imageUri,
            "gender": gender,
            "location": {
                "type": "Point",
                coordinates: [0, 0],
                address: country,
            },
            "device": {
                id: getDeviceId(),
                deviceToken: "fcmToken"
            }
        }

        if (number) {
            body = { ...body, "email": userEmail }
        }

        if (email) {
            body = { ...body, "number": JSON.stringify(`+${countryCode}` + phoneNumber) }
        }

        setIsLoading(true);
        callApi(method, endPoint, body, onSuccess, onError);
    }

    return (
        <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
            <Loader loading={isLoading} />
            <Header
                leftIcon
                onleftIconPress={() => props.navigation.goBack()}
                title={LocalizedStrings['Build Profile']}
            // rightTitle={LocalizedStrings.skip}
            // onPressRightTitle={() => props.navigation.navigate(routes.preferences)}
            />
            <ScrollView keyboardShouldPersistTaps={"always"} bounces={false} style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <View style={{ marginVertical: wp(5) }}>
                    <View style={styles.imageTopView}>
                        <View style={styles.imageView}>
                            <Image source={Object.keys(image).length !== 0 ? { uri: image?.uri } : appImages.profile1} style={[styles.imageStyle, { resizeMode: 'cover' }]} />
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
                            placeholder={'mm/dd/yyyy'}
                            value={dob}
                            rightIcon
                            onPressIcon={() => setShowDatePicker(true)}
                            eyeValue={appIcons.calender1}
                            rightIconColor={colors.primaryColor}
                            touchable
                        >
                            {LocalizedStrings.DOB}
                        </Input>

                        {
                            number
                            && (
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

                        {
                            email && (
                                <CountryInput phoneNumber={phoneNumber} countryCode={countryCode ? countryCode : '966'} countryAbbreviationCode={countryAbbreviationCode ? countryAbbreviationCode : 'SA'} setValue={setPhoneNumber} setSelectedCode={setCountryCode} layout={'first'} />
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
                                    <Pressable key={index} onPress={() => setGender(item.title)} style={{ flexDirection: "row", alignItems: "center", paddingVertical: wp(3) }}>
                                        <View style={[styles.dotComponentActiveStyle, { borderWidth: 2, marginRight: wp(3) }]}>
                                            <View style={[styles.dotComponentStyle, { backgroundColor: gender == item.title ? colors.primaryColor : 'transparent' }]} />
                                        </View>
                                        <Text style={styles.mainDes}>{item.title}</Text>
                                    </Pressable>
                                )
                            }}
                        />

                        <Input
                            placeholder={LocalizedStrings.Location}
                            rightIcon
                            eyeValue={appIcons.location}
                            rightIconColor={colors.primaryColor}
                            value={country}
                            onChangeText={(text) => setCountry(text)}
                        >
                            {LocalizedStrings.Location}
                        </Input>


                    </View>
                </View>

                <View style={[appStyles.ph20, appStyles.mt10]}>
                    <Button onPress={() => createUserProfile()}>{LocalizedStrings.save_changes}</Button>
                </View>
            </ScrollView>

            <DatePicker
                modal
                open={showDatePicker}
                date={new Date()}
                mode='date'
                maximumDate={new Date()}
                minimumDate={new Date(new Date().getFullYear() - 100, 0, 1)} // 100 years ago
                onConfirm={(date) => {
                    const today = new Date();
                    const age = today.getFullYear() - date.getFullYear();
                    const monthDiff = today.getMonth() - date.getMonth();
                    
                    // Check if birthday hasn't occurred this year
                    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate()) 
                        ? age - 1 
                        : age;

                    if (actualAge < 15) {
                        showMessage({ 
                            message: LocalizedStrings.age_validation_error || "You must be at least 15 years old to create a profile", 
                            type: "danger" 
                        });
                        setShowDatePicker(false);
                        return;
                    }

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
}

export default CreateProfile

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
        borderRadius: widthPixel(100)
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