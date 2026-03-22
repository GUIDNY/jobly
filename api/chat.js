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
