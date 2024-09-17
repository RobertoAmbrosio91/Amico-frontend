import React, { useEffect, useState } from "react";
import {  
  Keyboard, Platform, 
} from "react-native";

export const hideKeyboard=()=>{
    if( Platform.OS!=="web"){
        Keyboard.dismiss()
    }
}