import React from 'react';
import { SafeAreaView, LogBox, View, Platform, StatusBar, StyleSheet } from 'react-native';
import { persistStore } from 'redux-persist';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { MainNavigator } from './src/services/navigation';
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
                <View style={styles.container}>
                  <MainNavigator />
                </View>
                :
                <SafeAreaView style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
