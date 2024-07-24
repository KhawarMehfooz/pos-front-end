<script setup>
import { ref, onMounted, computed } from 'vue';
import { allProducts, loadProducts, getImageURL } from '@/utils/productUtils';
import { allCategories, loadCategories } from '@/utils/categoryUtils';
import { loadSettings } from '@/utils/settingsUtils';
import { createCustomer, getCustomers } from '@/services/posService'

import Swal from 'sweetalert2';

let customers = ref([])

let customerName = ref('')
let customerAddress = ref('')
let customerPhone = ref('')

const loadCustomers = async () => {
    try {
        customers.value = await getCustomers()
    } catch (err) {
        console.log(err)
    }
}

const createNewCustomer = async () => {
    const formData = new FormData()
    formData.append('customerName', customerName.value)
    formData.append('customerAddress', customerAddress.value)
    formData.append('customerPhone', customerPhone.value)
    try {
        const res = await createCustomer(formData)
        customerName.value = ''
        customerAddress.value = ''
        customerPhone.value = ''
        document.getElementById('createCustomerModal').close()
        Swal.fire({
            title: 'Customer Created Successfully',
            text: 'You have successfully created a new customer',
            icon: 'success'
        })
        loadCustomers()

    } catch (err) {
        console.log(err)
    }

}

let settings = ref([])
let selectedCategory = ref('*')

const filteredProducts = computed(() => {
    if (selectedCategory.value === '*') {
        return allProducts.value
    }
    return allProducts.value.filter(product => product.category === selectedCategory.value)
})

function filterProducts(categoryId) {
    selectedCategory.value = categoryId;
}

onMounted(async () => {
    settings = await loadSettings()
    await loadCustomers()
})

</script>

<template>
    <div class="bg-neutral-100">
        <section class=" flex gap-8 flex-col md:flex-row">
            <div style="min-height: calc(100vh - 200px);" class="md:w-[70%]">
                <!-- Categories List -->
                <ul
                    class="flex items-center gap-4 overflow-x-auto bg-neutral-200 border ring-gray-100 text-lg py-1 px-2 rounded-lg">
                    <li>
                        <button key="all" data-filter="*" @click="filterProducts('*')"
                            class="font-semibold border border-neutral-200 py-2 px-4 bg-neutral-100 rounded-xl">
                            All
                        </button>
                    </li>
                    <li class="" v-for="category in allCategories" :key="category._id"
                        @click="filterProducts(category._id)">
                        <button :key="category._id" data-filter="{{ category._id }}"
                            class="font-semibold border border-neutral-200 py-2 px-4 bg-neutral-100 rounded-xl">{{
                                category.categoryName }}</button>
                    </li>
                </ul>
                <!-- Products Grid -->
                <div style="max-height: calc(100vh - 150px);"
                    class="overflow-y-auto mt-4 grid gap-4 grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    <article v-for="product in filteredProducts" :key="product._id"
                        class="md:w-48 border bg-white p-4 rounded-lg ring-gray-100 cursor-pointer">
                        <img :src="getImageURL(product.image)" alt=""
                            class="rounded-full h-40 w-40 aspect-square mx-auto object-cover ">
                        <h2 class="mt-2 text-xl text-center">{{ product.name }}</h2>
                        <p class="text-center font-bold text-xl">{{ settings.currencySymbol + product.price }}
                        </p>
                    </article>
                </div>
            </div>
            <!-- cart -->
            <div style="min-height: calc(100vh - 200px);" class="relative bg-white rounded-md border md:w-[30%]">
                <div class="p-3">
                    <!-- Customers -->
                    <div class="flex items-center gap-4 border-b pb-4">
                        <fieldset class="w-full">
                            <form action="w-full">
                                <select class="py-2 w-full rounded border focus:outline-none cursor-pointer"
                                    name="customer" id="">
                                    <option value="walk-in">Walk in customer</option>
                                    <option v-for="customer in customers" value="">{{ customer.name }} </option>
                                </select>
                            </form>
                        </fieldset>
                        <button title="Create Customer"
                            class="bg-yellow-500 py-1 text-xl font-semibold px-4 rounded-md border-2 border-yellow-600"
                            onclick="createCustomerModal.show()">+</button>
                    </div>
                    <!-- Items In Cart -->
                    <div class="mt-4">
                        <div class="flex flex-col">
                            <div class="-m-1.5 overflow-x-auto">
                                <div class="p-1.5 min-w-full inline-block align-middle">
                                    <div class="border rounded-md overflow-hidden  ">
                                        <table class="min-w-full">
                                            <colgroup>
                                                <col width="40%">
                                                <col width="20%">
                                                <col width="20%">
                                                <col width="20%">
                                            </colgroup>
                                            <thead class="border-b">
                                                <tr>
                                                    <th scope="col"
                                                        class="pl-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                                                        Product</th>
                                                    <th scope="col"
                                                        class=" py-3 text-start text-xs font-medium text-gray-500 uppercase">
                                                        Quantity</th>
                                                    <th scope="col"
                                                        class=" pl-3 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                                                        price</th>
                                                    <th scope="col"
                                                        class="pr-3 py-3 text-end text-xs font-medium text-gray-500 uppercase">
                                                        Action</th>
                                                </tr>
                                            </thead>
                                        </table>
                                        <div class="max-h-[400px] overflow-y-auto">
                                            <table class="min-w-full divide-y divide-gray-200  ">
                                                <colgroup>
                                                    <col width="40%">
                                                    <col width="20%">
                                                    <col width="20%">
                                                    <col width="20%">
                                                </colgroup>
                                                <tbody class="divide-y divide-gray-200">
                                                    <tr>
                                                        <td
                                                            class="pl-3 py-4 whitespace-wrap text-sm font-medium text-gray-800 ">
                                                            Shoe</td>
                                                        <td class="py-4 whitespace-nowrap text-sm text-gray-800 ">
                                                            <input class="w-full border py-1 outline-none px-2"
                                                                value="4" type="number" name="" id="">
                                                        </td>
                                                        <td class="pl-3 py-4 whitespace-nowrap text-sm text-gray-800">
                                                            $55</td>
                                                        <td
                                                            class="pr-3 py-4 whitespace-nowrap text-end text-sm font-medium">
                                                            <button type="button"
                                                                class="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 ">Delete</button>
                                                        </td>
                                                    </tr>

                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Summary -->
                <div class="absolute bottom-0 mt-4 w-full border-t">
                    <div class="p-3">
                        <div class="my-4 flex items-center justify-between">
                            <p class="text-lg ">Subtotal</p>
                            <p class="text-lg font-semibold">$55</p>
                        </div>
                        <div class="my-4 flex items-center justify-between">
                            <p class="text-lg ">Discount (%)</p>
                            <p class="text-lg font-semibold">
                                <input class="outline-none border w-[80px] px-2 text-lg" type="number" min="0"
                                    name="discount" id="discount">
                            </p>
                        </div>
                        <div class="my-4 flex items-center justify-between">
                            <p class="text-lg ">Grand Total</p>
                            <p class="text-3xl font-semibold">$55</p>
                        </div>
                        <div class="flex items-center justify-center gap-8">
                            <button class="bg-green-500 rounded-md text-lg py-2 w-[50%] text-white font-semibold">Hold
                                Order</button>
                            <button
                                class="bg-sky-500 rounded-md text-lg text-white font-semibold py-2 w-[50%]">Pay</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- Create customer modal -->
        <dialog id="createCustomerModal" class="modal modal-top  max-w-xl mx-auto">
            <div class="modal-box">
                <form method="dialog">
                    <button id="closeCreateCustomerModal"
                        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <h3 class="text-lg font-bold pb-3 border-b">Create a new customer</h3>
                <form @submit.prevent="createNewCustomer" class="">
                    <input name="customerName" v-model="customerName" type="text" placeholder="Customer Name"
                        class="input input-bordered w-full my-4" />
                    <input name="customerAddress" v-model="customerAddress" type="text" placeholder="Address"
                        class="input input-bordered w-full my-4" />
                    <input name="customerPhone" v-model="customerPhone" type="number" placeholder="Phone Number"
                        class="input input-bordered w-full my-4" />
                    <button type="submit" class="block btn btn-primary px-6 py-0 ml-auto w-fit">Create</button>
                </form>
            </div>
        </dialog>
    </div>

</template>