import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

export function getListings() {
  return api.get('/marketplace/listings')
}

export function getCollection(address) {
  return api.get(`/nft/collection/${address}`)
}

export function getNFT(id) {
  return api.get(`/nft/${id}`)
}

export function createNFT(formData) {
  return api.post('/nft/create', formData)
}

export function listNFT(data) {
  return api.post('/marketplace/list', data)
}

export function buyNFT(data) {
  return api.post('/marketplace/buy', data)
}

export function cancelListing(data) {
  return api.post('/marketplace/cancel', data)
}

export function getProfile(address) {
  return api.get(`/auth/profile/${address}`)
}

export function updateProfile(address, data) {
  return api.put(`/auth/profile/${address}`, data)
}

export default api
