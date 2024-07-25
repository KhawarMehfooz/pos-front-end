<script setup>
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

</script>
<template>
    <section class="container p-4 md:min-h-screen mx-auto bg-neutral-100 border rounded">
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-4">
                <Category />
                <Inventory />
            </div>
            <div class="flex items-center gap-4">
                <Settings />
                <button title="Log out" class="text-xl bg-red-600 text-white py-2 px-3 rounded-sm" @click="logOut"><i
                        class="fa-solid fa-right-from-bracket"></i></button>
            </div>
        </div>
        <Pos />
    </section>
</template>