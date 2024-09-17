import {  Stack } from 'expo-router';




export default function StackLayoutLogin() {

  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="landing"
        options={{
          headerShown: false,
          title: 'Landing',
        }}
      />
      <Stack.Screen
  name="login"
  options={{
    title: "Login",
    headerShown: false,
  }}
/>
<Stack.Screen
  name="signup"
  options={{
    title: "Signup",
    headerShown: false,
  }}
/>
<Stack.Screen
  name="resetpassword"
  options={{
    title: "Reset Password",
    headerShown: false,
  }}
/>
    </Stack>
  );
}