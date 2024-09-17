import axios from "../axios/axiosConfig";
import * as Sentry from "@sentry/react-native";

export const sendMessage = async (
  sender: string,
  chat_room: string,
  content: string,
  token: string,
  subcategory: string
): Promise<void> => {
  try {
    const response = await axios.post(
      "/chat/send-message",
      {
        sender: sender,
        chat_room: chat_room,
        content: content,
        subcategory: subcategory,
      },
      {
        headers: {
          "x-access-token": token,
        },
      }
    );
    if (response && response.data && response.data.success) {
      console.log("message sent");
    }
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      console.error("error sending a message", error);
    } else {
      console.error("Something went wrong", error);
    }
    Sentry.captureException(error);
  }
};

export const getChatRoom = async (chat_id:string, token:string)  => {
  try {
    const response = await axios.get(`/chat/get-chat-room/${chat_id}`, {
      headers: {
        "x-access-token": token,
      },
    });
    if (response && response.data && response.data.success) {
      const result= response.data;
      return result;
    }
  } catch (error:any) {
    if (error.response && error.response.data && error.response.data.message) {
      console.error("Error retrieving tha chat room", error);
    } else {
      console.error(error);
    }
  }
};


export const deleteMessages = async (message_ids:string[], token:string) : Promise<void> => {
  try {
    const response = await axios.delete(
      "/chat/delete-message",
      {
        data: {
          messageIds: message_ids,
        },
        headers: {
          "x-access-token": token,
        },
      }
    );
  } catch (error:any) {
    if (error.response && error.response.data && error.response.data.message) {
      console.error("error deleting a message", error.response.data.message);
    } else {
      console.error("Something went wrong", error);
    }
  }
};

export const getChatRoomBySubcategory=async(subcategory_ids:string[],token:string)=>{
  try {
    const response=await axios.post("/chat/get-chat-room-by-subcategory",
    {
      subcategory_ids:subcategory_ids,
    }
  ,
    {
      headers:{
        "x-access-token":token
      }
    });
    if( response && response.data && response.data.success){
      const result=response.data.result;
      return result;
    }
  } catch (error:any) {
     if (error.response && error.response.data && error.response.data.message) {
      console.error("Error retrieving tha chat rooms", error);
    } else {
      console.error(error);
    }
  }
}

export const createChatRoom=async(name:string,subcategory:string,token:string,related_fields?:string[]|undefined)=>{
  try {
      const requestBody: any = {
      name,
      subcategory,
    };

    if (related_fields && related_fields.length > 0) {
      requestBody.related_fields = related_fields;
    }
    const response=await axios.post("/chat/create-chat",requestBody,
    {
      headers:{
      "x-access-token":token
    }
    });
    if (response && response.data && response.data.success){
      return response.data;
    }
  } catch (error:any) {
    if (error.response && error.response.data && error.response.data.message) {
      console.error("Error creating the chat room", error);
    } else {
      console.error(error);
    }
  }
}

export const deleteChatRoom=async(token:string,chat_id:string)=>{
  try {
    const response=await axios.delete(`/chat/delete-chat/${chat_id}`,
    {headers:{
      "x-access-token":token
    }})
    if (response && response.data.success){
     return response.data.success;
    }
  } catch (error:any) {
    if (error.response && error.response.data && error.response.data.message) {
      console.error("Error deleting the chat room", error);
    } else {
      console.error(error);
    }
  }
}

export const reportMessage=async(token:string,message_id:string,report_reason:string)=>{
  try {
    const response=await axios.post("/chat/report-message",
    {
      message_id:message_id,
      report_reason:report_reason,
    },
    {headers:
      {
        "x-access-token":token
      }
    });
    if(response && response.data && response.data.success){
      return response.data.success;
    }
  } catch (error:any) {
    if (error.response && error.response.data && error.response.data.message){
      console.error("Something went wrong while reporting the message",error);
    }
  }
}

export const getAllChatRooms=async()=>{
  try {
    const response=await axios.get("/chat/get-all-chats");
    
    if(response.data && response.data.success){
      return response.data.result;
    }
  } catch (error:any) {
    if (error.response && error.response.data && error.response.data.message){
      console.error("Something went wrong while fetching the chats",error);
    }
  }
}
