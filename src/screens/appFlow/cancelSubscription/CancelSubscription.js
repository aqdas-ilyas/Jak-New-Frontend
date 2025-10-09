import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {
  colors,
  hp,
  fontFamily,
  wp,
  routes,
  heightPixel,
  widthPixel,
} from '../../../services';
import appStyles from '../../../services/utilities/appStyles';
import Header from '../../../components/header';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Button from '../../../components/button';
import CallModal from '../../../components/modal';
import {Input} from '../../../components/input';
import {LocalizationContext} from '../../../language/LocalizationContext';
import {callApi, Method} from '../../../api/apiCaller';
import routs from '../../../api/routs';
import {showMessage} from 'react-native-flash-message';
import {Loader} from '../../../components/loader/Loader';
import {useDispatch} from 'react-redux';
import {updateUser} from '../../../store/reducers/userDataSlice';

const CancelSubscription = props => {
  const {LocalizedStrings} = React.useContext(LocalizationContext);
  const SubscriptionArray = [
    {id: 1, desc: LocalizedStrings['Lorem ipsum dolor set amet consectetur']},
    {id: 2, desc: LocalizedStrings['Integer non placerat justo.']},
    {id: 3, desc: LocalizedStrings['Fusce sollicitudin venenatis ex, sed']},
    {id: 4, desc: LocalizedStrings['lorem ipsum dolor set amet']},
    {id: 5, desc: LocalizedStrings['Aenean cursus sapien nec mauris']},
  ];

  const dispatch = useDispatch();
  const [modalShow, setModalShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [textCancelSubscrption, setTextCancelSubscrption] = useState(
    SubscriptionArray[0].desc,
  );

  const getUserProfile = () => {
    const onSuccess = response => {
      console.log('res while getUserProfile====>', response);
      dispatch(updateUser(response));
    };

    const onError = error => {
      console.log('error while getUserProfile====>', error);
    };

    const method = Method.GET;
    const endPoint = routs.getUser;
    const bodyParams = {};

    callApi(method, endPoint, bodyParams, onSuccess, onError);
  };

  const cancelSubscription = () => {
    const onSuccess = response => {
      console.log('res while cancelSubscription====>', response);
      getUserProfile();
      setIsLoading(false);
      setModalShow(true);
      showMessage({message: 'Subscription Canceled!', type: 'success'});

      setTimeout(() => {
        setModalShow(false);
        props.navigation.navigate(routes.tab, {screen: routes.home});
      }, 2000);
    };

    const onError = error => {
      setIsLoading(false);
      console.log('error while cancelSubscription====>', error);
      showMessage({message: error?.message, type: 'danger'});
    };

    const method = Method.POST;
    const endPoint = routs.cancelSubscription;
    const bodyParams = {
      subscriptionType: 'Jak Mobile App Free',
      reason: textCancelSubscrption,
    };

    setIsLoading(true);
    callApi(method, endPoint, bodyParams, onSuccess, onError);
  };

  return (
    <SafeAreaView style={[appStyles.safeContainer, {margin: wp(4)}]}>
      <Loader loading={isLoading} />
      <Header
        leftIcon
        onleftIconPress={() => props.navigation.goBack()}
        title={LocalizedStrings.select_reson}
      />
      <View style={{flex: 1}}>
        <Text
          style={[
            styles.mainDes,
            {
              marginVertical: wp(5),
              color: colors.descriptionColor,
              textAlign: 'left',
            },
          ]}>
          Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,
          consectetur, adipisci velit, sed qu
        </Text>

        <View>
          <FlatList
            data={SubscriptionArray}
            showsVerticalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({item, index}) => {
              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  key={index}
                  onPress={() => setTextCancelSubscrption(item.desc)}
                  style={{
                    marginTop: wp(4),
                    backgroundColor:
                      textCancelSubscrption == item.desc
                        ? colors.primaryColor
                        : 'rgba(98, 89, 132, 0.4)',
                    padding: wp(3),
                    borderRadius: 50,
                  }}>
                  <Text style={[styles.mainDes, {color: colors.fullWhite}]}>
                    {item.desc}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        <Input
          onChangeText={text => setTextCancelSubscrption(text)}
          placeholder={LocalizedStrings.Other}>
          {LocalizedStrings.Other}
        </Input>
      </View>
      <View style={[appStyles.ph20, appStyles.mb5]}>
        <Button onPress={() => cancelSubscription()}>
          {LocalizedStrings.cancel_subscription}
        </Button>
      </View>

      <CallModal
        modalShow={modalShow}
        setModalShow={() => setModalShow(!modalShow)}
        title={LocalizedStrings['Cancel Subscription Successfully!']}
        subTitle="Lorem ipsum dolor sit amet, consect adipiscing elit, sed do eiusmod tempor incididunt."
      />
    </SafeAreaView>
  );
};

export default CancelSubscription;

const styles = StyleSheet.create({
  Item: {
    backgroundColor: colors.offWhite,
    borderRadius: 10,
    marginTop: wp(5),
    paddingBottom: wp(5),
  },
  mainDes: {
    fontSize: hp(1.6),
    fontFamily: fontFamily.UrbanistRegular,
    textAlign: 'center',
    lineHeight: 24,
  },
  mainTitle: {
    fontSize: hp(2.4),
    fontFamily: fontFamily.UrbanistBold,
    color: colors.BlackSecondary,
    marginTop: wp(5),
    textAlign: 'center',
  },
  line: {
    borderColor: colors.borderColor,
    borderWidth: 0.5,
    width: wp(85),
    marginTop: wp(5),
    alignSelf: 'center',
  },
  Duration: {
    fontSize: hp(1.2),
    fontFamily: fontFamily.UrbanistLight,
    color: colors.descriptionColor,
  },
});
