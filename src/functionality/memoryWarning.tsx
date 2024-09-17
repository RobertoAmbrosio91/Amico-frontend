import { useEffect } from 'react';
import { AppState, Platform, Alert } from 'react-native';

const useMemoryWarning = () => {
  useEffect(() => {
    const handleMemoryWarning = () => {
      console.log('Memory Warning Logged');  // Log the memory warning to the console
      Alert.alert(
        'Memory Warning', 
        'The app is using too much memory. Some features may be disabled to improve performance.'
      );
      // You can add additional memory cleanup logic here
    };

    if (Platform.OS === 'ios') {
      const subscription = AppState.addEventListener('memoryWarning', handleMemoryWarning);
      return () => subscription.remove();  // Clean up the event listener when the component unmounts
    }
  }, []);
};

export default useMemoryWarning;
