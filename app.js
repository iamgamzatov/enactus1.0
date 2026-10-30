/* ==========================================================================
   Enactus IUCA — главный скрипт сайта (SPA на hash-роутинге)
   Структура файла:
     1. Константы и ссылки на DOM
     2. Утилиты
     3. Иконки
     4. Мелкие компоненты (карточки, списки)
     5. Страницы
     6. Страница проекта
     7. Эффекты (счётчики, reveal, параллакс)
     8. Обработчики (вкладки, форма заявки)
     9. Роутер и инициализация
   ========================================================================== */

/* ==========================================================================
   1. Константы и ссылки на DOM
   ========================================================================== */

const D = window.SITE_DATA;
const app = document.getElementById("app");

const JOIN_API_URL = "http://localhost:3000/api/join";
const ALL_TAG = "Все";
const IMPACT_ICONS = ["rocket", "users", "heart", "leaf"];

/* ==========================================================================
   2. Утилиты
   ========================================================================== */

/** Склеивает части шаблона без пробелов и переносов строк. */
const html = (...parts) => parts.flat().join("");

const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Экранирует спецсимволы HTML. */
const escapeHTML = (value) =>
  String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

/* ==========================================================================
   3. Иконки
   ========================================================================== */

const ICONS = {
  heart:
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',

  rocket: html(
    '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>',
    '<path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>',
    '<path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>',
    '<path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  ),

  leaf: html(
    '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>',
    '<path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  ),

  users: html(
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>',
    '<circle cx="9" cy="7" r="4"/>',
    '<path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',
    '<path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  ),

  chart: html(
    '<path d="M3 21v-5h4v5zM10 21v-9h4v9zM17 21V9h4v12z"/>',
    '<path d="M3 11L20 3M14 3h6v6"/>',
  ),

  paw: html(
    '<circle cx="5" cy="11" r="2"/>',
    '<circle cx="9" cy="6" r="2"/>',
    '<circle cx="15" cy="6" r="2"/>',
    '<circle cx="19" cy="11" r="2"/>',
    '<path d="M12 12c-3 0-6 3-5 6 1 2 3 1 5 1s4 1 5-1c1-3-2-6-5-6z"/>',
  ),

  recycle: html(
    '<path d="M21 12a9 9 0 0 0-15-6.7L3 8"/>',
    '<path d="M3 3v5h5"/>',
    '<path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/>',
    '<path d="M16 16h5v5"/>',
  ),

  mountain: '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
};

/** Возвращает <svg> с иконкой по имени. */
const icon = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;

/* ==========================================================================
   4. Мелкие компоненты
   ========================================================================== */

/** Заголовок внутренней страницы. */
const heading = (title, description) =>
  html(
    '<section class="page-head"><div class="wrap">',
    `<h1>${title}</h1>`,
    `<p>${description}</p>`,
    "</div></section>",
  );

/** Обложка карточки проекта: логотип, картинка или эмодзи-заглушка. */
function projectCover(project) {
  if (project.logo) {
    return html(
      `<div class="card-logo" style="background:${project.bg}">`,
      `<img src="${project.logo}" alt="${escapeHTML(project.name)}">`,
      "</div>",
    );
  }
  if (project.image) {
    return `<img class="card-image" src="${project.image}" alt="${escapeHTML(project.name)}">`;
  }
  return `<div class="card-placeholder">${project.emoji || "🌱"}</div>`;
}

/** Карточка проекта. */
const projectCard = (project) =>
  html(
    `<a class="card" href="#project/${project.id}">`,
    '<div class="card-cover">',
    `<span class="pill" style="background:${project.color}">`,
    project.icon ? icon(project.icon) : "",
    escapeHTML(project.name),
    "</span>",
    projectCover(project),
    "</div>",
    '<div class="card-body card-row">',
    `<h3>${escapeHTML(project.short || project.title)}</h3>`,
    '<span class="arrow">›</span>',
    "</div>",
    "</a>",
  );

/** Список карточек проектов (можно передать отфильтрованный список). */
const projects = (list = D.projects) => list.map(projectCard).join("");

/** Карточки участников команды. */
const team = () =>
  D.team
    .map((person) =>
      html(
        '<article class="person">',
        `<div class="avatar">${person.initials}</div>`,
        `<h3>${escapeHTML(person.name)}</h3>`,
        `<p>${escapeHTML(person.role)}</p>`,
        "</article>",
      ),
    )
    .join("");

/** Одна карточка события. Дата переносится на две строки по первому пробелу. */
const eventCard = (event) =>
  html(
    '<article class="event-card">',
    `<div class="date">${escapeHTML(event.date).replace(" ", "<br>")}</div>`,
    "<div>",
    `<h3>${escapeHTML(event.name)}</h3>`,
    `<p class="ed">${escapeHTML(event.description || "")}</p>`,
    `<p class="ep">📍 ${escapeHTML(event.place || "")}</p>`,
    "</div>",
    "</article>",
  );

/** Сетка событий. */
const events = () =>
  html('<div class="events-grid">', D.events.map(eventCard), "</div>");

/** Показатели «Наше влияние». */
const impact = () =>
  D.impact
    .map((item, index) =>
      html(
        '<div class="impact-item">',
        icon(IMPACT_ICONS[index % IMPACT_ICONS.length]),
        `<strong>${escapeHTML(item.value)}</strong>`,
        `<span>${escapeHTML(item.label)}</span>`,
        "</div>",
      ),
    )
    .join("");

/** Баннер «Стань частью Enactus IUCA!» (внизу страниц). */
const cta = () =>
  html(
    '<section class="section"><div class="wrap"><div class="cta-banner">',
    "<h2>Стань частью<br>Enactus IUCA!</h2>",
    "<p>Развивайся, создавай проекты и меняй мир вместе с нами.</p>",
    '<a href="#join" class="button">Присоединиться →</a>',
    '<span class="cta-frog-wrap">',
    '<svg class="cta-spark" viewBox="0 0 50 50">',
    '<path d="M36 8L24 20M16 34L2 32M40 26L26 28" stroke="#ffca21" stroke-width="4" stroke-linecap="round" fill="none"/>',
    "</svg>",
    '<img class="cta-frog" src="assets/frog-original.png" alt="">',
    "</span>",
    "</div></div></section>",
  );

/** Заголовок секции со ссылкой «Все ...». */
const sectionTop = (title, href, linkText) =>
  html(
    '<div class="section-top">',
    `<h2>${title}</h2>`,
    `<a class="text-link" href="${href}">${linkText}</a>`,
    "</div>",
  );

/* ==========================================================================
   5. Страницы
   ========================================================================== */

/* ---------- Главная: отдельные блоки ---------- */

const homeHero = () =>
  html(
    '<section class="hero">',
    '<div class="wrap hero-grid"><div>',
    '<div class="eyebrow">ENACTUS IUCA</div>',
    "<h1>Превращаем идеи<br>в реальные <span class=\"highlight\">изменения</span>",
    '<svg class="spark" viewBox="0 0 40 34">',
    '<path d="M4 30L20 12M24 24l14-6M20 6l8-4" stroke="#ffca21" stroke-width="3.5" stroke-linecap="round" fill="none"/>',
    "</svg></h1>",
    "<p>Студенческая команда социальных предпринимателей Международного университета Центральной Азии.</p>",
    '<div class="actions">',
    '<a class="button" href="#team">О команде →</a>',
    '<a class="button secondary" href="https://www.youtube.com/watch?v=E8GwKE9gtpY">▶ Видео о нас</a>',
    "</div>",
    "</div></div>",
    '<div class="hero-art">',
    '<img class="hero-rock" src="assets/generated/hero-bg.svg" alt="">',
    '<img class="hero-frog" src="assets/frog-original.png" alt="Жёлтая геометрическая лягушка Enactus IUCA">',
    "</div>",
    "</section>",
  );

const featureItem = (iconName, title, text) =>
  html(
    '<div class="fb-item">',
    icon(iconName),
    `<div><b>${title}</b><span>${text}</span></div>`,
    "</div>",
  );

const homeFeatureBar = () =>
  html(
    '<div class="wrap"><div class="feature-bar">',
    featureItem("rocket", "Проекты", "От идеи к реальным решениям"),
    featureItem("users", "Команда", "Активные студенты и единомышленники"),
    featureItem("leaf", "Влияние", "Польза для людей, сообщества и страны"),
    featureItem("chart", "Развитие", "Практика, опыт и лидерские навыки"),
    "</div></div>",
  );

const homeProjects = () =>
  html(
    '<section class="section"><div class="wrap">',
    sectionTop("Наши проекты", "#projects", "Все проекты →"),
    `<div class="cards">${projects()}</div>`,
    "</div></section>",
  );

const homeImpact = () =>
  html(
    '<section class="section"><div class="wrap"><div class="impact-bar">',
    "<h2>Наше влияние</h2>",
    `<div class="impact-items">${impact()}</div>`,
    "</div></div></section>",
  );

const homeTeamBanner = () =>
  html(
    '<section class="section"><div class="wrap">',
    '<div class="team-banner" style="background-image:linear-gradient(90deg,rgba(25,19,29,.8),rgba(25,19,29,.05)),url(assets/generated/team.PNG)">',
    "<h2>Команда, которая действует</h2>",
    '<a class="button" href="#team">Познакомиться с командой →</a>',
    "</div>",
    "</div></section>",
  );

const homeEvents = () =>
  html(
    '<section class="section"><div class="wrap">',
    sectionTop("Ближайшие события", "#events", "Все события →"),
    events(),
    "</div></section>",
  );

/* ---------- О команде: блок «Что мы делаем» ---------- */

const feature = (emoji, title, text) =>
  html(
    '<div class="feature">',
    `<span class="icon">${emoji}</span>`,
    `<h3>${title}</h3>`,
    `<p>${text}</p>`,
    "</div>",
  );

const aboutWhatWeDo = () =>
  html(
    '<section class="section"><div class="wrap">',
    "<h2>Что мы делаем</h2>",
    '<p class="lead">Находим реальные проблемы, изучаем потребности людей, разрабатываем решения и проверяем их на практике. Работаем в командах, учимся у наставников и стремимся к измеримому результату.</p>',
    '<div class="feature-grid" style="margin-top:35px">',
    feature("🔎", "Исследуем", "Проверяем проблему"),
    feature("🧩", "Создаём", "Прототипируем решения"),
    feature("🧪", "Тестируем", "Получаем обратную связь"),
    feature("🌍", "Меняем", "Работаем на пользу людям"),
    "</div>",
    "</div></section>",
  );

/* ---------- Форма «Присоединиться» ---------- */

const field = (label, control) =>
  `<label class="field">${label}${control}</label>`;

const INTEREST_OPTIONS = [
  "Проекты и исследования",
  "Разработка и дизайн",
  "Маркетинг и коммуникации",
  "Организация мероприятий",
  "Пока хочу узнать больше",
];

const joinForm = () =>
  html(
    '<form class="form" id="joinForm">',
    field("ФИО", '<input name="name" required maxlength="120" placeholder="Ваше имя">'),
    field(
      "Группа / курс",
      '<input name="group" required maxlength="80" placeholder="Например, IT-125">',
    ),
    field(
      "Email",
      '<input type="email" name="email" required placeholder="name@example.com">',
    ),
    field(
      "Чем хотите заниматься?",
      html(
        '<select name="interest" required>',
        '<option value="">Выберите направление</option>',
        INTEREST_OPTIONS.map((option) => `<option>${option}</option>`),
        "</select>",
      ),
    ),
    field(
      "О себе",
      '<textarea name="message" placeholder="Расскажите о своих интересах"></textarea>',
    ),

    // Honeypot-поле против ботов (скрыто от людей)
    '<input type="text" name="website" style="display:none" tabindex="-1" autocomplete="off">',

    // Согласие на обработку персональных данных
    '<label style="display:flex; align-items:flex-start; gap:10px; margin-bottom:20px; font-size:14px; cursor:pointer;">',
    '<input type="checkbox" name="consent" required style="margin-top:3px;">',
    '<span>Я даю согласие на обработку персональных данных и соглашаюсь с <a href="#privacy" style="color: #d50062; text-decoration: underline;">политикой конфиденциальности</a></span>',
    "</label>",

    '<button class="button" type="submit">Отправить заявку →</button>',
    '<div id="formResult" aria-live="polite"></div>',
    "</form>",
  );

/* ---------- Контакты ---------- */

const contactCards = () =>
  html(
    '<div class="people" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">',
    '<article class="person"><h3>Адрес</h3><p>Кыргызстан, Токмок, ул. Шамсинская 2</p></article>',
    '<article class="person"><h3>Заявка в команду</h3><p><a href="#join" style="color:var(--pink);font-weight:700">Заполнить форму →</a></p></article>',
    "</div>",
  );

/* ---------- Таблица страниц (ключ = hash) ---------- */

const pages = {
  home: () =>
    html(
      homeHero(),
      homeFeatureBar(),
      homeProjects(),
      homeImpact(),
      homeTeamBanner(),
      homeEvents(),
      cta(),
    ),

  about: () =>
    html(
      heading(
        "О команде",
        "Enactus IUCA — пространство для студенческих инициатив, социального предпринимательства и практического опыта.",
      ),
      aboutWhatWeDo(),
      cta(),
    ),

  projects: () => {
    const tags = [ALL_TAG, ...new Set(D.projects.map((p) => p.tag))];
    const tabs = tags
      .map(
        (tag, index) =>
          `<button class="tab${index ? "" : " active"}" data-tag="${escapeHTML(tag)}">${escapeHTML(tag)}</button>`,
      )
      .join("");

    return html(
      heading(
        "Наши проекты",
        "Решения, которые команда разрабатывает и проверяет на практике.",
      ),
      '<section class="section"><div class="wrap">',
      `<div class="tabs">${tabs}</div>`,
      `<div class="cards" id="projCards">${projects()}</div>`,
      "</div></section>",
      cta(),
    );
  },

  team: () =>
    html(
      heading(
        "Наша команда",
        "Студенты, наставники и единомышленники, которые превращают идеи в действия.",
      ),
      '<section class="section"><div class="wrap">',
      '<div class="notice" style="margin-bottom:25px">Здесь пока показаны роли-заглушки. IT-команда добавит настоящие фотографии, имена и состав после согласования.</div>',
      `<div class="people">${team()}</div>`,
      "</div></section>",
      cta(),
    ),

  events: () =>
    html(
      heading("События", "Хакатоны, соревнования, встречи, обучение и жизнь команды."),
      '<section class="section"><div class="wrap">',
      events(),
      '<div class="notice">Карточки демонстрационные. Перед запуском необходимо подтвердить даты и добавить актуальные события.</div>',
      "</div></section>",
    ),

  partners: () =>
    html(
      heading(
        "Партнёры и наставники",
        "Сотрудничество с бизнесом, экспертами и организациями помогает нашим проектам расти.",
      ),
      '<section class="section"><div class="wrap"><div class="empty">',
      "<h2>Раздел готов к наполнению</h2>",
      "<p>Здесь появятся подтверждённые партнёры, их логотипы, направления сотрудничества и возможности поддержки проектов.</p>",
      "</div></div></section>",
      cta(),
    ),

  join: () =>
    html(
      heading(
        "Присоединиться к Enactus IUCA",
        "Хотите развивать проекты, учиться и работать в команде? Расскажите о себе.",
      ),
      '<section class="section"><div class="wrap">',
      joinForm(),
      "</div></section>",
    ),

  contacts: () =>
    html(
      heading("Контакты", "Свяжитесь с командой Enactus IUCA."),
      '<section class="section"><div class="wrap">',
      contactCards(),
      "</div></section>",
    ),

  privacy: () =>
    html(
      heading("Политика конфиденциальности", "Как мы обращаемся с вашими данными."),
      '<section class="section"><div class="wrap">',
      '<p class="lead">Мы собираем ваши данные (ФИО, группа, email) исключительно для связи с вами и рассмотрения заявки на вступление в команду Enactus IUCA.</p>',
      "<p>Мы обязуемся не передавать ваши персональные данные третьим лицам, не использовать их для спама и хранить их в безопасности. Вы можете запросить удаление своих данных, связавшись с нами по почте.</p>",
      '<a href="#join" class="button" style="margin-top:20px;">Вернуться к форме</a>',
      "</div></section>",
    ),
};

/* ==========================================================================
   6. Страница проекта (#project/<id>)
   ========================================================================== */

/** Визуал справа на странице проекта: логотип, картинка или эмодзи. */
function projectVisual(project) {
  if (project.logo) {
    return `<img src="${project.logo}" alt="${escapeHTML(project.name)}" style="width:100%;height:100%;object-fit:contain">`;
  }
  if (project.image) {
    return `<img src="${project.image}" alt="${escapeHTML(project.name)}" style="width:100%;height:100%;object-fit:cover">`;
  }
  return project.emoji || "🌱";
}

function detail(id) {
  const project = D.projects.find((p) => p.id === id);

  if (!project) {
    return heading("Проект не найден", "Вернитесь в каталог проектов.");
  }

  const visualStyle = project.bg ? `style="background:${project.bg}"` : "";

  return html(
    heading(escapeHTML(project.name), escapeHTML(project.title)),
    '<section class="section"><div class="wrap">',
    '<a href="#projects" class="back">← Все проекты</a>',
    '<div class="detail-grid">',

    "<div>",
    `<div class="eyebrow">${escapeHTML(project.tag)}</div>`,
    `<h2>${escapeHTML(project.title)}</h2>`,
    `<p class="lead">${escapeHTML(project.description)}</p>`,
    `<p>${escapeHTML(project.details)}</p>`,
    `<p><b>Текущий этап:</b> ${escapeHTML(project.status)}</p>`,
    '<a href="#join" class="button">Присоединиться к команде →</a>',
    "</div>",

    `<div class="detail-visual" ${visualStyle}>${projectVisual(project)}</div>`,

    "</div>",
    "</div></section>",
  );
}

/* ==========================================================================
   7. Эффекты
   ========================================================================== */

/** Анимация счётчиков в блоке «Наше влияние»: «25+» → плавно от 0 до 25. */
function countUp(root) {
  const DURATION_MS = 1200;

  root.querySelectorAll(".impact-item strong").forEach((el) => {
    const match = el.textContent.match(/^(\d+)(.*)$/);
    if (!match) return;

    const target = +match[1];
    const suffix = match[2];
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / DURATION_MS);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

/** Плавное появление блоков при прокрутке (+ запуск счётчиков). */
function initReveal() {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("in");
        observer.unobserve(entry.target);

        if (entry.target.classList.contains("impact-bar")) {
          countUp(entry.target);
        }
      }),
    { threshold: 0.12 },
  );

  document
    .querySelectorAll(".section .wrap > *, .feature-bar")
    .forEach((el) => {
      el.classList.add("reveal");
      observer.observe(el);
    });
}

/** Параллакс в hero: пишет положение мыши в CSS-переменные --mx и --my. */
function initHeroParallax() {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    hero.style.setProperty("--mx", ((e.clientX - rect.left) / rect.width - 0.5).toFixed(3));
    hero.style.setProperty("--my", ((e.clientY - rect.top) / rect.height - 0.5).toFixed(3));
  });
}

function initFX() {
  initReveal();
  initHeroParallax();
}

/* ==========================================================================
   8. Обработчики страниц
   ========================================================================== */

/** Вкладки-фильтры на странице «Проекты». */
function initProjectTabs() {
  const tabs = document.querySelectorAll(".tab");

  tabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.toggle("active", t === tab));

      const tag = tab.dataset.tag;
      const filtered = D.projects.filter((p) => tag === ALL_TAG || p.tag === tag);
      document.getElementById("projCards").innerHTML = projects(filtered);
    }),
  );
}

/** Показывает сообщение под формой. */
const showFormMessage = (html, color) => {
  document.getElementById("formResult").innerHTML =
    `<div style="color: ${color}; margin-top: 10px;">${html}</div>`;
};

/** Собирает данные формы в объект для отправки на сервер. */
const collectFormData = (form) => ({
  name: form.elements.name.value,
  group: form.elements.group.value,
  email: form.elements.email.value,
  interest: form.elements.interest.value,
  message: form.elements.message.value,
  consent: form.elements.consent.checked, // true / false
  website: form.elements.website.value, // honeypot
});

/** Отправка заявки на сервер. */
async function submitJoinForm(event) {
  event.preventDefault();
  const form = event.currentTarget;

  showFormMessage("Отправка...", "gray");

  try {
    const response = await fetch(JOIN_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(collectFormData(form)),
    });

    if (response.ok) {
      showFormMessage(
        "<b>Успех!</b> Вы оставили заявку! Менеджер с вами свяжется обязательно!.",
        "green",
      );
      form.reset();
    } else {
      showFormMessage(
        "Не удалось отправить форму. Пожалуйста, обновите страницу и попробуйте снова.",
        "red",
      );
    }
  } catch (err) {
    showFormMessage("Сервер не отвечает. Запустите server.js.", "red");
  }
}

function initJoinForm() {
  const form = document.getElementById("joinForm");
  if (form) form.addEventListener("submit", submitJoinForm);
}

/* ==========================================================================
   9. Роутер и инициализация
   ========================================================================== */

/** Подсвечивает активный пункт меню и закрывает мобильное меню. */
function updateNavigation(page) {
  document
    .querySelectorAll("[data-nav]")
    .forEach((link) => link.classList.toggle("active", link.dataset.nav === page));

  document.getElementById("mainNav").classList.remove("open");
  document.getElementById("menuBtn").setAttribute("aria-expanded", "false");
}

/** Отрисовывает страницу по текущему hash (#page или #project/<id>). */
function render() {
  const hash = decodeURIComponent(location.hash.slice(1) || "home");
  const [page, id] = hash.split("/");

  app.innerHTML = page === "project" ? detail(id) : (pages[page] || pages.home)();

  updateNavigation(page);
  window.scrollTo(0, 0);

  initFX();
  initProjectTabs();
  initJoinForm();
}

/** Кнопка мобильного меню. */
function initMenuButton() {
  const nav = document.getElementById("mainNav");
  const button = document.getElementById("menuBtn");

  button.addEventListener("click", () => {
    nav.classList.toggle("open");
    button.setAttribute("aria-expanded", String(nav.classList.contains("open")));
  });
}

window.addEventListener("hashchange", render);
initMenuButton();
document.getElementById("year").textContent = new Date().getFullYear();
render();
