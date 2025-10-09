


import React, { useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel, appIcons } from '../../../services';
import appStyles from '../../../services/utilities/appStyles';
import Header from '../../../components/header';
import { LocalizationContext } from '../../../language/LocalizationContext';

const PrivacyPolicy = (props) => {
    const { LocalizedStrings } = React.useContext(LocalizationContext);
    const scrollViewRef = useRef(null);
    const [scrollIndicatorHeight, setScrollIndicatorHeight] = useState(0);
    const [scrollIndicatorPosition, setScrollIndicatorPosition] = useState(0);

    const PrivacyPolicyList = [
        { id: 1, title: LocalizedStrings.acceptance_of_terms, desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent a sapien eleifend, viverra est at, consequat mauris. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum sed consectetur nisl. Curabitur efficitur enim at lacus faucibus porta.' },
        { id: 2, title: LocalizedStrings.user_responsibility, desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent a sapien eleifend, viverra est at, consequat mauris. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum sed consectetur nisl. Curabitur efficitur enim at lacus faucibus porta.' },
        { id: 3, title: LocalizedStrings.subscription_services, desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent a sapien eleifend, viverra est at, consequat mauris. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum sed consectetur nisl. Curabitur efficitur enim at lacus faucibus porta.' },
        { id: 4, title: LocalizedStrings.intellectual_property, desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent a sapien eleifend, viverra est at, consequat mauris. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum sed consectetur nisl. Curabitur efficitur enim at lacus faucibus porta.' },
        { id: 5, title: LocalizedStrings.limitation_of_loability, desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent a sapien eleifend, viverra est at, consequat mauris. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum sed consectetur nisl. Curabitur efficitur enim at lacus faucibus porta.' },
    ];

    const handleScroll = (event) => {
        const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
        console.log(contentOffset, layoutMeasurement, contentSize)
        const maxScroll = contentSize.height - layoutMeasurement.height;
        const position = Math.max(0, Math.min(contentOffset.y / maxScroll, 1));
        const visibleHeight = layoutMeasurement.height / contentSize.height * layoutMeasurement.height;
        // const height = Math.max(visibleHeight, layoutMeasurement.height);
        const height = layoutMeasurement.height * (layoutMeasurement.height / contentSize.height);
        const top = Math.min(layoutMeasurement.height - visibleHeight, layoutMeasurement.height * position);
        setScrollIndicatorPosition(top);
        setScrollIndicatorHeight(height);
    };

    const handleContentSizeChange = (contentWidth, contentHeight) => {
        setScrollIndicatorHeight(contentWidth);
    };

    return (
        <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
            <Header leftIcon onleftIconPress={() => props.navigation.goBack()} title={LocalizedStrings.privacy} />
            <View style={{ flex: 1, marginTop: wp(5) }}>
                <ScrollView
                    bounces={false}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    ref={scrollViewRef}
                    onContentSizeChange={handleContentSizeChange}
                >
                    {PrivacyPolicyList.map((item, index) => (
                        <View key={index} style={{ marginTop: wp(2) }}>
                            <Text style={[styles.mainTitle, { marginVertical: wp(2) }]}>{item.title}</Text>
                            <Text style={[styles.mainDesc]}>{item.desc}</Text>
                        </View>
                    ))}
                </ScrollView>
                <View style={[styles.scrollIndicator, { backgroundColor: colors.borderColor, height: Dimensions.get('screen').height / 1.18 }]}>
                    <View style={[styles.scrollIndicator, { backgroundColor: colors.primaryColor, height: scrollIndicatorHeight, top: scrollIndicatorPosition }]} />
                </View>
            </View>
        </SafeAreaView>
    );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingVertical: wp(2),
    },
    mainTitle: {
        fontSize: hp(1.6),
        fontFamily: fontFamily.UrbanistSemiBold,
        color: colors.BlackSecondary,
        lineHeight: 24,
        textAlign: "left"
    },
    mainDesc: {
        fontSize: hp(1.4),
        fontFamily: fontFamily.UrbanistRegular,
        color: 'rgba(102, 102, 102, 1)',
        lineHeight: 22,
        textAlign: "left"
    },
    scrollIndicator: {
        position: 'absolute',
        right: 0,
        width: 4,
        borderRadius: 2,
    },
});
