import React, { useEffect, useRef, useState } from 'react';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import { View, StyleSheet, Platform, SafeAreaView, Image, ImageBackground, TouchableOpacity, StatusBar, Text, FlatList, Pressable, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { heightPixel, hp, routes, widthPixel, wp } from '../../../services/constants';
import { appIcons, appImages } from '../../../services/utilities/assets';
import { Input } from '../../../components/input';
import { colors, fontFamily } from '../../../services';
import FilterModal from '../../../components/filter';
import { LocalizationContext } from '../../../language/LocalizationContext';
import { saveCategoryMyOfferPageNo, saveCategoryOffers, saveTotalCategoryMyOfferPagesCount } from '../../../store/reducers/OfferSlice';
import { useDispatch, useSelector } from 'react-redux';
import routs from '../../../api/routs';
import { callApi, Method } from '../../../api/apiCaller';
import { Loader } from '../../../components/loader/Loader';
import { showMessage } from 'react-native-flash-message';

export default Home = props => {
  const { appLanguage, LocalizedStrings, setAppLanguage } =
    React.useContext(LocalizationContext);

  const mapRef = useRef();
  const refCategorySheet = useRef();
  const refDiscountSheet = useRef();
  const refLocationSheet = useRef();
  const dispatch = useDispatch();
  const IsFocused = useIsFocused();
  const navigation = useNavigation();
  const user = useSelector(state => state?.user?.user?.user);
  const CategoriesOffers = useSelector(state => state.offer.CategoriesOffers);
  const categoryMyOfferPageNo = useSelector(
    state => state.offer.categoryMyOfferPageNo,
  );
  const [checkboxes, setCheckboxes] = useState([]);
  const [userLocation, setUserLocation] = useState({ latitude: 0, longitude: 0 });
  const [markers, setMarkers] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [filterDiscounts, setFilterDiscounts] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [region, setRegion] = useState({
    latitude: userLocation?.latitude,
    longitude: userLocation?.longitude,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  useFocusEffect(
    React.useCallback(() => {
      dispatch(saveTotalCategoryMyOfferPagesCount(1));
      dispatch(saveCategoryMyOfferPageNo(1));

      // Return a cleanup function if necessary
      return () => {
        console.log('Screen is unfocused, clean up here if needed');
      };
    }, []), // Dependency array is empty to run the effect only once when the component mounts
  );

  useEffect(() => {
    getMyOfferCategory();
  }, [IsFocused]);

  const getCheckedLocalizedStrings = async () => {
    // Filter out checked items
    const checkedItems = await checkboxes.filter(item => item.checked);

    // Map to LocalizedStrings format and join with commas
    const localizedCheckedItems = await checkedItems
      .map(item => LocalizedStrings[item.title])
      .join(',');

    return localizedCheckedItems;
  };

  // Helper function to filter out expired offers
  const filterExpiredOffers = (offers) => {
    if (!offers || !Array.isArray(offers)) {
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

    return offers.filter((offer) => {
      const expiryDateStr = offer?.['expiry date'];
      
      if (!expiryDateStr) {
        // If no expiry date, include the offer
        return true;
      }

      try {
        // Try to parse the expiry date
        // Handle different date formats (DD/MM/YYYY, YYYY-MM-DD, etc.)
        let expiryDate;
        
        // Check if it's in DD/MM/YYYY format
        if (expiryDateStr.includes('/')) {
          const parts = expiryDateStr.split('/');
          if (parts.length === 3) {
            // DD/MM/YYYY format
            expiryDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          } else {
            // Try default date parsing
            expiryDate = new Date(expiryDateStr);
          }
        } else {
          // Try default date parsing
          expiryDate = new Date(expiryDateStr);
        }

        // Check if date is valid
        if (isNaN(expiryDate.getTime())) {
          console.log('Invalid expiry date format:', expiryDateStr);
          // If date is invalid, include the offer (don't filter it out)
          return true;
        }

        expiryDate.setHours(0, 0, 0, 0); // Set to start of day

        // Include offer if expiry date is today or in the future
        return expiryDate >= today;
      } catch (error) {
        console.log('Error parsing expiry date:', expiryDateStr, error);
        // If there's an error parsing, include the offer (don't filter it out)
        return true;
      }
    });
  };

  const getMyOffers = async () => {
    const formattedCheckedStrings = await checkboxes.filter(
      item => item.checked,
    )[0]?.title;

    const onSuccess = async response => {
      console.log('response getMyOffers Home===', response?.data);
      setIsLoading(false);
      // Filter out expired offers
      const filteredOffers = filterExpiredOffers(response?.data?.data || []);
      dispatch(saveCategoryOffers(filteredOffers));

      const originalArray = filteredOffers;
      setMarkers(originalArray);

      if (filteredOffers.length > 0) {
        dispatch(
          saveTotalCategoryMyOfferPagesCount(response?.data?.totalPages),
        );
        dispatch(saveCategoryMyOfferPageNo(categoryMyOfferPageNo + 1));

        props.navigation.navigate(routes.storeList, {
          item: filteredOffers,
          category: formattedCheckedStrings,
        });
      } else {
        showMessage({ message: 'No Offers Found!', type: 'danger' });
      }
    };

    const onError = error => {
      console.log('Error getMyOffers Home===', error);
      setIsLoading(false);
    };

    let endPoint =
      routs.getMyOffers +
      `user/all?myoffers=yes&limit=10&page=1&language=${appLanguage === 'ar' ? 'arabic' : 'english'
      }`;

    if (filterLocation != '') {
      endPoint += `&km=${filterLocation}`;
    }

    if (filterDiscounts != '') {
      endPoint += `&discount=${filterDiscounts}`;
    }

    if (formattedCheckedStrings != '') {
      endPoint += `&category=${formattedCheckedStrings}`;
    }

    const method = Method.GET;
    const bodyParams = {};

    console.log('end Point: ', endPoint);

    setIsLoading(true);
    callApi(method, endPoint, bodyParams, onSuccess, onError);
  };

  const getMyOfferCategory = () => {
    const onSuccess = async response => {
      console.log('response get Map Category Home===', response?.categories);
      setIsLoading(false);

      const categories = response?.categories;

      const formattedCategories = categories.map((category, index) => {
        return {
          id: index + 1,
          title: category,
          checked: false,
        };
      });

      // Ensure 'Others' is the last object in the array
      const others = formattedCategories.find(item => item.title === 'Others');
      const otherIndex = formattedCategories.findIndex(
        item => item.title === 'Others',
      );

      if (otherIndex > -1) {
        formattedCategories.splice(otherIndex, 1); // Remove 'Others' from its current position
        formattedCategories.push(others); // Add 'Others' at the end
      }

      setCheckboxes(formattedCategories);
    };

    const onError = error => {
      console.log('Error get Map Category Home===', error);
      setIsLoading(false);
    };

    let endPoint =
      routs.getMyOffers +
      `categories?language=${appLanguage === 'ar' ? 'arabic' : 'english'}`;

    const method = Method.GET;
    const bodyParams = {};

    // setIsLoading(true);
    callApi(method, endPoint, bodyParams, onSuccess, onError);
  };

  useEffect(() => {
    const updatedCheckboxes = checkboxes.filter(checkbox => checkbox.checked);
    if (updatedCheckboxes.length > 0) {
      getMyOffers();
    }
  }, [checkboxes]);

  const handleCheckboxChange = checkboxId => {
    // ******************* Multiple Selection Code *******************
    // const updatedCheckboxes = checkboxes.map((checkbox) =>
    //     checkbox.id === checkboxId ? { ...checkbox, checked: !checkbox.checked } : checkbox
    // );

    // ******************* Single Selection Code *******************
    const updatedCheckboxes = checkboxes.map(checkbox =>
      checkbox.id === checkboxId
        ? { ...checkbox, checked: true }
        : { ...checkbox, checked: false },
    );

    setCheckboxes(updatedCheckboxes);
  };

  // const Markers = React.memo(({ markers }) => {
  //     return markers.map((item, index) => {
  //         return (
  //             <Marker
  //                 onPress={() => props.navigation.navigate(routes.storeList, { item })}
  //                 key={index}
  //                 title={item?.name}
  //                 // description={item?.description}
  //                 coordinate={{
  //                     latitude: item?.location?.coordinates[1],
  //                     longitude: item?.location?.coordinates[0],
  //                 }}>
  //                 <ImageBackground source={appIcons.otherMarker} style={index % 2 === 0 ? styles.markerImageEvenBackground : styles.markerImageBackground}>
  //                     <Image source={{ uri: item.image }} style={index % 2 === 0 ? [styles.markerEvenImage, { margin: wp(0.7), borderRadius: 50 }] : [styles.markerImage, { margin: wp(1), borderRadius: 50, resizeMode: 'cover' }]} />
  //                 </ImageBackground>
  //             </Marker>
  //         );
  //     });
  // });

  return (
    <View style={styles.container}>
      <Loader loading={isLoading} />
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={'dark-content'}
      />
      <MapView
        ref={mapRef}
        // showsUserLocation={true}
        // showsMyLocationButton={true}
        showsCompass={false}
        showsIndoors={false}
        zoomEnabled={true}
        zoomTapEnabled={true}
        style={styles.map}
        provider={
          Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
        }
        region={region}>
        {/* {
                     markers.length > 0 && (
                        <Markers markers={markers} />
                    )
                } */}

        {userLocation?.latitude !== 0 && (
          <Marker
            coordinate={{
              latitude: userLocation?.latitude,
              longitude: userLocation?.longitude,
            }}
            title={user?.name}>
            <ImageBackground
              source={appIcons.currentMarker}
              style={styles.currentMarkerImageBackground}>
              <Image
                source={{ uri: user?.image }}
                style={[
                  styles.markerImage,
                  { resizeMode: 'cover', borderRadius: 50 },
                ]}
              />
            </ImageBackground>
            <Image source={appIcons.line} style={styles.markerImage} />
          </Marker>
        )}
      </MapView>

      <SafeAreaView>
        <View
          style={{
            marginHorizontal: wp(5),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() =>
              props.navigation.navigate(routes.search, {
                discount: filterDiscounts,
                location: filterLocation,
                category: getCheckedLocalizedStrings(),
              })
            }>
            <Input
              editable={false}
              placeholder={LocalizedStrings.search}
              value={''}
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
                borderRadius: 5,
                width: wp(78),
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => props.navigation.navigate(routes.notification)}>
            <Image source={appIcons.notification} style={styles.rightIcon} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={checkboxes}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => {
            return (
              item.title != null && (
                <Pressable
                  key={index}
                  onPress={() => handleCheckboxChange(item.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginHorizontal: wp(1),
                    paddingVertical: wp(3),
                  }}>
                  <View
                    style={[
                      styles.filterView,
                      {
                        borderColor: item.checked
                          ? colors.primaryColor
                          : colors.borderColor,
                        borderWidth: 1,
                      },
                    ]}>
                    <Text style={[styles.filterText]}>{item.title}</Text>
                  </View>
                </Pressable>
              )
            );
          }}
        />

        {/* <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "space-evenly", marginTop: wp(5) }}>
                    <TouchableOpacity onPress={() => refCategorySheet.current.show()} activeOpacity={0.9} style={styles.filterView}>
                        <Text style={[styles.filterText]}>{getMultipleText().length > 0 ? getMultipleText().length > 8 ? `${getMultipleText().slice(0, 6)}...` : getMultipleText() : `${(LocalizedStrings.Category).slice(0, 7)}...`}</Text>
                        <Image source={appIcons.arrowDownFilter} style={styles.arrowDown} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => refDiscountSheet.current.show()} activeOpacity={0.9} style={styles.filterView}>
                        <Text style={styles.filterText}>{filterDiscounts != '' ? `${filterDiscounts}%` : LocalizedStrings.Discount}</Text>
                        <Image source={appIcons.arrowDownFilter} style={styles.arrowDown} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => refLocationSheet.current.show()} activeOpacity={0.9} style={styles.filterView}>
                        <Text style={styles.filterText}>{filterLocation != '' ? `${filterLocation} KM` : LocalizedStrings.Location}</Text>
                        <Image source={appIcons.arrowDownFilter} style={styles.arrowDown} />
                    </TouchableOpacity>
                </View> */}

        {/* <ActionSheet ref={refCategorySheet} headerAlwaysVisible={true}>
                    <FlatList
                        data={checkboxes}
                        keyExtractor={(item, index) => index.toString()}
                        ListHeaderComponent={
                            <Text style={[styles.headerText, { marginBottom: wp(5) }]}>{LocalizedStrings.Category}</Text>
                        }
                        renderItem={({ item, index }) => {
                            return (
                                <Pressable key={index} onPress={() => handleCheckboxChange(item.id)} style={{ flexDirection: "row", alignItems: "center", borderTopColor: colors.borderColor, borderTopWidth: 1, marginHorizontal: wp(3), paddingVertical: wp(3) }}>
                                    <View style={{ marginHorizontal: wp(2) }}>
                                        <CheckBox
                                            disabled={false}
                                            onFillColor={colors.primaryColor}
                                            onCheckColor='white'
                                            value={item.checked}
                                            onValueChange={() => Platform.OS == 'android' ? handleCheckboxChange(item.id) : console.log('Ok IOS')}
                                            boxType='square'
                                            onTintColor={colors.primaryColor}
                                            style={styles.checbox}
                                            hitSlop={{ top: 10, bottom: 10, left: 0, right: 0 }}
                                            tintColors={{ true: colors.primaryColor, false: colors.placeholderColor }} // Change tint colors if needed
                                        />
                                    </View>
                                    <Text style={styles.mainDes}>{item.title}</Text>
                                </Pressable>
                            )
                        }}
                    />
                </ActionSheet>

                <ActionSheet ref={refDiscountSheet} headerAlwaysVisible={true}>
                    <FlatList
                        data={discountArray}
                        keyExtractor={(item, index) => index.toString()}
                        ListHeaderComponent={
                            <Text style={[styles.headerText, { marginBottom: wp(5) }]}>{LocalizedStrings.Discount}</Text>
                        }
                        ListFooterComponent={
                            <View style={{ marginHorizontal: wp(3), paddingVertical: wp(3), borderTopColor: colors.borderColor, borderTopWidth: 1, }}>
                                <Input
                                    placeholder={LocalizedStrings.Other}
                                    onChangeText={(value) => setFilterDiscounts(value)}
                                    containerStyle={{
                                        borderRadius: 15,
                                        marginTop: -hp(5),
                                        marginBottom: hp(3),
                                        borderRadius: 5,
                                    }}
                                    WholeContainer={{
                                        borderRadius: 0,
                                    }}
                                />
                            </View>
                        }
                        renderItem={({ item, index }) => {
                            return (
                                <Pressable key={index} onPress={() => setFilterDiscounts(item.name)} style={{ flexDirection: "row", alignItems: "center", borderTopColor: colors.borderColor, borderTopWidth: 1, marginHorizontal: wp(3), paddingVertical: wp(3) }}>
                                    <View style={[styles.dotComponentActiveStyle, { borderWidth: 1.5, marginRight: wp(3) }]}>
                                        <View style={[styles.dotComponentStyle, { backgroundColor: filterDiscounts == item.name ? colors.primaryColor : 'transparent' }]} />
                                    </View>
                                    <Text style={styles.mainDes}>{item.name}%</Text>
                                </Pressable>
                            )
                        }}
                    />
                </ActionSheet>

                <ActionSheet ref={refLocationSheet} headerAlwaysVisible={true}>
                    <FlatList
                        data={locationArray}
                        keyExtractor={(item, index) => index.toString()}
                        ListHeaderComponent={
                            <Text style={[styles.headerText, { marginBottom: wp(5) }]}>{LocalizedStrings.Location}</Text>
                        }
                        ListFooterComponent={
                            <View style={{ marginHorizontal: wp(3), paddingVertical: wp(3), borderTopColor: colors.borderColor, borderTopWidth: 1, }}>
                                <Input
                                    placeholder={LocalizedStrings.Other}
                                    onChangeText={(value) => setFilterLocation(value)}
                                    containerStyle={{
                                        borderRadius: 15,
                                        marginTop: -hp(5),
                                        marginBottom: hp(3),
                                        borderRadius: 5,
                                    }}
                                    WholeContainer={{
                                        borderRadius: 0,
                                    }}
                                />
                            </View>
                        }
                        renderItem={({ item, index }) => {
                            return (
                                <Pressable key={index} onPress={() => setFilterLocation(item.name)} style={{ flexDirection: "row", alignItems: "center", borderTopColor: colors.borderColor, borderTopWidth: 1, marginHorizontal: wp(3), paddingVertical: wp(3) }}>
                                    <View style={[styles.dotComponentActiveStyle, { borderWidth: 1.5, marginRight: wp(3) }]}>
                                        <View style={[styles.dotComponentStyle, { backgroundColor: filterLocation == item.name ? colors.primaryColor : 'transparent' }]} />
                                    </View>
                                    <Text style={styles.mainDes}>{item.name} KM</Text>
                                </Pressable>
                            )
                        }}
                    />
                </ActionSheet> */}
      </SafeAreaView>

      <FilterModal
        modalShow={modalShow}
        setModalShow={() => setModalShow(!modalShow)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: Dimensions.get('screen').height,
    width: wp(100),
    zIndex: 100,
    position: 'absolute',
    paddingTop: Platform.OS == 'android' ? wp(10) : 0,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  pinIcon: {
    width: hp(10),
    height: hp(10),
    resizeMode: 'contain',
  },
  currentMarkerImageBackground: {
    width: wp(15),
    height: wp(15),
    resizeMode: 'contain',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerImage: {
    width: wp(12.5),
    height: wp(12.6),
    resizeMode: 'contain',
    alignSelf: 'center',
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
    alignSelf: 'center',
  },
  markerImageBackground: {
    width: wp(15),
    height: wp(18.8),
    resizeMode: 'contain',
  },
  rightIcon: {
    width: wp(8),
    height: wp(8),
    // alignSelf: "flex-end"
  },
  arrowDown: {
    width: wp(5),
    height: wp(5),
    resizeMode: 'contain',
  },
  filterView: {
    paddingHorizontal: wp(3),
    paddingVertical: wp(2),
    backgroundColor: colors.fullWhite,
    borderRadius: wp(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // width: wp(25)
  },
  filterText: {
    fontSize: hp(1.6),
    fontFamily: fontFamily.UrbanistMedium,
    color: colors.primaryColor,
    textAlign: 'center',
    lineHeight: 19,
    marginRight: wp(1),
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
    textAlign: 'center',
    lineHeight: 24,
  },
  headerText: {
    fontSize: hp(1.8),
    fontFamily: fontFamily.UrbanistBold,
    color: colors.BlackSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  checbox: {
    height: Platform.OS == 'ios' ? heightPixel(15) : heightPixel(20),
    width: Platform.OS == 'ios' ? widthPixel(15) : widthPixel(30),
  },
});
