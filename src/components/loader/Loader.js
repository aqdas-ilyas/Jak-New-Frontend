import React from 'react';
import { View } from 'react-native'; // Import Modal from 'react-native'
import Spinner from 'react-native-loading-spinner-overlay';

export const Loader = props => {
    const { loading } = props;
    return (
        <View>
            <Spinner
                visible={loading}
                animation={'fade'}
                textStyle={{ color: 'white', fontSize: 16 }}
            />
        </View>
    );
};