import { ref, nextTick } from 'vue';
import { getCategories, getCategoryById } from '@/services/posService';
import JsBarcode from 'jsbarcode';

export const allCategories = ref([]);

export const loadCategories = async () => {
    try {
        const response = await getCategories();
        allCategories.value = response;
    } catch (err) {
        console.log('Error fetching categories:', err);
    }
};

export const getCatById=async(id)=>{
    try{
        const response = await getCategoryById(id)
        return response
    }catch(err){
        console.log(err)
    }
}

