export default async function handler(req, res) {
  // CORS-headere for å støtte frontend-kall fra nettleser (f.eks. Kajabi)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Håndter preflight (OPTIONS-kall fra nettleser før POST)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Håndter kun POST-forespørsler
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Kun POST er støttet" });
  }

  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: "Mangler melding" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Du er en varm coach som hjelper folk med sunn vektnedgang. Svar alltid kort, konkret og på norsk."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Beklager, jeg fikk ikke noe svar fra AI-en.";

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Feil fra OpenAI:", error);
    res.status(500).json({ error: "Serverfeil ved henting av svar fra OpenAI." });
  }
}
