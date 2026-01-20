export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    // Parse request body
    const body = await request.json();
    const { resumeText, jobText, missingKeywords, category } = body;

    if (!resumeText || !jobText) {
      return new Response(
        JSON.stringify({ error: "Missing resumeText or jobText" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const prompt = `
You are an ATS-aware resume assistant.
Rewrite 3–5 resume bullet points that naturally include these missing keywords:

${missingKeywords.join(", ")}

Resume:
${resumeText}

Job Description:
${jobText}

Category: ${category}

Rules:
- Professional tone
- No exaggeration
- Bullets only
`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4
      })
    });

    const data = await openaiRes.json();

    return new Response(
      JSON.stringify({
        bullets: data.choices?.[0]?.message?.content || ""
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
