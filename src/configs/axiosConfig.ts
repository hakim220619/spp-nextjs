import axios from 'axios'

const axiosCons = axios.create({
  baseURL: `http://localhost:4000/api`
})
export default axiosCons
