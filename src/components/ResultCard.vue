<script setup>
defineProps({
  confirmedFood: {
    type: Object,
    default: null,
  },
});

defineEmits(["restart"]);
</script>

<template>
  <section v-if="confirmedFood" class="result-card">
    <h3>오늘의 식사는 {{ confirmedFood.name }}!</h3>
    <p>맛있게 먹고 오세요.</p>
    <!-- <button class="ghost-btn" @click="$emit('restart')">다시 하기</button> !-->
  </section>
</template>
