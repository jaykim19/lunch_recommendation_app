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
  loadingText: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <section class="card" :class="{ 'is-ai-card': food?.isAi }" aria-live="polite">
    <div class="card-header-row">
      <p class="card-label">Today's Pick</p>
      <span v-if="food?.isAi" class="ai-pill-badge">
        <span class="ai-sparkle-icon" aria-hidden="true">✨</span>
        ChatGPT 추천
      </span>
    </div>

    <div v-if="isLoading" class="loading-container" aria-label="메뉴 로딩 중">
      <div class="loading-foods">
        <span class="loading-food-item">🍜</span>
        <span class="loading-food-item">🍔</span>
        <span class="loading-food-item">🍣</span>
        <span class="loading-food-item">🍕</span>
      </div>
      <p v-if="loadingText" class="loading-text">{{ loadingText }}</p>
    </div>

    <div v-if="food && !isLoading" class="food-body">
      <h2 class="food-name">{{ food.name }}</h2>
      <p class="food-category">{{ food.category }}</p>
      <div v-if="food.reason" class="ai-reason-box">
        <p class="ai-reason-text">"{{ food.reason }}"</p>
      </div>
    </div>

    <p v-else-if="!isLoading" class="placeholder">
      <template v-if="emptyMessage">{{ emptyMessage }}</template>
      <template v-else>
        아직 메뉴를 뽑지 않았어요.<br />
        키워드로 AI 추천을 받거나 메뉴 뽑기 버튼을 눌러보세요.
      </template>
    </p>
  </section>
</template>
