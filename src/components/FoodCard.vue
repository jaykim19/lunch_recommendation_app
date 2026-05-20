<script setup>
defineProps({
  food: {
    type: Object,
    default: null,
  },
  emptyMessage: {
    type: String,
    default: "",
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <section class="card" aria-live="polite">
    <p class="card-label">오늘의 추천 메뉴</p>
    <div v-if="isLoading" class="loading-foods" aria-label="메뉴 로딩 중">
      <span class="loading-food-item">🍜</span>
      <span class="loading-food-item">🍔</span>
      <span class="loading-food-item">🍣</span>
      <span class="loading-food-item">🍕</span>
    </div>
    <div v-if="food" class="food-body">
      <h2 class="food-name">{{ food.name }}</h2>
      <p class="food-category">{{ food.category }}</p>
    </div>
    <p v-else-if="!isLoading" class="placeholder">
      <template v-if="emptyMessage">{{ emptyMessage }}</template>
      <template v-else>
        아직 메뉴를 뽑지 않았어요.<br />
        메뉴 뽑기 버튼을 눌러보세요!
      </template>
    </p>
  </section>
</template>
