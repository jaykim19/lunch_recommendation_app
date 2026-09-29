<script setup>
import { onBeforeUnmount, ref } from "vue";
import { fetchAiRecommendation } from "../services/openaiService";

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["start-ai-pick", "finish-ai-pick"]);

const keyword = ref("");
const errorMessage = ref("");
let requestSequence = 0;
let activeController = null;

const quickKeywords = [
  { label: "🌶️ 얼큰한국물", text: "비 오는 날이나 해장에 좋은 얼큰하고 칼칼한 국물요리" },
  { label: "🥗 가벼운건강식", text: "속 편하고 칼로리 부담 없는 가벼운 샐러드나 건강식" },
  { label: "🍱 든든한한식", text: "밥심 채워주는 든든하고 정갈한 한식 백반이나 고기반찬" },
  { label: "🍝 감성양식", text: "분위기 내기 좋은 깔끔한 파스타나 브런치" },
  { label: "⚡ 초스피드", text: "바쁜 시간 10분 컷으로 빠르게 먹을 수 있는 간편식" },
  { label: "🍜 시원한면요리", text: "입맛 돋우는 시원하고 탱탱한 면요리" },
];

onBeforeUnmount(() => {
  cancelRecommendation();
});

defineExpose({
  cancelRecommendation,
});

function selectQuickKeyword(item) {
  keyword.value = item.text;
}

async function handleRecommend() {
  errorMessage.value = "";
  const query = keyword.value.trim();

  if (!query) {
    errorMessage.value = "원하는 음식 키워드나 기분을 입력해주세요!";
    return;
  }

  activeController?.abort();
  const controller = new AbortController();
  activeController = controller;
  const requestId = ++requestSequence;

  emit("start-ai-pick", {
    requestId,
    keyword: query,
    loadingText: `ChatGPT가 '${query}'에 어울리는 최적의 메뉴를 찾는 중... ✨`,
  });

  try {
    const result = await fetchAiRecommendation(query, { signal: controller.signal });
    keyword.value = "";
    emit("finish-ai-pick", { requestId, success: true, food: result });
  } catch (error) {
    if (error.name === "AbortError") {
      emit("finish-ai-pick", { requestId, success: false, cancelled: true });
      return;
    }

    console.error("AI 추천 오류:", error);
    let msg = error.message || "추천을 불러오는 중 오류가 발생했습니다.";
    if (error.status === 429) {
      msg = "OpenAI API 사용 한도에 도달했습니다. 결제 설정이나 사용량을 확인해주세요.";
    }
    errorMessage.value = msg;
    emit("finish-ai-pick", { requestId, success: false, error: msg });
  } finally {
    if (activeController === controller) {
      activeController = null;
    }
  }
}

function cancelRecommendation() {
  activeController?.abort();
  activeController = null;
}

</script>

<template>
  <section class="ai-recommend-section">
    <div class="ai-section-header">
      <div class="ai-header-left">
        <span class="ai-sparkle">✨</span>
        <span class="section-label ai-label">AI 맞춤 메뉴 추천</span>
      </div>
    </div>

    <form class="ai-input-form" @submit.prevent="handleRecommend">
      <div class="ai-input-wrap">
        <span class="search-icon" aria-hidden="true">🔍</span>
        <input
          v-model="keyword"
          type="text"
          class="ai-input"
          placeholder="예: 비 오는 날 얼큰한 국물, 가벼운 다이어트식, 든든한 밥..."
          :disabled="isLoading"
        />
        <button
          v-if="keyword"
          type="button"
          class="clear-input-btn"
          @click="keyword = ''"
          aria-label="입력 내용 지우기"
        >
          ✕
        </button>
      </div>
      <button
        type="submit"
        class="ai-submit-btn"
        :disabled="isLoading"
      >
        <span v-if="isLoading" class="spinner" aria-hidden="true"></span>
        <span v-else class="btn-icon" aria-hidden="true">🤖</span>
        <span>{{ isLoading ? "추천 중..." : "AI 추천받기" }}</span>
      </button>
    </form>

    <!-- 빠른 키워드 추천 태그들 -->
    <div class="quick-keywords-wrap">
      <span class="quick-label">추천 키워드:</span>
      <div class="quick-tags">
        <button
          v-for="item in quickKeywords"
          :key="item.label"
          type="button"
          class="quick-tag"
          :disabled="isLoading"
          @click="selectQuickKeyword(item)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <!-- 에러 메시지 알림 -->
    <div v-if="errorMessage" class="ai-error-alert" role="alert">
      <span>⚠️ {{ errorMessage }}</span>
      <button type="button" class="alert-close" @click="errorMessage = ''">✕</button>
    </div>

  </section>
</template>
