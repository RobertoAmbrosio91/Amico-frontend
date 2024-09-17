import React from 'react';
import { View, TextInput, StyleSheet, TextStyle, ViewStyle, } from 'react-native';
import colors from '../../config/colors';

interface SignupInputProps {
  name?: string;
  placeholder?: string;
  placeholderColor?: string;
  _id?: string;
  secure_Text_Entry?: boolean;
  onChangeText?: (text: string) => void;
  multiline?: boolean;
  style?: TextStyle;
  editable?: boolean;
  containerStyle?: ViewStyle;
  value?: string;
}


const SignupInput: React.FC<SignupInputProps> = ({
  placeholder,
  placeholderColor,
  _id,
  secure_Text_Entry,
  onChangeText,
  multiline,
  style,
  editable,
  containerStyle,
  value,
}) => {
  return (
    <View style={[styles.inputContainer, containerStyle]}>
      <TextInput
        placeholder={placeholder}
        style={[styles.input, style]}
        secureTextEntry={secure_Text_Entry}
        id={_id}
        onChangeText={onChangeText}
        placeholderTextColor={placeholderColor}
        multiline={multiline}
        editable={editable}
        value={value}
      />
    </View>
  );
};




const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
  },

  input: {
    paddingHorizontal: 15,
    width: "100%",
    color: colors.primary,
    backgroundColor: "#fff",
    height: 40,
    borderRadius: 4,
    borderColor: colors.__blue_dark,
    borderWidth: 1,
  },
});

export default SignupInput;
