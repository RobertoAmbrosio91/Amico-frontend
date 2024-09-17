import { EventType } from "@/types"
import axios from "../axios/axiosConfig"
import * as Sentry from "@sentry/react-native";

const fetchSingleEvent=async(id:string,token:string): Promise<EventType|undefined>  =>{
    try {
        const response = await axios.get(`/event/get-event/${id}`, {
          headers: {
            "x-access-token": token,
          },
        });
        if(response.data && response.data.success){
            return response.data.result[0];
        }
    } catch (error:any) {
        console.log("Error fetching the event",error)
        Sentry.captureException(error);
        return error
    }
}

export default fetchSingleEvent