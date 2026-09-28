const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-4o-mini";
const MAX_KEYWORD_LENGTH = 200;

const recommendationSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    category: {
      type: "string",
      enum: [
        "한식", "중식", "일식", "양식", "분식", "아시안", "패스트푸드",
        "샐러드/건강식", "면요리", "국밥/탕류",
      ],
    },
    reason: { type: "string" },
  },
  required: ["name", "category", "reason"],
  additionalProperties: false,
};

function json(data, init = {}) {
  return Response.json(data, {
    ...init,
    headers: { "Cache-Control": "no-store", ...init.headers },
  });
}

function extractOutputText(data) {
  return data.output_text || data.output
    ?.flatMap((item) => item.content || [])
    .find((content) => content.type === "output_text")
    ?.text;
}

export async function POST(request) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return json(
      { error: { message: "서버에 OPENAI_API_KEY가 설정되지 않았습니다." } },
      { status: 500 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: { message: "올바른 JSON 요청이 아닙니다." } }, { status: 400 });
  }

  const keyword = typeof body.keyword === "string" ? body.keyword.trim() : "";
  if (!keyword) {
    return json({ error: { message: "추천 키워드를 입력해주세요." } }, { status: 400 });
  }
  if (keyword.length > MAX_KEYWORD_LENGTH) {
    return json(
      { error: { message: `추천 키워드는 ${MAX_KEYWORD_LENGTH}자 이하로 입력해주세요.` } },
      { status: 400 },
    );
  }

  try {
    const openAiResponse = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      signal: request.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL,
        store: false,
        input: [
          {
            role: "system",
            content:
              "당신은 한국의 점심 메뉴 추천 전문가입니다. 사용자의 취향, 상황, 기분에 가장 잘 맞는 메뉴를 정확히 하나만 추천하세요. 메뉴 이름 뒤에는 어울리는 이모지 하나를 붙이고, 이유는 친절하고 센스 있게 한국어 1~2문장으로 작성하세요.",
          },
          { role: "user", content: `점심 메뉴 요청: ${keyword}` },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "lunch_recommendation",
            strict: true,
            schema: recommendationSchema,
          },
        },
      }),
    });

    if (!openAiResponse.ok) {
      const errorData = await openAiResponse.json().catch(() => ({}));
      const code = errorData?.error?.code || "";
      let message = errorData?.error?.message || "OpenAI API 요청에 실패했습니다.";
      let status = openAiResponse.status;

      if (status === 401 || status === 403) {
        message = "서버에 설정된 OpenAI API 키가 유효하지 않습니다.";
      } else if (status === 429) {
        message = "OpenAI API 사용 한도에 도달했습니다. 잠시 후 다시 시도해주세요.";
      } else if (status >= 500) {
        message = "OpenAI 서비스에 일시적인 문제가 발생했습니다.";
        status = 502;
      }

      console.error("OpenAI API 오류:", openAiResponse.status, code);
      return json({ error: { message, code } }, { status });
    }

    const data = await openAiResponse.json();
    if (data.status === "incomplete") {
      return json(
        { error: { message: "AI 응답 생성이 완료되지 않았습니다. 다시 시도해주세요." } },
        { status: 502 },
      );
    }

    const outputText = extractOutputText(data);
    if (!outputText) {
      return json({ error: { message: "AI 응답 내용이 비어있습니다." } }, { status: 502 });
    }

    const parsed = JSON.parse(outputText);
    if (!parsed.name?.trim()) {
      return json({ error: { message: "올바른 메뉴 데이터 형식이 아닙니다." } }, { status: 502 });
    }

    return json({
      food: {
        name: parsed.name.trim(),
        category: parsed.category?.trim() || "AI 추천",
        reason: parsed.reason?.trim() || "키워드에 딱 맞는 오늘의 추천 메뉴입니다!",
      },
    });
  } catch (error) {
    if (error.name === "AbortError") {
      return json({ error: { message: "요청이 취소되었습니다." } }, { status: 499 });
    }

    console.error("추천 서버 오류:", error);
    return json(
      { error: { message: "추천을 처리하는 중 서버 오류가 발생했습니다." } },
      { status: 500 },
    );
  }
}

export function GET() {
  return json({ error: { message: "POST 요청만 지원합니다." } }, { status: 405 });
}
