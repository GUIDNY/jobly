export default function Privacy() {
  return (
    <div dir="rtl" className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">מדיניות פרטיות</h1>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">1. איסוף מידע</h2>
          <p>Jobly אוסף מידע שאתה מספק בעת ההרשמה, לרבות שם, כתובת אימייל, ומידע פרופיל נוסף. אנו גם אוספים נתוני שימוש אנונימיים לשיפור השירות.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">2. שימוש במידע</h2>
          <p>המידע משמש לספק ולשפר את השירותים, לאמת משתמשים, לעיבוד תשלומים, ולשלוח עדכונים רלוונטיים.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">3. אבטחת מידע</h2>
          <p>אנו מיישמים אמצעי אבטחה מתקדמים להגנה על המידע שלך, כולל הצפנה בתעבורה ובאחסון.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">4. שיתוף מידע</h2>
          <p>איננו מוכרים מידע אישי לצדדים שלישיים. מידע עשוי להישתף עם ספקי שירות הכרחיים (כגון Stripe לעיבוד תשלומים).</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">5. יצירת קשר</h2>
          <p>לשאלות בנוגע לפרטיות, ניתן לפנות אלינו דרך עמוד יצירת הקשר.</p>
        </section>
      </div>
    </div>
  );
}
