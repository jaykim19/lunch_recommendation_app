import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { GET, POST } from "./api/recommend.js";

function localRecommendApi() {
  return {
    name: "local-recommend-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (nodeRequest, nodeResponse, next) => {
        const url = new URL(nodeRequest.url, `http://${nodeRequest.headers.host || "localhost"}`);
        if (url.pathname !== "/api/recommend") {
          next();
          return;
        }

        try {
          const chunks = [];
          for await (const chunk of nodeRequest) {
            chunks.push(chunk);
          }

          const headers = new Headers();
          for (const [name, value] of Object.entries(nodeRequest.headers)) {
            if (Array.isArray(value)) {
              value.forEach((item) => headers.append(name, item));
            } else if (value !== undefined) {
              headers.set(name, value);
            }
          }

          const method = nodeRequest.method || "GET";
          const request = new Request(url, {
            method,
            headers,
            ...(method === "GET" || method === "HEAD"
              ? {}
              : { body: Buffer.concat(chunks) }),
          });
          const response = method === "POST" ? await POST(request) : GET();

          nodeResponse.statusCode = response.status;
          response.headers.forEach((value, name) => nodeResponse.setHeader(name, value));
          nodeResponse.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          console.error("로컬 추천 API 오류:", error);
          nodeResponse.statusCode = 500;
          nodeResponse.setHeader("Content-Type", "application/json; charset=utf-8");
          nodeResponse.end(
            JSON.stringify({ error: { message: "추천 서버를 실행하는 중 오류가 발생했습니다." } }),
          );
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  process.env.OPENAI_API_KEY ||= env.OPENAI_API_KEY;
  process.env.OPENAI_MODEL ||= env.OPENAI_MODEL;

  return {
    plugins: [vue(), localRecommendApi()],
  };
});
