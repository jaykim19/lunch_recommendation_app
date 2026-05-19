<script setup>
defineEmits(["confirm", "reject"]);

defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div class="choice-buttons">
    <!-- <button class="confirm-btn" :disabled="disabled" @click="$emit('confirm')">먹을래요!</button> -->
    <!--<button class="reject-btn" :disabled="disabled" @click="$emit('reject')">나중에 먹을래요!</button>!-->
  </div>
</template>
