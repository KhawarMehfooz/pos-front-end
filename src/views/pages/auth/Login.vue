<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { loginUser } from '@/services/authService'
import { toast } from 'vue3-toastify';

const login_email = ref('')
const login_password = ref('')
const showAlert = ref(false)
const alertMessage = ref('')
const router = useRouter()

const login = async () => {
    try {
        const response = await loginUser({
            email: login_email.value,
            password: login_password.value
        });
        document.cookie = `auth_token=${response.token}; expires=${response.expires}; path=/`;
        toast('Logged in successfully. Redirecting....',{
            autoClose: 3000,
            type: "success"
        })
        setTimeout(() => {
            showAlert.value = false
            router.push('/')
        }, 3000)
    } catch (err) {
        toast('Incorrect email or password..',{
            autoClose: 3000,
            type: "error"
        })
    }
}
</script>

<template>
    <div class="mt-4 p-8 container mx-auto">
        <div class="p-4 sm:max-w-2xl border rounded-sm mx-auto">
            <h1 class="mb-4 text-center text-2xl font-semibold uppercase">Login</h1>
            <form @submit.prevent="login" action="w-full">
                <label class=" my-4 input input-bordered flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"
                        class="h-4 w-4 opacity-70">
                        <path
                            d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                        <path
                            d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                    </svg>
                    <input v-model="login_email" name="email" autocomplete="off" type="text" class="grow"
                        placeholder="Email" />
                </label>
                <label class="my-4 input input-bordered flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"
                        class="h-4 w-4 opacity-70">
                        <path fill-rule="evenodd"
                            d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 1 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                            clip-rule="evenodd" />
                    </svg>
                    <input v-model="login_password" autocomplete="off" name="password" type="password" class="grow"
                        value="" placeholder="Password" />
                </label>
                <button role="button" type="submit" id="register-btn"
                    class="btn btn-primary block uppercase px-10 mx-auto w-fit">Login</button>
            </form>
            <div class="my-4 text-center">
                <p>Don't have an account? <span class="underline">
                        <RouterLink to="/register">Register</RouterLink>
                    </span></p>
            </div>
        </div>
    </div>
</template>
