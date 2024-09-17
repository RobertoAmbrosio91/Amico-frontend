import {
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  FlatList,
  Image,
  Pressable,
  Share
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import colors from "../../config/colors";
import { Feather,MaterialCommunityIcons,Ionicons,AntDesign } from "@expo/vector-icons";
import {
  deleteMessages,
  getChatRoom,
  reportMessage,
  sendMessage,
} from "../../hooks/chat/chatApi";
import useFetchUserDataAsync from "../../hooks/async_storage/useFetchUserDataAsync";
import io from "socket.io-client";
import typography from "../../config/typography";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-root-toast";


interface Sender {
  _id: string;
  first_name:string,
  last_name:string,
  profile:string
}
interface MessageData {
  _id: string;
  content: string;
  // sender: Sender| string;
  sender:Sender
  
}

interface ChatData {
  messages: MessageData[];
  name:string,
  subcategory:string,
}

interface MessageProps {
  sender: boolean;
  message: MessageData;
  showDelete: boolean;
  setShowDelete: React.Dispatch<React.SetStateAction<boolean>>;
  messagesToDelete: string[];
  handleMessagesTodelete: (messageId: string) => void;
  index: number;
  setReportMessage:React.Dispatch<React.SetStateAction<boolean>>;
  setMessageId:React.Dispatch<React.SetStateAction<string>>
}

interface HeaderProps {
  showDelete: boolean;
  deleteChatMessage: () => Promise<void>;
  chatData?:ChatData;
  setShowDelete:any
  onShare?: () => void;
}  

const ChatScreen : React.FC= () => {
  const {id}=useLocalSearchParams();
  const chatRoomId = Array.isArray(id) ? id[0] : id;
  const [message, setMessage] = useState<string>("");
  const currentUser = useFetchUserDataAsync();
  const [chatData, setChatData] = useState<ChatData>();
  const [showDelete, setShowDelete] = useState<boolean>(false);
  const [messagesToDelete, setMessagesToDelete] = useState<string[]>([]);
  const [reportMessage,setReportMessage]=useState<boolean>(false);
  const [isMessageReported,setIsMessageReported]=useState<boolean>(false);
  const [messageId,setMessageId]=useState<string>("");
  const sharer=currentUser?.user_type==='sharer'?true:false;
  const router=useRouter();
  const checkUser=()=>{
    if(currentUser===null){
      router.replace('/landing')
    }
  }
  setTimeout(() => {
   checkUser()
  },500);
  useEffect(()=>{
    if(messagesToDelete.length===0){
      setShowDelete(false)
    }
  },[messagesToDelete])
  const handleMessagesTodelete = (message_id:string) => {
    const isIncluded = messagesToDelete.includes(message_id);
    if (isIncluded) {
      setMessagesToDelete((prevSelected) =>
        prevSelected.filter((id) => id !== message_id)
      );
     
    } else {
      setMessagesToDelete((prevSelected) => [...prevSelected, message_id]);
    }
  };

  const sendChatMessage = async () => {
    if (message.length > 0 && currentUser && chatRoomId && chatData) {
      try {
        await sendMessage(
          currentUser._id,
          chatRoomId,
          message,
          currentUser.token,
          chatData.subcategory,
        );
        setMessage("");
        scrollViewRef.current?.scrollToEnd({ animated: true });
      } catch (error) {
        console.log("Error sending a message", error);
      }
    }
  };

  const fetchChatRoom = async () => {
    if (currentUser && chatRoomId) {
      try {
        const fetchedChatData = await getChatRoom(
          chatRoomId,
          currentUser.token
        );
        if (fetchedChatData.success) {
          setChatData(fetchedChatData.result[0]);
        }
      } catch (error:any) {
        console.log("Something went wrong fetching the chat",error)
      }
    }
  };


  const deleteChatMessage = async () => {
    if (currentUser) {
      try {
        await deleteMessages(messagesToDelete, currentUser.token);
      } catch (error) {
        console.log("Error deleting a message", error);
      }
    }
  };
  useEffect(() => {
    const socket = io("https://socket.noosk.co");

    socket.emit("join_room", chatRoomId);

    socket.on("new_message", (newMessage:any) => {
      // console.log(newMessage)
      setChatData((prevChatData:any) => ({
        ...prevChatData,
        messages: [...prevChatData.messages, newMessage],
      }));
    });

    socket.on("message_deleted", (data:any) => {
      const { messageIds } = data;
      setChatData((prevChatData:any) => ({
        ...prevChatData,
        messages: prevChatData.messages.filter(
          (message:any) => !messageIds.includes(message._id)
        ),
      }));
      setShowDelete(false);
      setMessagesToDelete([]);
    });

    return () => {
      socket.disconnect();
    }
  }, []);

  useEffect(() => {
    fetchChatRoom();
  }, [currentUser]);

  const scrollViewRef = useRef<FlatList>(null);
  const renderMessage = ({ item, index }: { item: MessageData; index: number }) => {
     let isSender: boolean;
  if (typeof item.sender === 'string') {
    isSender = item.sender === currentUser?._id;
  } else {
    isSender = item.sender._id === currentUser?._id;
  }



  
    return (
      <NewMessage
        sender={isSender}
        message={item}
        key={index}
        showDelete={showDelete}
        setShowDelete={setShowDelete}
        messagesToDelete={messagesToDelete}
        handleMessagesTodelete={handleMessagesTodelete}
        index={index}
        setReportMessage={setReportMessage}
        setMessageId={setMessageId}
      />
    );
  };

  const onShare = async () => {
    // Ensure that chatData and chatData.name are available
    if (!chatData || !chatData.name) {
      console.error("Chat data is not loaded yet.");
      return;
    }
    
    const shareMessage = `Join this chat about ${chatData.name}!`;
  
    try {
      const result = await Share.share({
        message: shareMessage,
        url: `https://noosk.co/chat/${chatRoomId}`,
        title: "Noosk",
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("shared with activity type of :", result.activityType);
        } else {
          console.log("shared");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("dismissed");
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <Header 
      showDelete={showDelete} 
      chatData={chatData} 
      deleteChatMessage={deleteChatMessage} 
      setShowDelete={setShowDelete}
      onShare={onShare}
      />
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 70 : 0}
        >
         

          <FlatList
            data={chatData?.messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => item._id || index.toString()}
            ref={scrollViewRef}
            style={{ flex: 1 }}
          />
          
          {sharer && 
          <View style={styles.inputContainer}>
            <TextInput
              placeholder={"Write your message here"}
              style={styles.input}
              onChangeText={(text) => setMessage(text)}
              value={message}
            />
            <TouchableOpacity onPress={sendChatMessage} style={{marginRight:5}}>
              <Feather name="send" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          }
          
          {reportMessage &&  
          <ReportMessage 
            setReportMessage={setReportMessage} 
            currentUser={currentUser} 
            messageId={messageId} 
            setMessageId={setMessageId}
            setIsMessageReported={setIsMessageReported}
            />
            }
      {isMessageReported &&
          <TouchableOpacity style={styles.messageReported} onPress={()=>setIsMessageReported(false)}>
            <Text style={[styles.textReport,{fontSize:17,fontWeight:"500"}]}>Message Report</Text>
            <View style={{rowGap:5}}>
            <Text style={styles.textReport}>Message has successfully been reported!</Text>
            <Text style={styles.textReport}>We will review this message ASAP and take action if necessary</Text>
            </View>
            
          </TouchableOpacity>
      }
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const ReportMessage:React.FC<any>=({setReportMessage,currentUser,messageId,setMessageId,setIsMessageReported})=>{
  const reportMessageHandler=async()=>{
    if(currentUser){
      try{
        const result=await reportMessage(currentUser.token,messageId,"Reported message")
        
          setReportMessage(false)
          setMessageId("");
          setIsMessageReported(true)
      
      }catch(error){
        console.log("Error reporting a message",error)
      }
    }
  }
  return(
    <Pressable style={styles.reportContentContainer} onPress={()=>{setReportMessage(false);setMessageId("")}}>
      <View style={styles.reportInnerContainer}>
        <TouchableOpacity style={{flexDirection:"row",alignItems:"center",columnGap:10}} onPress={()=>reportMessageHandler()}>
          <Text>Report this message</Text>
          <Ionicons name="alert-circle-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </Pressable>
  )
}
const NewMessage:React.FC<MessageProps> = ({
  sender,
  message,
  showDelete,
  setShowDelete,
  messagesToDelete,
  handleMessagesTodelete,
  index,
  setReportMessage,
  setMessageId
}) => {
  const isMessageSelected = messagesToDelete?.includes(message._id) || false;
  let messageSender = `${message.sender.first_name} ${message.sender.last_name}`;
  // return (
  //   <TouchableOpacity
  //     onLongPress={() => {
  //       if (sender) {
  //         handleMessagesTodelete(message._id);
  //         setShowDelete(true);
  //       }
  //     }}
  //     onPress={()=>{
  //       if(sender && showDelete){
  //         handleMessagesTodelete(message._id);
  //       }
  //     }}
  //     style={index === 0 ? { marginTop: 60 } : {}}
  //   >
  //     <View
  //       style={sender ? styles.messageContainerSender : styles.messageContainer}
  //     >
  //       <View style={sender ? styles.messageSent : styles.messageReceived}>
  //         <Text>{message.content}</Text>
  //       </View>
  //       {showDelete && isMessageSelected && (
  //         <AntDesign name="checkcircleo" size={18} color="black" />
  //       )}
  //     </View>
  //   </TouchableOpacity>
  // );

  return(
    <TouchableOpacity 
    onLongPress={() => {
        if (sender) {
          handleMessagesTodelete(message._id);
          setShowDelete(true);
        }else{
          setReportMessage(true);
          setMessageId(message._id)
        }
      }}
      onPress={()=>{
        if(sender && showDelete){
          handleMessagesTodelete(message._id);
        }
      }}
      style={index === 0 ? { marginTop: 60 } : {}}>
      <View style={[styles.newMessageContainer,sender && styles.newMessageContainerSender]}>
        <Image source={{uri:message.sender.profile}} style={styles.profileImage}/>
        <View style={[styles.textContainer,index===0 || sender ?{borderTopColor:"transparent"}:{}]}>
          <Text style={[styles.userName]}>{messageSender}</Text>
          <Text >{message.content}</Text>
        </View>
        {showDelete && isMessageSelected && (
          <View style={{alignSelf:"center"}}>
            <AntDesign name="checkcircleo" size={18} color="black" />
          </View>
        )}
      </View>
      
    </TouchableOpacity>
  )
};


const Header: React.FC<HeaderProps> = ({ showDelete, deleteChatMessage,chatData,setShowDelete, onShare }) => {
  const router=useRouter()
  return (
    <View style={styles.header}>
      <TouchableOpacity style={{flexDirection:"row",alignItems:"center"}} onPress={()=>router.back()}>
      <MaterialCommunityIcons name="chevron-left" size={30} color="#000" />
      <Text style={styles.chatTitle}>{chatData && chatData.name}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.icon]} onPress={onShare}>
          <MaterialCommunityIcons
            name="share"
            size={25}
            color={colors.__01_light_n}
          />
        </TouchableOpacity>
      {showDelete && (
        <View style={{flexDirection:"row",columnGap:10}}>
          <TouchableOpacity onPress={() => deleteChatMessage()}>
            <AntDesign name="delete" size={22} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>setShowDelete(false)}>
            <AntDesign name="closecircleo" size={22} color="black" />
          </TouchableOpacity>
        </View>
   
      )}
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#fff",
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
  },
  container: {
    flex: 1,
    rowGap: 5,
  },
  chatTitle: {
    fontFamily: typography.appFont[600],
    fontSize: 18,
  },
  icon: {
    borderColor: "#fff",
    borderWidth: 2,
    borderRadius: 100,
    padding: 5,
    flexDirection: "row",
    columnGap: 3,
    alignItems: "center",
  },
  header: {
    position: "absolute",
    top: Platform.OS != "web" ? "7%" : "2%",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.5)",
    height: 60,
    paddingHorizontal: 15,
    zIndex: 1000,
  },
  chatContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    rowGap: 15,
  },

  inputContainer: {
    flexDirection: "row",
    columnGap: 10,
    borderColor: "#C7C7C7",
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    marginHorizontal:16
  },
  input: {
    height: 40,
    paddingHorizontal: 5,
    flex:1
  },

  newMessageContainer:{
    flexDirection:"row",
    columnGap:5,
    flexWrap:"wrap",
    marginBottom:5,
    paddingHorizontal:16,
    paddingBottom:10
  },
  newMessageContainerSender:{
    flexDirection:"row",
    columnGap:5,
    flexWrap:"wrap",
    marginBottom:5,
    paddingHorizontal:16,
    borderLeftColor:colors.__teal_dark,
    borderLeftWidth:4,
    backgroundColor:"rgba(84, 215, 183, 0.2)"
  },
  textContainer:{
    borderTopColor:"#acacac",
    borderTopWidth:1,
    flex:1,
    rowGap:3,
    paddingTop:10
  },
  userName:{
    fontFamily:typography.appFont[500]
  },
  profileImage:{
    width:35,
    height:35,
    borderRadius:30,
    marginTop:10
  },
  myMessages:{
    fontFamily:typography.appFont[700],
    color:colors.__teal_light,
    borderColor:colors.__teal_light,
    borderWidth:2,
  
  },
  reportContentContainer:{
    backgroundColor:"rgba(256,256,256,0.8)",
    position:"absolute",
    zIndex:100,
    top:0,
    right:0,
    left:0,
    bottom:0,
    flex:1,
    alignItems:"center",
    justifyContent:"center"
  },
  reportInnerContainer:{
    borderRadius:8,
    padding:16,
    rowGap:5,
    backgroundColor:"rgba(84, 215, 183, 1)"
  },
  messageReported:{
    position:"absolute",
    backgroundColor: colors.__black,
    top:"40%",
    alignSelf:"center",
    padding:20,
    borderRadius:10,
    justifyContent:"center",
    rowGap:20
  },
  textReport:{
    color:"white",
    textAlign:"center"
  }
});
