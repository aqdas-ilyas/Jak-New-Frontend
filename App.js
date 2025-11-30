import React from 'react';
import { SafeAreaView, LogBox, View, Text, Platform, StatusBar } from 'react-native';
import { persistStore } from 'redux-persist';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { MainNavigator } from './src/services';
import { LocalizationProvider } from './src/language/LocalizationContext';
import { store } from './src/store/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';

LogBox.ignoreLogs(['Warning: ...']);
LogBox.ignoreAllLogs();

const App = () => {
  let persistor = persistStore(store);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <LocalizationProvider>
          <StatusBar
            barStyle={'dark-content'}
            backgroundColor={Platform.OS === 'android' ? '#fff' : undefined}
            translucent={Platform.OS === 'android'}
          />
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
          </PersistGate>
        </LocalizationProvider>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;
