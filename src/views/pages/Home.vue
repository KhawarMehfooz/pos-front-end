<script setup>
import { ref, onMounted } from 'vue';
import Category from '@/components/Category/Category.vue'
import Inventory from '@/components/Inventory/Inventory.vue'
import Pos from '@/components/Pos/Pos.vue'
import Settings from '@/components/Settings/Settings.vue'
import Cookies from 'js-cookie';
import { toast } from 'vue3-toastify';
import { useRouter } from 'vue-router'
const router = useRouter()


const logOut = async () => {
    Cookies.remove('auth_token')
    toast('Logging out....', {
        type: 'info',
        autoClose: 2000
    })
    await new Promise(resolve => setTimeout(resolve, 2000))
    router.push('/login');
}
let showTransactions = ref(false)
let showPos = ref(true)

const showTransactionView = () => {
    showTransactions = true
    document.getElementById('transaction-btn').classList.add('hidden')
    document.getElementById('pos-btn').classList.remove('hidden')

    document.getElementById('pos-view').classList.add('hidden')
    document.getElementById('transaction-view').classList.remove('hidden')

}
const showPosView = () => {
    document.getElementById('pos-btn').classList.add('hidden')
    document.getElementById('transaction-btn').classList.remove('hidden')
    document.getElementById('pos-view').classList.remove('hidden')
    document.getElementById('transaction-view').classList.add('hidden')
}

</script>
<template>
    <v-app>
        <section class="container p-4 md:min-h-screen mx-auto bg-neutral-100 border rounded">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-4">
                    <Category />
                    <Inventory />
                </div>
                <div class="flex items-center gap-4">
                    <div class="flex items-center w-fit">
                        <button id="transaction-btn" title="Show Products"
                            class="bg-primary flex items-center gap-2 sm:text-xl rounded-l-xl"
                            @click="showTransactionView">
                            <span class="block px-3 py-2 bg-primary"><i class="fa-solid fa-credit-card"></i></span>
                            <span class="block pr-3 py-2">Transactions</span>
                        </button>
                        <button id="pos-btn" title="Show Products"
                            class="bg-primary flex items-center gap-2 sm:text-xl rounded-l-xl hidden"
                            @click="showPosView">
                            <span class="block px-3 py-2 bg-primary"><i class="fa-solid fa-credit-card"></i></span>
                            <span class="block pr-3 py-2">POS View</span>
                        </button>
                    </div>
                    <Settings />
                    <button title="Log out" class="text-xl bg-red-600 text-white py-2 px-3 rounded-sm"
                        @click="logOut"><i class="fa-solid fa-right-from-bracket"></i></button>
                </div>
            </div>
            <Pos />
        </section>
    </v-app>
</template>