import axios from "../axios/axiosConfig";

const deleteEvent = async (token: string, eventId: string) => {
  try {
    const response = await axios.post(
      "/event/delete-event",
      {
        event_id: eventId,
      },
      {
        headers: {
          "x-access-token": token,
        },
      }
    );
    if (response.data && response.data.success) {
      return response.data;
    }
  } catch (error: any) {
    console.log("Something went wrong deleting the event", error);
    return error;
  }
};

export default deleteEvent;
