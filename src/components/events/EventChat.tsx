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
  Share,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import colors from "../../config/colors";
import { Feather, Ionicons, AntDesign } from "@expo/vector-icons";

import {
  sendMessage,
  deleteMessages,
  getChatRoom,
  reportMessage,
} from "@/hooks/chat/chatApi";
import useFetchUserDataAsync from "../../hooks/async_storage/useFetchUserDataAsync";
import io from "socket.io-client";
import typography from "../../config/typography";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChatData, HeaderProps, MessageData, MessageProps } from "@/types";
import getTimeAgo from "@/services/timeAgo";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";

const EventChat: React.FC<any> = ({ chatRoomId }: { chatRoomId: string }) => {
  const [message, setMessage] = useState<string>("");
  const [selectedMessage, setSelectedMessage] = useState<any>();
  const currentUser = useFetchUserDataAsync();
  const [chatData, setChatData] = useState<ChatData>();
  const [showDelete, setShowDelete] = useState<boolean>(false);
  const [messagesToDelete, setMessagesToDelete] = useState<string[]>([]);
  const [reportMessage, setReportMessage] = useState<boolean>(false);
  const [isMessageReported, setIsMessageReported] = useState<boolean>(false);
  const [messageId, setMessageId] = useState<string>("");
  const sharer = currentUser?.user_type === "sharer" ? true : false;
  const router = useRouter();
  const checkUser = () => {
    if (currentUser === null) {
      router.replace("/landing");
    }
  };
  setTimeout(() => {
    checkUser();
  }, 500);
  useEffect(() => {
    if (messagesToDelete.length === 0) {
      setShowDelete(false);
    }
  }, [messagesToDelete]);

  const handleMessagesTodelete = (message_id: string) => {
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
          chatData.subcategory
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
      } catch (error: any) {
        console.log("Something went wrong fetching the chat", error);
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

    socket.on("new_message", (newMessage: any) => {
      setChatData((prevChatData: any) => ({
        ...prevChatData,
        messages: [...prevChatData.messages, newMessage],
      }));
    });

    socket.on("message_deleted", (data: any) => {
      const { messageIds } = data;
      setChatData((prevChatData: any) => ({
        ...prevChatData,
        messages: prevChatData.messages.filter(
          (message: any) => !messageIds.includes(message._id)
        ),
      }));
      setShowDelete(false);
      setMessagesToDelete([]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchChatRoom();
  }, [currentUser]);

  const scrollViewRef = useRef<FlatList>(null);
  const renderMessage = ({
    item,
    index,
  }: {
    item: MessageData;
    index: number;
  }) => {
    let isSender: boolean;
    if (typeof item.sender === "string") {
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
        setSelectedMessage={setSelectedMessage}
      />
    );
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      {showDelete && (
        <Header
          showDelete={showDelete}
          chatData={chatData}
          deleteChatMessage={deleteChatMessage}
          setShowDelete={setShowDelete}
          // onShare={onShare}
        />
      )}

      <View style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 230 : 0}
        >
          <FlatList
            data={chatData?.messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => item._id || index.toString()}
            ref={scrollViewRef}
            style={{ flex: 1 }}
          />

          <View style={styles.inputContainer}>
            <TextInput
              placeholder={"Write your message here"}
              style={styles.input}
              onChangeText={(text) => setMessage(text)}
              value={message}
              placeholderTextColor={colors.__secondary_text_color}
            />
            <TouchableOpacity
              onPress={sendChatMessage}
              style={{ marginRight: 5 }}
            >
              <Feather
                name="send"
                size={24}
                color={colors.__secondary_text_color}
              />
            </TouchableOpacity>
          </View>

          {reportMessage && (
            <ReportMessage
              setReportMessage={setReportMessage}
              currentUser={currentUser}
              messageId={messageId}
              setMessageId={setMessageId}
              setIsMessageReported={setIsMessageReported}
              selectedMessage={selectedMessage}
            />
          )}
          {isMessageReported && (
            <TouchableOpacity
              style={styles.messageReported}
              onPress={() => setIsMessageReported(false)}
            >
              <Text
                style={[styles.textReport, { fontSize: 17, fontWeight: "500" }]}
              >
                Message Report
              </Text>
              <View style={{ rowGap: 5 }}>
                <Text style={styles.textReport}>
                  Message has successfully been reported!
                </Text>
                <Text style={styles.textReport}>
                  We will review this message ASAP and take action if necessary
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const ReportMessage: React.FC<any> = ({
  setReportMessage,
  currentUser,
  messageId,
  setMessageId,
  setIsMessageReported,
  selectedMessage,
}) => {
  const reportMessageHandler = async () => {
    if (currentUser) {
      try {
        const result = await reportMessage(
          currentUser.token,
          messageId,
          "Reported message"
        );

        setReportMessage(false);
        setMessageId("");
        setIsMessageReported(true);
      } catch (error) {
        console.log("Error reporting a message", error);
      }
    }
  };
  if (selectedMessage)
    return (
      <Pressable
        style={styles.reportContentContainer}
        onPress={() => {
          setReportMessage(false);
          setMessageId("");
        }}
      >
        <BlurView style={styles.reportContentContainer} intensity={40}>
          <View style={[styles.newMessageContainer]}>
            <View style={{ maxWidth: "10%" }}>
              <Image
                source={{ uri: selectedMessage.sender.profile }}
                style={styles.profileImage}
              />
            </View>

            <View style={[styles.textContainer]}>
              <View style={[{ flexDirection: "row" }]}>
                <Text style={[styles.userName]}>
                  {selectedMessage.sender.user_name}
                </Text>
                <View style={styles.dot}></View>
                <Text style={{ fontSize: 12, alignSelf: "baseline" }}>
                  {getTimeAgo(selectedMessage)}
                </Text>
              </View>
              <View
                style={[
                  {
                    width: "93%",
                  },
                ]}
              >
                <Text style={styles.message}>{selectedMessage.content}</Text>
              </View>
            </View>
          </View>
          <View style={styles.reportInnerContainer}>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                columnGap: 10,
              }}
              onPress={() => reportMessageHandler()}
            >
              <Text>Report this message</Text>
              <Ionicons name="alert-circle-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </BlurView>
      </Pressable>
    );
};
const NewMessage: React.FC<MessageProps> = ({
  sender,
  message,
  showDelete,
  setShowDelete,
  messagesToDelete,
  handleMessagesTodelete,
  index,
  setReportMessage,
  setMessageId,
  setSelectedMessage,
}) => {
  const isMessageSelected = messagesToDelete?.includes(message._id) || false;

  return (
    <TouchableOpacity
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        if (sender) {
          handleMessagesTodelete(message._id);
          setShowDelete(true);
        } else {
          setReportMessage(true);
          setMessageId(message._id);
          setSelectedMessage(message);
        }
      }}
      onPress={() => {
        if (sender && showDelete) {
          handleMessagesTodelete(message._id);
        }
      }}
      style={[
        index === 0 ? { marginTop: 10 } : {},
        sender && { alignItems: "flex-end" },
        showDelete && index === 0 && { marginTop: 70 },
      ]}
    >
      <View style={[styles.newMessageContainer]}>
        {!sender && (
          <View style={{ maxWidth: "10%" }}>
            <Image
              source={{ uri: message.sender.profile }}
              style={styles.profileImage}
            />
          </View>
        )}

        <View
          style={[
            styles.textContainer,
            // sender && {
            //   backgroundColor: colors.__amico_blue,
            //   borderBottomLeftRadius: 10,
            //   borderBottomRightRadius: 0,
            // },
            showDelete && { maxWidth: "85%" },
          ]}
        >
          <View
            style={[
              { flexDirection: "row" },
              sender && { justifyContent: "flex-end" },
            ]}
          >
            <Text style={[styles.userName]}>{message.sender.user_name}</Text>
            <View style={styles.dot}></View>
            <Text style={{ fontSize: 12, alignSelf: "baseline" }}>
              {getTimeAgo(message)}
            </Text>
          </View>
          <View
            style={[
              sender && { alignSelf: "flex-end", alignItems: "flex-end" },
            ]}
          >
            <Text style={styles.message}>{message.content}</Text>
          </View>
        </View>
        {sender && (
          <View style={{ maxWidth: "10%" }}>
            <Image
              source={{ uri: message.sender.profile }}
              style={styles.profileImage}
            />
          </View>
        )}
        {showDelete && isMessageSelected && (
          <View style={{ alignSelf: "center" }}>
            <AntDesign
              name="checkcircleo"
              size={18}
              color={colors.__main_text}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const Header: React.FC<HeaderProps> = ({
  showDelete,
  deleteChatMessage,
  chatData,
  setShowDelete,
  onShare,
}) => {
  return (
    <View style={styles.header}>
      {showDelete && (
        <View style={{ flexDirection: "row", columnGap: 10 }}>
          <TouchableOpacity onPress={() => deleteChatMessage()}>
            <AntDesign name="delete" size={22} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowDelete(false)}>
            <AntDesign name="closecircleo" size={22} color="black" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default EventChat;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.__secondary_background,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
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
    // top: Platform.OS != "web" ? "7%" : "2%",
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
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
  message: {
    fontFamily: typography.appFont[400],
    top: 5,
  },
  inputContainer: {
    flexDirection: "row",
    columnGap: 10,
    paddingHorizontal: 5,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderColor: colors.__secondary_text_color,
    borderWidth: 1,
  },
  input: {
    height: 40,
    paddingHorizontal: 5,
    flex: 1,
    color: colors.__main_text,
  },

  newMessageContainer: {
    flexDirection: "row",
    columnGap: 5,
    marginBottom: 20,
    paddingHorizontal: 16,
    alignItems: "flex-start",
  },

  textContainer: {
    borderRadius: 10,
    maxWidth: "90%",
    rowGap: 3,
    backgroundColor: "#fff",
    padding: 10,
  },
  userName: {
    fontFamily: typography.appFont[600],
    alignSelf: "baseline",
  },
  profileImage: {
    width: 35,
    height: 35,
    borderRadius: 30,
    top: 5,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#000",
    alignSelf: "center",
    marginHorizontal: 4,
  },
  reportContentContainer: {
    backgroundColor: "transparent",
    position: "absolute",
    zIndex: 100,
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  reportInnerContainer: {
    borderRadius: 8,
    padding: 16,
    rowGap: 5,
    backgroundColor: "rgba(256, 256, 256, 0.8)",
  },
  messageReported: {
    position: "absolute",
    backgroundColor: colors.__main_background,
    top: "40%",
    alignSelf: "center",
    padding: 20,
    borderRadius: 10,
    justifyContent: "center",
    rowGap: 20,
  },
  textReport: {
    color: "white",
    textAlign: "center",
  },
});
