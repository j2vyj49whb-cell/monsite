/* InfraDojo — moteur de la plateforme (aucune dépendance, aucune étape de build). */
(function () {
  "use strict";

  const COURSES = window.COURSES || {};
  const ORDER = ["ansible", "terraform", "tiering"].filter((k) => COURSES[k]);
  const app = document.getElementById("app");

  /* ================= État & stockage ================= */
  const KEY = "infradojo.v1";
  const blank = () => ({ xp: 0, lessons: {}, ex: {}, exams: {}, name: "", last: "", days: [], badges: {} });
  let S = blank();
  try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(blank(), JSON.parse(raw)); } catch (e) { /* stockage indisponible */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignoré */ } }

  (function trackDay() {
    const d = new Date().toISOString().slice(0, 10);
    if (!S.days.includes(d)) { S.days.push(d); S.days = S.days.slice(-60); save(); }
  })();

  /* ================= Ceintures (niveaux) ================= */
  const BELTS = [
    { name: "Ceinture blanche", xp: 0, color: "#f4f4f2", title: "Découverte" },
    { name: "Ceinture jaune", xp: 150, color: "#f5d23c", title: "Premiers pas" },
    { name: "Ceinture orange", xp: 450, color: "#f08a24", title: "Opérateur" },
    { name: "Ceinture verte", xp: 900, color: "#2f9e57", title: "Technicien confirmé" },
    { name: "Ceinture bleue", xp: 1500, color: "#2f6fdb", title: "Ingénieur" },
    { name: "Ceinture marron", xp: 2300, color: "#7a4a24", title: "Ingénieur senior" },
    { name: "Ceinture noire", xp: 3000, color: "#14161a", title: "Expert / Architecte" },
  ];
  const beltOf = (xp) => BELTS.reduce((b, x) => (xp >= x.xp ? x : b), BELTS[0]);
  const nextBelt = (xp) => BELTS.find((b) => b.xp > xp);

  /* ================= Utilitaires ================= */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  function shuffle(a) { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }
  const INTERACTIVE = ["quiz", "term", "editor", "order", "classify"];
  const XP_DEFAULT = { quiz: 10, term: 20, editor: 25, order: 15, classify: 20 };
  const LESSON_XP = 30, EXAM_XP = 200;

  function toast(html) {
    const t = document.createElement("div");
    t.className = "toast"; t.innerHTML = html;
    $("#toasts").appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }
  function addXP(n, why) {
    if (!n) return;
    const before = beltOf(S.xp);
    S.xp += n; save(); renderTopbar();
    toast(`<b>+${n} XP</b> · ${esc(why)}`);
    const after = beltOf(S.xp);
    if (after !== before) setTimeout(() => toast(`Nouvelle ceinture : <b>${after.name}</b> — ${after.title}`), 500);
    checkBadges();
  }
  function markEx(key, xp, why) {
    if (S.ex[key] !== undefined) return false;
    S.ex[key] = xp > 0 ? 1 : 0; save();
    if (xp > 0) addXP(xp, why);
    return true;
  }

  /* ================= Coloration syntaxique légère ================= */
  const LANGS = {
    yaml: { re: /(#.*$)|("(?:[^"\\]|\\.)*"|'[^']*')|(\{\{.*?\}\}|\{%.*?%\})|(^\s*-?\s*[\w.\/@-]+(?=:(\s|$)))|(\b(?:true|false|yes|no|null)\b)|(\b\d+\b)/g, cls: ["c", "s", "v", "k", "w", "n"] },
    hcl: { re: /(#.*$|\/\/.*$)|("(?:[^"\\]|\\.)*")|(\$\{[^}]*\})|(^\s*(?:resource|data|variable|output|provider|module|locals|terraform|moved|import|check|backend|required_providers|lifecycle|dynamic|content|validation)\b)|(\b(?:true|false|null|for|in|if|each|count|var|local|module|data|self|path)\b)|(\b\d+\b)/g, cls: ["c", "s", "v", "k", "w", "n"] },
    bash: { re: /(#.*$)|("(?:[^"\\]|\\.)*"|'[^']*')|(\$\w+|\$\{[^}]*\})|(^\s*(?:\$|PS[^>]*>|#)\s)|(\s--?[\w-]+)/g, cls: ["c", "s", "v", "p", "w"] },
    ps: { re: /(#.*$)|("(?:[^"\\]|\\.)*"|'[^']*')|(\$[\w:]+)|(\b[A-Z][a-z]+-[A-Za-z]+\b)|(\s-[A-Za-z]+)/g, cls: ["c", "s", "v", "k", "w"] },
    ini: { re: /(#.*$|;.*$)|(^\s*\[[^\]]+\])|(\b\w+=)|("(?:[^"\\]|\\.)*")/g, cls: ["c", "k", "w", "s"] },
    json: { re: /("(?:[^"\\]|\\.)*"(?=\s*:))|("(?:[^"\\]|\\.)*")|(\b(?:true|false|null)\b)|(\b\d+\b)/g, cls: ["k", "s", "w", "n"] },
  };
  function highlight(code, lang) {
    const L = LANGS[lang];
    if (!L) return esc(code);
    return code.split("\n").map((line) => {
      let out = "", last = 0; L.re.lastIndex = 0; let m;
      while ((m = L.re.exec(line))) {
        if (m[0] === "") { L.re.lastIndex++; continue; }
        const gi = m.findIndex((g, i) => i > 0 && g !== undefined);
        out += esc(line.slice(last, m.index));
        out += `<span class="tk-${L.cls[gi - 1]}">${esc(m[0])}</span>`;
        last = m.index + m[0].length;
      }
      return out + esc(line.slice(last));
    }).join("\n");
  }
  const LANG_LABEL = { yaml: "YAML", hcl: "HCL", bash: "Shell", ps: "PowerShell", ini: "INI", json: "JSON", text: "Texte" };

  /* ================= Barre du haut ================= */
  function renderTopbar(active) {
    const b = beltOf(S.xp);
    $("#beltSwatch").style.background = b.color;
    $("#beltLabel").textContent = b.name;
    $("#xpLabel").textContent = S.xp + " XP";
    if (active !== undefined) $$(".topnav a").forEach((a) => a.classList.toggle("on", a.dataset.mod === active));
  }

  /* ================= Thème ================= */
  (function theme() {
    let t = null; try { t = localStorage.getItem("infradojo.theme"); } catch (e) {}
    if (t) document.documentElement.setAttribute("data-theme", t);
    $("#themeBtn").addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const nt = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", nt);
      try { localStorage.setItem("infradojo.theme", nt); } catch (e) {}
    });
  })();

  /* ================= Statistiques de progression ================= */
  function exCount(lesson) { return lesson.blocks.filter((b) => INTERACTIVE.includes(b.t)).length; }
  function exDone(mod, lesson) { return lesson.blocks.reduce((n, b, i) => n + (INTERACTIVE.includes(b.t) && S.ex[`${mod}/${lesson.id}/${i}`] !== undefined ? 1 : 0), 0); }
  function modProgress(mod) {
    const c = COURSES[mod]; const total = c.lessons.length;
    const done = c.lessons.filter((l) => S.lessons[`${mod}/${l.id}`]).length;
    return { done, total, pct: Math.round((done / total) * 100) };
  }
  function totalExercises() { return ORDER.reduce((n, m) => n + COURSES[m].lessons.reduce((k, l) => k + exCount(l), 0), 0); }

  /* ================= Badges ================= */
  const BADGES = [
    { id: "first", ico: "1", name: "Premier pas", desc: "Valider une première leçon", test: () => Object.keys(S.lessons).length >= 1 },
    { id: "term5", ico: ">_", name: "Main au clavier", desc: "Réussir 5 défis terminal", test: () => countKind("term") >= 5 },
    { id: "code5", ico: "{}", name: "Artisan du code", desc: "Réussir 5 exercices de code", test: () => countKind("editor") >= 5 },
    { id: "streak3", ico: "3j", name: "Régulier", desc: "S'entraîner 3 jours différents", test: () => S.days.length >= 3 },
    ...ORDER.map((m) => ({ id: "mod-" + m, ico: COURSES[m].glyph, name: COURSES[m].title + " complet", desc: "Valider toutes les leçons du module", test: () => modProgress(m).done === modProgress(m).total })),
    ...ORDER.map((m) => ({ id: "exam-" + m, ico: "★", name: "Certifié " + COURSES[m].title, desc: "Réussir l'examen final (≥ 80 %)", test: () => !!(S.exams[m] && S.exams[m].passed) })),
    { id: "perfect", ico: "100", name: "Sans faute", desc: "Obtenir 100 % à un examen", test: () => Object.values(S.exams).some((e) => e.best === 100) },
    { id: "black", ico: "黒", name: "Ceinture noire", desc: "Atteindre 3 000 XP", test: () => S.xp >= 3000 },
  ];
  function countKind(kind) {
    let n = 0;
    ORDER.forEach((m) => COURSES[m].lessons.forEach((l) => l.blocks.forEach((b, i) => { if (b.t === kind && S.ex[`${m}/${l.id}/${i}`] === 1) n++; })));
    return n;
  }
  function checkBadges() {
    BADGES.forEach((b) => {
      if (!S.badges[b.id] && b.test()) { S.badges[b.id] = new Date().toISOString().slice(0, 10); save(); setTimeout(() => toast(`Badge débloqué : <b>${esc(b.name)}</b>`), 900); }
    });
  }

  /* ================= Routeur ================= */
  function route() {
    const h = (location.hash || "#home").slice(1);
    let mod = "";
    if (h === "home" || h === "") renderHome();
    else if (h === "profil") renderProfile();
    else {
      const [m, ...rest] = h.split("-"); const sub = rest.join("-");
      mod = m;
      if (!COURSES[m]) renderHome();
      else if (!sub) renderModule(m);
      else if (sub === "examen") renderExam(m);
      else if (sub === "memo") renderCheat(m);
      else {
        const lesson = COURSES[m].lessons.find((l) => l.id === sub);
        lesson ? renderLesson(m, lesson) : renderModule(m);
      }
    }
    renderTopbar(mod);
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }
  window.addEventListener("hashchange", route);

  /* ================= Accueil ================= */
  function renderHome() {
    document.title = "InfraDojo";
    const b = beltOf(S.xp), nb = nextBelt(S.xp);
    const resume = S.last && S.last.includes("-") ? S.last : "";
    let resumeLabel = "";
    if (resume) { const [m, id] = resume.split("-"); const l = COURSES[m] && COURSES[m].lessons.find((x) => x.id === id); if (l) resumeLabel = `${COURSES[m].title} · ${l.title}`; }
    app.innerHTML = `
      <section class="hero"><div class="wrap hero-grid">
        <div>
          <div class="eyebrow">Formation interactive · niveau pro</div>
          <h1>Automatise, provisionne, <em>cloisonne</em>.</h1>
          <p class="lead">Trois parcours pour passer du premier playbook à l'architecture sécurisée : Ansible pour configurer, Terraform pour provisionner, le Tiering pour protéger l'Active Directory. Tu lis, tu tapes de vraies commandes, tu corriges du vrai code, tu passes ta ceinture.</p>
          <div class="hero-actions">
            ${resume && resumeLabel ? `<a class="btn btn-primary" href="#${resume}">Reprendre : ${esc(resumeLabel)}</a>` : `<a class="btn btn-primary" href="#ansible-l1">Commencer par Ansible</a>`}
            <a class="btn btn-ghost" href="#profil">Ma progression</a>
          </div>
        </div>
        <div class="hero-term" aria-label="Exemple d'exécution Ansible"><div class="dots"><i></i><i></i><i></i></div><span class="p">admin@ctrl:~$</span> ansible-playbook site.yml -l tier1 --check
<span class="dim">PLAY [Durcir les serveurs Tier 1] ****************</span>
TASK [Désactiver SMBv1] **************************
<span class="ok">ok: [srv-app01]</span>
<span class="ch">changed: [srv-app02]</span>
TASK [Refuser l'ouverture de session Tier 0] *****
<span class="ch">changed: [srv-app01]</span>
<span class="ch">changed: [srv-app02]</span>
<span class="dim">PLAY RECAP ***************************************</span>
srv-app01 : <span class="ok">ok=2</span> <span class="ch">changed=1</span> failed=0
srv-app02 : <span class="ok">ok=1</span> <span class="ch">changed=2</span> failed=0
<span class="p">admin@ctrl:~$</span> <span class="caret"></span></div>
      </div></section>

      <section class="section"><div class="wrap">
        <div class="section-head"><h2>Les trois modules</h2><p>Chaque module se termine par un examen et un certificat.</p></div>
        <div class="mod-cards">
          ${ORDER.map((m) => { const c = COURSES[m], p = modProgress(m); return `
          <a class="mod-card mod-${m}" href="#${m}">
            <div class="glyph">${esc(c.glyph)}</div>
            <h3>${esc(c.title)}</h3>
            <p>${esc(c.tagline)}</p>
            <div class="tags">${c.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
            <div class="meta"><span>${c.lessons.length} leçons</span><span>${c.lessons.reduce((n, l) => n + exCount(l), 0)} exercices</span><span>~${c.hours} h</span></div>
            <div class="foot"><div class="progress"><span style="width:${p.pct}%"></span></div><small>${p.done}/${p.total} leçons validées${S.exams[m] && S.exams[m].passed ? " · certifié" : ""}</small></div>
          </a>`; }).join("")}
        </div>
      </div></section>

      <section class="section"><div class="wrap">
        <div class="section-head"><h2>Comment on apprend ici</h2></div>
        <div class="how">
          <div class="how-item"><b>Terminal simulé</b><span>Tu tapes les vraies commandes (<code>ansible</code>, <code>terraform</code>, PowerShell). Le terminal répond comme le vrai.</span></div>
          <div class="how-item"><b>Code à corriger</b><span>Des playbooks et fichiers HCL à écrire ou réparer, vérifiés point par point.</span></div>
          <div class="how-item"><b>Mises en situation</b><span>Classer des actifs par tier, remettre un workflow dans l'ordre, choisir la bonne réponse en incident.</span></div>
          <div class="how-item"><b>Examen et certificat</b><span>80 % pour réussir. Les questions sont tirées des pièges réels de production.</span></div>
        </div>
      </div></section>

      <section class="section"><div class="wrap">
        <div class="section-head"><h2>Ta ceinture</h2><p>${esc(b.name)} — ${esc(b.title)}${nb ? ` · encore ${nb.xp - S.xp} XP pour la ${esc(nb.name.toLowerCase())}` : ""}</p></div>
        <div class="belts-row">${BELTS.map((x) => `<div class="belt-step ${S.xp >= x.xp ? "reached" : ""}"><span class="belt-swatch" style="background:${x.color}"></span>${esc(x.name.replace("Ceinture ", ""))}<small>${x.xp} XP</small></div>`).join("")}</div>
      </div></section>`;
  }

  /* ================= Page module ================= */
  function renderModule(m) {
    const c = COURSES[m], p = modProgress(m);
    document.title = `${c.title} · InfraDojo`;
    const parts = [];
    c.lessons.forEach((l, i) => { const last = parts[parts.length - 1]; if (!last || last.title !== l.part) parts.push({ title: l.part, items: [] }); parts[parts.length - 1].items.push({ l, i }); });
    const firstTodo = c.lessons.find((l) => !S.lessons[`${m}/${l.id}`]) || c.lessons[0];
    const ex = S.exams[m];
    app.innerHTML = `
      <div class="mod-${m}">
        <section class="mod-hero"><div class="wrap">
          <div class="eyebrow">Module</div>
          <h1>${esc(c.title)}</h1>
          <p>${c.desc}</p>
          <div class="mod-stats"><span><b>${c.lessons.length}</b> leçons</span><span><b>${c.lessons.reduce((n, l) => n + exCount(l), 0)}</b> exercices</span><span><b>${c.exam.length}</b> questions d'examen</span><span><b>${p.pct} %</b> validé</span></div>
          <div class="mod-actions">
            <a class="btn btn-mod" href="#${m}-${firstTodo.id}">${p.done ? "Continuer" : "Commencer"} : ${esc(firstTodo.title)}</a>
            <a class="btn btn-ghost" href="#${m}-memo">Antisèche</a>
          </div>
        </div></section>
        <section class="section"><div class="wrap">
          <div class="lesson-list">
            ${parts.map((pt) => `<div class="part-title">${esc(pt.title)}</div>` + pt.items.map(({ l, i }) => {
              const done = S.lessons[`${m}/${l.id}`]; const n = exCount(l), d = exDone(m, l);
              return `<a class="lesson-row ${done ? "done" : ""}" href="#${m}-${l.id}">
                <span class="lesson-num">${done ? "✓" : String(i + 1).padStart(2, "0")}</span>
                <div><h3>${esc(l.title)}</h3><p>${esc(l.summary)}</p></div>
                <div class="lesson-side"><span>${l.duration} min</span><span class="pill ${done ? "pill-ok" : ""}">${d}/${n} ex.</span></div>
              </a>`; }).join("")).join("")}
          </div>
          <div class="extra-cards">
            <a class="extra-card" href="#${m}-examen"><b>Examen final${ex && ex.passed ? " · réussi" : ""}</b><span>${c.exam.length} questions, 80 % pour obtenir le certificat (+${EXAM_XP} XP).${ex ? ` Meilleur score : ${ex.best} %.` : ""}</span></a>
            <a class="extra-card" href="#${m}-memo"><b>Antisèche</b><span>Toutes les commandes et notions clés du module sur une page.</span></a>
          </div>
        </div></section>
      </div>`;
  }

  /* ================= Rendu des blocs de contenu ================= */
  function blockHTML(b, i) {
    switch (b.t) {
      case "h2": return `<h2 id="s${i}">${b.text}</h2>`;
      case "h3": return `<h3>${b.text}</h3>`;
      case "p": return `<p>${b.html}</p>`;
      case "list": return b.ordered ? `<ol>${b.items.map((x) => `<li>${x}</li>`).join("")}</ol>` : `<ul>${b.items.map((x) => `<li>${x}</li>`).join("")}</ul>`;
      case "code": return `<div class="codebox"><div class="codebox-head"><span>${esc(b.title || LANG_LABEL[b.lang] || "")}</span><button class="copy-btn" type="button" data-copy="${i}">Copier</button></div><pre class="code"><code>${highlight(b.code.replace(/^\n/, ""), b.lang)}</code></pre></div>`;
      case "callout": { const ico = { tip: "i", warn: "!", danger: "×", pro: "★" }[b.kind] || "i"; return `<div class="callout callout-${b.kind}"><span class="ico">${ico}</span><div>${b.title ? `<div class="callout-title">${b.title}</div>` : ""}<p>${b.html}</p></div></div>`; }
      case "table": return `<div class="tbl-wrap"><table><thead><tr>${b.head.map((x) => `<th>${x}</th>`).join("")}</tr></thead><tbody>${b.rows.map((r) => `<tr>${r.map((x) => `<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
      case "figure": return `<figure class="figure" style="margin:0">${b.svg}${b.caption ? `<figcaption>${b.caption}</figcaption>` : ""}</figure>`;
      default:
        if (INTERACTIVE.includes(b.t)) {
          const label = { quiz: "Question", term: "Défi terminal", editor: "Exercice de code", order: "Remise en ordre", classify: "Mise en situation" }[b.t];
          return `<div class="ex" data-ex="${i}"><div class="ex-head"><span class="ex-kind">${label}</span><span class="ex-xp">+${b.xp || XP_DEFAULT[b.t]} XP</span></div><div class="ex-body"></div></div>`;
        }
        return "";
    }
  }

  function renderLesson(m, lesson) {
    const c = COURSES[m]; const idx = c.lessons.indexOf(lesson);
    const prev = c.lessons[idx - 1], next = c.lessons[idx + 1];
    S.last = `${m}-${lesson.id}`; save();
    document.title = `${lesson.title} · ${c.title} · InfraDojo`;
    app.innerHTML = `
      <div class="mod-${m}"><div class="wrap lesson-layout">
        <nav class="toc" aria-label="Leçons du module">
          <a class="toc-mod" href="#${m}">${esc(c.title)}</a>
          ${c.lessons.map((l, i) => `<a href="#${m}-${l.id}" class="${l === lesson ? "on" : ""} ${S.lessons[`${m}/${l.id}`] ? "done" : ""}"><span class="n">${S.lessons[`${m}/${l.id}`] ? "✓" : i + 1}</span><span>${esc(l.title)}</span></a>`).join("")}
          <a href="#${m}-examen"><span class="n">★</span><span>Examen final</span></a>
          <a href="#${m}-memo"><span class="n">≡</span><span>Antisèche</span></a>
        </nav>
        <article class="lesson">
          <div class="crumbs"><a href="#home">Accueil</a><span>/</span><a href="#${m}">${esc(c.title)}</a><span>/</span><span>Leçon ${idx + 1}</span></div>
          <header class="lesson-head">
            <h1>${esc(lesson.title)}</h1>
            <div class="lesson-meta"><span class="pill pill-mod">${esc(lesson.part)}</span><span class="pill">${lesson.duration} min</span><span class="pill">${exCount(lesson)} exercices</span></div>
          </header>
          ${lesson.objectives ? `<div class="objectives"><b>À la fin de cette leçon, tu sauras</b><ul>${lesson.objectives.map((o) => `<li>${o}</li>`).join("")}</ul></div>` : ""}
          <div class="lesson-body">${lesson.blocks.map(blockHTML).join("")}</div>
          <div class="lesson-end" id="lessonEnd"></div>
          <div class="pager">
            ${prev ? `<a href="#${m}-${prev.id}"><small>← Précédente</small>${esc(prev.title)}</a>` : `<a href="#${m}"><small>← Retour</small>Sommaire du module</a>`}
            ${next ? `<a class="next" href="#${m}-${next.id}"><small>Suivante →</small>${esc(next.title)}</a>` : `<a class="next" href="#${m}-examen"><small>Dernière étape →</small>Examen final</a>`}
          </div>
        </article>
      </div></div>`;

    $$("[data-copy]", app).forEach((btn) => btn.addEventListener("click", () => copyText(lesson.blocks[+btn.dataset.copy].code.replace(/^\n/, ""), btn)));
    $$("[data-ex]", app).forEach((el) => {
      const i = +el.dataset.ex, b = lesson.blocks[i], key = `${m}/${lesson.id}/${i}`;
      const ctx = { el, body: $(".ex-body", el), b, key, xp: b.xp || XP_DEFAULT[b.t], onDone: () => updateEnd(m, lesson) };
      if (S.ex[key] !== undefined) el.classList.add("solved");
      EX[b.t](ctx);
    });
    updateEnd(m, lesson);
  }

  function updateEnd(m, lesson) {
    const box = $("#lessonEnd"); if (!box) return;
    const k = `${m}/${lesson.id}`, n = exCount(lesson), d = exDone(m, lesson);
    if (S.lessons[k]) {
      box.innerHTML = `<div class="stat"><b>Leçon validée.</b> ${d}/${n} exercices faits.</div><span class="pill pill-ok">+${LESSON_XP} XP obtenus</span>`;
      return;
    }
    const ready = d >= n;
    box.innerHTML = `<div class="stat"><b>${d}/${n}</b> exercices faits${ready ? "" : " — termine-les pour valider la leçon"}.</div><button class="btn btn-mod" type="button" id="validateBtn" ${ready ? "" : "disabled"}>Valider la leçon (+${LESSON_XP} XP)</button>`;
    const btn = $("#validateBtn");
    if (btn) btn.addEventListener("click", () => {
      S.lessons[k] = 1; save(); addXP(LESSON_XP, "Leçon validée : " + lesson.title); updateEnd(m, lesson);
      $$(".toc a.on").forEach((a) => a.classList.add("done"));
    });
  }

  function copyText(txt, btn) {
    const done = () => { btn.textContent = "Copié"; setTimeout(() => (btn.textContent = "Copier"), 1400); };
    try { navigator.clipboard.writeText(txt).then(done, () => fallback()); } catch (e) { fallback(); }
    function fallback() {
      const pre = btn.closest(".codebox").querySelector("pre");
      const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
      btn.textContent = "Sélectionné";
    }
  }

  /* ================= Exercices ================= */
  function solved(ctx, xp, why) {
    ctx.el.classList.add("solved");
    markEx(ctx.key, xp, why);
    ctx.onDone();
  }

  const EX = {
    quiz(ctx) {
      const { b, body } = ctx;
      const order = shuffle(b.options.map((o, i) => i));
      body.innerHTML = `<p class="ex-q">${b.q}</p><div class="options">${order.map((oi, k) => `<button class="opt" type="button" data-oi="${oi}"><span class="k">${"ABCDEF"[k]}</span><span>${b.options[oi]}</span></button>`).join("")}</div><div class="fb"></div>`;
      $$(".opt", body).forEach((btn) => btn.addEventListener("click", () => {
        const oi = +btn.dataset.oi, ok = oi === b.answer;
        $$(".opt", body).forEach((x) => { x.disabled = true; if (+x.dataset.oi === b.answer) x.classList.add("right"); });
        if (!ok) btn.classList.add("wrong");
        $(".fb", body).innerHTML = `<div class="feedback ${ok ? "ok" : "ko"}"><b>${ok ? "Exact." : "Pas tout à fait."}</b> ${b.explain || ""}</div>`;
        const first = S.ex[ctx.key] === undefined;
        solved(ctx, ok && first ? ctx.xp : 0, "Bonne réponse");
        if (!ok) ctx.el.classList.remove("solved");
      }));
    },

    term(ctx) {
      const { b, body } = ctx;
      const ps = b.ps || "admin@ctrl:~$";
      let step = 0;
      body.innerHTML = `<p class="ex-q">${b.task}</p><div class="term"><div class="term-out"></div><div class="term-line"><span class="ps">${esc(ps)}</span><input type="text" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Commande" id="term-${ctx.key.replace(/\W/g, "-")}"></div></div><div class="ex-actions"><button class="btn btn-ghost btn-sm" type="button" data-a="hint">Indice</button><button class="btn btn-ghost btn-sm" type="button" data-a="sol">Voir la commande</button><span class="step-info" style="font-size:.84rem;color:var(--fg-3)"></span></div><div class="fb"></div>`;
      const out = $(".term-out", body), input = $("input", body), info = $(".step-info", body);
      let revealed = false;
      const print = (html) => { out.insertAdjacentHTML("beforeend", html + "\n"); const t = $(".term", body); t.scrollTop = t.scrollHeight; };
      const showStep = () => {
        if (step < b.steps.length) { info.textContent = `Étape ${step + 1}/${b.steps.length}`; $(".fb", body).innerHTML = b.steps.length > 1 ? `<div class="feedback info">${b.steps[step].ask || ""}</div>` : (b.steps[0].ask ? `<div class="feedback info">${b.steps[0].ask}</div>` : ""); }
      };
      showStep();
      body.querySelector(".term").addEventListener("click", () => input.focus());
      input.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        const cmd = input.value.trim(); input.value = "";
        if (!cmd) return;
        print(`<span style="color:var(--term-prompt)">${esc(ps)}</span> ${esc(cmd)}`);
        if (cmd === "clear") { out.innerHTML = ""; return; }
        if (step >= b.steps.length) { print(`<span class="dim">Défi terminé. Passe à la suite de la leçon.</span>`); return; }
        const st = b.steps[step];
        if (st.accept.some((re) => re.test(cmd))) {
          print(st.output || "");
          step++;
          if (step >= b.steps.length) {
            info.textContent = "Terminé";
            $(".fb", body).innerHTML = `<div class="feedback ok"><b>Bien joué.</b> ${b.explain || ""}</div>`;
            solved(ctx, revealed ? 0 : ctx.xp, "Défi terminal réussi");
          } else showStep();
        } else {
          const near = st.near && st.near.find((n) => n.re.test(cmd));
          print(`<span class="err">${esc(near ? near.msg : (st.error || "Commande incorrecte pour cette étape. Relis la consigne ou demande un indice."))}</span>`);
        }
      });
      $("[data-a=hint]", body).addEventListener("click", () => { if (step < b.steps.length) $(".fb", body).innerHTML = `<div class="feedback info"><b>Indice :</b> ${b.steps[step].hint}</div>`; });
      $("[data-a=sol]", body).addEventListener("click", () => { if (step < b.steps.length) { revealed = true; input.value = b.steps[step].solution; input.focus(); } });
    },

    editor(ctx) {
      const { b, body } = ctx;
      const id = "ed-" + ctx.key.replace(/\W/g, "-");
      body.innerHTML = `<p class="ex-q">${b.task}</p><textarea class="code-editor" id="${id}" spellcheck="false" aria-label="Éditeur de code" style="min-height:${Math.max(180, b.starter.split("\n").length * 22 + 30)}px"></textarea><ul class="checks">${b.checks.map((c) => `<li>${c.label}</li>`).join("")}</ul><div class="ex-actions"><button class="btn btn-mod btn-sm" type="button" data-a="check">Vérifier</button><button class="btn btn-ghost btn-sm" type="button" data-a="reset">Réinitialiser</button><button class="btn btn-ghost btn-sm" type="button" data-a="sol">Voir une solution</button></div><div class="fb"></div>`;
      const ta = $("textarea", body); ta.value = b.starter.replace(/^\n/, "");
      let revealed = false;
      ta.addEventListener("keydown", (e) => {
        if (e.key === "Tab") { e.preventDefault(); const s = ta.selectionStart; ta.setRangeText("  ", s, ta.selectionEnd, "end"); }
      });
      $("[data-a=check]", body).addEventListener("click", () => {
        const v = ta.value; const lis = $$(".checks li", body); let all = true;
        b.checks.forEach((c, i) => { const ok = c.re.test(v) !== !!c.not; lis[i].className = ok ? "ok" : "ko"; if (!ok) all = false; });
        $(".fb", body).innerHTML = all ? `<div class="feedback ok"><b>Validé.</b> ${b.explain || ""}</div>` : `<div class="feedback ko">Certains points ne sont pas encore bons (✗). Corrige et revérifie.</div>`;
        if (all) solved(ctx, revealed ? 0 : ctx.xp, "Exercice de code réussi");
      });
      $("[data-a=reset]", body).addEventListener("click", () => { ta.value = b.starter.replace(/^\n/, ""); $$(".checks li", body).forEach((l) => (l.className = "")); });
      $("[data-a=sol]", body).addEventListener("click", () => { revealed = true; ta.value = b.solution.replace(/^\n/, ""); $(".fb", body).innerHTML = `<div class="feedback info">Solution chargée. Lis-la, puis clique sur Vérifier. (Pas d'XP pour un exercice dont la solution a été affichée.)</div>`; });
    },

    order(ctx) {
      const { b, body } = ctx;
      let cur = shuffle(b.items.map((x, i) => i));
      if (cur.every((v, i) => v === i)) cur.reverse();
      let attempts = 0;
      const draw = (state) => {
        $(".order-list", body).innerHTML = cur.map((oi, k) => `<li class="order-item ${state ? (oi === k ? "right" : "wrong") : ""}"><span class="pos">${k + 1}</span><span>${b.items[oi]}</span><span class="order-btns"><button class="mini-btn" type="button" data-up="${k}" aria-label="Monter">↑</button><button class="mini-btn" type="button" data-down="${k}" aria-label="Descendre">↓</button></span></li>`).join("");
        $$("[data-up]", body).forEach((x) => x.addEventListener("click", () => { const k = +x.dataset.up; if (k > 0) { [cur[k - 1], cur[k]] = [cur[k], cur[k - 1]]; draw(); } }));
        $$("[data-down]", body).forEach((x) => x.addEventListener("click", () => { const k = +x.dataset.down; if (k < cur.length - 1) { [cur[k + 1], cur[k]] = [cur[k], cur[k + 1]]; draw(); } }));
      };
      body.innerHTML = `<p class="ex-q">${b.task}</p><ol class="order-list"></ol><div class="ex-actions"><button class="btn btn-mod btn-sm" type="button" data-a="check">Vérifier l'ordre</button></div><div class="fb"></div>`;
      draw();
      $("[data-a=check]", body).addEventListener("click", () => {
        attempts++;
        const ok = cur.every((v, i) => v === i);
        draw(true);
        $(".fb", body).innerHTML = ok ? `<div class="feedback ok"><b>Ordre correct.</b> ${b.explain || ""}</div>` : `<div class="feedback ko">Les étapes en rouge ne sont pas à leur place. Réorganise et revérifie.</div>`;
        if (ok) solved(ctx, attempts <= 2 ? ctx.xp : Math.round(ctx.xp / 2), "Ordre correct");
      });
    },

    classify(ctx) {
      const { b, body } = ctx;
      const picks = b.items.map(() => -1);
      const items = shuffle(b.items.map((x, i) => i));
      let attempts = 0;
      body.innerHTML = `<p class="ex-q">${b.task}</p><div class="classify-items">${items.map((ii) => `<div class="cl-item" data-ii="${ii}"><span>${b.items[ii].t}</span><div class="seg" role="group">${b.buckets.map((bk, bi) => `<button type="button" data-bi="${bi}">${esc(bk)}</button>`).join("")}</div><div class="cl-why" hidden></div></div>`).join("")}</div><div class="ex-actions"><button class="btn btn-mod btn-sm" type="button" data-a="check">Vérifier</button></div><div class="fb"></div>`;
      $$(".cl-item", body).forEach((row) => {
        const ii = +row.dataset.ii;
        $$(".seg button", row).forEach((btn) => btn.addEventListener("click", () => {
          picks[ii] = +btn.dataset.bi;
          $$(".seg button", row).forEach((x) => x.classList.toggle("on", x === btn));
          row.classList.remove("right", "wrong");
        }));
      });
      $("[data-a=check]", body).addEventListener("click", () => {
        if (picks.some((p) => p < 0)) { $(".fb", body).innerHTML = `<div class="feedback info">Classe tous les éléments avant de vérifier.</div>`; return; }
        attempts++;
        let good = 0;
        $$(".cl-item", body).forEach((row) => {
          const ii = +row.dataset.ii, it = b.items[ii], ok = picks[ii] === it.b;
          if (ok) good++;
          row.classList.toggle("right", ok); row.classList.toggle("wrong", !ok);
          const why = $(".cl-why", row);
          if (it.why) { why.hidden = false; why.innerHTML = (ok ? "" : `<b>Réponse : ${esc(b.buckets[it.b])}.</b> `) + it.why; }
        });
        const all = good === b.items.length;
        $(".fb", body).innerHTML = all ? `<div class="feedback ok"><b>${good}/${b.items.length} — parfait.</b> ${b.explain || ""}</div>` : `<div class="feedback ko"><b>${good}/${b.items.length}.</b> Lis les explications sous les lignes en rouge, corrige et revérifie.</div>`;
        if (all) solved(ctx, attempts === 1 ? ctx.xp : Math.round(ctx.xp / 2), "Mise en situation réussie");
      });
    },
  };

  /* ================= Examen ================= */
  function renderExam(m) {
    const c = COURSES[m];
    document.title = `Examen ${c.title} · InfraDojo`;
    const qs = shuffle(c.exam.map((q, i) => i));
    let k = 0, score = 0;
    const answers = [];
    const shell = (inner) => { app.innerHTML = `<div class="mod-${m}"><div class="wrap"><div class="exam-card"><div class="crumbs"><a href="#home">Accueil</a><span>/</span><a href="#${m}">${esc(c.title)}</a><span>/</span><span>Examen final</span></div>${inner}</div></div></div>`; };

    const intro = () => {
      const ex = S.exams[m];
      shell(`<div class="exam-score" style="text-align:left">
        <div class="eyebrow">Examen final</div>
        <h1 style="font-size:2rem;margin:8px 0 10px">${esc(c.title)}</h1>
        <p>${c.exam.length} questions de mise en situation, dans un ordre aléatoire. Tu dois obtenir au moins <b>80 %</b> pour décrocher le certificat et <b>${EXAM_XP} XP</b> (une seule fois). Les explications s'affichent après chaque réponse.</p>
        ${ex ? `<p>Meilleur score actuel : <b>${ex.best} %</b>${ex.passed ? " · certificat obtenu" : ""}.</p>` : ""}
        <div class="hero-actions"><button class="btn btn-mod" type="button" id="startExam">Commencer l'examen</button>${ex && ex.passed ? `<button class="btn btn-ghost" type="button" id="showCert">Voir mon certificat</button>` : ""}</div>
      </div>`);
      $("#startExam").addEventListener("click", ask);
      const sc = $("#showCert"); if (sc) sc.addEventListener("click", () => result(true));
    };

    const ask = () => {
      const q = c.exam[qs[k]];
      const order = shuffle(q.options.map((o, i) => i));
      shell(`<div class="exam-top"><span>Question ${k + 1} / ${qs.length}</span><span>Score : ${score}</span></div>
        <div class="progress" style="margin-bottom:16px"><span style="width:${Math.round((k / qs.length) * 100)}%"></span></div>
        <div class="ex"><div class="ex-body"><p class="ex-q">${q.q}</p><div class="options">${order.map((oi, j) => `<button class="opt" type="button" data-oi="${oi}"><span class="k">${"ABCDEF"[j]}</span><span>${q.options[oi]}</span></button>`).join("")}</div><div class="fb"></div><div class="ex-actions" id="nextZone"></div></div></div>`);
      $$(".opt").forEach((btn) => btn.addEventListener("click", () => {
        const oi = +btn.dataset.oi, ok = oi === q.answer;
        if (ok) score++;
        answers.push(ok);
        $$(".opt").forEach((x) => { x.disabled = true; if (+x.dataset.oi === q.answer) x.classList.add("right"); });
        if (!ok) btn.classList.add("wrong");
        $(".fb").innerHTML = `<div class="feedback ${ok ? "ok" : "ko"}"><b>${ok ? "Correct." : "Incorrect."}</b> ${q.explain || ""}</div>`;
        $("#nextZone").innerHTML = `<button class="btn btn-mod" type="button" id="nextQ">${k + 1 < qs.length ? "Question suivante" : "Voir le résultat"}</button>`;
        $("#nextQ").addEventListener("click", () => { k++; k < qs.length ? ask() : finish(); });
        $("#nextQ").focus();
      }));
    };

    const finish = () => {
      const pct = Math.round((score / qs.length) * 100);
      const prev = S.exams[m] || { best: 0, passed: false };
      const passed = pct >= 80;
      const firstPass = passed && !prev.passed;
      S.exams[m] = { best: Math.max(prev.best, pct), passed: prev.passed || passed, date: passed && !prev.passed ? new Date().toISOString().slice(0, 10) : prev.date };
      save();
      if (firstPass) addXP(EXAM_XP, "Examen " + c.title + " réussi");
      else checkBadges();
      result(false, pct);
    };

    const result = (onlyCert, pct) => {
      const ex = S.exams[m];
      const name = S.name || "";
      const cert = ex && ex.passed ? `<div class="cert">
          <div class="eyebrow">InfraDojo · certificat de réussite</div>
          <h3>${esc(c.certTitle)}</h3>
          <div class="who">${name ? esc(name) : "Ton nom ici"}</div>
          <p>a réussi l'examen final du module ${esc(c.title)} avec un meilleur score de <b>${ex.best} %</b>.</p>
          <small>Obtenu le ${esc(ex.date || "")}${name ? "" : " · ajoute ton nom dans la page Progression"}</small>
        </div>` : "";
      if (onlyCert) { shell(`${cert}<div class="hero-actions" style="margin-top:16px"><a class="btn btn-ghost" href="#${m}">Retour au module</a></div>`); return; }
      shell(`<div class="exam-score">
          <div class="eyebrow">Résultat</div>
          <div class="big" style="color:${pct >= 80 ? "var(--ok)" : "var(--bad)"}">${pct} %</div>
          <p>${score} bonnes réponses sur ${qs.length}. ${pct >= 80 ? "Examen réussi." : "Il faut 80 % : relis les leçons où tu as hésité, puis retente."}</p>
          <div class="hero-actions" style="justify-content:center"><button class="btn btn-mod" type="button" id="retry">Repasser l'examen</button><a class="btn btn-ghost" href="#${m}">Retour au module</a></div>
        </div>${cert}`);
      $("#retry").addEventListener("click", () => renderExam(m));
    };

    intro();
  }

  /* ================= Antisèche ================= */
  function renderCheat(m) {
    const c = COURSES[m];
    document.title = `Antisèche ${c.title} · InfraDojo`;
    app.innerHTML = `<div class="mod-${m}">
      <section class="mod-hero"><div class="wrap"><div class="crumbs"><a href="#home">Accueil</a><span>/</span><a href="#${m}">${esc(c.title)}</a><span>/</span><span>Antisèche</span></div><h1>Antisèche ${esc(c.title)}</h1><p>L'essentiel du module sur une page, à garder ouvert pendant que tu travailles.</p></div></section>
      <div class="wrap"><div class="cheat-grid">${c.cheat.map((s) => `<div class="cheat"><h3>${esc(s.title)}</h3>${s.rows.map((r) => `<div class="cheat-row"><code>${esc(r[0])}</code><span>${r[1]}</span></div>`).join("")}</div>`).join("")}</div></div>
    </div>`;
  }

  /* ================= Profil ================= */
  function renderProfile() {
    document.title = "Ma progression · InfraDojo";
    const b = beltOf(S.xp), nb = nextBelt(S.xp);
    const solvedN = Object.values(S.ex).filter((v) => v === 1).length;
    const lessonsN = Object.keys(S.lessons).length;
    const totalL = ORDER.reduce((n, m) => n + COURSES[m].lessons.length, 0);
    const pctNext = nb ? Math.round(((S.xp - b.xp) / (nb.xp - b.xp)) * 100) : 100;
    app.innerHTML = `<div class="wrap" style="padding-block:28px 48px">
      <div class="eyebrow">Progression</div>
      <h1 style="font-size:2rem;margin:6px 0 18px">${S.name ? esc(S.name) : "Ma progression"}</h1>
      <div class="profile-grid">
        <div class="stat-card"><div class="l">Ceinture</div><div class="v" style="display:flex;align-items:center;gap:10px"><span class="belt-swatch" style="width:40px;height:14px;background:${b.color}"></span>${esc(b.name.replace("Ceinture ", ""))}</div><div class="l">${esc(b.title)}</div></div>
        <div class="stat-card"><div class="l">Expérience</div><div class="v">${S.xp} XP</div><div class="progress" style="margin-top:8px"><span style="width:${pctNext}%"></span></div><div class="l" style="margin-top:6px">${nb ? `${nb.xp - S.xp} XP avant la ${esc(nb.name.toLowerCase())}` : "Niveau maximum atteint"}</div></div>
        <div class="stat-card"><div class="l">Travail accompli</div><div class="v">${lessonsN}/${totalL}</div><div class="l">leçons validées · ${solvedN}/${totalExercises()} exercices réussis</div></div>
      </div>

      <div class="section-head" style="margin-top:32px"><h2>Modules</h2></div>
      <div class="mod-cards">${ORDER.map((m) => { const c = COURSES[m], p = modProgress(m), ex = S.exams[m]; return `<a class="mod-card mod-${m}" href="#${m}"><h3>${esc(c.title)}</h3><div class="progress"><span style="width:${p.pct}%"></span></div><p>${p.done}/${p.total} leçons · examen : ${ex ? `${ex.best} %${ex.passed ? " (réussi)" : ""}` : "pas encore passé"}</p></a>`; }).join("")}</div>

      <div class="section-head" style="margin-top:32px"><h2>Badges</h2><p>${Object.keys(S.badges).length}/${BADGES.length} débloqués</p></div>
      <div class="badges">${BADGES.map((x) => `<div class="badge ${S.badges[x.id] ? "got" : ""}"><span class="b-ico">${esc(x.ico)}</span><div><b>${esc(x.name)}</b><small>${esc(x.desc)}</small></div></div>`).join("")}</div>

      <div class="section-head" style="margin-top:32px"><h2>Mon nom sur les certificats</h2></div>
      <div class="field"><label for="nameInput">Nom affiché</label><input id="nameInput" type="text" value="${esc(S.name)}" placeholder="Ex. Hénok Mubenga" maxlength="60"></div>

      <div class="danger-zone"><button class="btn btn-ghost btn-sm" type="button" id="resetBtn">Remettre la progression à zéro</button><span id="resetMsg"></span></div>
    </div>`;
    $("#nameInput").addEventListener("input", (e) => { S.name = e.target.value.trim(); save(); });
    let armed = false;
    $("#resetBtn").addEventListener("click", () => {
      if (!armed) { armed = true; $("#resetBtn").textContent = "Confirmer la remise à zéro"; $("#resetMsg").textContent = "Toute ta progression sera effacée de ce navigateur."; return; }
      const name = S.name; S = blank(); S.name = name; save(); renderTopbar(""); renderProfile(); toast("Progression remise à zéro");
    });
  }

  /* ================= Démarrage ================= */
  renderTopbar("");
  checkBadges();
  route();
})();
