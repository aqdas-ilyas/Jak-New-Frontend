import React from 'react';
import { SafeAreaView, LogBox, View, Text, Platform, StatusBar } from 'react-native';
import { persistStore } from 'redux-persist';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import FlashMessage from 'react-native-flash-message';
import { MainNavigator } from './src/services';
import { LocalizationProvider } from './src/language/LocalizationContext';
import { store } from './src/store/store';

LogBox.ignoreLogs(['Warning: ...']);
LogBox.ignoreAllLogs();

const App = () => {
  let persistor = persistStore(store);


  return (
    <Provider store={store}>
      <LocalizationProvider>
        {/* <StatusBar barStyle={'dark-content'} backgroundColor='#fff' /> */}
        <StatusBar translucent backgroundColor="transparent" />
        <PersistGate loading={null} persistor={persistor}>
          {
            Platform.OS === 'ios' ?
              <View style={{ flex: 1 }}>
                <MainNavigator />
              </View>
              :
              <SafeAreaView style={{ flex: 1 }}>
                <MainNavigator />
              </SafeAreaView>
          }
          <FlashMessage position='bottom' />
        </PersistGate>
      </LocalizationProvider>
    </Provider>
  );
};

export default App;
