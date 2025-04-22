import { NextResponse, type NextRequest } from "next/server";

export const runtime = "edge";
export const preferredRegion = [
  "cle1",
  "iad1",
  "pdx1",
  "sfo1",
  "sin1",
  "syd1",
  "hnd1",
  "kix1",
];

const API_PROXY_BASE_URL = process.env.OPENAI_COMPATIBLE_API_BASE_URL || "";

async function handler(req: NextRequest) {
  let body;
  if (req.method.toUpperCase() !== "GET") {
    body = await req.json();
  }
  const searchParams = req.nextUrl.searchParams;
  const path = searchParams.getAll("slug");
  searchParams.delete("slug");
  const params = searchParams.toString();

  try {
    let url = `${API_PROXY_BASE_URL}/${decodeURIComponent(path.join("/"))}`;
    if (params) url += `?${params}`;
    
    // 记录API请求URL
    console.log('OpenAI Compatible API Request URL:', url);
    
    const payload: RequestInit = {
      method: req.method,
      headers: {
        "Content-Type": req.headers.get("Content-Type") || "application/json",
        Authorization: req.headers.get("Authorization") || "",
      },
    };
    if (body) payload.body = JSON.stringify(body);
    const response = await fetch(url, payload);
    
    // 记录API响应状态
    console.log('OpenAI Compatible API Response Status:', response.status, response.statusText);
    
    // 尝试记录响应内容的简要信息（不克隆整个响应体，避免影响性能）
    try {
      const responseClone = response.clone();
      const responseData = await responseClone.json();
      if (responseData) {
        // 记录响应中的关键信息，但不包含完整的响应内容
        const responseInfo = {
          status: response.status,
          model: responseData.model,
          object: responseData.object,
          created: responseData.created,
          // 如果响应包含choices，显示其长度
          choicesLength: responseData.choices ? responseData.choices.length : undefined,
        };
        console.log('OpenAI Compatible API Response Info:', responseInfo);
      }
    } catch {
      // 如果无法解析响应JSON，不要阻止主流程
      console.log('OpenAI Compatible API Response Info: Unable to parse response');
    }
    
    return new NextResponse(response.body, response);
  } catch (error) {
    if (error instanceof Error) {
      console.error('OpenAI Compatible API Error:', error);
      return NextResponse.json(
        { code: 500, message: error.message },
        { status: 500 }
      );
    }
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
