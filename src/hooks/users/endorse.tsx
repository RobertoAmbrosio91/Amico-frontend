import axios from "../axios/axiosConfig";

// Define the structure of the endorsement result
interface EndorsementResult {
  endorse_by: string;
  endorse_to: string;
  is_deleted: boolean;
  _id: string;
  updatedAt: string;
  createdAt: string;
  __v: number;
}

// Define the structure of the API response
interface EndorseUserResponse {
  success: boolean;
  message: string;
  result: EndorsementResult;
}

const endorseUser = async (
  user_id: string,
  token: string
): Promise<EndorseUserResponse | undefined> => {
  try {
    const response = await axios.post<EndorseUserResponse>(
      "/user/endorse",
      {
        endorse_to: user_id,
      },
      {
        headers: {
          "x-access-token": token,
        },
      }
    );

    if (response.data && response.data.success) {
      // console.log(response.data.message);
      return response.data;
    }
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      console.error(error.response.data.message);
    } else {
      console.error(error);
    }
  }
};

export default endorseUser;

