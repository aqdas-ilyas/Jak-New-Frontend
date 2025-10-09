// // import React, { useState } from 'react';
// // import { View, Text, Image, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, FlatList } from 'react-native';
// // import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel, appIcons } from '../../../services';
// // import appStyles from '../../../services/utilities/appStyles';
// // import Header from '../../../components/header';

// // const termsList = [
// //     { id: 1, title: 'Acceptance of Terms:', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent a sapien eleifend, viverra est at, consequat mauris. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum sed consectetur nisl. Curabitur efficitur enim at lacus faucibus porta.' },
// //     { id: 2, title: 'user Responsibility:', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent a sapien eleifend, viverra est at, consequat mauris. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum sed consectetur nisl. Curabitur efficitur enim at lacus faucibus porta.' },
// //     { id: 3, title: 'Subscription Services:', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent a sapien eleifend, viverra est at, consequat mauris. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum sed consectetur nisl. Curabitur efficitur enim at lacus faucibus porta.' },
// //     { id: 4, title: 'Intellectual Property:', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent a sapien eleifend, viverra est at, consequat mauris. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum sed consectetur nisl. Curabitur efficitur enim at lacus faucibus porta.' },
// //     { id: 5, title: 'Limitation of Loability:', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent a sapien eleifend, viverra est at, consequat mauris. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum sed consectetur nisl. Curabitur efficitur enim at lacus faucibus porta.' },
// // ];

// // const Terms = (props) => {
// //     return (
// //         <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
// //             <Header leftIcon onleftIconPress={() => props.navigation.goBack()} title="Terms of Service" />
// //             <View style={{ flex: 1, marginTop: wp(5) }}>
// //                 <ScrollView
// //                     style={styles.scrollView}
// //                     showsVerticalScrollIndicator={false}
// //                     contentContainerStyle={styles.scrollViewContent}
// //                 >
// //                     {termsList.map((item, index) => (
// //                         <View key={index} style={{ marginTop: wp(2) }}>
// //                             <Text style={[styles.mainTitle, { marginVertical: wp(2) }]}>{item.title}</Text>
// //                             <Text style={[styles.mainDesc]}>{item.desc}</Text>
// //                         </View>
// //                     ))}
// //                 </ScrollView>
// //             </View>
// //         </SafeAreaView>
// //     );
// // };

// // export default Terms;

// // const styles = StyleSheet.create({
// //     scrollView: {
// //         flex: 1,
// //     },
// //     scrollViewContent: {
// //         paddingVertical: wp(2),
// //     },
// //     mainTitle: {
// //         fontSize: hp(1.6),
// //         fontFamily: fontFamily.UrbanistSemiBold,
// //         color: colors.BlackSecondary,
// //         lineHeight: 24,
// //     },
// //     mainDesc: {
// //         fontSize: hp(1.4),
// //         fontFamily: fontFamily.UrbanistRegular,
// //         color: 'rgba(102, 102, 102, 1)',
// //         lineHeight: 22,
// //     },
// // });


// import React, { useState, useRef } from 'react';
// import { View, Text, Image, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, FlatList } from 'react-native';
// import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel, appIcons } from '../../../services';
// import appStyles from '../../../services/utilities/appStyles';
// import Header from '../../../components/header';

// const termsList = [
//     { id: 1, title: 'Acceptance of Terms:', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent a sapien eleifend, viverra est at, consequat mauris. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum sed consectetur nisl. Curabitur efficitur enim at lacus faucibus porta.' },
//     { id: 2, title: 'user Responsibility:', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent a sapien eleifend, viverra est at, consequat mauris. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum sed consectetur nisl. Curabitur efficitur enim at lacus faucibus porta.' },
//     { id: 3, title: 'Subscription Services:', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent a sapien eleifend, viverra est at, consequat mauris. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum sed consectetur nisl. Curabitur efficitur enim at lacus faucibus porta.' },
//     { id: 4, title: 'Intellectual Property:', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent a sapien eleifend, viverra est at, consequat mauris. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum sed consectetur nisl. Curabitur efficitur enim at lacus faucibus porta.' },
//     { id: 5, title: 'Limitation of Loability:', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent a sapien eleifend, viverra est at, consequat mauris. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum sed consectetur nisl. Curabitur efficitur enim at lacus faucibus porta.' },
// ];

// const Terms = (props) => {
//     const scrollViewRef = useRef(null);
//     const [scrollIndicatorHeight, setScrollIndicatorHeight] = useState(0);
//     const [scrollIndicatorPosition, setScrollIndicatorPosition] = useState(0);

//     const handleScroll = (event) => {
//         const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
//         const position = contentOffset.y / (contentSize.height - layoutMeasurement.height);
//         const height = layoutMeasurement.height * (layoutMeasurement.height / contentSize.height);
//         setScrollIndicatorPosition(layoutMeasurement.height * position);
//         setScrollIndicatorHeight(height);
//     };

//     return (
//         <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
//             <Header leftIcon onleftIconPress={() => props.navigation.goBack()} title="Terms of Service" />
//             <View style={{ flex: 1, marginTop: wp(5) }}>
//                 <ScrollView
//                     bounces={false}
//                     style={styles.scrollView}
//                     contentContainerStyle={styles.scrollViewContent}
//                     onScroll={handleScroll}
//                     scrollEventThrottle={16}
//                     showsVerticalScrollIndicator={false}
//                     ref={scrollViewRef}
//                 >
//                     {termsList.map((item, index) => (
//                         <View key={index} style={{ marginTop: wp(2) }}>
//                             <Text style={[styles.mainTitle, { marginVertical: wp(2) }]}>{item.title}</Text>
//                             <Text style={[styles.mainDesc]}>{item.desc}</Text>
//                         </View>
//                     ))}
//                 </ScrollView>
//                 <View style={[styles.scrollIndicator, { backgroundColor: colors.borderColor, height: wp(182) }]}>
//                     <View style={[styles.scrollIndicator, { backgroundColor: colors.primaryColor, height: scrollIndicatorHeight, top: scrollIndicatorPosition }]} />
//                 </View>
//             </View>
//         </SafeAreaView>
//     );
// };

// export default Terms;

// const styles = StyleSheet.create({
//     scrollView: {
//         flex: 1,
//     },
//     scrollViewContent: {
//         paddingVertical: wp(2),
//     },
//     mainTitle: {
//         fontSize: hp(1.6),
//         fontFamily: fontFamily.UrbanistSemiBold,
//         color: colors.BlackSecondary,
//         lineHeight: 24,
//     },
//     mainDesc: {
//         fontSize: hp(1.4),
//         fontFamily: fontFamily.UrbanistRegular,
//         color: 'rgba(102, 102, 102, 1)',
//         lineHeight: 22,
//     },
//     scrollIndicator: {
//         position: 'absolute',
//         right: 0,
//         width: 4,
//         borderRadius: 2,
//     },
// });


import React, { useState, useRef, useEffect } from 'react';
import { View, Text, useWindowDimensions, Image, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { colors, hp, fontFamily, wp, routes, heightPixel, widthPixel, appIcons } from '../../../services';
import appStyles from '../../../services/utilities/appStyles';
import Header from '../../../components/header';
import { LocalizationContext } from '../../../language/LocalizationContext';
import routs from '../../../api/routs';
import { callApi, Method } from '../../../api/apiCaller';
import { Loader } from '../../../components/loader/Loader';
import RenderHtml from 'react-native-render-html';

const Terms = (props) => {
    const { width } = useWindowDimensions();
    const { LocalizedStrings } = React.useContext(LocalizationContext);
    const scrollViewRef = useRef(null);
    const [scrollIndicatorHeight, setScrollIndicatorHeight] = useState(0);
    const [scrollIndicatorPosition, setScrollIndicatorPosition] = useState(0);
    const [isLoading, setIsLoading] = useState(false)
    const [termstext, setTermsText] = useState('')
    const [privacytext, setPrivacyText] = useState('')

    const termsList = [
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

    useEffect(() => {
        _termsandcondition()
        _privacy()
    }, [])

    const _termsandcondition = () => {
        const onSuccess = response => {
            setIsLoading(false);
            console.log('response _termsandcondition===', response?.data?.data[0]?.data);
            setTermsText(response?.data?.data[0]?.data)
        };

        const onError = error => {
            setIsLoading(false);
            console.log('Error _termsandcondition===', error);
        };

        const endPoint = routs.termsandcondition;
        const method = Method.GET;
        const bodyParams = {};

        setIsLoading(true);
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    };

    const _privacy = () => {
        const onSuccess = response => {
            setIsLoading(false);
            console.log('response _privacy===', response);
            setPrivacyText(response?.data?.data[0]?.data)
        };

        const onError = error => {
            setIsLoading(false);
            console.log('Error _privacy===', error);
        };

        const endPoint = routs.privacy;
        const method = Method.GET;
        const bodyParams = {};

        setIsLoading(true);
        callApi(method, endPoint, bodyParams, onSuccess, onError);
    };


    return (
        <SafeAreaView style={[appStyles.safeContainer, { margin: wp(4) }]}>
            <Loader loading={isLoading} />
            <Header leftIcon onleftIconPress={() => props.navigation.goBack()} title={`${LocalizedStrings.terms} & ${LocalizedStrings.privacy}`} />
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
                    <RenderHtml
                        contentWidth={width}
                        source={{ html: `${termstext}` }}
                        tagsStyles={{
                            h1: {
                                fontSize: hp(1.6),
                                fontFamily: fontFamily.UrbanistSemiBold,
                                color: colors.BlackSecondary,
                                lineHeight: 24,
                                textAlign: "left"
                            }
                        }}
                    />

                    <RenderHtml
                        contentWidth={width}
                        source={{ html: `${privacytext}` }}
                        tagsStyles={{
                            h1: {
                                fontSize: hp(1.6),
                                fontFamily: fontFamily.UrbanistSemiBold,
                                color: colors.BlackSecondary,
                                lineHeight: 24,
                                textAlign: "left"
                            }
                        }}
                    />
                    {/* {termsList.map((item, index) => (
                        <View key={index} style={{ marginTop: wp(2) }}>
                            <Text style={[styles.mainTitle, { marginVertical: wp(2) }]}>{item.title}:</Text>
                            <Text style={[styles.mainDesc]}>{item.desc}</Text>
                        </View>
                    ))} */}
                </ScrollView>

                <View style={[styles.scrollIndicator, { backgroundColor: colors.borderColor, height: Dimensions.get('screen').height / 1.18 }]}>
                    <View style={[styles.scrollIndicator, { backgroundColor: colors.primaryColor, height: scrollIndicatorHeight, top: scrollIndicatorPosition }]} />
                </View>
            </View>
        </SafeAreaView>
    );
};

export default Terms;

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
        width: 4,
        right: 0,
        borderRadius: 2,
    },
});
