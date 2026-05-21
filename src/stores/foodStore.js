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
  const savedByName = new Map(savedFoods.map((food) => [food.name, food]));

  return baseFoods.map((food) => {
    const saved = savedByName.get(food.name) ?? savedById.get(food.id);
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

  function buildPersistPayload() {
    return {
      foods: foods.value,
      currentFoodId: currentFoodId.value,
      confirmedFoodId: confirmedFoodId.value,
      picksToday: picksToday.value,
      lastRecommendedId: lastRecommendedId.value,
      recentConfirmedIds: recentConfirmedIds.value,
      selectedCategories: selectedCategories.value,
    };
  }

  function persistState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buildPersistPayload()));
  }

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

  function remapSavedFoodId(savedId, savedFoods) {
    if (!Number.isFinite(savedId) || !Array.isArray(savedFoods)) return null;

    const savedFood = savedFoods.find((food) => food.id === savedId);
    if (!savedFood) return null;

    const matched = foods.value.find((food) => food.name === savedFood.name);
    return matched?.id ?? null;
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
    if (!raw) {
      // 신규/초기 사용자도 항상 최신(200개+) 메뉴 데이터 구조를 저장한다.
      persistState();
      return;
    }

    try {
      const saved = JSON.parse(raw);
      foods.value = mergeSavedFoodStats(saved.foods);
      const remappedCurrentId = remapSavedFoodId(saved.currentFoodId, saved.foods);
      if (remappedCurrentId !== null) currentFoodId.value = remappedCurrentId;

      const remappedConfirmedId = remapSavedFoodId(saved.confirmedFoodId, saved.foods);
      if (remappedConfirmedId !== null) confirmedFoodId.value = remappedConfirmedId;

      if (typeof saved.picksToday === "number") picksToday.value = saved.picksToday;

      const remappedLastRecommendedId = remapSavedFoodId(saved.lastRecommendedId, saved.foods);
      if (remappedLastRecommendedId !== null) lastRecommendedId.value = remappedLastRecommendedId;

      if (Array.isArray(saved.recentConfirmedIds)) {
        recentConfirmedIds.value = saved.recentConfirmedIds
          .map((id) => remapSavedFoodId(id, saved.foods))
          .filter((id) => id !== null);
      }

      if (Array.isArray(saved.selectedCategories)) {
        selectedCategories.value = saved.selectedCategories.filter((value) =>
          categories.value.includes(value),
        );
      } else if (typeof saved.categoryFilter === "string" && saved.categoryFilter !== "전체") {
        selectedCategories.value = categories.value.includes(saved.categoryFilter)
          ? [saved.categoryFilter]
          : [];
      }

      // 저장된 구버전/구개수 데이터를 현재 최신 메뉴 목록으로 즉시 동기화한다.
      persistState();
    } catch (error) {
      console.error("저장된 상태를 불러오는 중 오류가 발생했습니다.", error);
      persistState();
    }
  }

  watch(
    [foods, currentFoodId, confirmedFoodId, picksToday, lastRecommendedId, recentConfirmedIds, selectedCategories],
    () => {
      persistState();
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
