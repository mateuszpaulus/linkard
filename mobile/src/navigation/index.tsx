import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "@clerk/clerk-expo";
import { View, ActivityIndicator } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import SignInScreen from "../screens/SignInScreen";
import DashboardScreen from "../screens/DashboardScreen";
import PublicProfileScreen from "../screens/PublicProfileScreen";

export type RootStackParamList = {
  Home: undefined;
  SignIn: undefined;
  Dashboard: undefined;
  PublicProfile: { username: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#18181b" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isSignedIn ? (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen
            name="PublicProfile"
            component={PublicProfileScreen}
            options={{ headerShown: true, title: "Profil" }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ headerShown: true, title: "" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
