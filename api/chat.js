export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages, bot } = req.body;

  const systemPrompt = `אתה ${bot.name}, ${bot.role || 'עוזר AI'}.
${bot.instructions ? `הוראות: ${bot.instructions}` : ''}
${bot.bot_type === 'freelancer' ? `
- אתה פרילנסר שמשווק את השירותים שלך
- מחיר בסיסי: ₪${bot.pricing_basic?.price || 500}
- מחיר סטנדרטי: ₪${bot.pricing_standard?.price || 1500}
- מחיר פרמיום: ₪${bot.pricing_premium?.price || 4000}
- ענה בעברית, בצורה מקצועית וידידותית
- עודד את הלקוח לשוחח ולהזמין שירות
` : `
- אתה בוט מראיין של ${bot.company_name || 'החברה'}
- תפקיד מבוקש: ${bot.job_title || bot.role || ''}
- ${bot.interview_criteria ? `קריטריוני ריאיון: ${bot.interview_criteria}` : ''}
- ענה בעברית, בצורה מקצועית
- שאל שאלות רלוונטיות להערכת המועמד
`}
ענה תמיד בעברית. היה קצר וממוקד (2-3 משפטים).`;

  try {
    const geminiMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: geminiMessages,
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
        }),
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error('No response from Gemini');
    res.status(200).json({ reply: text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
