window.dataService = {
  async loadTests() {
    // مسیر فایل را اگر فرق دارد تغییر بده
    const res = await fetch("data/tests.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Cannot load tests.json");

    const raw = await res.json();
    return this.normalizeTests(raw);
  },

  normalizeTests(raw) {
    // raw: همون JSON که فرستادی
    const exam = {
      title: raw?.meta?.title || "آزمون",
      // اگر زمان نداری می‌تونی ثابت بذاری (مثلاً 5 دقیقه)
      duration: raw?.meta?.duration ?? 5,
      questions: (raw?.items || []).map((it) => ({
        id: it.id,
        text: it?.question?.text || "",
        image: it?.question?.image || null,
        options: (it?.choices || []).map((c) => ({
          text: c?.text || "",
          image: c?.image || null
        })),
        correctOptionIndex: it?.answerIndex,
        explain: it?.explain || null
      }))
    };

    return { exam };
  }
};
