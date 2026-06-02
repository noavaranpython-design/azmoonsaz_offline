window.uiRenderer = {
  renderHome(container) {
    container.innerHTML = `
      <section class="home-screen">
        <div class="card">
          <h1>اپلیکیشن جامع یادگیری</h1>
          <p>بخش مورد نظر خود را انتخاب کنید:</p>
          <div style="display:flex; flex-direction:column; gap:12px; margin-top:20px;">
            <button id="start-exam-btn" style="background:#2196F3;">شروع آزمون</button>
            <button id="study-btn" style="background:#4CAF50;">بخش آموزش</button>
            <button id="practice-btn" style="background:#FF9800;">بخش تمرین</button>
          </div>
        </div>
      </section>
    `;

    document.getElementById("start-exam-btn")?.addEventListener("click", () => window.app?.startExam());
    document.getElementById("study-btn")?.addEventListener("click", () => window.app?.showStudyList());
    document.getElementById("practice-btn")?.addEventListener("click", () => window.app?.showPracticeList());
  },

  renderLoading(container, message = "در حال بارگذاری...") {
    container.innerHTML = `<div class="card"><p>${message}</p></div>`;
  },

  renderError(container, message = "خطایی رخ داده است.") {
    container.innerHTML = `
      <div class="card">
        <h2 style="color:red;">خطا</h2>
        <p>${message}</p>
        <button id="go-home-btn">بازگشت به خانه</button>
      </div>
    `;
    document.getElementById("go-home-btn")?.addEventListener("click", () => window.app?.showHome());
  },

  renderExamIntro(container, exam) {
    container.innerHTML = `
      <section class="card">
        <h2>${exam?.title || "آزمون"}</h2>
        <p>تعداد سوالات: ${exam?.questionCount || 0}</p>
        <p>مدت زمان: ${exam?.duration || 0} دقیقه</p>
        <button id="begin-exam-btn">شروع فرآیند آزمون</button>
      </section>
    `;
    document.getElementById("begin-exam-btn")?.addEventListener("click", () => window.app?.beginExam());
  },

  renderQuestion(container, payload) {
    const { question, index, total, selectedOption, remainingTime } = payload;

    const qImageHtml = question?.image
      ? `<div style="margin:15px 0;"><img src="${question.image}" style="max-width:100%; border-radius:8px;"></div>`
      : "";

    const optionsHtml = (question?.options || [])
      .map((opt, i) => {
        const checked = selectedOption === i ? "checked" : "";
        const optImageHtml = opt?.image 
          ? `<div style="margin-top:5px;"><img src="${opt.image}" style="max-height:100px; border-radius:4px;"></div>` 
          : "";

        return `
          <label style="display:block; margin:10px 0; padding:12px; border:1px solid #ddd; border-radius:8px; cursor:pointer; background:${selectedOption === i ? '#e3f2fd' : '#fff'}">
            <div style="display:flex; align-items:center; gap:10px;">
              <input type="radio" name="answer" value="${i}" ${checked} />
              <span>${opt?.text || ""}</span>
            </div>
            ${optImageHtml}
          </label>
        `;
      }).join("");

    container.innerHTML = `
      <section class="card">
        <div style="display:flex; justify-content:space-between; margin-bottom:15px; font-weight:bold; color:#666;">
          <span>سوال ${index + 1} از ${total}</span>
          <span style="color:${remainingTime.startsWith('00:') ? 'red' : 'inherit'}">زمان: ${remainingTime}</span>
        </div>
        <h3>${question?.text || ""}</h3>
        ${qImageHtml}
        <div style="margin-top:20px;">${optionsHtml}</div>
        <div style="display:flex; gap:10px; margin-top:25px;">
          <button id="prev-question-btn" style="flex:1; background:#9e9e9e;">قبلی</button>
          <button id="next-question-btn" style="flex:1; background:#2196F3;">بعدی</button>
          <button id="finish-exam-btn" style="flex:1; background:#f44336;">پایان</button>
        </div>
      </section>
    `;

    document.querySelectorAll('input[name="answer"]').forEach(r => {
      r.addEventListener("change", (e) => window.app?.selectAnswer(Number(e.target.value)));
    });
    document.getElementById("prev-question-btn")?.addEventListener("click", () => window.app?.prevQuestion());
    document.getElementById("next-question-btn")?.addEventListener("click", () => window.app?.nextQuestion());
    document.getElementById("finish-exam-btn")?.addEventListener("click", () => window.app?.finishExam());
  },

  renderResult(container, result) {
    container.innerHTML = `
      <section class="card">
        <h2>نتیجه آزمون</h2>
        <div style="font-size:1.2em; margin:20px 0;">
          <p>تعداد کل: <b>${result.total}</b></p>
          <p style="color:green;">پاسخ صحیح: <b>${result.correct}</b></p>
          <p style="color:red;">پاسخ غلط: <b>${result.wrong}</b></p>
          <p style="color:orange;">بدون پاسخ: <b>${result.unanswered}</b></p>
          <hr>
          <p>درصد موفقیت: <span style="font-size:1.5em;">${result.percent}%</span></p>
        </div>
        <button id="restart-btn">بازگشت به منوی اصلی</button>
      </section>
    `;
    document.getElementById("restart-btn")?.addEventListener("click", () => window.app?.showHome());
  },

  renderStudyList(container, topics) {
    const listHtml = (topics || []).map(t => `
      <div class="card" style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0;">${t.title}</h3>
        <button class="open-study-btn" data-id="${t.id}" style="width:auto; padding:8px 15px;">مطالعه</button>
      </div>
    `).join("");
    container.innerHTML = `<h2>سرفصل‌های آموزشی</h2>${listHtml}<button id="back-home-btn" style="margin-top:15px; background:#666;">بازگشت</button>`;
    document.querySelectorAll(".open-study-btn").forEach(b => b.addEventListener("click", (e) => window.app?.showStudyDetail(e.target.dataset.id)));
    document.getElementById("back-home-btn")?.addEventListener("click", () => window.app?.showHome());
  },

  renderStudyDetail(container, topic) {
    const img = topic.image ? `<img src="${topic.image}" style="max-width:100%; border-radius:8px; margin-bottom:15px;">` : "";
    container.innerHTML = `
      <div class="card">
        <h2>${topic.title}</h2>
        ${img}
        <div style="line-height:1.8; text-align:justify; white-space:pre-line;">${topic.content}</div>
        <button id="back-study-list" style="margin-top:20px;">بازگشت به لیست دروس</button>
      </div>
    `;
    document.getElementById("back-study-list")?.addEventListener("click", () => window.app?.showStudyList());
  },

  renderPracticeList(container, packs) {
    const html = (packs || []).map(p => `
      <div class="card" style="margin-bottom:12px;">
        <h3>${p.title}</h3>
        <p style="color:#666; font-size:0.9em;">${p.description}</p>
        <button class="open-practice-btn" data-id="${p.id}">شروع تمرین</button>
      </div>
    `).join("");
    container.innerHTML = `<h2>بخش تمرینات</h2>${html}<button id="back-home-btn" style="margin-top:15px; background:#666;">بازگشت</button>`;
    document.querySelectorAll(".open-practice-btn").forEach(b => b.addEventListener("click", (e) => window.app?.startPractice(e.target.dataset.id)));
    document.getElementById("back-home-btn")?.addEventListener("click", () => window.app?.showHome());
  },

  renderPracticeItem(container, vm) {
    const { packTitle, index, total, item, feedback, isAnswered } = vm;
    let inputBody = "";

    if (item.type === "mcq") {
      inputBody = (item.options || []).map((o, i) => `
        <label style="display:block; margin:8px 0; padding:10px; border:1px solid #ccc; border-radius:8px;">
          <input type="radio" name="panswer" value="${i}" ${isAnswered ? "disabled" : ""}> ${o.text}
        </label>
      `).join("");
    } else if (item.type === "tf") {
      inputBody = `
        <label style="display:inline-block; margin-left:20px;"><input type="radio" name="panswer" value="true" ${isAnswered ? "disabled" : ""}> درست</label>
        <label style="display:inline-block;"><input type="radio" name="panswer" value="false" ${isAnswered ? "disabled" : ""}> نادرست</label>
      `;
    } else {
      inputBody = `<input id="blank-input" type="text" placeholder="پاسخ را بنویسید..." style="width:100%; padding:10px;" ${isAnswered ? "disabled" : ""}>`;
    }

    container.innerHTML = `
      <div class="card">
        <div style="color:#2196F3; font-weight:bold; margin-bottom:10px;">${packTitle} - ${index + 1} از ${total}</div>
        <h3 style="margin-bottom:20px;">${item.prompt}</h3>
        <div>${inputBody}</div>
        <div style="margin-top:20px; display:flex; gap:10px;">
          <button id="chk-p" ${isAnswered ? "disabled" : ""} style="background:#4CAF50;">بررسی</button>
          <button id="nxt-p" style="background:#2196F3;">بعدی</button>
          <button id="ext-p" style="background:#666;">خروج</button>
        </div>
        ${feedback ? `<div style="margin-top:15px; padding:10px; border-radius:8px; background:${feedback.correct ? '#e8f5e9' : '#ffebee'}; border:1px solid ${feedback.correct ? '#4CAF50' : '#f44336'};">
          <b>${feedback.correct ? '✅ درست' : '❌ نادرست'}</b><p>${feedback.message}</p>
        </div>` : ""}
      </div>
    `;

    document.getElementById("ext-p")?.addEventListener("click", () => window.app?.showPracticeList());
    document.getElementById("nxt-p")?.addEventListener("click", () => window.app?.nextPracticeItem());
    document.getElementById("chk-p")?.addEventListener("click", () => {
      let val = null;
      if (item.type === "blank") val = document.getElementById("blank-input").value;
      else {
        const sel = container.querySelector('input[name="panswer"]:checked');
        val = sel ? sel.value : null;
      }
      window.app?.checkPracticeAnswer(val);
    });
  },

  renderPracticeResult(container, res) {
    container.innerHTML = `<div class="card"><h2>پایان تمرین</h2><p>درست: ${res.correct}</p><p>نادرست: ${res.wrong}</p><p>درصد: ${res.percent}%</p><button id="p-res-back">بازگشت</button></div>`;
    document.getElementById("p-res-back")?.addEventListener("click", () => window.app?.showPracticeList());
  }
};
