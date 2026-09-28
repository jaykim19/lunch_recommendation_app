/**
 * OpenAI Responses API를 이용한 점심 메뉴 추천 서비스
 *
 * API 키와 모델은 Vite 환경 변수에서 읽습니다.
 * 운영 환경에서는 서버 프록시 사용을 권장합니다.
 */

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-4o-mini";

function getApiKey() {
  return (import.meta.env.VITE_OPENAI_API_KEY || "").trim();
}

export function hasApiKey() {
  return Boolean(getApiKey());
}

/**
 * OpenAI API에 키워드를 전달하여 메뉴 추천을 받아옵니다.
 * @param {string} keyword 사용자 입력 키워드 (예: "얼큰하고 시원한 국물")
 * @param {{ signal?: AbortSignal }} options 요청 취소 옵션
 * @returns {Promise<{ name: string, category: string, reason: string }>}
 */
export async function fetchAiRecommendation(keyword, { signal } = {}) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }

  const model = (import.meta.env.VITE_OPENAI_MODEL || DEFAULT_MODEL).trim();
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content:
            "당신은 한국의 점심 메뉴 추천 전문가입니다. 사용자의 취향, 상황, 기분에 가장 잘 맞는 메뉴를 정확히 하나만 추천하세요. 메뉴 이름 뒤에는 어울리는 이모지 하나를 붙이고, 이유는 친절하고 센스 있게 한국어 1~2문장으로 작성하세요.",
        },
        {
          role: "user",
          content: `점심 메뉴 요청: ${keyword}`,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "lunch_recommendation",
          strict: true,
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              category: {
                type: "string",
                enum: [
                  "한식",
                  "중식",
                  "일식",
                  "양식",
                  "분식",
                  "아시안",
                  "패스트푸드",
                  "샐러드/건강식",
                  "면요리",
                  "국밥/탕류",
                ],
              },
              reason: { type: "string" },
            },
            required: ["name", "category", "reason"],
            additionalProperties: false,
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const apiMessage = errorData?.error?.message;
    const error = new Error(apiMessage || `OpenAI API 요청 실패 (${response.status})`);
    error.status = response.status;
    error.code = errorData?.error?.code || "";
    throw error;
  }

  const data = await response.json();
  if (data.status === "incomplete") {
    const reason = data.incomplete_details?.reason;
    if (reason === "max_output_tokens") {
      throw new Error("AI가 응답 길이 한도에 도달했습니다. 다시 시도해주세요.");
    }
    throw new Error("AI 응답 생성이 완료되지 않았습니다. 다시 시도해주세요.");
  }

  const outputText =
    data.output_text ||
    data.output
      ?.flatMap((item) => item.content || [])
      .find((content) => content.type === "output_text")
      ?.text;
  if (!outputText) {
    throw new Error("AI 응답 내용이 비어있습니다.");
  }

  let parsed;
  try {
    parsed = JSON.parse(outputText);
  } catch {
    throw new Error("AI 응답을 메뉴 데이터로 변환하지 못했습니다.");
  }

  if (!parsed.name?.trim()) {
    throw new Error("올바른 메뉴 데이터 형식이 아닙니다.");
  }

  return {
    name: parsed.name.trim(),
    category: parsed.category?.trim() || "AI 추천",
    reason: parsed.reason?.trim() || "키워드에 딱 맞는 오늘의 추천 메뉴입니다!",
  };
}
