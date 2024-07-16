<script setup>
import { ref, onMounted } from 'vue'
import { createCategory, getCategories, updateCategory, deleteCategory } from '@/services/posService'
import { loadProducts } from '@/utils/productUtils';
import { allCategories,loadCategories } from '@/utils/categoryUtils';

import Swal from 'sweetalert2'

const category_name = ref('');
const currentCategory = ref(null);

const newCategory = async () => {
    try {
        const categoryData = {
            categoryName: category_name.value
        };
        const response = await createCategory(categoryData);
        console.log(response)
        console.log(category_name.value)
        category_name.value = '';
        document.getElementById('createCategoryModal').close();
        document.getElementById('showCategoriesModal').close()

        Swal.fire({
            title: "Category Creation Successfull",
            text: "You have created the category successfully",
            icon: "success"
        })
        loadCategories();
    } catch (err) {
        console.log(err);
    }
};

const editCategory = (category) => {
    currentCategory.value = category;
    category_name.value = category.categoryName;
    document.getElementById('editCategoryModal').showModal();
};

const saveCategory = async () => {
    try {
        const response = await updateCategory(currentCategory.value._id, {
            categoryName: category_name.value
        });
        category_name.value = '';
        currentCategory.value = null;
        document.getElementById('editCategoryModal').close();
        document.getElementById('showCategoriesModal').close()

        Swal.fire({
            title: "Update Successfull",
            text: "You have updated the category successfully",
            icon: "success"
        })
        loadCategories();
    } catch (err) {
        console.log(err);
    }
};

const deleteCategoryPrompt = async (category) => {
    document.getElementById('showCategoriesModal').close()
    const { value: confirmDelete } = await Swal.fire({
        title: `Delete ${category.categoryName}?`,
        text: "Deleting catagory also deletes all the products that have this cateogry. You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    });

    if (confirmDelete) {
        try {
            const response = await deleteCategory(category._id);
            Swal.fire(
                'Deleted!',
                `You have deleted the ${category.categoryName}`,
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
});
</script>




<template>
    <div class="flex items-center w-fit">
        <!-- show categories model -->
        <button title="Show Categories" class="bg-primary flex items-center gap-2 sm:text-xl rounded-l-xl"
            onclick="showCategoriesModal.showModal()">
            <span class="block px-3 py-2 bg-primary"><i class="fa-solid fa-table"></i></span>
            <span class="block pr-3 py-2">Categories</span>
        </button>
        <!-- Show Create category modal -->
        <button title="Create Category" class="px-3 py-2 bg-accent sm:text-xl"
            onclick="createCategoryModal.showModal()">
            <i class="fa-solid fa-plus"></i>
        </button>
    </div>
    <!-- Show Categories Modal -->
    <dialog id="showCategoriesModal" class="modal modal-top max-w-3xl mx-auto">
        <div class="modal-box">
            <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 class="text-lg font-bold pb-3 border-b">Categories</h3>
            <div class="overflow-x-auto">
                <table class="table table-lg">
                    <thead>
                        <tr>
                            <th>Category Name</th>
                            <th colspan="2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="category in allCategories" :key="category.id">
                            <td>{{ category.categoryName }}</td>
                            <td>
                                <span class="flex items-center gap-4 text-white">
                                    <button class="block bg-info px-3 py-1 rounded" @click="editCategory(category)">
                                        <i class="fa-solid fa-pen-to-square"></i>
                                    </button>
                                    <button class="block bg-error px-3 py-1 rounded"
                                        @click="deleteCategoryPrompt(category)">
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

    <!-- Create Category Modal -->
    <dialog id="createCategoryModal" class="modal modal-top max-w-xl mx-auto">
        <div class="modal-box">
            <form method="dialog">
                <button id="closeCreateCategoryModal"
                    class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 class="text-lg font-bold pb-3 border-b">Create a new category</h3>
            <form @submit.prevent="newCategory" class="">
                <input name="categoryName" v-model="category_name" type="text" placeholder="Category Name"
                    class="input input-bordered w-full my-4" />
                <button type="submit" class="block btn btn-primary px-6 py-0 ml-auto w-fit">Create</button>
            </form>
        </div>
    </dialog>

    <!-- Edit Category Modal -->
    <dialog id="editCategoryModal" class="modal modal-top max-w-xl mx-auto">
        <div class="modal-box">
            <form method="dialog">
                <button id="closeEditCategoryModal"
                    class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 class="text-lg font-bold pb-3 border-b">Update the category</h3>
            <form @submit.prevent="saveCategory" class="">
                <input name="categoryName" v-model="category_name" type="text" placeholder="Category Name"
                    class="input input-bordered w-full my-4" />
                <button type="submit" class="block btn btn-primary px-6 py-0 ml-auto w-fit">Save</button>
            </form>
        </div>
    </dialog>
</template>
