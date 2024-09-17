import axios from "axios";

axios.defaults.baseURL = "https://api.noosk.co";
axios.defaults.headers.common["Authorization"] = "Bearer your-token";
axios.defaults.timeout = 15000; // 15 seconds



export default axios;
