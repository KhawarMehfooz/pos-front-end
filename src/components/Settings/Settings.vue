<script setup>
import { ref, onMounted, computed } from 'vue';
import Swal from 'sweetalert2';
import { saveSettings, getSettings } from '@/services/posService';
import { getImageURL } from '@/utils/productUtils';

const store_name = ref('')
const store_location = ref('')
const contact_number = ref('')
const currency_symbol = ref('')
const charge_vat = ref('')
const vat_percentage = ref('')
const store_logo = ref(null)
const current_logo_url = ref('');

const handleFileChange = (event) => {
    store_logo.value = event.target.files[0];
    if (store_logo.value) {
        current_logo_url.value = '';
    }
};

const openSettingModal = async () => {
    try {
        let settings = await getSettings()
        store_name.value = settings?.storeName || ''
        store_location.value = settings?.storeLocation || ''
        contact_number.value = settings?.storeContactNumber || ''
        currency_symbol.value = settings?.currencySymbol || ''
        charge_vat.value = settings?.chargeVat === '1'
        vat_percentage.value = settings?.vatPercentage || ''
        current_logo_url.value = settings?.storeLogo || ''
        document.getElementById('settingsModal').showModal()
    } catch (err) {
        console.log(err)
    }
}

const savePosSettings = async () => {
    try {
        const formData = new FormData()
        formData.append('storeName', store_name.value)
        formData.append('storeLocation', store_location.value)
        formData.append('storeContactNumber', contact_number.value)
        formData.append('currencySymbol', currency_symbol.value)
        formData.append('chargeVat', charge_vat.value ? '1' : '0')
        formData.append('vatPercentage', vat_percentage.value)
        if (store_logo.value) {
            formData.append('storeLogo', store_logo.value)
        }
        const response = await saveSettings(formData)
        document.getElementById('settingsModal').close();

        Swal.fire({
            title: "Settings Saved",
            text: "You have saved the settings successfully",
            icon: "success"
        })
    } catch (err) {
        console.log(err)
    }

}
const showVatPercentage = computed(() => charge_vat.value);


</script>
<template>
    <button title="Settings" class="text-xl bg-primary py-2 px-3 rounded-sm" @click="openSettingModal()">
        <i class="fa-solid fa-gear"></i>
    </button>
    <dialog id="settingsModal" class="modal modal-top max-w-4xl mx-auto">
        <div class="modal-box">
            <form method="dialog">
                <button id="closeSettingsModal"
                    class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 class="text-lg font-bold pb-3 border-b">Settings</h3>
            <form @submit.prevent="savePosSettings" class="mt-4" enctype="multipart/form-data">
                <div class="md:flex md:items-center md:gap-4">
                    <label  class="form-control w-full mb-4">
                        <div class="label">
                            <span class="label-text">Store Name</span>
                        </div>
                        <input type="text" name="storeName" v-model="store_name" placeholder="Store Name"
                            class="input input-bordered w-full" />
                    </label>
                    <label  class="form-control w-full mb-4">
                        <div class="label">
                            <span class="label-text">Store Location</span>
                        </div>
                        <input type="text" name="storeLocation" v-model="store_location" placeholder="Address"
                            class="input input-bordered w-full" />
                    </label>
                </div>
                <div class="md:flex md:items-center md:gap-4">
                    <label  class="form-control w-full mb-4">
                        <div class="label">
                            <span class="label-text">Store Contact Info</span>
                        </div>
                        <input type="number" name="storeContactNumber" v-model="contact_number"
                            placeholder="Contact Number" class="input input-bordered w-full" />
                    </label>
                    <label  class="form-control w-full mb-4">
                        <div class="label">
                            <span class="label-text">Currency Symbol</span>
                        </div>
                        <input type="text" name="currencySymbol" v-model="currency_symbol" placeholder="Currency Symbol"
                            class="input input-bordered w-full" />
                    </label>
                </div>
                <div class="md:flex md:items-center md:gap-4">
                    <label  class="form-control w-full mb-4">
                        <div class="label">
                            <span class="label-text">Charge VAT</span>
                            <input type="checkbox" name="chargeVat" v-model="charge_vat" class="toggle" />
                        </div>
                    </label>
                    <label v-if="showVatPercentage"  class="form-control w-full mb-4">
                        <div class="label">
                            <span class="label-text">VAT Percentage</span>
                        </div>
                        <input type="number" name="vatPercentage" v-model="vat_percentage" placeholder="VAT %"
                            class="input input-bordered w-full" />
                    </label>
                </div>
                <div class="md:flex md:items-center md:gap-4">
                    <div class="w-full">
                        <div class="label">
                            <span class="label-text">Logo</span>
                        </div>
                        <input type="file" name="storeLogo" class="file-input file-input-bordered w-full"
                            accept="image/*" @change="handleFileChange" />
                    </div>
                    <div class="w-full">
                        <div v-if="current_logo_url" class="label">
                            <span class="label-text">Current Logo</span>
                            <img :src="getImageURL(current_logo_url)" height="100" width="100" alt="">
                        </div>

                    </div>
                </div>
                <button type="submit" class="block btn btn-primary px-6 py-0 ml-auto w-fit my-4">Save Settings</button>

            </form>
        </div>
    </dialog>
</template>