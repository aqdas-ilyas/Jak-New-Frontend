import React, {useRef, useState, useCallback} from 'react';
import {View, Text, ImageBackground, StyleSheet, Platform} from 'react-native';
import {SwiperFlatList} from 'react-native-swiper-flatlist';
import {useDispatch} from 'react-redux';
import {colors, hp, fontFamily, wp, routes} from '../../../services';
import {appImages} from '../../../services/utilities/assets';
import appStyles from '../../../services/utilities/appStyles';
import Button from '../../../components/button';
import {LocalizationContext} from '../../../language/LocalizationContext';
import {saveSplash} from '../../../store/reducers/userDataSlice';

// Move to a separate constants file for reusability
const ONBOARDING_DATA = [
  {
    titleKey: 'Customized offers for you',
    subtitleKey: 'onbaord1',
    image: appImages.onboard1,
  },
  {
    titleKey: 'Get notified and never miss out',
    subtitleKey: 'onbaord2',
    image: appImages.onboard2,
  },
  {
    titleKey: 'Easily access you loyalty cards',
    subtitleKey: 'onbaord3',
    image: appImages.onboard3,
  },
];

const Onboarding = ({navigation}) => {
  const {appLanguage, LocalizedStrings} = React.useContext(LocalizationContext);
  const swiperRef = useRef(null);
  const dispatch = useDispatch();
  const isRTL = appLanguage === 'ar';

  // Initialize swiper index based on language direction
  const initialIndex = isRTL ? ONBOARDING_DATA.length - 1 : 0;
  const [paginationIndex, setPaginationIndex] = useState(initialIndex);

  // Handle button press (Next or Get Started)
  const onButtonPress = useCallback(() => {
    if (paginationIndex < ONBOARDING_DATA.length - 1) {
      try {
        swiperRef.current?.scrollToIndex({index: paginationIndex + 1});
        setPaginationIndex(paginationIndex + 1);
      } catch (error) {
        console.warn('Failed to scroll to index:', error);
      }
    } else {
      navigation.navigate(routes.welcome);
      dispatch(saveSplash(true));
    }
  }, [paginationIndex, navigation, dispatch]);

  // Handle skip button
  const onSkipPress = useCallback(() => {
    navigation.navigate(routes.welcome);
    dispatch(saveSplash(true));
  }, [navigation, dispatch]);

  // Dynamic title width based on index and language
  const getTitleWidth = index => {
    const widths = {
      0: {en: wp(48), ar: wp(35)},
      1: {en: wp(35), ar: wp(45)},
      2: {en: wp(40), ar: Platform.OS === 'android' ? wp(35) : wp(38)},
    };
    return widths[index][appLanguage] || wp(40);
  };

  // Custom pagination dots
  const DotComponent = ({paginationIndex}) => (
    <View style={[appStyles.rowCenter, styles.paginationContainer]}>
      {ONBOARDING_DATA.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dotContainer,
            index === paginationIndex && styles.activeDotContainer,
          ]}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === paginationIndex
                    ? colors.primaryColor
                    : colors.borderColor,
                width: index === paginationIndex ? wp(8) : wp(3),
              },
            ]}
          />
        </View>
      ))}
    </View>
  );

  return (
    <View style={[appStyles.safeContainer]}>
      <SwiperFlatList
        ref={swiperRef}
        data={ONBOARDING_DATA}
        initialScrollIndex={initialIndex}
        onChangeIndex={({index}) => setPaginationIndex(index)}
        showPagination
        PaginationComponent={DotComponent}
        renderItem={({item, index}) => (
          <View style={styles.swiperTopView}>
            <ImageBackground source={item.image} style={styles.imageStyle}>
              <Text
                style={[
                  styles.titleStyle,
                  {
                    alignSelf: isRTL ? 'flex-end' : 'flex-start',
                    textAlign: isRTL ? 'right' : 'left',
                    width: getTitleWidth(index),
                    marginHorizontal: wp(5),
                  },
                ]}>
                {LocalizedStrings[item.titleKey]}
              </Text>
            </ImageBackground>
            <View style={styles.contentContainer}>
              <Text style={styles.subtitleStyle}>
                {LocalizedStrings[item.subtitleKey]}
              </Text>
            </View>
          </View>
        )}
      />
      <View style={[appStyles.ph20, styles.buttonContainer]}>
        <Button
          onPress={onButtonPress}
          accessibilityLabel={
            paginationIndex === ONBOARDING_DATA.length - 1
              ? 'Get Started'
              : 'Next'
          }>
          {
            LocalizedStrings[
              paginationIndex === ONBOARDING_DATA.length - 1
                ? 'Get Started'
                : 'next'
            ]
          }
        </Button>
      </View>
      <View style={[appStyles.ph20, styles.skipButtonContainer]}>
        <Button skip onPress={onSkipPress} accessibilityLabel="Skip onboarding">
          {LocalizedStrings.skip}
        </Button>
      </View>
    </View>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  swiperTopView: {
    width: wp(100),
  },
  imageStyle: {
    width: wp(100),
    height: wp(114),
    resizeMode: 'contain',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  titleStyle: {
    fontSize: hp(4),
    fontFamily: fontFamily.UrbanistBold,
    color: colors.fullBlack,
    marginBottom: -wp(5),
  },
  subtitleStyle: {
    fontSize: hp(1.6),
    fontFamily: fontFamily.UrbanistRegular,
    color: colors.descriptionColor,
    textAlign: 'left',
    marginTop: hp(4),
  },
  contentContainer: {
    margin: wp(4),
  },
  paginationContainer: {
    paddingBottom: hp(2),
    marginBottom: hp(2),
  },
  dotContainer: {
    width: wp(5),
    height: wp(5),
    borderRadius: wp(1.75),
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDotContainer: {
    width: wp(10),
    height: wp(5),
    borderRadius: wp(2),
  },
  dot: {
    width: wp(3),
    height: wp(3),
    borderRadius: wp(3),
  },
  buttonContainer: {
    marginBottom: hp(0.5),
  },
  skipButtonContainer: {
    marginBottom: hp(2),
  },
});
