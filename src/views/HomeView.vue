<script setup>
import { computed, onMounted, ref } from "vue";
import FoodCard from "../components/FoodCard.vue";
import RouletteButton from "../components/RouletteButton.vue";
import ChoiceButtons from "../components/ChoiceButtons.vue";
import ResultCard from "../components/ResultCard.vue";
import { useFoodStore } from "../stores/foodStore";

const store = useFoodStore();
const showCategoryOptions = ref(false);
const selectedCategorySet = computed(() => new Set(store.selectedCategories));
const categorySummary = computed(() =>
  store.selectedCategories.length === 0
    ? "전체 메뉴"
    : `${store.selectedCategories.length}개 선택`,
);

onMounted(() => {
  store.loadState();
});

function onPick() {
  store.pickRandomFood();
}

function onConfirm() {
  store.confirmCurrentFood();
}

function onReject() {
  store.rejectCurrentFood();
}

function onRestart() {
  store.resetRound();
}

function onToggleCategory(category, checked) {
  const next = new Set(store.selectedCategories);

  if (checked) next.add(category);
  else next.delete(category);

  store.setSelectedCategories([...next]);
}
</script>

<template>
  <main class="layout">
    <header class="hero">
      <div class="hero-title-wrap">
        <span class="hero-icon" aria-hidden="true">🍱</span>
        <h1>오늘의 한끼픽</h1>
      </div>
      <p>
        오늘의 식사 메뉴를 골라드릴게요. <br/>
        버튼을 눌러 오늘의 메뉴를 확인해보세요!
        </p>
    </header>

    <section class="toolbar">
      <label for="">카테고리</label>
      <div class="category-select-wrap">
        <button
          id="category-select-trigger"
          class="category-select-trigger"
          type="button"
          @click="showCategoryOptions = !showCategoryOptions"
        >
          {{ categorySummary }}
        </button>

        <div v-if="showCategoryOptions" class="category-options">
          <label v-for="category in store.categories" :key="category" class="category-option">
            <input
              type="checkbox"
              :checked="selectedCategorySet.has(category)"
              @change="onToggleCategory(category, $event.target.checked)"
            />
            <span>{{ category }}</span>
          </label>
        </div>
      </div>

      <button class="ghost-btn reset-btn" @click="store.resetAllStats">🗑️ 통계 초기화</button>
    </section>

    <FoodCard :food="store.currentFood" :emptyMessage="store.emptyMessage" />

    <RouletteButton :disabled="!store.hasAvailableFoods" @pick="onPick" />

    <ChoiceButtons :disabled="!store.currentFood || !!store.confirmedFood" @confirm="onConfirm" @reject="onReject" />

    <ResultCard :confirmedFood="store.confirmedFood" @restart="onRestart" />

    <details class="stats stats-accordion">
      <summary>통계 보기</summary>
      <div class="stats-content">
        <p>오늘 확정 횟수: {{ store.picksToday }}회</p>
        <h4>최근 확정 메뉴</h4>
        <ul>
          <li v-for="food in store.recentConfirmedFoods" :key="food.id">{{ food.name }}</li>
        </ul>
        <p v-if="store.recentConfirmedFoods.length === 0" class="placeholder">아직 확정된 메뉴가 없어요.</p>
      </div>
    </details>
    <p class="placeholder">메뉴는 지속적으로 추가될 예정입니다.</p>
  </main>
</template>
