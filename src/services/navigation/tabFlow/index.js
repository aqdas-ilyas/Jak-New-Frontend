import React, { useEffect } from 'react';
import { StyleSheet, Image, View, TouchableOpacity, Platform, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { appIcons, colors, fontFamily } from '../../utilities';
import { hp, wp } from '../../constants';
import { HomeNavigation } from '../homeFlow';
import { FavouriteNavigation } from '../favouriteFlow';
import { OfferNavigation } from '../offerFlow';
import { SettingNavigation } from '../profileFlow';
import { WalletNavigation } from '../walletFlow';
import { LocalizationContext } from '../../../language/LocalizationContext';
import { useRTL } from '../../../language/useRTL';
import { useNavigation } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

const TabButton = props => {
  const { isRTL, rtlStyles } = useRTL();
  const { item, onPress, accessibilityState } = props;
  const focused = accessibilityState.selected;

  return (
    <TouchableOpacity disabled={item.disabled} onPress={() => [onPress()]} activeOpacity={1} style={[styles.container,]}>
      <View style={[styles.btn, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={{ alignItems: 'center' }}>
          <Image source={focused ? item.iconfill : item.iconUnfill} style={[styles.tabIcon, { tintColor: focused ? colors.primaryColor : colors.inActiveText }]} />
          <Text style={[styles.bottomText, rtlStyles.writingDirection, { marginTop: isRTL ? 0 : wp(2), color: focused ? colors.primaryColor : colors.inActiveText }]}>{item.route}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export function TabNavigation() {
  const { LocalizedStrings } = React.useContext(LocalizationContext);
  const { isRTL } = useRTL();
  const navigation = useNavigation();

  const baseTabs = [
    // {
    //   route: LocalizedStrings.home,
    //   iconfill: appIcons.homeFill,
    //   iconUnfill: appIcons.homeUnfill,
    //   component: HomeNavigation,
    //   color: colors.primaryColor,
    //   disabled: false,
    // },
    {
      // route: LocalizedStrings.offers,
      route: LocalizedStrings.home,
      iconfill: appIcons.documentFill,
      iconUnfill: appIcons.documentUnfill,
      component: OfferNavigation,
      color: colors.theme,
      disabled: false,
    },
    {
      // route: LocalizedStrings.wallet,
      route: LocalizedStrings['Loyal Cards'],
      iconfill: appIcons.loyalty,
      iconUnfill: appIcons.loyalty,
      component: WalletNavigation,
      color: colors.theme,
      disabled: false,
    },
    {
      route: LocalizedStrings.favorite,
      iconfill: appIcons.heartFill,
      iconUnfill: appIcons.heartUnfill,
      component: FavouriteNavigation,
      color: colors.theme,
      disabled: false,
    },
    {
      route: LocalizedStrings.settings,
      iconfill: appIcons.settingFill,
      iconUnfill: appIcons.settingUnfill,
      component: SettingNavigation,
      color: colors.theme,
      disabled: false,
    },
  ]

  const tabArray = React.useMemo(() => {
    return isRTL ? [...baseTabs].reverse() : baseTabs;
  }, [isRTL, baseTabs]);

  useEffect(() => {
    const homeRouteName = LocalizedStrings.home;
    if (homeRouteName) {
      navigation.navigate(homeRouteName);
    }
  }, [navigation, LocalizedStrings.home]);

  return (
    <Tab.Navigator
      initialRouteName={LocalizedStrings.home}
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.barStyle,
        tabBarHideOnKeyboard: true
      }}>
      {tabArray.map((item, index) => {
        return (
          <Tab.Screen
            key={index}
            name={item.route}
            component={item.component}
            options={{
              tabBarButton: props => <TabButton {...props} item={item} />,
            }}
          />
        );
      })}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  barStyle: {
    backgroundColor: colors.fullWhite,
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    height: hp(10),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingTop: Platform.OS == 'ios' ? wp(5) : 0,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.20,
    shadowRadius: 3.84,
    elevation: 10,
    borderTopWidth: 0,
  },
  tabIcon: {
    width: wp(7),
    height: wp(7),
    resizeMode: 'contain',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  bottomText: {
    fontFamily: fontFamily.UrbanistMedium,
    fontSize: hp(1.4),
  }
});