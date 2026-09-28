/**
 * 같은 도메인의 Vercel Function을 통해 점심 메뉴 추천을 요청합니다.
 * OpenAI API 키는 브라우저가 아닌 서버 환경변수에만 보관됩니다.
 */

const RECOMMEND_API_URL = "/api/recommend";

/**
 * @param {string} keyword 사용자 입력 키워드
 * @param {{ signal?: AbortSignal }} options 요청 취소 옵션
 * @returns {Promise<{ name: string, category: string, reason: string }>}
 */
export async function fetchAiRecommendation(keyword, { signal } = {}) {
  const response = await fetch(RECOMMEND_API_URL, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ keyword }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      data?.error?.message || `추천 서버 요청에 실패했습니다. (${response.status})`,
    );
    error.status = response.status;
    error.code = data?.error?.code || "";
    throw error;
  }

  if (!data.food?.name) {
    throw new Error("추천 서버가 올바른 메뉴 데이터를 반환하지 않았습니다.");
  }

  return data.food;
}
