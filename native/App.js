import 'react-native-gesture-handler';
import React, { useEffect, useState, createContext, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { initI18n, toggleLang, t } from './src/i18n';
import { theme } from './src/theme';
import HomeScreen from './src/screens/HomeScreen';
import BrowseScreen from './src/screens/BrowseScreen';
import DetailScreen from './src/screens/DetailScreen';
import PostScreen from './src/screens/PostScreen';
import InquiriesScreen from './src/screens/InquiriesScreen';

const Tab = createBottomTabNavigator();
const BrowseStack = createNativeStackNavigator();

const LangContext = createContext({ lang: 'en', toggle: async () => {} });
export const useLang = () => useContext(LangContext);

function HeaderRight() {
  const { lang, toggle } = useLang();
  return (
    <TouchableOpacity onPress={toggle} style={styles.langBtn}>
      <Text style={styles.langTxt}>{t('language')}</Text>
    </TouchableOpacity>
  );
}

function BrowseStackScreen() {
  return (
    <BrowseStack.Navigator screenOptions={{ headerRight: () => <HeaderRight /> }}>
      <BrowseStack.Screen name="BrowseList" component={BrowseScreen} options={{ title: t('tabBrowse') }} />
      <BrowseStack.Screen name="Detail" component={DetailScreen} options={{ title: t('tabBrowse') }} />
    </BrowseStack.Navigator>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerRight: () => <HeaderRight />,
        tabBarActiveTintColor: theme.brand,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: { backgroundColor: theme.card, borderTopColor: theme.line },
        headerStyle: { backgroundColor: theme.card },
        headerTitleStyle: { color: theme.ink },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('tabHome') }} />
      <Tab.Screen name="Browse" component={BrowseStackScreen} options={{ title: t('tabBrowse') }} />
      <Tab.Screen name="Post" component={PostScreen} options={{ title: t('tabPost') }} />
      <Tab.Screen name="Inquiries" component={InquiriesScreen} options={{ title: t('tabInq') }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [lang, setLang] = useState('en');

  useEffect(() => {
    (async () => {
      const l = await initI18n();
      setLang(l);
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.brand} />
      </View>
    );
  }

  const value = {
    lang,
    toggle: async () => {
      const next = await toggleLang();
      setLang(next);
    },
  };

  return (
    <LangContext.Provider value={value}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <NavigationContainer>
          <Tabs />
        </NavigationContainer>
      </SafeAreaProvider>
    </LangContext.Provider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  langBtn: { paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  langTxt: { color: theme.brand, fontSize: 13, fontWeight: '600' },
});
