import axios from "../axios/axiosConfig";

const fetchMemory = async (token: string, memoryId: string) => {
  try {
    const response = await axios.get(`/event/get-memory/${memoryId}`, {
      headers: {
        "x-access-token": token,
      },
    });
    if (response.data && response.data.success) {
      return response.data.result[0];
    }
  } catch (error: any) {
    console.log("Something went wrong fetching the memory");
    throw error;
  }
};

export default fetchMemory;
