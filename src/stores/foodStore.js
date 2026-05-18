import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { foods as initialFoods } from "../data/foods";

const STORAGE_KEY = "lunch-recommendation-state-v1";

function cloneInitialFoods() {
  return initialFoods.map((food) => ({ ...food }));
}

function mergeSavedFoodStats(savedFoods) {
  const baseFoods = cloneInitialFoods();
  if (!Array.isArray(savedFoods)) return baseFoods;

  const savedById = new Map(savedFoods.map((food) => [food.id, food]));

  return baseFoods.map((food) => {
    const saved = savedById.get(food.id);
    if (!saved) return food;

    return {
      ...food,
      selectedCount: Number.isFinite(saved.selectedCount) ? saved.selectedCount : 0,
      rejectedCount: Number.isFinite(saved.rejectedCount) ? saved.rejectedCount : 0,
      isActive: typeof saved.isActive === "boolean" ? saved.isActive : true,
    };
  });
}

export const useFoodStore = defineStore("food", () => {
  const foods = ref(cloneInitialFoods());
  const currentFoodId = ref(null);
  const confirmedFoodId = ref(null);
  const emptyMessage = ref("");
  const picksToday = ref(0);
  const lastRecommendedId = ref(null);
  const recentConfirmedIds = ref([]);
  const selectedCategories = ref([]);

  const categories = computed(() => {
    const uniqueCategories = [...new Set(foods.value.map((food) => food.category))];
    return uniqueCategories;
  });

  const filteredFoods = computed(() =>
    foods.value.filter((food) => {
      if (!food.isActive) return false;
      if (selectedCategories.value.length === 0) return true;
      return selectedCategories.value.includes(food.category);
    }),
  );

  const currentFood = computed(() =>
    foods.value.find((food) => food.id === currentFoodId.value) ?? null,
  );

  const confirmedFood = computed(() =>
    foods.value.find((food) => food.id === confirmedFoodId.value) ?? null,
  );

  const recentConfirmedFoods = computed(() =>
    recentConfirmedIds.value
      .map((id) => foods.value.find((food) => food.id === id))
      .filter(Boolean),
  );

  const hasAvailableFoods = computed(() => filteredFoods.value.length > 0);

  function pickRandomFood() {
    if (!hasAvailableFoods.value) return null;

    let pool = filteredFoods.value.filter((food) => food.id !== lastRecommendedId.value);
    if (pool.length === 0) {
      pool = filteredFoods.value;
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    const selected = pool[randomIndex];

    currentFoodId.value = selected.id;
    confirmedFoodId.value = null;
    emptyMessage.value = "";
    lastRecommendedId.value = selected.id;

    return selected;
  }

  function confirmCurrentFood() {
    if (!currentFood.value) return;

    const target = foods.value.find((food) => food.id === currentFood.value.id);
    if (!target) return;

    target.selectedCount += 1;
    confirmedFoodId.value = target.id;
    emptyMessage.value = "";
    picksToday.value += 1;

    const nextRecent = [target.id, ...recentConfirmedIds.value.filter((id) => id !== target.id)];
    recentConfirmedIds.value = nextRecent.slice(0, 5);
  }

  function rejectCurrentFood() {
    if (!currentFood.value) return;

    const target = foods.value.find((food) => food.id === currentFood.value.id);
    if (!target) return;

    target.rejectedCount += 1;
    currentFoodId.value = null;
    confirmedFoodId.value = null;
    emptyMessage.value = "다른 메뉴를 추천해드릴게요! 메뉴를 뽑아보세요!";
  }

  function resetRound() {
    currentFoodId.value = null;
    confirmedFoodId.value = null;
    emptyMessage.value = "";
  }

  function setSelectedCategories(values) {
    selectedCategories.value = Array.isArray(values)
      ? values.filter((value) => categories.value.includes(value))
      : [];
    resetRound();
  }

  function resetAllStats() {
    foods.value = cloneInitialFoods();
    currentFoodId.value = null;
    confirmedFoodId.value = null;
    emptyMessage.value = "";
    picksToday.value = 0;
    lastRecommendedId.value = null;
    recentConfirmedIds.value = [];
    selectedCategories.value = [];
  }

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const saved = JSON.parse(raw);
      foods.value = mergeSavedFoodStats(saved.foods);
      if (typeof saved.currentFoodId === "number") currentFoodId.value = saved.currentFoodId;
      if (typeof saved.confirmedFoodId === "number") confirmedFoodId.value = saved.confirmedFoodId;
      if (typeof saved.picksToday === "number") picksToday.value = saved.picksToday;
      if (typeof saved.lastRecommendedId === "number") {
        lastRecommendedId.value = saved.lastRecommendedId;
      }
      if (Array.isArray(saved.recentConfirmedIds)) recentConfirmedIds.value = saved.recentConfirmedIds;
      if (Array.isArray(saved.selectedCategories)) {
        selectedCategories.value = saved.selectedCategories.filter((value) =>
          categories.value.includes(value),
        );
      } else if (typeof saved.categoryFilter === "string" && saved.categoryFilter !== "전체") {
        selectedCategories.value = categories.value.includes(saved.categoryFilter)
          ? [saved.categoryFilter]
          : [];
      }
    } catch (error) {
      console.error("저장된 상태를 불러오는 중 오류가 발생했습니다.", error);
    }
  }

  watch(
    [foods, currentFoodId, confirmedFoodId, picksToday, lastRecommendedId, recentConfirmedIds, selectedCategories],
    () => {
      const payload = {
        foods: foods.value,
        currentFoodId: currentFoodId.value,
        confirmedFoodId: confirmedFoodId.value,
        picksToday: picksToday.value,
        lastRecommendedId: lastRecommendedId.value,
        recentConfirmedIds: recentConfirmedIds.value,
        selectedCategories: selectedCategories.value,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    },
    { deep: true },
  );

  return {
    foods,
    categories,
    selectedCategories,
    filteredFoods,
    currentFood,
    emptyMessage,
    confirmedFood,
    picksToday,
    recentConfirmedFoods,
    hasAvailableFoods,
    pickRandomFood,
    confirmCurrentFood,
    rejectCurrentFood,
    resetRound,
    setSelectedCategories,
    resetAllStats,
    loadState,
  };
});
