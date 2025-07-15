import axios from "axios";

const instance = axios.create({
  baseURL: "https://server-vibes.ridhoamr.my.id",
});

export default instance;
