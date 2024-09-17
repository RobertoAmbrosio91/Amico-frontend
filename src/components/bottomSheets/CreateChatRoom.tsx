import { Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import typography from 'src/config/typography';
import useFetchUserDataAsync from '@/hooks/async_storage/useFetchUserDataAsync';
import fetchAllCategories from '@/hooks/categories/fetchAllCategories';
import colors from 'src/config/colors';
import { Ionicons,AntDesign } from "@expo/vector-icons";
import CustomButton from '../buttons&inputs/CustomButton';
import { createChatRoom } from '@/hooks/chat/chatApi';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
type CreateChatRoomProps = {
    modalRef:React.MutableRefObject<any>;
    token:string | undefined;
    subcategory?:string;
    userCategories?:any;
};
type CategoryProp={
    _id:string;
    category:object;
    name:string
  }
const CreateChatRoomModal:React.FC<CreateChatRoomProps> = ({modalRef,token,subcategory,userCategories}) => {
    const router=useRouter();
    const initialSubCat=subcategory ? subcategory : "";
    const [categories,setCategories]=useState<CategoryProp[]>();
    const [chatName,setChatName]=useState<string>("");
    const [filteredCategories, setFilteredCategories] = useState<CategoryProp[] | null>(null); // Initialize as null
    const [selectedCategories,setSelectedCategories]=useState<CategoryProp[]|null>()
    const [selectedCategoryId,setSelectedCategoryId]=useState<string[]>();
    const currentUser=useFetchUserDataAsync();
    const [subCategory,setSubCategory]=useState<string>(initialSubCat);
    const canCreateChat= subcategory ? currentUser?.subcategory_id.includes(subcategory || "") && currentUser.user_type==="sharer" : currentUser?.user_type==="sharer"; 
    const isDisabled=chatName.length>0 && subCategory.length>0 ?false:true;
    const [isKeyboardVisible, setKeyboardVisible] = useState<boolean>(false);
    const snappingPpoints=isKeyboardVisible ? ["90%"] : canCreateChat?["70%"]:["30%"];
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
    const searchCategories = (value:string) => {
        if (categories) {
            if (value.trim() === "") {
                setFilteredCategories(null); // Clear the filteredCategories when value is empty
            } else {
                const filtered = categories.filter((item) => item.name.includes(value));
                setFilteredCategories(filtered);
            }
        }
    };
    const handleSelectCategories=(category:CategoryProp)=>{
        const isSelected=selectedCategories?.includes(category);
        const maximumReached=selectedCategories && selectedCategories?.length >=4 ;
        if(isSelected){
            setSelectedCategories((prevSelected)=>prevSelected?.filter((prevCategory) => prevCategory !== category))
            setSelectedCategoryId((prevId)=>prevId?.filter((id)=>id !== category._id))
        }else if(!maximumReached){
        setSelectedCategories((prevCat)=>[...prevCat || [],category]);
        setSelectedCategoryId((prevId)=>[...prevId || [],category._id])
        }
    }
    const resetModal=()=>{
        setChatName("");
        setFilteredCategories([]);
        setSelectedCategories([]);
        modalRef.current?.dismiss();
    }


    

    const handleCreateChatRoom=async()=>{
        if(token && subCategory){
            const createChat=await createChatRoom(chatName,subCategory,token,selectedCategoryId);
            const success=createChat.success;
            const _id=createChat.result._id;
            if (success){
                resetModal();
                router.push({pathname:`/chat/${_id}`});
            } 
            else{console.log("error creating a chat")}
        }
    }

      
  useEffect(()=>{
    if(currentUser){
        try {
            const fetchCategories=async()=>{
                const fetchedCategories=await fetchAllCategories(currentUser.token);
                if(fetchedCategories.length>0){
                    setCategories(fetchedCategories);
                }
            }
            fetchCategories();
        
        } catch (error:any) {
            console.log("Something went wrong fetching categories",error)
        }
    }
  },[currentUser])

    return (
    <BottomSheetModal index={0} snapPoints={snappingPpoints} ref={modalRef} backgroundStyle={{ 
        backgroundColor: "#EFEFEF",
       }}>
        {canCreateChat ? 
            <View style={styles.wrapper}>
               <TouchableOpacity
                    style={{alignSelf:"flex-end"}}
                    onPress={() => {
                        modalRef.current?.dismiss();
                    }}
                >
                    <AntDesign name="close" size={24} color="black" />
                </TouchableOpacity>
         <Text style={styles.title}>Start a Discussion</Text>
          {userCategories!== undefined && 
                <View>
                    <Text>Select a category</Text>
                    <View style={{flexDirection:"row", flexWrap:"wrap", columnGap:10}}>
                        {userCategories.map((item:any,index:number)=>{
                        return(
                            <TouchableOpacity key={index} style={subCategory===item._id ?styles.userCategorySelected :styles.userCategory} onPress={()=>setSubCategory(item._id)}>
                                <Text >{item.name}</Text>
                            </TouchableOpacity>
                        )
                    })}
                    </View>
                </View>
                }
         <Text>Title</Text>
         <CustomInput name={"ex Global finance.."} onChangeText={(value:string)=>setChatName(value)}/>
         <Text>Add related fields</Text>
         <View style={{flexWrap:"wrap",flexDirection:"row",columnGap:5}}>
            {selectedCategories && selectedCategories.map((item,index)=>{
                return(
                    <SelectedCategory 
                    category={item} 
                    key={index} 
                    handleSelectCategories={handleSelectCategories}
                    />
                )
            })}
            
         </View>
         <CustomInput name={"search category, ex finance"} onChangeText={(value:string)=>searchCategories(value)}/>
         <View style={{flexWrap:"wrap",flexDirection:"row",columnGap:7}}>
            {filteredCategories && filteredCategories.map((category,index)=>{
                return(
                    <Category 
                    category={category} 
                    key={index} 
                    handleSelectCategories={handleSelectCategories}
                    />
                )
            })}
            
         </View>
         <View style={styles.buttonContainer}>
            <CustomButton 
            text={"Create Discussion"} 
            borderStyle={[styles.button,isDisabled?{backgroundColor:colors.__disabled_button}:{}]} 
            textStyle={styles.textButton} 
            onPress={()=>handleCreateChatRoom()}
            disabled={isDisabled}
            />
         </View>
        </View>
        :
        <View style={styles.wrapper}>
            <View style={{alignSelf:"center"}}>
                <MaterialCommunityIcons name="emoticon-sad-outline" size={30} color="black" />
            </View>
            <Text style={[styles.title,{fontSize:16}]}>
                We are sorry, but you can only create discussions in your areas of expertise
            </Text>
        </View>
        }
        
    </BottomSheetModal>
   
  )
}

const CustomInput=({name,onChangeText}:{name:string,onChangeText?:any,})=>{
    return(
        <View>
            <TextInput placeholder={name} style={styles.input} onChangeText={onChangeText}/>
        </View>
    )
}

const Category=({category,handleSelectCategories}:{category:CategoryProp,handleSelectCategories:any})=>{
    return(
            <TouchableOpacity style={styles.category}onPress={()=>handleSelectCategories(category)}>
                <Text>{category.name}</Text>
            </TouchableOpacity>
    )
}

const SelectedCategory=({category,handleSelectCategories}:{category:CategoryProp,handleSelectCategories:any})=>{
    return(
        <TouchableOpacity style={styles.selectedCategory} onPress={()=>handleSelectCategories(category)}>
            <Text>#{category.name}</Text>
            <Ionicons name="close" size={15} color="#000" />
        </TouchableOpacity>
    )
}

export default CreateChatRoomModal

const styles = StyleSheet.create({
    wrapper:{
        padding:15,
        rowGap:10,
        flex:1,
    },
    title:{
    fontFamily:typography.appFont[500],
    textAlign:"center",
    fontSize:18
    },
    input:{
        borderWidth:1,
        borderColor:"#acacac",
        padding:9,
        borderRadius:4
    },
    category:{
        borderColor:colors.__main_blue,
        borderWidth:1,
        padding:5,
        borderRadius:4,
        marginTop:5
    },
    selectedCategory:{
        borderColor:colors.__main_blue,
        borderWidth:1,
        padding:5,
        borderRadius:4,
        marginTop:5,
        flexDirection:"row",
        alignItems:"center"
    },
    button:{
        backgroundColor:colors.__teal_light
    },
    textButton:{
        fontFamily:typography.appFont[600]
    },
    buttonContainer:{
        position:"absolute",
        top: 300,
        alignSelf:"center"
    },
     userCategory:{
        padding:5,
        borderRadius:20,
        fontFamily:typography.appFont[400],
        borderWidth:1,
        borderColor:colors.__main_blue,
        marginTop:5
    },
    userCategorySelected:{
        padding:7,
        borderRadius:20,
        fontFamily:typography.appFont[400],
        marginTop:5,
        backgroundColor:colors.__teal_light
    }
})