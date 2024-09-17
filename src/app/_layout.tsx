import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useAppFonts } from '../../src/functionality/loadFonts';
import * as Linking from 'expo-linking';
import colors from 'src/config/colors';
import * as Sentry from "@sentry/react-native";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "/",
};

SplashScreen.preventAutoHideAsync();

Sentry.init({
  dsn: "https://adcaa413c108235ba9228f3856d1f165@o4505910114123776.ingest.us.sentry.io/4505910163406848",
  debug: false, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
  // integrations: [
  //   new Sentry.ReactNativeTracing({
  //     routingInstrumentation,
  //   }),
  // ],
});

function RootLayout() {
  const fontsLoaded = useAppFonts();
  const router = useRouter();
  useEffect(function linkingWorkaround() {
    Linking.addEventListener("url", ({ url }) => {
      // console.log("url", url);
      const regex = /^noosk:\/\/(.*)|https:\/\/noosk\.co\/(.*)/;
      const match = url.match(regex);
      if (match) {
        const path = match[1] || match[2];
        // console.log("path", path);
        router.push(path);
      }
    });
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // or a splash/loading screen
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(registration)" options={{ headerShown: false }} />
        <Stack.Screen
          name="user/[id]"
          options={{
            headerShown: false,
            // headerBackTitleVisible: false,
            // headerStyle: { backgroundColor: colors.__secondary_background },
            // headerTintColor: colors.__main_background,
            presentation: "modal",
          }}
        />
        <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="chunckupload" options={{ headerShown: false }} />
        <Stack.Screen name="eventrecap/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="onboarding/categories"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="onboarding/createusername"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="onboarding/setupprofile"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="onboarding/userverification"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="privacy_policy"
          options={{ headerShown: true, headerBackTitleVisible: false }}
        />
        <Stack.Screen name="event/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="amicoevent/[id]" options={{ headerShown: false }} />
        {/* <Stack.Screen
          name="event/eventrecap"
          options={{ headerShown: false }}
        /> */}
        <Stack.Screen name="album/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="memory/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="onboarding/firstlastname"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="onboarding/nationalities"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="onboarding/languages"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="onboarding/petprofile"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="onboarding/invitefriends"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="onboarding/profilereview"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="event/eventdetails"
          options={{ headerShown: false, presentation: "modal" }}
        />
        {/* <Stack.Screen name="searchusers" options={{ headerShown: false }} /> */}
        <Stack.Screen
          name="settings"
          options={{ headerShown: false, presentation: "modal" }}
        />
      </Stack>
    </ThemeProvider>
  );
}

export default Sentry.wrap(RootLayout);