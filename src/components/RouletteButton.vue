<script setup>
defineEmits(["pick"]);

defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <button class="primary-btn" :disabled="disabled" @click="$emit('pick')">메뉴 뽑기</button>
</template>
