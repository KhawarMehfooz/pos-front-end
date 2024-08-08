<script setup>
import { ref, onMounted, computed, toValue } from 'vue';
import { allProducts, loadProducts, getImageURL, } from '@/utils/productUtils';
import { allCategories, loadCategories } from '@/utils/categoryUtils';
import { loadSettings } from '@/utils/settingsUtils';
import { createCustomer, getCustomers, getCustomerById, createTransaction, getProductById, getAllTransaction, getAllProducts } from '@/services/posService'
import DataTable from 'datatables.net-vue3'

import Swal from 'sweetalert2';

let customers = ref([])

let customerName = ref('')
let customerAddress = ref('')
let customerPhone = ref('')
let settings = ref([])
let selectedCategory = ref('*')
let cart = ref([]);
let paidAmount = ref(0);
let selectedCustomer = ref('walk-in');

const receipt = ref({
    customer: '',
    customerName: '',
    customerPhone: '',
    items: [],
    orderNumber: '',
    subtotal: '',
    discount: '',
    tax: '',
    total: '',
    paid: '',
    change: '',
    date: '',
    time: ''
});


const addProductToCart = (productId) => {
    const product = allProducts.value.find(p => p._id === productId);
    if (!product) return;

    const cartItem = cart.value.find(item => item.product._id === productId);
    if (cartItem) {
        if (cartItem.quantity < product.quantity) {
            cartItem.quantity++;
        } else {
            Swal.fire({
                title: 'Out of Stock',
                text: 'The requested quantity is more than available stock',
                icon: 'error'
            });
        }
    } else {
        cart.value.push({
            product,
            quantity: 1,
            price: product.price
        });
    }
};

const updateQuantity = (cartItem) => {
    const product = allProducts.value.find(p => p._id === cartItem.product._id);
    if (cartItem.quantity > product.quantity) {
        Swal.fire({
            title: 'Out of Stock',
            text: 'The requested quantity is more than available stock',
            icon: 'error'
        });
        cartItem.quantity = product.quantity;
    }
};

const removeFromCart = (productId) => {
    cart.value = cart.value.filter(item => item.product._id !== productId);
};

const clearCart = () => {
    cart.value = []
}

let discount = ref(0);

const subtotal = computed(() => (cart.value.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0).toFixed(2));
const discountAmount = computed(() => ((subtotal.value * discount.value) / 100 || 0).toFixed(2));
const grandTotal = computed(() => (subtotal.value - discountAmount.value || 0).toFixed(2));
const vatAmount = computed(() => {
    if (settings.chargeVat === '1') {

        const vatPercentage = parseFloat(settings.vatPercentage) || 0;
        const grandTotalValue = parseFloat(grandTotal.value) || 0;
        return (grandTotalValue * vatPercentage / 100).toFixed(2);
    }
    return 0
});

const finalTotal = computed(() => (parseFloat(grandTotal.value) + parseFloat(vatAmount.value) || 0).toFixed(2));
const changeAmount = computed(() => (paidAmount.value - finalTotal.value || 0).toFixed(2));



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



const filteredProducts = computed(() => {
    if (selectedCategory.value === '*') {
        return allProducts.value
    }
    return allProducts.value.filter(product => product.category === selectedCategory.value)
})

function filterProducts(categoryId) {
    selectedCategory.value = categoryId;
}

const processPayment = async () => {
    const transactionData = {
        orderNumber: Math.floor(Date.now() / 10000),
        customer: selectedCustomer.value,
        discount: discount.value,
        subtotal: subtotal.value,
        tax: vatAmount.value,
        items: cart.value.map(item => ({ product: item.product._id, quantity: item.quantity })),
        total: finalTotal.value,
        paid: paidAmount.value,
        change: changeAmount.value
    };
    try {
        await createTransaction(transactionData);
        document.getElementById('paymentModal').close();


        showReceipt(transactionData);

        cart.value = [];
        discount.value = 0;
        paidAmount.value = 0;
        document.getElementById('receiptModal').showModal();
    } catch (err) {
        console.log(err);
    }
};

const showReceipt = async (transactionData) => {
    const customerDetails = selectedCustomer.value !== 'walk-in' ? await getCustomerById(selectedCustomer.value) : {};
    const itemsWithProductDetails = await Promise.all(
        transactionData.items.map(async item => {
            const product = await getProductById(item.product);

            console.log(customerDetails);

            receipt.customerName = customerDetails.name || 'Walk-in';
            receipt.customerPhone = customerDetails.phone || '';
            return {
                ...item,
                productName: product.name,
                price: product.price
            };
        })
    );

    receipt.value = {
        ...transactionData,
        customerName: customerDetails.name || 'Walk-in',
        customerPhone: customerDetails.phone || '',
        items: itemsWithProductDetails,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
    };
};

const orders = ref([]);

const headers = ref([
    {
        title: 'Order ID',
        value: 'orderNumber'
    }, {
        title: 'Order Date',
        value: 'createdAt'
    },
    {
        title: 'Total',
        value: 'total'
    }, {
        title: 'Paid',
        value: 'paid'
    }, {
        title: 'Change',
        value: 'change'
    }
])

const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-GB', options).replace(',', '');
};
const formatCurrency = (value) => {
    if (value === null || value === undefined) return '';
    return `${settings.currencySymbol}${parseFloat(value).toFixed(2)}`;
};

const fetchTransactions = async () => {
    try {
        const data = await getAllTransaction();
        orders.value = data;
    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
};

const formattedOrders = computed(() => {
    return orders.value.map(order => ({
        ...order,
        total: formatCurrency(order.total),
        paid: formatCurrency(order.paid),
        change: formatCurrency(order.change),
        createdAt: formatDate(order.createdAt),
    }));
});

const searchQuery = ref('');
const filteredOrders = computed(() => {
    if (!searchQuery.value) return formattedOrders.value;
    return formattedOrders.value.filter(order =>
        order.orderNumber.toString().toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

const productTableHeaders = ref([
    {
        title: 'Product Name',
        value: 'name'
    }, {
        title: 'Sold',
        value: 'sold'
    },
    {
        title: 'Available',
        value: 'available'
    }, {
        title: 'Total Sales',
        value: 'totalSales'
    },
])

let transactionForProductTable = ref([])
let computedProducts = ref([])
let productMap = {}
let products = ref([])

const fetchProductsAndTransactions = async () => {
    try {
        transactionForProductTable.value = await getAllTransaction();
        products.value = await getAllProducts();

        products.value.forEach(prod => {
            productMap[prod._id] = {
                name: prod.name,
                available: prod.quantity,
                sold: 0,
                totalSales: 0,
            };
        });

        for (let transaction of transactionForProductTable.value) {
            for (let item of transaction.items) {
                const product = productMap[item.product];
                try {
                    const productDetails = await getProductById(item.product);
                    const price = productDetails.price || 0;
                    if (product) {
                        product.sold += item.quantity;
                        product.totalSales += item.quantity * price;
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        }

        computedProducts.value = Object.values(productMap);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

onMounted(async () => {
    settings = await loadSettings()
    await fetchTransactions()
    await loadCustomers()
    await fetchProductsAndTransactions();
})

</script>

<template>
    <div id="pos-view" class="bg-neutral-100">
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
                        @click="addProductToCart(product._id)"
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
                                    name="customer" v-model="selectedCustomer" id="">
                                    <option value="walk-in">Walk in customer</option>
                                    <option v-for="customer in customers" :key="customer._id" :value="customer._id">{{
                                        customer.name }} </option>
                                </select>
                            </form>
                        </fieldset>
                        <button title="Create Customer"
                            class="bg-yellow-500 py-1 text-xl font-semibold px-4 rounded-md border-2 border-yellow-600"
                            onclick="createCustomerModal.showModal()">+</button>
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
                                                    <th scope="col" title="Clear Cart" @click="clearCart()"
                                                        class="cursor-pointer pr-3 py-3 text-end text-xl font-medium text-red-600 uppercase">
                                                        <i class="fa-solid fa-xmark"></i>
                                                    </th>
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
                                                    <tr v-for="item in cart" :key="item.product._id">
                                                        <td
                                                            class="pl-3 py-4 whitespace-wrap text-sm font-medium text-gray-800 ">
                                                            {{ item.product.name }}
                                                        </td>
                                                        <td class="py-4 whitespace-nowrap text-sm text-gray-800 ">
                                                            <input class="w-full border py-1 outline-none px-2"
                                                                value="4" type="number" v-model="item.quantity"
                                                                @change="updateQuantity(item)"
                                                                :max="item.product.quantity" name="" id="">
                                                        </td>
                                                        <td class="pl-3 py-4 whitespace-nowrap text-sm text-gray-800">
                                                            {{ settings.currencySymbol + item.price * item.quantity }}
                                                        </td>
                                                        <td
                                                            class="pr-3 py-4 whitespace-nowrap text-end text-sm font-medium">
                                                            <button type="button"
                                                                @click="removeFromCart(item.product._id)"
                                                                title="Remove Item"
                                                                class="inline-flex items-center gap-x-2 text-xl font-semibold rounded-lg border border-transparent text-red-500 hover:text-red-600 disabled:opacity-50 "><i
                                                                    class="fa-solid fa-xmark"></i></button>
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
                            <p class="text-lg font-semibold">{{ settings.currencySymbol + subtotal }}</p>
                        </div>
                        <div class="my-4 flex items-center justify-between">
                            <p class="text-lg ">Discount (%)</p>
                            <p class="text-lg font-semibold">
                                <input class="outline-none border w-[80px] px-2 text-lg" type="number" min="0"
                                    name="discount" v-model="discount" id="discount">
                            </p>
                        </div>
                        <div v-if="settings.chargeVat === '1'" class="my-4 flex items-center justify-between">
                            <p class="text-lg ">VAT ({{ settings.vatPercentage }}%)</p>
                            <p class="text-3xl font-semibold">{{ settings.currencySymbol + vatAmount }}</p>
                        </div>
                        <div class="my-4 flex items-center justify-between">
                            <p class="text-lg ">Grand Total</p>
                            <p class="text-3xl font-semibold">{{ settings.currencySymbol + finalTotal }}</p>
                        </div>
                        <div class="flex items-center justify-center gap-8">
                            <button class="bg-green-500 rounded-md text-lg py-2 w-[50%] text-white font-semibold">Hold
                                Order</button>
                            <button onclick="paymentModal.showModal()"
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
                    <label class="form-control w-full">
                        <div class="label">
                            <span class="label-text">Customer Name</span>
                        </div>
                        <input name="customerName" v-model="customerName" type="text"
                            class="input input-bordered w-full" />
                    </label>
                    <label class="form-control w-full">
                        <div class="label">
                            <span class="label-text">Customer Address</span>
                        </div>
                        <input name="customerAddress" v-model="customerAddress" type="text"
                            class=" input input-bordered w-full" />
                    </label>
                    <label class="form-control w-full mb-4">
                        <div class="label">
                            <span class="label-text">Customer Contact Number</span>
                        </div>
                        <input name="customerPhone" v-model="customerPhone" type="number"
                            class="input input-bordered w-full" />
                    </label>
                    <button type="submit" class="block btn btn-primary px-6 py-0 ml-auto w-fit">Create</button>
                </form>
            </div>
        </dialog>
        <!-- Payment Modal -->
        <dialog id="paymentModal" class="modal modal-top  max-w-xl mx-auto">
            <div class="modal-box">
                <form method="dialog">
                    <button id="closePaymentModal"
                        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <h3 class="text-lg font-bold pb-3 border-b">Enter Payment Details</h3>
                <form @submit.prevent="processPayment" class="">
                    <div class="my-4">
                        <label for="paidAmount" class="block text-lg">Amount Paid by Customer</label>
                        <input name="paidAmount" v-model="paidAmount" type="number" class="input input-bordered w-full"
                            required />
                    </div>
                    <div v-if="changeAmount >= 0" class="my-4">
                        <p class="text-lg">Change to be returned:</p>
                        <p class="text-3xl font-semibold">{{ settings.currencySymbol + changeAmount }}</p>
                    </div>
                    <button type="submit" class="block btn btn-primary px-6 py-0 ml-auto w-fit">Process Payment</button>
                </form>
            </div>
        </dialog>

        <!-- Receipt Modal -->
        <dialog id="receiptModal" class="modal modal-top  max-w-fit mx-auto">
            <div class="modal-box">
                <form method="dialog">
                    <button id="closeReceiptModal"
                        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <div class="w-[302px] border mx-auto my-3 font-martian">
                    <!-- Store Info -->
                    <div class="">
                        <img class="w-24 mx-auto object-cover" :src="getImageURL(settings.storeLogo)" alt="logo" />
                        <p class="text-center">{{ settings.storeName }}</p>
                        <p class="text-center"><i class="fa-solid fa-phone"></i> {{ settings.storeContactNumber }}</p>
                        <p class="text-center"><i class="fa-solid fa-location-dot"></i> {{ settings.storeLocation }}</p>
                    </div>
                    <hr class="border-t" />
                    <!-- Sales Receipt -->
                    <div class="my-2">
                        <h3 class="text-center text-lg font-semibold uppercase">
                            Sales Receipt
                        </h3>
                    </div>
                    <hr class="border-t" />
                    <!-- Customer Details -->
                    <div class="my-2">
                        <h3 class="text-center text-md font-semibold uppercase">Customer Details</h3>
                        <p class="text-sm">Customer Name: {{ receipt.customerName }}</p>
                        <p class="text-sm" v-if="receipt.customerPhone">Customer Phone: {{
                            receipt.customerPhone }}</p>
                    </div>
                    <hr class="border-t" />

                    <div class="my-2">
                        <h3 class="text-center text-md font-semibold uppercase">
                            Order Details
                        </h3>
                    </div>
                    <hr class="border-t" />

                    <table class="w-full mb-6 text-left">
                        <colgroup>
                            <col width="70%" />
                            <col width="20%" />
                            <col width="10%" />
                        </colgroup>
                        <thead class="border-b">
                            <tr class="">
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm">
                            <tr v-for="item in receipt.items" :key="item.product">
                                <td>{{ item.productName }}</td>
                                <td>{{ item.quantity }}</td>
                                <td>{{ settings.currencySymbol + item.price * item.quantity }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="my-2">
                        <hr />
                        <div class="my-1 flex items-center justify-between">
                            <p class="text-md font-semibold">Sub Total:</p>
                            <p class="font-semibold">{{ settings.currencySymbol + receipt.subtotal }}</p>
                        </div>
                        <hr />
                        <div class="my-1 flex items-center justify-between">
                            <p class="text-md font-semibold">Discount:</p>
                            <p class="font-semibold">{{ +receipt.discount }}%</p>
                        </div>
                        <hr />
                        <div class="my-1 flex items-center justify-between" v-if="settings.chargeVat === '1'">
                            <p class="text-md font-semibold">VAT(<span>{{ settings.vatPercentage }}</span>%):</p>
                            <p class="font-semibold">{{ settings.currencySymbol + receipt.tax }}</p>
                        </div>
                        <hr />
                        <div class="flex items-center justify-between text-2xl">
                            <p class="font-semibold">Total:</p>
                            <p class="font-semibold">{{ settings.currencySymbol + receipt.total }}</p>
                        </div>
                        <div class="my-1 flex items-center justify-between text-md">
                            <p class="font-semibold">Paid:</p>
                            <p class="font-semibold">{{ settings.currencySymbol + receipt.paid }}</p>
                        </div>
                        <div class="my-1 flex items-center justify-between text-md">
                            <p class="font-semibold">Change:</p>
                            <p class="font-semibold">{{ settings.currencySymbol + receipt.change }}</p>
                        </div>
                        <hr />
                        <br />
                        <h3 class="text-center uppercase font-semibold">Thank You</h3>
                        <br />
                        <hr />
                        <div class="flex items-center justify-between text-sm">
                            <p>{{ receipt.date }}</p>
                            <p>{{ receipt.time }}</p>
                            <p>Admin</p>
                        </div>
                        <hr />
                    </div>
                    <p class="text-neutral-400 text-xs text-center">
                        {{ receipt.orderNumber }}
                    </p>
                </div>
                <button class="block btn btn-primary w-fit mx-auto text-lg font-martian"><i
                        class="fa-solid fa-print"></i> Print Receipt</button>
            </div>
        </dialog>
    </div>
    <div id="transaction-view" class="hidden">
        <!-- Transactions -->
        <div class="bg-white rounded-md border p-4">
            <div class="flex gap-4 flex-col md:flex-row">
                <div style="min-height: calc(100vh - 200px);" class="relative rounded-md border md:w-[30%]">
                    <h2 class="p-4 text-xl font-semibold">Products Overview</h2>
                    <hr>
                    <v-data-table :headers="productTableHeaders" :items="computedProducts" class="elevation-1 products-table">
                        <template v-slot:body.cell.totalSales="{ item }">
                            {{ formatCurrency(item.totalSales) }}
                        </template>
                    </v-data-table>
                </div>
                <div style="min-height: calc(100vh - 200px); " class=" rounded-md border md:w-[70%]">
                    <v-card flat>
                        <v-card-title class="d-flex align-center pe-2">
                            <v-icon icon="mdi-video-input-component"></v-icon> &nbsp;
                            Transactions

                            <v-spacer></v-spacer>

                            <v-text-field v-model="searchQuery" density="compact" label="Search by Order ID..."
                                prepend-inner-icon="mdi-magnify" variant="solo-filled" flat hide-details
                                single-line></v-text-field>
                        </v-card-title>

                        <v-divider></v-divider>
                        <v-data-table :headers="headers" :items="filteredOrders" class="elevation-1 transactions-table"
                            style="overflow-y: auto;">

                        </v-data-table>
                    </v-card flat>
                </div>
            </div>
        </div>
    </div>

</template>

<style scoped>
.transactions-table:deep(.v-data-table-header__content) {
    font-size: 1.125rem;
    font-weight: 600;
}
.products-table:deep(.v-data-table-header__content){
    font-weight: 600;
}
</style>