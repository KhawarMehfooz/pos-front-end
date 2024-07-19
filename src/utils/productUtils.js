import { ref, nextTick } from 'vue';
import { getAllProducts } from '@/services/posService';
import JsBarcode from 'jsbarcode';

export const allProducts = ref([]);
export const allCategories = ref([]);


const loadCategories = async () => {
    try {
        const response = await getCategories();
        allCategories.value = response;
    } catch (err) {
        console.log('Error fetching categories:', err);
    }
};

export const generateBarcode = (product, element) => {
    JsBarcode(element, product.barcode, {
        format: "CODE128",
        displayValue: true,
        height: 25,
        width: 2
    });
};

export const loadProducts = async () => {
    try {
        const response = await getAllProducts();
        allProducts.value = response;
        nextTick(() => {
            allProducts.value.forEach(product => {
                const canvas = document.querySelector(`#barcode-${product.barcode}`);
                generateBarcode(product, canvas);
            });
        });
    } catch (err) {
        console.log(err);
    }
};
export const getImageURL = (path) => {
    let baseURL = import.meta.env.VITE_POS_API;
    return `${baseURL}${path}`;
};
