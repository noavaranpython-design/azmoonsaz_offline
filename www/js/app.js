window.app = {
  root: null,
  examData: null,
  currentQuestionIndex: 0,
  userAnswers: [],
  timerInterval: null,
  timeLeft: 0,
  studyData: [],
  practicePacks: [],
  practicePack: null,
  practiceIndex: 0,
  practiceScore: { correct: 0, wrong: 0 },
  practiceAnswered: false,

  init() {
    this.root = document.getElementById("app");
    this.showHome();
  },

  showHome() {
    this.clearTimer();
    window.uiRenderer.renderHome(this.root);
  },

  clearTimer() {
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
  },

  async loadExamData() {
    const res = await fetch("data/exam.json");
    this.examData = await res.json();
  },

  async startExam() {
    try {
      window.uiRenderer.renderLoading(this.root, "در حال بارگذاری سوالات...");
      if (!this.examData) await this.loadExamData();
      
      const items = this.examData.items || [];
      window.uiRenderer.renderExamIntro(this.root, {
        title: this.examData.meta?.title || "آزمون",
        duration: this.examData.meta?.duration || 0,
        questionCount: items.length
      });
    } catch (e) {
      window.uiRenderer.renderError(this.root, "خطا در لود آزمون.");
    }
  },

  beginExam() {
    const items = this.examData?.items || [];
    if (items.length === 0) return;

    this.currentQuestionIndex = 0;
    this.userAnswers = new Array(items.length).fill(null);
    this.timeLeft = (this.examData.meta?.duration || 1) * 60;

    this.startTimer();
    this.renderCurrentQuestion();
  },

  startTimer() {
    this.clearTimer();
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) { this.finishExam(); }
      else { this.renderCurrentQuestion(); }
    }, 1000);
  },

  renderCurrentQuestion() {
    const items = this.examData?.items || [];
    const item = items[this.currentQuestionIndex];
    if (!item) return;

    // تبدیل ساختار دیتای شما به فرمت رندر
    const questionVM = {
      text: item.question?.text,
      image: item.question?.image,
      options: (item.choices || []).map(c => ({ text: c.text, image: c.image }))
    };

    window.uiRenderer.renderQuestion(this.root, {
      question: questionVM,
      index: this.currentQuestionIndex,
      total: items.length,
      selectedOption: this.userAnswers[this.currentQuestionIndex],
      remainingTime: `${Math.floor(this.timeLeft / 60)}:${String(this.timeLeft % 60).padStart(2, '0')}`
    });
  },

  selectAnswer(idx) { this.userAnswers[this.currentQuestionIndex] = idx; },
  prevQuestion() { if (this.currentQuestionIndex > 0) { this.currentQuestionIndex--; this.renderCurrentQuestion(); } },
  nextQuestion() { 
    if (this.currentQuestionIndex < (this.examData.items.length - 1)) { 
      this.currentQuestionIndex++; 
      this.renderCurrentQuestion(); 
    } 
  },

  finishExam() {
    this.clearTimer();
    const items = this.examData.items || [];
    let correct = 0, wrong = 0, unanswered = 0;

    items.forEach((item, i) => {
      if (this.userAnswers[i] === null) unanswered++;
      else if (Number(this.userAnswers[i]) === Number(item.answerIndex)) correct++;
      else wrong++;
    });

    window.uiRenderer.renderResult(this.root, {
      total: items.length,
      correct, wrong, unanswered,
      percent: Math.round((correct / items.length) * 100)
    });
  },

  // متدهای بخش آموزش
  async showStudyList() {
    try {
      if (this.studyData.length === 0) {
        const res = await fetch("data/study.json");
        this.studyData = await res.json();
      }
      window.uiRenderer.renderStudyList(this.root, this.studyData);
    } catch (e) { window.uiRenderer.renderError(this.root, "خطا در لود بخش آموزش."); }
  },

  showStudyDetail(id) {
    const topic = this.studyData.find(t => String(t.id) === String(id));
    if (topic) window.uiRenderer.renderStudyDetail(this.root, topic);
  },

  // متدهای بخش تمرین
  async showPracticeList() {
    try {
      if (this.practicePacks.length === 0) {
        const res = await fetch("data/practice.json");
        this.practicePacks = await res.json();
      }
      window.uiRenderer.renderPracticeList(this.root, this.practicePacks);
    } catch (e) { window.uiRenderer.renderError(this.root, "خطا در لود تمرینات."); }
  },

  startPractice(id) {
    this.practicePack = this.practicePacks.find(p => String(p.id) === String(id));
    this.practiceIndex = 0;
    this.practiceScore = { correct: 0, wrong: 0 };
    this.practiceAnswered = false;
    this.renderCurrentPracticeItem();
  },

  renderCurrentPracticeItem() {
    if (this.practiceIndex >= this.practicePack.items.length) {
      const total = this.practicePack.items.length;
      window.uiRenderer.renderPracticeResult(this.root, {
        correct: this.practiceScore.correct,
        wrong: this.practiceScore.wrong,
        total: total,
        percent: Math.round((this.practiceScore.correct / total) * 100)
      });
      return;
    }
    window.uiRenderer.renderPracticeItem(this.root, {
      packTitle: this.practicePack.title,
      index: this.practiceIndex,
      total: this.practicePack.items.length,
      item: this.practicePack.items[this.practiceIndex],
      isAnswered: this.practiceAnswered,
      feedback: this.practiceFeedback
    });
  },

  checkPracticeAnswer(ans) {
    const item = this.practicePack.items[this.practiceIndex];
    let isCorrect = false;
    if (item.type === "mcq") isCorrect = Number(ans) === Number(item.answer);
    else if (item.type === "tf") isCorrect = String(ans) === String(item.answer);
    else isCorrect = (item.answers || []).map(a => a.toLowerCase().trim()).includes(ans.toLowerCase().trim());

    if (isCorrect) this.practiceScore.correct++; else this.practiceScore.wrong++;
    this.practiceAnswered = true;
    this.practiceFeedback = { correct: isCorrect, message: item.explain };
    this.renderCurrentPracticeItem();
  },

  nextPracticeItem() {
    this.practiceIndex++;
    this.practiceAnswered = false;
    this.practiceFeedback = null;
    this.renderCurrentPracticeItem();
  }
};

document.addEventListener("DOMContentLoaded", () => window.app.init());
