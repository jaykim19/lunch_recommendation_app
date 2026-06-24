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
  <button class="primary-btn" :disabled="disabled" @click="$emit('pick')">
    <span aria-hidden="true">🎲</span>
    메뉴 뽑기
  </button>
</template>
