<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import FoodCard from "../components/FoodCard.vue";
import RouletteButton from "../components/RouletteButton.vue";
import ChoiceButtons from "../components/ChoiceButtons.vue";
import ResultCard from "../components/ResultCard.vue";
import { useFoodStore } from "../stores/foodStore";

const store = useFoodStore();
const showCategoryOptions = ref(false);
const categorySelectRef = ref(null);
const selectedCategorySet = computed(() => new Set(store.selectedCategories));
const categorySummary = computed(() =>
  store.selectedCategories.length === 0
    ? "전체 항목에서 메뉴 랜덤 선택"
    : `선택된 카테고리에서 메뉴 랜덤 선택 (${store.selectedCategories.length}개)`,
);

onMounted(() => {
  store.loadState();
  document.addEventListener("pointerdown", onOutsidePointerDown);
  document.addEventListener("keydown", onEscapeKeyDown);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onOutsidePointerDown);
  document.removeEventListener("keydown", onEscapeKeyDown);
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

function onOutsidePointerDown(event) {
  if (!showCategoryOptions.value) return;
  if (categorySelectRef.value?.contains(event.target)) return;
  showCategoryOptions.value = false;
}

function onEscapeKeyDown(event) {
  if (event.key !== "Escape") return;
  showCategoryOptions.value = false;
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
      <!-- <label for="">카테고리</label> -->
      <div ref="categorySelectRef" class="category-select-wrap">
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

      <!-- <button class="ghost-btn reset-btn" @click="store.resetAllStats">🗑️ 초기화</button> -->
    </section>

    <FoodCard :food="store.currentFood" :emptyMessage="store.emptyMessage" />

    <RouletteButton :disabled="!store.hasAvailableFoods" @pick="onPick" />

    <button class="ghost-btn reset-btn" @click="store.resetAllStats">초기화</button>

    <ChoiceButtons :disabled="!store.currentFood || !!store.confirmedFood" @confirm="onConfirm" @reject="onReject" />

    <ResultCard :confirmedFood="store.confirmedFood" @restart="onRestart" />

    <!-- <details class="stats stats-accordion">
      <summary>통계 보기</summary>
      <div class="stats-content">
        <p>오늘 확정 횟수: {{ store.picksToday }}회</p>
        <h4>최근 확정 메뉴</h4>
        <ul>
          <li v-for="food in store.recentConfirmedFoods" :key="food.id">{{ food.name }}</li>
        </ul>
        <p v-if="store.recentConfirmedFoods.length === 0" class="placeholder">아직 확정된 메뉴가 없어요.</p>
      </div>
    </details> -->
    <p class="placeholder">메뉴 종류는 계속 업데이트 될 예정입니다.</p>

    <footer class="app-footer">
      <!-- <p class="creator-text">기획/개발: 김지영, 윤혜준</p> -->
      <p class="copyright-text">Copyright &copy; 2026 브릿지듀오  All rights reserved.</p>
    </footer>
  </main>
</template>
