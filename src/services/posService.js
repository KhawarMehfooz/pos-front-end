import posClient from './pos-api'
import Cookies from 'js-cookie'

export const createCategory = async(category)=>{
    const response = await posClient.post('/categories',category,{
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get('auth_token')}`,
        }
    })
    return response.data
}

export const getCategories = async()=>{
    const response = await posClient.get('/categories',{
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get('auth_token')}`,
        }
    })
    return response.data
}
export const getCategoryById = async(id)=>{
    const response = await posClient.get(`/category/${id}`,{
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get('auth_token')}`,
        }
    })
    return response.data
}

export const updateCategory = async(id,data)=>{
    const response = await posClient.put(`/category/${id}`,data,{
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get('auth_token')}`,
        }
    })
    return response.data
}

export const deleteCategory = async(id)=>{
    const response = await posClient.delete(`/category/${id}`,{
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get('auth_token')}`,
        }
    })
    return response.data
}

// products

export const createProduct = async(data)=>{
    const response = await posClient.post(`/products`,data,{
        headers: {
            'Content-Type': 'multipart/form-data',
            "Authorization": `Bearer ${Cookies.get('auth_token')}`,
        }
    })
    return response.data
}
export const getAllProducts = async()=>{
    const response = await posClient.get('/products',{
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get('auth_token')}`,
        }
    })
    return response.data
}

export const getProductById = async (id)=>{
    const response = await posClient.get(`/product/${id}`,{
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${Cookies.get('auth_token')}`,
        }
    })
    return response.data
}

export const updateProduct = async(id,data)=>{
    const response = await posClient.put(`/product/${id}`,data,{
        headers: {
            'Content-Type': 'multipart/form-data',
            "Authorization": `Bearer ${Cookies.get('auth_token')}`,
        }
    })
    return response.data
}
export const deleteProduct = async(id)=>{
    const response = await posClient.delete(`/product/${id}`,{
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get('auth_token')}`,
        }
    })
    return response.data
}
// settings

export const saveSettings = async(data)=>{
    const response = await posClient.post('/settings',data,{
        headers: {
            'Content-Type': 'multipart/form-data',
            "Authorization": `Bearer ${Cookies.get('auth_token')}`
        }
    })
    return response.data
}

export const getSettings = async()=>{
    const response = await posClient.get('/settings',{
        headers: {
            "Authorization": `Bearer ${Cookies.get('auth_token')}`
        }
    })
    return response.data
}

// Customers

export const getCustomers = async()=>{
    const response = await posClient.get('/customers',{
        headers: {
            'Authorization': `Bearer ${Cookies.get('auth_token')}`
        }
    })
    return response.data
}

export const createCustomer = async(data)=>{
    const response = await posClient.post('/customers',data,{
        headers: {
            "Authorization": `Bearer ${Cookies.get('auth_token')}`,
            'Content-Type': 'application/json',
        }
    })
    return response.data
}