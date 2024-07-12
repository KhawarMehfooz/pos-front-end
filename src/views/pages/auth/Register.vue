<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { registerUser } from '@/services/authService'
import { toast } from 'vue3-toastify';


const register_fullname = ref('')
const register_email = ref('')
const register_password = ref('')
const showAlert = ref(false)
const alertMessage = ref('')
const router = useRouter()

const signUp = async () => {
    try {
        const response = await registerUser({
            fullName: register_fullname.value,
            email: register_email.value,
            password: register_password.value
        });
        toast('Registration successfull. Redirecting....', {
            autoClose: 3000,
            type: "success"
        })
        setTimeout(() => {
            router.push('/login')
        }, 3000)
    } catch (err) {
        if (err.response.status === 400) {
            toast(`${err.response.data.message || 'Email already in use or invalid data'} `, {
                autoClose: 3000,
                type: "error"
            })
        } else {
            if (err.response.status === 400) {
                toast(`Something went wrong, try again...`, {
                    autoClose: 3000,
                    type: "error"
                })
            }
        }
    }
}
</script>

<template>
    <div class="mt-4 p-8 container mx-auto">
        <div class="p-4 sm:max-w-2xl border rounded-sm mx-auto">
            <h1 class="mb-4 text-center text-2xl font-semibold uppercase">Register</h1>
            <form @submit.prevent="signUp" action="w-full">
                <label class="my-4 input input-bordered flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"
                        class="h-4 w-4 opacity-70">
                        <path
                            d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                    </svg>
                    <input v-model="register_fullname" name="fullName" autocomplete="off" type="text" class="grow"
                        placeholder="Full Name" />
                </label>
                <label class=" my-4 input input-bordered flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"
                        class="h-4 w-4 opacity-70">
                        <path
                            d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                        <path
                            d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                    </svg>
                    <input v-model="register_email" name="email" autocomplete="off" type="text" class="grow"
                        placeholder="Email" />
                </label>
                <label class="my-4 input input-bordered flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"
                        class="h-4 w-4 opacity-70">
                        <path fill-rule="evenodd"
                            d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 1 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                            clip-rule="evenodd" />
                    </svg>
                    <input v-model="register_password" autocomplete="off" name="password" type="password" class="grow"
                        value="" placeholder="Password" />
                </label>
                <button role="button" type="submit" id="register-btn"
                    class="btn btn-primary block uppercase px-10 mx-auto w-fit">Register</button>
            </form>
            <div class="my-4 text-center">
                <p>Already have an account? <span class="underline">
                        <RouterLink to="/login">Login</RouterLink>
                    </span></p>
            </div>
        </div>
    </div>
</template>