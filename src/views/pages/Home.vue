<script setup>
import Category from '@/components/Category/Category.vue'
import Inventory from '@/components/Inventory/Inventory.vue'


</script>
<template>
    <section class="container p-4 md:min-h-screen mx-auto bg-neutral-100 border rounded">
        <div class="flex items-center gap-4">
            <Category/>
            <Inventory/>
        </div>
    </section>
</template>