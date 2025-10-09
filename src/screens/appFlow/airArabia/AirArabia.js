import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ImageBackground,
  Alert,
} from 'react-native';
import {
  colors,
  hp,
  fontFamily,
  wp,
  routes,
  heightPixel,
  widthPixel,
  appImages,
  appIcons,
} from '../../../services';
import appStyles from '../../../services/utilities/appStyles';
import Header from '../../../components/header';
import Button from '../../../components/button';
import {Input} from '../../../components/input';
import Entypo from 'react-native-vector-icons/Entypo';
import {LocalizationContext} from '../../../language/LocalizationContext';
import routs from '../../../api/routs';
import {callApi, Method} from '../../../api/apiCaller';
import {useDispatch, useSelector} from 'react-redux';
import {saveLoyaltyCards} from '../../../store/reducers/WalletSlice';
import {
  ImageProfileCameraUpload,
  ImageProfileSelectandUpload,
} from '../../../common/HelpingFunc';
import {Loader} from '../../../components/loader/Loader';
import {showMessage} from 'react-native-flash-message';

const AddLoyaltyCard = props => {
  const {item} = props?.route?.params ?? {};
  const {LocalizedStrings} = React.useContext(LocalizationContext);
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.user.user);

  const [name, setName] = useState('');
  const [loyaltyName, setLoyaltyName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [frontImage, setFrontImage] = useState('');
  const [backImage, setBackImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    if (/\d/.test(name)) {
      showMessage({
        message: 'Name can only consists of alphabets between A to Z or a to z',
        type: 'danger',
      });
      return false;
    }

    // if (name.length < 2) {
    //     showMessage({ message: "Please enter a valid name", type: "danger" });
    //     return false;
    // }

    if (loyaltyName.length < 2) {
      showMessage({
        message: 'Please select your Date of Birth',
        type: 'danger',
      });
      return false;
    }

    if (cardNumber.length < 2) {
      showMessage({message: 'Please add Valid Card Number', type: 'danger'});
      return false;
    }

    // if (notes.length < 2) {
    //     showMessage({ message: "Please Enter Some Notes", type: "danger" });
    //     return false;
    // }
    return true;
  };

  const createLoyaltyCards = () => {
    if (validate()) {
      const onSuccess = response => {
        console.log('response createLoyaltyCards===', response?.data);
        getLoyaltyCards();
      };
      const onError = error => {
        setIsLoading(false);
        console.log('Error createLoyaltyCards===', error);
      };

      const endPoint = routs.createLoyaltyCards;
      const method = Method.POST;
      const bodyParams = {
        name: '',
        loyaltyName: loyaltyName,
        cardNumber: cardNumber,
        frontImage: frontImage,
        backImage: backImage,
        notes: notes,
      };

      setIsLoading(true);
      callApi(method, endPoint, bodyParams, onSuccess, onError);
    }
  };

  const getLoyaltyCards = () => {
    const onSuccess = response => {
      console.log('response getLoyaltyCards===', response?.data);
      setIsLoading(false);
      dispatch(saveLoyaltyCards(response?.data?.data));
      // props.navigation.navigate(routes.loyaltyCardList)
      props.navigation.goBack();
    };

    const onError = error => {
      setIsLoading(false);
      console.log('Error getLoyaltyCards===', error);
    };

    const endPoint = routs.getLoyaltyCards + `?creator=${user?._id}`;
    const method = Method.GET;
    const bodyParams = {};

    callApi(method, endPoint, bodyParams, onSuccess, onError);
  };

  const handleUpload = str => {
    Alert.alert(
      LocalizedStrings['Select Image'],
      LocalizedStrings['Choose an option'],
      [
        {
          text: LocalizedStrings['Camera'],
          onPress: () => openCamera(str),
        },
        {
          text: LocalizedStrings['Gallery'],
          onPress: () => openGallary(str),
        },
        {
          text: LocalizedStrings['Cancel'],
          style: 'cancel',
        },
      ],
      {cancelable: true},
    );
  };

  const openCamera = str => {
    ImageProfileCameraUpload(data => {
      if (data) {
        uploadImage(data, str);
      }
    });
  };

  // Open gallery
  const openGallary = str => {
    ImageProfileSelectandUpload(data => {
      if (data) {
        uploadImage(data, str);
      }
    });
  };

  // Send Picture to AWS Server
  const uploadImage = async (data, str) => {
    const onSuccess = response => {
      console.log('response uploadImage============', response.url);
      if (str == 'front') {
        setFrontImage(response.url);
      } else {
        setBackImage(response.url);
      }
      setIsLoading(false);
    };
    const onError = error => {
      setIsLoading(false);
      console.log('Error uploadImage============', error.url);
    };

    const endPoint = routs.uploadFile;
    const method = Method.POST;
    const formData = new FormData();

    formData.append('file', {
      uri: data.uri,
      name: data.name,
      type: `image/${data.type}`,
    });

    setIsLoading(true);
    callApi(method, endPoint, formData, onSuccess, onError, null, true);
  };

  useEffect(() => {
    if (item) {
      setName(item?.name);
      setLoyaltyName(item?.loyaltyName);
      setCardNumber(item?.cardNumber);
      setNotes(item?.notes);
      setFrontImage(item?.frontImage);
      setBackImage(item?.backImage);
    }
  }, [item]);

  const updateLoyaltyCards = () => {
    if (validate()) {
      const onSuccess = response => {
        console.log('response createLoyaltyCards===', response?.data);
        getLoyaltyCards();
      };
      const onError = error => {
        setIsLoading(false);
        console.log('Error createLoyaltyCards===', error);
      };

      const endPoint = routs.updateLoyaltyCards + `/${item?._id}`;
      const method = Method.PATCH;
      const bodyParams = {
        name: name,
        loyaltyName: loyaltyName,
        cardNumber: cardNumber,
        frontImage: frontImage,
        backImage: backImage,
        notes: notes,
      };

      setIsLoading(true);
      callApi(method, endPoint, bodyParams, onSuccess, onError);
    }
  };

  return (
    <SafeAreaView style={[appStyles.safeContainer, {margin: wp(4)}]}>
      <Loader loading={isLoading} />
      <Header
        leftIcon
        onleftIconPress={() => props.navigation.goBack()}
        title={LocalizedStrings['new_card']}
      />
      <ScrollView style={{flex: 1}}>
        {/* <Input
                    value={name}
                    onChangeText={(value) => setName(value)}
                    placeholder={LocalizedStrings.full_name}>
                    {LocalizedStrings.full_name}
                </Input> */}

        <Input
          value={loyaltyName}
          onChangeText={value => setLoyaltyName(value)}
          placeholder={LocalizedStrings.loyalty_name}>
          {LocalizedStrings.loyalty_name}
        </Input>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}>
          <Input
            value={cardNumber}
            onChangeText={value => setCardNumber(value)}
            placeholder={LocalizedStrings['Card Number']}
            // WholeContainer={{ width: wp(78) }}
          >
            {LocalizedStrings['Card Number']}
          </Input>
          {/* <View style={{ backgroundColor: colors.primaryColor, padding: wp(2), borderRadius: 50, marginBottom: wp(1) }}>
                        <Image source={appIcons.scan} style={{ width: wp(7), height: wp(7) }} />
                    </View> */}
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            marginTop: wp(5),
          }}>
          {frontImage != '' ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleUpload('front')}>
              <ImageBackground
                source={{uri: frontImage}}
                style={{
                  width: wp(40),
                  height: wp(25),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                borderRadius={10}
                blurRadius={5}>
                <Entypo
                  name={'camera'}
                  color={colors.BlackSecondary}
                  size={wp(5)}
                />
              </ImageBackground>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleUpload('front')}
              style={styles.cameraBox}>
              <Entypo
                name={'camera'}
                color={colors.BlackSecondary}
                size={wp(5)}
              />
              <Text style={styles.imageText}>
                {LocalizedStrings['Add Front Image']}
              </Text>
            </TouchableOpacity>
          )}

          {backImage != '' ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleUpload('back')}>
              <ImageBackground
                source={{uri: backImage}}
                style={{
                  width: wp(40),
                  height: wp(25),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                borderRadius={10}
                blurRadius={5}>
                <Entypo
                  name={'camera'}
                  color={colors.BlackSecondary}
                  size={wp(5)}
                />
              </ImageBackground>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleUpload('back')}
              style={styles.cameraBox}>
              <Entypo
                name={'camera'}
                color={colors.BlackSecondary}
                size={wp(5)}
              />
              <Text style={styles.imageText}>
                {LocalizedStrings['Add Back Image']}
              </Text>
            </TouchableOpacity>
          )}
          {/* <View style={styles.cameraBox}>
                        <Entypo name={'camera'} color={colors.BlackSecondary} size={wp(5)} />
                        <Text onPress={() => openGallary('back')} style={styles.imageText}>{LocalizedStrings['Add Back Image']}</Text>
                    </View> */}
        </View>

        <Input
          value={notes}
          onChangeText={value => setNotes(value)}
          placeholder={LocalizedStrings.notes}
          multiline={true}
          containerStyle={{
            height: wp(40),
            paddingVertical: wp(2),
            alignItems: 'flex-start',
          }}
          WholeContainer={{marginTop: -wp(5)}}
        />
      </ScrollView>

      <View style={[appStyles.ph20, appStyles.mb5]}>
        <Button
          onPress={() => (item ? updateLoyaltyCards() : createLoyaltyCards())}>
          {LocalizedStrings.save}
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default AddLoyaltyCard;

const styles = StyleSheet.create({
  cameraBox: {
    backgroundColor: colors.offWhite,
    borderRadius: 12,
    paddingHorizontal: wp(8),
    paddingVertical: wp(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageText: {
    fontSize: hp(1.6),
    lineHeight: 24,
    fontFamily: fontFamily.UrbanistSemiBold,
    color: colors.BlackSecondary,
    marginTop: wp(2),
  },
});
