import axios from 'axios'

const axiosInstance = axios.create({
    baseURL:'https://204ed3432b06d7af.mokky.dev',
    timeout:10000,
})

//加入攔截器，自動帶入 token
axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('userToken')// 根據你的系統自行調整
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default axiosInstance