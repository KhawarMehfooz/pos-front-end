<script setup>
import { ref, onMounted } from 'vue';
import { getCategories, createProduct, getCategoryById, updateProduct, getProductById, deleteProduct } from '@/services/posService';
import Swal from 'sweetalert2';
import { allProducts, loadProducts, getImageURL } from '@/utils/productUtils';
import { allCategories, loadCategories } from '@/utils/categoryUtils';

const current_product_id = ref('')
const existing_image_url = ref('');


const product_name = ref('');
const product_category = ref('');
const product_price = ref('');
const product_quantity = ref('');
const stockCheck = ref('');
const product_image = ref(null);
const product_image_url = ref('');

const getCategory = async (id) => {
    try {
        const response = await getCategoryById(id);
        return response;
    } catch (err) {
        console.log(err);
    }
};

const handleFileChange = (event) => {
    product_image.value = event.target.files[0];
    if (product_image.value) {
        existing_image_url.value = '';
    }
};


const saveProduct = async () => {
    try {
        const formData = new FormData();
        formData.append('productName', product_name.value);
        formData.append('productCategory', product_category.value);
        formData.append('productPrice', product_price.value);
        formData.append('productQuantity', product_quantity.value);
        formData.append('stockCheck', stockCheck.value ? "on" : "off");
        formData.append('image', product_image.value);

        const response = await createProduct(formData);
        product_name.value = ""
        product_category.value = ""
        product_price.value = ""
        product_quantity.value = ""
        stockCheck.value = ""
        product_image.value = null
        existing_image_url.value = ""
        document.querySelector('input[type="file"]').value = '';
        document.getElementById('createProductModal').close()
        Swal.fire({
            title: "Product Creation Successful",
            text: "You have created the product successfully",
            icon: "success"
        });
        loadProducts();
    } catch (err) {
        console.log('Error saving product:', err);
    }
};

const editProduct = async (id) => {
    try {
        current_product_id.value = id;
        let res = await getProductById(id);
        product_name.value = res.name;
        product_category.value = res.category;
        product_quantity.value = res.quantity;
        product_price.value = res.price;
        existing_image_url.value = getImageURL(res.image);
        product_image.value = null;
        stockCheck.value = res.stockCheck === 1;
        document.getElementById('editProductModal').showModal();
    } catch (err) {
        console.log(err)
    }
};

const updateProd = async () => {
    try {
        const formData = new FormData();
        formData.append('productName', product_name.value);
        formData.append('productCategory', product_category.value);
        formData.append('productPrice', product_price.value);
        formData.append('productQuantity', product_quantity.value);
        formData.append('stockCheck', stockCheck.value ? 'on' : 'off');
        if (product_image.value) {
            formData.append('image', product_image.value);
        }

        const response = await updateProduct(current_product_id.value, formData);
        document.getElementById('editProductModal').close();
        document.getElementById('showProductsModal').close();
        Swal.fire({
            title: 'Product Update Successful',
            text: 'You have updated the product successfully',
            icon: 'success'
        });
        loadProducts();
    } catch (err) {
        console.log(err)
    }
};

const deleteProductPrompt = async (id) => {
    document.getElementById('showProductsModal').close()
    let product = await getProductById(id)
    const { value: confirmDelete } = await Swal.fire({
        title: `Delete ${product.name}`,
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    });

    if (confirmDelete) {
        try {
            const response = await deleteProduct(id);
            Swal.fire(
                'Deleted!',
                `You have deleted the - ${product.name} - Product`,
                'success'
            )
            loadCategories();
            loadProducts()
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
            });
        }
    }
};

onMounted(async () => {
    await loadCategories();
    await loadProducts();
});
</script>

<template>
    <div class="flex items-center w-fit">
        <!-- show products model -->
        <button title="Show Products" class="bg-primary flex items-center gap-2 sm:text-xl rounded-l-xl"
            onclick="showProductsModal.showModal()">
            <span class="block px-3 py-2 bg-primary"><i class="fa-solid fa-barcode"></i></span>
            <span class="block pr-3 py-2">Products</span>
        </button>
        <!-- Show Create product modal -->
        <button title="Create Product" class="px-3 py-2 bg-accent sm:text-xl" onclick="createProductModal.showModal()">
            <i class="fa-solid fa-plus"></i>
        </button>
    </div>
    <!-- Show Products Modal -->
    <dialog id="showProductsModal" class="modal modal-top max-w-5xl mx-auto">
        <div class="modal-box">
            <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 class="text-lg font-bold pb-3 border-b">Products</h3>
            <div class="overflow-x-auto">
                <table class="table table-lg">
                    <thead>
                        <tr>
                            <th>Product Image</th>
                            <th>Product Name</th>
                            <th>Product Barcode</th>
                            <th>Product Price</th>
                            <th>Product Quantity</th>
                            <th colspan="2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="product in allProducts" :key="product.id">
                            <td>
                                <img class="aspect-square object-cover rounded-full border"
                                    :src="getImageURL(product.image)" alt="" height="100" width="100">
                            </td>
                            <td>{{ product.name }}</td>
                            <td><canvas :id="'barcode-' + product.barcode"></canvas></td>
                            <td>{{ product.price }}</td>
                            <td>{{ product.quantity }}</td>
                            <td>
                                <span class="flex items-center gap-4 text-white">
                                    <button class="block bg-info px-3 py-1 rounded"
                                        @click="editProduct(`${product._id}`)">
                                        <i class="fa-solid fa-pen-to-square"></i>
                                    </button>
                                    <button @click="deleteProductPrompt(`${product._id}`)"
                                        class="block bg-error px-3 py-1 rounded">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </dialog>

    <!-- Create Product Modal -->
    <dialog id="createProductModal" class="modal modal-top max-w-2xl mx-auto">
        <div class="modal-box">
            <form method="dialog">
                <button id="closeCreateCategoryModal"
                    class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 class="text-lg font-bold pb-3 border-b">Create a new product</h3>
            <form @submit.prevent="saveProduct" enctype="multipart/form-data">
                <div class="md:flex md:items-center md:gap-4">
                    <input name="productName" v-model="product_name" type="text" placeholder="Product Name"
                        class="input input-bordered w-full my-4" />
                    <select name="categoryName" v-model="product_category" class="select select-bordered w-full">
                        <option value="" disabled>Select Category</option>
                        <option v-for="category in allCategories" name="productCategory" :key="category._id"
                            :value="category._id">{{
                                category.categoryName }}</option>
                    </select>
                </div>
                <div class="md:flex md:items-center md:gap-4">
                    <input name="productPrice" v-model="product_price" type="number" placeholder="Product Price"
                        class="input input-bordered w-full my-4" />
                    <input name="productQuantity" v-model="product_quantity" type="number"
                        placeholder="Product Quantity" class="input input-bordered w-full my-4" />
                </div>
                <div class="md:flex md:items-center md:gap-4">
                    <label class="label cursor-pointer w-full">
                        <span class="label-text">Stock Check</span>
                        <input type="checkbox" v-model="stockCheck" class="toggle ml-4" />
                    </label>
                    <input name="image" type="file" class="file-input file-input-bordered w-full" accept="image/*"
                        @change="handleFileChange" />
                </div>
                <button type="submit" class="block btn btn-primary px-6 py-0 ml-auto w-fit my-4">Create</button>
            </form>
        </div>
    </dialog>

    <!-- Edit Product Modal -->
    <dialog id="editProductModal" class="modal modal-top max-w-2xl mx-auto">
        <div class="modal-box">
            <form method="dialog">
                <button id="closeCreateCategoryModal"
                    class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 class="text-lg font-bold pb-3 border-b">Update product</h3>
            <form @submit.prevent="updateProd" enctype="multipart/form-data">
                <div class="md:flex md:items-center md:gap-4">
                    <input name="productName" v-model="product_name" type="text" placeholder="Product Name"
                        class="input input-bordered w-full my-4" />
                    <select name="categoryName" v-model="product_category" class="select select-bordered w-full">
                        <option value="" disabled>Select Category</option>
                        <option v-for="category in allCategories" name="productCategory" :key="category._id"
                            :value="category._id">{{
                                category.categoryName }}</option>
                    </select>
                </div>
                <div class="md:flex md:items-center md:gap-4">
                    <input name="productPrice" v-model="product_price" type="number" placeholder="Product Price"
                        class="input input-bordered w-full my-4" />
                    <input name="productQuantity" v-model="product_quantity" type="number"
                        placeholder="Product Quantity" class="input input-bordered w-full my-4" />
                </div>
                <div class="md:flex md:items-center md:gap-4">
                    <label class="label cursor-pointer w-full">
                        <span class="label-text">Stock Check</span>
                        <input type="checkbox" v-model="stockCheck" class="toggle ml-4" />
                    </label>
                    <label class="label cursor-pointer w-full">
                        <span class="label-text">Current Image</span>
                        <img v-if="existing_image_url" width="100" height="100" :src="existing_image_url"
                            alt="Current Product Image">
                    </label>
                    <input name="image" type="file" class="file-input file-input-bordered w-full" accept="image/*"
                        @change="handleFileChange" />
                </div>
                <button type="submit" class="block btn btn-primary px-6 py-0 ml-auto w-fit my-4">Save</button>
            </form>
        </div>
    </dialog>
</template>
