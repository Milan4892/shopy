type SupportMessage = {
  role: "user" | "assistant";
  content: string;
};

type SupportAIInput = {
  messages: SupportMessage[];
  accountData: unknown;
};

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function generateSupportResponse({
  messages,
  accountData,
}: SupportAIInput) {
  const apiKey = process.env.AI_API_KEY;

  const apiUrl =
    process.env.AI_API_URL ||
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

  const model =
    process.env.AI_MODEL ||
    "gemini-3.8-flash";

  if (!apiKey) {
    throw new Error("AI_API_KEY is not configured");
  }

  const systemMessage = `
You are Shopy's customer support assistant.

You are assisting the authenticated Shopy customer whose account data is provided below.

Answer questions using the customer's account data when relevant.

Rules:
- Never invent account information.
- Never claim an action was completed unless the provided data confirms it.
- Never reveal passwords, password hashes, session tokens, API keys, secrets, or internal security information.
- Never reveal information about another customer.
- Do not expose internal database details.
- Do not expose unnecessary sensitive banking information.
- If the customer's data does not contain the answer, clearly say that you do not have enough information.
- Explain payment, wallet, withdrawal, mining, bike, mission, referral, notification, and account issues clearly.
- Use Nigerian Naira formatting when discussing NGN amounts.
- Keep responses concise and helpful.
- If a customer appears to have a problem requiring staff intervention, explain what happened and advise them to contact Shopy support.
- Do not pretend to be a human support representative.

Authenticated customer's account data:
${JSON.stringify(accountData)}
`;

  const payload = {
    model,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: systemMessage,
      },
      ...messages,
    ],
  };

  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 8000);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          `AI provider error: ${response.status} ${errorText}`
        );
      }

      const data = await response.json();

      const answer = data?.choices?.[0]?.message?.content;

      if (!answer || typeof answer !== "string") {
        throw new Error("AI provider returned an invalid response");
      }

      return answer.trim();
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;

      if (attempt < 2) {
        await sleep(500);
      }
    }
  }

  console.error("Support AI provider unavailable:", lastError);

  return "I'm temporarily unable to connect to Shopy Support. Please try again shortly. If your issue involves a wallet, withdrawal, payment, or account problem that needs immediate attention, please contact Shopy support.";
}