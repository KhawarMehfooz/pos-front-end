import axios from 'axios';
import Cookies from 'js-cookie'

const AUTH_TOKEN =  `Bearer ${Cookies.get('auth_token')}`

const posClient = axios.create({
  baseURL: import.meta.env.VITE_POS_API,
});

export default posClient;
