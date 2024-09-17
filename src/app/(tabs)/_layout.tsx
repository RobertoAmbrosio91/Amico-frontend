import colors from "src/config/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { Tabs, useGlobalSearchParams } from "expo-router";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof MaterialIcons>["name"];
  color: string;
  size: number;
}) {
  return <MaterialIcons style={{ paddingTop: 0 }} {...props} />;
}

export default function TabLayout() {
  const isStories = useGlobalSearchParams().is_story === "yes" ? true : false;
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.__amico_blue,
        headerShown: false,
        tabBarStyle: {
          maxWidth: 800,
          width: "100%",
          height: Platform.OS === "android" ? "8.1%" : "10%",
          paddingBottom: Platform.OS === "android" ? 5 : 20,
          paddingTop: 5,
          backgroundColor: "#fff",
          display: isStories ? "none" : "flex",
        },
      }}
    >
      <Tabs.Screen
        name="myeventsrevisited"
        options={{
          headerShown: false,
          title: "Home",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="home-filled" color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="searchusers"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="search" color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="createevent"
        options={{
          title: "Create",
          tabBarIcon: ({ color }) => (
            <TabBarIcon
              name="add-circle"
              color={colors.__main_background}
              size={50}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="myfriends"
        options={{
          title: "My Friends",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="groups" color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="person-outline" color={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
