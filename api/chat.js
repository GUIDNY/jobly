export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages, bot } = req.body;

  const isFreelancer = bot.bot_type === 'freelancer';
  const systemPrompt = isFreelancer ? `
אתה ${bot.name}, פרילנסר מקצועי בתחום "${bot.role || 'שירותים דיגיטליים'}".
${bot.instructions ? bot.instructions : ''}

המחירים שלך (אל תציין אותם אוטומטית, רק כשנשאל):
- חבילה בסיסית: ₪${bot.pricing_basic?.price || 500} — ${bot.pricing_basic?.description || ''}
- חבילה סטנדרטית: ₪${bot.pricing_standard?.price || 1500} — ${bot.pricing_standard?.description || ''}
- חבילה פרמיום: ₪${bot.pricing_premium?.price || 4000} — ${bot.pricing_premium?.description || ''}

כללים:
- דבר בגוף ראשון כאילו אתה אדם אמיתי
- שוחח בצורה טבעית וחמה
- ענה קצר (2-3 משפטים בלבד)
- ענה אך ורק בעברית
- אל תציג את המחירים אלא אם הלקוח שואל
`.trim() : `
אתה בוט מראיין AI של "${bot.company_name || 'החברה'}".
המשרה: ${bot.job_title || bot.role || ''}
${bot.interview_criteria ? `קריטריונים להערכה: ${bot.interview_criteria}` : ''}
${bot.instructions ? bot.instructions : ''}

כללים:
- שאל שאלה אחת בכל פעם
- היה מקצועי וידידותי
- ענה קצר (2-3 משפטים)
- ענה אך ורק בעברית
`.trim();

  try {
    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content })),
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) throw new Error(data.error?.message || 'No response from Groq');
    res.status(200).json({ reply: text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
