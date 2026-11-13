/* =========================================================
   CÁCH CUỐN SỔ HOẠT ĐỘNG
   - Mỗi "mặt" (side) là 1 trang; trang lẻ nằm bên trái, trang chẵn bên phải.
   - Lật trang = gấp góc trang theo một "đường gấp", phần gấp lên lộ mặt sau, trang dưới hiện ra.
   - flipped = số tờ đã lật. Đang thấy: trang trái = mặt (2*flipped - 1), trang phải = mặt (2*flipped).
   ========================================================= */

const bookEl = document.getElementById("book");
const stageEl = document.getElementById("stage");

/* ---------- Tiện ích ---------- */
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const sectionById = id => SECTIONS.find(s => s.id === id);
// chữ đặt trên nền màu mục: màu sáng (vd vàng) thì dùng chữ tối, màu đậm thì chữ trắng
SECTIONS.forEach(s => {
  const h = s.color.replace("#", ""), [r, g, b] = [0, 2, 4].map(k => parseInt(h.substr(k, 2), 16) / 255)
    .map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  s.on = "#fff";      // mọi mục dùng chữ trắng trên nền màu (giống nhau ở cả 4 mục)
  // chữ trên giấy giữ màu mực bình thường; màu mục chỉ dùng cho nền (dải đầu trang, nền chuyển màu, nhãn khoảng cách)
  s.ct = "var(--ink)";
  s.vars = `--c:${s.color};--on:${s.on};--ct:${s.ct}` + (s.color2 ? `;--c2:${s.color2}` : "");
});
/* nhóm khoảng cách trong trang mỗi mục */
const DIST_BANDS = ["< 1 km", "1 – 2 km", "2 – 3 km"];
const bandOf = p => { const k = Number(p.km); return !(k >= 1) ? 0 : k < 2 ? 1 : 2; };
// quán của 1 mục, xếp theo nhóm khoảng cách (giữ thứ tự gốc trong cùng nhóm) → thứ tự trang = thứ tự trong danh sách
const placesOf = id => PLACES.filter(p => p.section === id)
  .map((p, n) => ({ p, n })).sort((a, b) => bandOf(a.p) - bandOf(b.p) || a.n - b.n).map(x => x.p);
/* Khung cắt ảnh (từ trang "Cắt ảnh"): CROPS["ten-anh-1"] = { x, y, z } — x, y: 0–1 vị trí, z: phóng to (1 = vừa khung) */
function cropStyle(src) {
  const c = (typeof CROPS !== "undefined" && CROPS[String(src).replace(/^images\//, "").replace(/\.\w+$/, "")]) || null;
  if (!c) return "";
  const x = (c.x * 100).toFixed(2) + "%", y = (c.y * 100).toFixed(2) + "%";
  return ` style="object-position:${x} ${y};transform-origin:${x} ${y};transform:scale(${(+c.z || 1).toFixed(3)})"`;
}
const photosOf = p => {
  const list = Array.isArray(p.photos) && p.photos.length ? p.photos.slice(0, 4) : p.photo ? [p.photo] : [];
  while (list.length < 2) list.push("");
  return list;
};

function stars(r) {
  return `<span class="stars" style="--r:${(r / 5) * 100}%" aria-hidden="true">★★★★★</span> <b>${r}</b>/5`;
}
function mapUrl(p) {
  if (p.mapq) return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(p.mapq);   // tìm riêng cho quán Google không có / ra danh sách
  const first = String(p.address).split("\n")[0].replace(/^CN [^:]*:\s*/, "");      // nhiều chi nhánh: chỉ đường tới chi nhánh đầu
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(p.name + ", " + first);
}

/* ---------- 1. Xếp các trang theo thứ tự ---------- */
const sides = [];               // { key, kind, section, html() }
const keyToSide = {};
function addSide(side) { keyToSide[side.key] = sides.length; sides.push(side); }

addSide({ key: "cover", kind: "cover" });
// Lời nói đầu dài hơn 1 trang → chia theo đoạn ra nhiều trang (không thu nhỏ chữ)
function splitForeword() {
  const sw = stageEl.clientWidth, sh = stageEl.clientHeight, solo0 = sw && sh && sw < sh * 0.9;   // sổ dựng đứng: trang có lề trên rộng hơn (vòng xoắn)
  const pw = !sw || !sh ? 480 : sw < sh * 0.9 ? Math.max(120, Math.floor(Math.min(sw - 28, (sh - 90) * 3 / 4, 560)))
                                             : Math.max(120, Math.floor(Math.min((sw - 44) / 2, (sh - 30) / (4 / 3), 520)));
  const probe = document.createElement("div");
  probe.className = "side rp";
  probe.style.cssText = `--pw:${pw}px;--ph:${Math.round(pw * 4 / 3)}px;left:-9999px;top:0;visibility:hidden;position:fixed`;
  document.body.appendChild(probe);
  // giữ các cụm từ trên cùng 1 dòng: thay khoảng trắng trong cụm bằng khoảng trắng không ngắt dòng (chữ giữ nguyên)
  const keep = (BOOK.forewordKeep || []).slice().sort((x, y) => y.length - x.length);
  const glue = t => keep.reduce((acc, k) => acc.split(k).join(k.replace(/ /g, "\u00a0")), t);
  const paras = BOOK.foreword.map(t => `<p>${esc(glue(t))}</p>`), sign = `<p class="sign">${esc(BOOK.signature).replace(/\n/g, "<br>")}</p>`;
  const fits = (first, html) => {
    probe.innerHTML = `<div class="page ruled fw-page"${solo0 ? ' style="padding-top:12%"' : ""}>${first ? '<h2 class="script ptitle fw-title">Lời nói đầu</h2>' : ""}${html}
      <footer class="pf"><span></span><span class="pno">00</span></footer></div>`;
    const pg = probe.firstChild, foot = pg.querySelector(".pf").getBoundingClientRect().top;
    if (!foot) return true;
    const em = parseFloat(getComputedStyle(pg).fontSize);
    let bottom = 0;
    pg.querySelectorAll(":scope > :not(.pf)").forEach(k => { bottom = Math.max(bottom, k.getBoundingClientRect().bottom); });
    return foot - bottom >= (solo0 ? 1.3 : 1.1) * em;   // chừa khoảng trống vừa phải giữa chữ ký và số trang   // sổ dựng đứng chừa rộng hơn chút (lề trang khác lúc đo)     // chữ ký sát chân trang hơn
  };
  // giữ Lời nói đầu trong 1 trang: thu nhỏ dần riêng phần chữ (tiêu đề giữ nguyên) tới khi vừa
  const all = paras.concat(sign).join("");
  // tìm cỡ chữ lớn nhất còn vừa (chia đôi khoảng 0.7–1), để chữ không nhỏ hơn mức cần thiết
  let lo = 0.7, hi = 1, scale = 0.7;
  if (fits(true, `<div class="fw-body">${all}</div>`)) scale = 1;
  else for (let n = 0; n < 9; n++) {
    const mid = (lo + hi) / 2;
    if (fits(true, `<div class="fw-body" style="font-size:${mid.toFixed(3)}em">${all}</div>`)) { scale = mid; lo = mid; } else hi = mid;
  }
  scale = Math.floor(scale * 1000) / 1000;
  const pages = [[`<div class="fw-body" style="font-size:${scale}em">${all}</div>`]];
  probe.remove();
  return pages;
}
splitForeword().forEach((html, k) => addSide({ key: k ? "foreword-" + (k + 1) : "foreword", kind: "foreword", html: html.join(""), first: k === 0 }));
addSide({ key: "toc", kind: "toc" });
/* Trang mỗi mục: danh sách quán chia theo khoảng cách, cả mục nằm trên 1 trang, chữ giữ nguyên cỡ.
   (Với cỡ chữ hiện tại, 1 trang chứa vừa khoảng 6–7 quán cho mỗi mục.) */
const FOOT_GAP = 0.5;          // khoảng trống tối thiểu giữa nội dung và chân trang (tính theo cỡ chữ của trang)
// Chừa thêm 1 dòng: mỗi máy/cỡ màn hình xuống dòng hơi khác nhau (nhất là Windows), 1 địa chỉ có thể dài thêm 1 dòng so với lúc đo
const LIST_SAFE = 0.2;
function listHead(sec, part) {      // mọi trang của mục (kể cả trang sau) dùng cùng 1 tiêu đề, cùng cỡ
  return `<header class="band"><span class="band-no">Mục ${SECTIONS.indexOf(sec) + 1}</span>
        <h2 class="script">${esc(sec.name)}</h2><p>${esc(sec.blurb)}</p></header>`;
}
function listBody(items) {
  let html = "", open = false;
  items.forEach(e => {
    if (e.t !== "item" && open) { html += "</ol>"; open = false; }
    if (e.t === "head") html += `<h3 class="pl-band"><span>${e.label}</span></h3>`;
    else if (e.t === "empty") html += `<p class="pl-empty">Chưa có quán</p>`;
    else {
      if (!open) { html += `<ol class="plist" start="${e.n}" style="counter-reset: p ${e.n - 1}">`; open = true; }
      const p = e.p;
      html += `<li><button type="button" data-goto="place:${p.id}">
        <span class="pl-name">${esc(p.name)}</span><span class="pl-rate">${p.rating != null ? `<span class="pl-star">★</span> ${p.rating}` : ""}</span>
        <span class="pl-addr">${esc(String(p.address).split("\n")[0])}</span></button></li>`;
    }
  });
  return html + (open ? "</ol>" : "");
}
function listEntries(sec) {
  const entries = []; let num = 0;
  DIST_BANDS.forEach((label, b) => {
    const ps = placesOf(sec.id).filter(p => bandOf(p) === b);
    entries.push({ t: "head", label, b });
    if (ps.length) ps.forEach(p => entries.push({ t: "item", p, b, n: ++num }));
    else entries.push({ t: "empty", b });
  });
  return entries;
}
const fitProbe = document.createElement("div");
fitProbe.className = "side rp";
// đo đúng cỡ trang sẽ hiện (cùng công thức với resize()), để chữ xuống dòng y như thật
const probePW = (() => {
  const sw = stageEl.clientWidth, sh = stageEl.clientHeight;
  if (!sw || !sh) return 480;
  if (sw < sh * 0.9) return Math.max(120, Math.floor(Math.min(sw - 28, (sh - 90) * 3 / 4, 560)));
  return Math.max(120, Math.floor(Math.min((sw - 44) / 2, (sh - 30) / (4 / 3), 520)));
})();
fitProbe.style.cssText = `--pw:${probePW}px;--ph:${Math.round(probePW * 4 / 3)}px;left:-9999px;top:0;visibility:hidden;position:fixed`;
function listFits(sec, part, items) {
  fitProbe.innerHTML = `<div class="page" style="${sec.vars}">${listHead(sec, part)}<div class="plists">${listBody(items)}</div>
    <footer class="pf"><span class="link">Mục lục</span><span class="pno">00</span></footer></div>`;
  const em = parseFloat(getComputedStyle(fitProbe).fontSize);
  const foot = fitProbe.querySelector(".pf").getBoundingClientRect().top;
  if (!foot) return items.length <= 5;          // không đo được (trang bị ẩn) → tạm xếp tối đa ~4 quán/trang
  let bottom = 0;
  fitProbe.querySelectorAll(".band, .plists > *").forEach(k => { bottom = Math.max(bottom, k.getBoundingClientRect().bottom); });
  return foot - bottom >= (FOOT_GAP + LIST_SAFE) * em;
}
// danh sách quán của mục dài hơn 1 trang thì phần còn lại sang trang sau (cùng cỡ chữ, không lặp lại tiêu đề nhóm đang dở)
function paginateList(sec) {
  const entries = listEntries(sec);
  document.body.appendChild(fitProbe);
  const pages = [[]];
  for (let k = 0; k < entries.length; k++) {
    const e = entries[k], cur = pages[pages.length - 1];
    const add = e.t === "head" ? [e, entries[k + 1]] : [e];      // tiêu đề nhóm luôn đi cùng quán đầu tiên của nhóm
    if (cur.length && !listFits(sec, pages.length - 1, cur.concat(add))) pages.push([]);
    pages[pages.length - 1].push(...add);
    if (e.t === "head") k++;
  }
  // tránh trang cuối của mục chỉ còn 1 quán: chuyển bớt quán từ trang trước sang cho cân
  const nPlaces = pg => pg.filter(e => e.t !== "head").length;
  while (pages.length > 1) {
    const last = pages[pages.length - 1], prev = pages[pages.length - 2];
    if (nPlaces(last) >= 2 || nPlaces(prev) <= nPlaces(last) + 1) break;
    let move = prev.slice(-1);
    if (prev.length >= 2 && prev[prev.length - 2].t === "head") move = prev.slice(-2);   // tiêu đề nhóm đi cùng quán
    if (move.length >= prev.length) break;
    const cand = move.concat(last);
    if (!listFits(sec, pages.length - 1, cand)) break;
    prev.splice(prev.length - move.length, move.length);
    pages[pages.length - 1] = cand;
  }
  fitProbe.remove();
  return pages;
}
const LIST_SPLIT = {};
SECTIONS.forEach(sec => {
  const pages = paginateList(sec);
  LIST_SPLIT[sec.id] = pages.map(pg => pg.length).join(",");
  // các mục nối tiếp nhau liền mạch (không chèn trang trống giữa các mục)
  pages.forEach((items, k) =>
    addSide({ key: "sec:" + sec.id + (k ? ":" + (k + 1) : ""), kind: "list", section: sec.id, items, part: k }));
  placesOf(sec.id).forEach(p => addSide({ key: "place:" + p.id, kind: "place", section: sec.id, place: p }));
});
// Hộp góp ý (2 trang) và series foodtour nối tiếp ngay sau mục cuối
addSide({ key: "suggest", kind: "suggest" });
addSide({ key: "suggest-2", kind: "suggest2" });
SERIES.episodes.forEach((ep, k) => addSide({ key: k ? "series-" + (k + 1) : "series", kind: "series", ep, part: k }));   // mỗi tập 1 trang, 2 tập nằm cạnh nhau
// Bìa sau phải là mặt sau của tờ cuối (vị trí lẻ) → chèn trang trống nếu cần
if (sides.length % 2 === 0) addSide({ key: "blank", kind: "blank" });
addSide({ key: "back", kind: "back" });

const LEAVES = sides.length / 2;
const pageNo = i => i;          // lời nói đầu = trang 1

function footer(i, sec) {
  return `<footer class="pf">
    <button type="button" class="link" data-goto="${sec ? "sec:" + sec.id : "toc"}">${sec ? "← " + esc(sec.name) : "Mục lục"}</button>
    <span class="pno">${pageNo(i)}</span>
  </footer>`;
}

function renderSide(side, i) {
  const sec = side.section ? sectionById(side.section) : null;
  switch (side.kind) {
    case "cover":
      if (BOOK.coverImage)       // ảnh bìa đã có sẵn tên sổ → chỉ hiện ảnh + lời nhắc
        return `<div class="cover has-img"><img class="cover-img" src="${esc(BOOK.coverImage)}" alt="${esc(BOOK.title.replace("\n", " "))}"><p class="cover-hint">Chạm để mở sổ</p></div>`;
      return `<div class="cover">
        ${BOOK.coverImage
          ? `<img class="cover-img" src="${esc(BOOK.coverImage)}" alt="">`
          : `<div class="cover-art"><span>Ảnh bìa<br>ban Truyền thông</span></div>`}
        <h1 class="script cover-title">${esc(BOOK.title).replace("\n", "<br>")}</h1>
        <p class="cover-ed">${esc(BOOK.edition)}</p>
        <p class="cover-hint">Chạm để mở sổ</p>
      </div>`;

    case "foreword":       // trang Lời nói đầu: chân trang chỉ có số trang (không có link)
      return `<div class="page ruled fw-page">
        ${side.first ? '<h2 class="script ptitle fw-title">Lời nói đầu</h2>' : ""}
        ${side.html}
        <footer class="pf"><span></span><span class="pno">${pageNo(i)}</span></footer>
      </div>`;

    case "toc":
      return `<div class="page ruled">
        <h2 class="script ptitle">Mục lục</h2>
        <ol class="toc">
          ${SECTIONS.map((s, n) => `<li><button type="button" data-goto="sec:${s.id}" style="${s.vars}">
            <span class="dot">${n + 1}</span><span class="tname">${esc(s.name)}</span>
            <span class="lead"></span><span class="tpage">${keyToSide["sec:" + s.id]}</span></button></li>`).join("")}
        </ol>
        <button type="button" class="link toc-suggest" data-goto="suggest">Hộp góp ý · trang ${keyToSide.suggest}</button>
        <button type="button" class="link toc-suggest toc-series" data-goto="series">${esc(SERIES.tocTitle)} · trang ${keyToSide.series}</button>
        <footer class="pf"><span></span><span class="pno">${pageNo(i)}</span></footer>
      </div>`;

    case "list":
      return `<div class="page" style="${sec.vars}">
        ${listHead(sec, side.part)}
        <div class="plists">${listBody(side.items)}</div>
        ${footer(i)}
      </div>`;

    case "place": {
      const p = side.place;
      return `<div class="page" style="${sec.vars}">
        <div class="photo n${photosOf(p).length}${p.layout === "rows" ? " rows" : ""}">${photosOf(p).map((src, k) =>
          `<div class="ph">${src ? `<img src="${esc(src)}" alt="${esc(p.name)} – ảnh ${k + 1}" loading="lazy" decoding="async" draggable="false"${cropStyle(src)}>` : ""}</div>`).join("")}</div>
        <div class="name-row">
          <h2 class="script pname">${esc(p.name)}</h2>
          <div class="votes" data-place="${p.id}">
            <button type="button" class="vote vote-up" data-vote="up" aria-pressed="false" aria-label="Thích ${esc(p.name)}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
            </button>
            <span class="vcount">0</span>
          </div>
        </div>
        ${p.rating != null ? `<p class="rating">${stars(p.rating)}</p>` : ""}
        <dl class="facts">
          <div><dt>Địa chỉ</dt><dd>${esc(p.address).replace(/\n/g, "<br>")}</dd></div>
          ${p.note ? `<div><dt>Lưu ý</dt><dd>${esc(p.note)}</dd></div>` : ""}
        </dl>
        ${p.review ? `<p class="review" data-full="${esc(p.review)}">“${esc(p.review)}”</p>` : ""}
        <a class="maplink" href="${mapUrl(p)}" target="_blank" rel="noopener">Mở Google Maps ↗</a>
        ${footer(i, sec)}
      </div>`;
    }

    case "suggest": {   // trang trái của hộp góp ý: thông tin quán
      const field = (id, name, label, req, ph) => `
          <label for="${id}">${label}${req ? " <em>*</em>" : ""}</label>
          <input id="${id}" name="${name}" maxlength="160"${req ? " required" : ""} placeholder="${ph}">`;
      return `<div class="page ruled">
        <h2 class="script ptitle">Hộp góp ý</h2>
        <p class="small">Ô có dấu <em class="req">*</em> là bắt buộc.</p>
        <form class="sform no-flip" id="sform" novalidate>
          ${field("s-name", "ten-quan", "Tên quán", true, "vd: Bún riêu Cô Hai")}
          ${field("s-addr", "dia-chi", "Địa chỉ quán", true, "Số nhà, tên đường, phường")}
          <span class="lbl">Khoảng cách từ Đại học Y Dược TP.HCM<br>(Cơ sở Hồng Bàng) <em>*</em></span>
          <div class="chips" id="dist-chips">
            ${DIST_BANDS.map((d, n) => `<label class="chip"><input type="radio" name="khoang-cach" id="s-d${n}" value="${esc(d)}"><span>${esc(d)}</span></label>`).join("")}
          </div>
          <div class="two">
            <div><label for="s-stars">Chấm điểm <em>*</em></label>
              <input id="s-stars" name="so-sao" type="number" inputmode="decimal" min="1" max="5" step="0.5" required placeholder="1 – 5 sao"></div>
            <div><label for="s-cat">Loại quán <em>*</em></label>
              <select id="s-cat" name="loai-quan" required>
                <option value="">Chọn loại quán</option>
                ${SECTIONS.map(s => `<option>${esc(s.name)}</option>`).join("")}
              </select></div>
          </div>
        </form>
        <footer class="pf"><button type="button" class="link" data-goto="toc">Mục lục</button><span class="pno">${pageNo(i)}</span></footer>
      </div>`;
    }

    case "suggest2":    // trang phải: cảm nhận + người gợi ý. Các ô gắn vào form bằng thuộc tính form="sform"
      return `<div class="page ruled">
        <div class="sform no-flip">
          <label for="s-try">Nên thử</label>
          <input id="s-try" name="nen-thu" maxlength="160" form="sform" placeholder="Món hoặc hoạt động nên thử">
          <span class="lbl">Vì sao bạn gợi ý?</span>
          <div class="chips" id="reason-chips">
            ${REASONS.map((r, n) => `<label class="chip"><input type="checkbox" id="s-r${n}" value="${esc(r)}" form="sform"><span>${esc(r)}</span></label>`).join("")}
            <label class="chip"><input type="checkbox" id="s-rother" value="__other" form="sform"><span>Khác…</span></label>
          </div>
          <input id="s-other" name="khac" maxlength="200" placeholder="Lý do khác" form="sform" hidden>
          <label for="s-exp">Trải nghiệm riêng <em>*</em></label>
          <textarea id="s-exp" name="trai-nghiem" rows="2" maxlength="600" form="sform" required placeholder="Bạn đã ăn / chơi gì, thấy thế nào?"></textarea>
          <div class="two">
            <div><label for="s-who">Tên bạn</label><input id="s-who" name="nguoi-goi-y" maxlength="60" form="sform"></div>
            <div><label for="s-class">Lớp bạn</label><input id="s-class" name="lop" maxlength="30" form="sform"></div>
          </div>
          <div class="send-row">
            <button type="submit" class="send" id="s-send" form="sform">Gửi góp ý</button>
            <p class="sstatus" id="s-status" role="status"></p>
          </div>
        </div>
        <footer class="pf"><span></span><span class="pno">${pageNo(i)}</span></footer>
      </div>`;

    case "series": {       // series foodtour: mỗi tập 1 trang, bấm để mở Facebook
      const ep = side.ep;
      return `<div class="page ruled">
        <h2 class="script ptitle series-title${side.part ? " ghost" : ""}"${side.part ? ' aria-hidden="true"' : ""}>${esc(SERIES.title).replace(/\n/g, "<br>")}</h2>
        <a class="ep" href="${esc(ep.url)}" target="_blank" rel="noopener">
          <span class="ep-thumb"><img src="${esc(ep.thumb)}" alt="" loading="lazy" draggable="false"><span class="ep-play" aria-hidden="true">▶</span></span>
          <span class="ep-title">${esc(ep.title)}</span>
          <span class="ep-more">Xem trên Facebook ↗</span>
        </a>
        <footer class="pf"><span></span><span class="pno">${pageNo(i)}</span></footer>
      </div>`;
    }

    case "blank":          // trang trống trước mục mới: tô màu của mục trước cho liền mạch
      return sec ? `<div class="page blank-fill" style="${sec.vars}"></div>` : `<div class="page ruled"></div>`;

    case "back":
      return `<div class="cover back">
        <div class="logo logo-light">${BOOK.logo ? `<img src="${esc(BOOK.logo)}" alt="">` : `<span>${esc(BOOK.edition)}</span>`}</div>
        <p class="back-note">${esc(BOOK.backNote)}</p>
      </div>`;
  }
}


/* =========================================================
   3. BỘ MÁY LẬT TRANG (gấp giấy như sổ thật)
   Hệ tọa độ "frame": gáy sổ ở X = 0, trang đang lật nằm ở X ∈ [0, W].
   Góc trang C bị kéo tới điểm P. Đường gấp = trung trực của đoạn C–P.
   - Phần trang phía gáy giữ nguyên (cắt bằng clip-path).
   - Phần phía góc bị gấp sang: lấy đối xứng qua đường gấp, lộ ra mặt sau.
   - Trang bên dưới lộ ra ở chỗ trống, có bóng đổ dọc đường gấp.
   Bìa trước/sau là bìa cứng: xoay cứng, không cong.
   ========================================================= */

let PW = 300, PH = 400;                  // kích thước 1 trang (px)
let flipped = 0;                         // số tờ đã lật

/* --- Điện thoại dựng đứng ("solo"): vẫn là cuốn sổ 2 trang, nhưng chỉ nhìn 1 trang mỗi lúc.
   view = "L" hoặc "R": trang đang nhìn. Bấm tới ở trang trái → trượt sang trang phải (không lật);
   bấm tới ở trang phải → lật trang, khung nhìn trượt theo tờ giấy về trang trái của cặp mới. Lùi thì ngược lại. */
let solo = false, view = "R", lastFlipped = 0, wantView = null, pendingView = null;
const SLIDE_MS = 480;
const viewable = i => !!sides[i] && sides[i].kind !== "blank";
function pickView(f, prefer) {
  if (f <= 0) return "R";
  if (f >= LEAVES) return "L";
  if (prefer === "L") return viewable(2 * f - 1) ? "L" : "R";
  return viewable(2 * f) ? "R" : "L";
}

/* --- dựng các trang --- */
const sideEls = sides.map((side, i) => {
  const el = document.createElement("div");
  el.className = "side " + (i % 2 ? "lp" : "rp") + (side.kind === "cover" || side.kind === "back" ? " hard" : "");
  el.dataset.side = i;
  el.dataset.kind = side.kind;
  el.innerHTML = renderSide(side, i);
  el.hidden = true;
  bookEl.appendChild(el);
  return el;
});

function makeShade(cls) {
  const clip = document.createElement("div");
  clip.className = "shade-clip " + cls;
  clip.innerHTML = `<div class="strip"></div>`;
  clip.hidden = true;
  return clip;
}

/* --- độ dày cuốn sổ: mép các trang xếp chồng + mép bìa cứng bên dưới --- */
const stackL = document.createElement("div");
const stackR = document.createElement("div");
stackL.className = "stack stack-l"; stackR.className = "stack stack-r";
bookEl.prepend(stackL, stackR);

function stackShadow(n, dir) {
  const css = getComputedStyle(document.documentElement);
  const board = css.getPropertyValue("--cover").trim() || "#b8392f";
  const boardEdge = css.getPropertyValue("--cover-edge").trim() || "#7d241d";
  const k = Math.max(0.8, PW / 340);                        // 1 lớp giấy ≈ 1px (to hơn trên màn lớn)
  const out = [];
  for (let i = 1; i <= n; i++) out.push(`${(dir * i * k).toFixed(1)}px ${(i * k * 0.8).toFixed(1)}px 0 ${i % 2 ? "#f6f1e6" : "#d9d1c0"}`);
  const b1 = n + 1.2, b2 = n + 2.6;                          // bìa cứng nằm dưới cùng
  out.push(`${(dir * b1 * k).toFixed(1)}px ${(b1 * k * 0.8).toFixed(1)}px 0 ${board}`);
  out.push(`${(dir * b2 * k).toFixed(1)}px ${(b2 * k * 0.8).toFixed(1)}px 0 ${boardEdge}`);
  out.push(`${(dir * (b2 + 2) * k).toFixed(1)}px ${((b2 + 4) * k).toFixed(1)}px ${(10 * k).toFixed(1)}px rgb(0 0 0 / 0.35)`);
  return out.join(",");
}
/* --- bóng đổ dưới sổ, theo từng nửa --- */
const shadowL = document.createElement("div");
const shadowR = document.createElement("div");
shadowL.className = "bshadow bshadow-l"; shadowR.className = "bshadow bshadow-r";
bookEl.prepend(shadowL, shadowR);
const smooth = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
// Nửa nào có trang nằm yên thì có bóng; bìa đang lật thì bóng nửa đích hiện dần, nửa rời đi tắt dần theo góc lật
function paintBookShadow() {
  const st = staticSides();
  let l = st.left !== null ? 1 : 0, r = st.right !== null ? 1 : 0;
  flights.forEach(f => {
    if (!f.hard) return;
    const deg = thetaOf(f.P) * 180 / Math.PI;
    const landing = smooth((deg - 90) / 90), leaving = 1 - smooth(deg / 90);
    // tới: bìa rời nửa phải, đáp nửa trái; lui: ngược lại
    if (f.s > 0) { l = Math.max(l, landing); r = Math.max(r, leaving); }
    else { r = Math.max(r, landing); l = Math.max(l, leaving); }
  });
  shadowL.style.opacity = l.toFixed(3);
  shadowR.style.opacity = r.toFixed(3);
}

function paintStacks() {          // tắt: không hiện mép giấy (độ dày) ở bất kỳ trạng thái nào
  stackL.hidden = stackR.hidden = true;
}

/* --- hình học --- */
const dot = (a, b) => a.x * b.x + a.y * b.y;
const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });

// Cắt đa giác bằng nửa mặt phẳng f(q) >= 0 (Sutherland–Hodgman)
function clipPoly(poly, f) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const fa = f(a), fb = f(b);
    if (fa >= 0) out.push(a);
    if ((fa >= 0) !== (fb >= 0)) {
      const t = fa / (fa - fb);
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  return out;
}
const polyCss = pts => pts.length < 3 ? "polygon(0 0, 0 0, 0 0)" : "polygon(" + pts.map(p => `${p.x.toFixed(2)}px ${p.y.toFixed(2)}px`).join(",") + ")";

// Giấy không co giãn: góc trang không thể ra xa gáy hơn chiều rộng trang
function clampP(P, C) {
  const A = { x: 0, y: C.y };                 // điểm gáy cùng phía với góc
  const B = { x: 0, y: C.y === 0 ? PH : 0 };  // điểm gáy phía đối diện
  const diag = Math.hypot(PW, PH);
  let d = Math.hypot(P.x - A.x, P.y - A.y);
  if (d > PW) P = { x: A.x + (P.x - A.x) * PW / d, y: A.y + (P.y - A.y) * PW / d };
  d = Math.hypot(P.x - B.x, P.y - B.y);
  if (d > diag) P = { x: B.x + (P.x - B.x) * diag / d, y: B.y + (P.y - B.y) * diag / d };
  return P;
}

// Đường đi của góc trang: cung tròn quanh gáy, hơi nhấc lên ở giữa
const LIFT = 0.22;
const TURN_MS = 700;                      // thời gian lật 1 trang (ms): nhỏ hơn = nhanh hơn
const COVER_MS = 1000;                    // bìa cứng lật chậm, êm hơn trang giấy
function arcPoint(theta, C) {
  const up = C.y === 0 ? 1 : -1;
  return { x: PW * Math.cos(theta), y: C.y + up * LIFT * PW * Math.sin(theta) };
}
const thetaOf = P => Math.acos(Math.max(-1, Math.min(1, P.x / PW)));

/* --- chuẩn bị các lần lật ---
   Nhiều trang có thể đang lật CÙNG LÚC (bấm liên tục không phải chờ trang trước nằm yên).
   Mỗi lần lật ("flight") có lớp riêng: phần trang còn nằm yên (cur), phần giấy gấp sang (oth) và bóng.
   flipped = vị trí sau khi mọi trang đang bay đã đáp xuống. */
const sideEl = i => (i >= 0 && i < sideEls.length ? sideEls[i] : null);
const flights = [];
let held = 0;                  // lần bấm phải chờ (+ tới, − lui): ngược chiều, hoặc dính tới bìa

function canFlip(dir) { return dir > 0 ? flipped < LEAVES : flipped > 0; }

// Thứ tự lớp: bên phải, tờ số nhỏ nằm trên; bên trái, tờ số lớn nằm trên.
// Phần gấp nửa đầu (chưa qua gáy) xếp theo chồng bên này, nửa sau theo chồng bên kia.
function makeFlight(dir, corner, from, to, kind) {
  const s = dir;
  const leaves = [];
  if (s > 0) for (let L = from; L < to; L++) leaves.push(L);
  else for (let L = to; L < from; L++) leaves.push(L);
  const leaf = s > 0 ? from : from - 1;
  const cur = sideEl(s > 0 ? 2 * from : 2 * from - 1);     // trang đang thấy, bị nhấc lên
  const oth = sideEl(s > 0 ? 2 * to - 1 : 2 * to);         // mặt sau = trang sẽ nằm ở bên kia
  const hard = s > 0 ? (from === 0 || to === LEAVES) : (from === LEAVES || to === 0);
  const curZ = s > 0 ? 4 * (LEAVES + 5 - leaf) : 4 * (leaf + 5);
  const fl = {
    s, from, to, leaf, leaves, cur, oth, hard, kind, committed: false,
    curZ, lateZ: 2000 + (s > 0 ? leaf : LEAVES - leaf),
    C: { x: PW, y: corner === "top" ? 0 : PH }
  };
  fl.P = { ...fl.C };
  [cur, oth].forEach(el => { if (el) { el.style.cssText = ""; el.hidden = false; } });
  if (cur) cur.style.zIndex = curZ;
  if (hard) {
    if (oth) { oth.style.zIndex = fl.lateZ; oth.style.visibility = "hidden"; }
  } else {
    fl.flapEl = document.createElement("div");
    fl.flapEl.className = "flap";
    fl.flapShade = makeShade("flap-shade"); fl.flapShade.hidden = false;
    fl.revealShade = makeShade("reveal-shade"); fl.revealShade.hidden = false;
    fl.revealShade.style.zIndex = curZ - 1;
    fl.flapEl.style.zIndex = curZ + 2;
    if (oth) { fl.flapEl.append(oth); oth.style.left = "0px"; oth.style.transformOrigin = "0 0"; oth.style.visibility = "hidden"; }
    fl.flapEl.append(fl.flapShade);
    bookEl.append(fl.revealShade, fl.flapEl);
  }
  flights.push(fl);
  stackL.hidden = stackR.hidden = true;
  renderStatics();
  return fl;
}

function endFlight(fl) {
  const i = flights.indexOf(fl);
  if (i >= 0) flights.splice(i, 1);
  [fl.cur, fl.oth].forEach(el => { if (el) { el.style.cssText = ""; if (el.parentNode !== bookEl) bookEl.appendChild(el); } });
  if (fl.flapEl) fl.flapEl.remove();
  if (fl.revealShade) fl.revealShade.remove();
  renderStatics();
  updateState();
  drainHeld();
}

/* Bìa KHÔNG lật chồng: khi bìa đang lật thì các lần bấm trong lúc đó bị bỏ qua (không tính);
   lần lật bìa cũng chờ mọi trang đang bay đáp xong. Trang ruột vẫn lật chồng lên nhau như cũ. */
const leafIsCover = L => L === 0 || L === LEAVES - 1;
function mustWait(dir) {
  const live = flights.filter(f => f.committed);
  if (live.some(f => f.s !== dir)) return true;                 // ngược chiều
  if (live.some(f => f.hard)) return true;                      // bìa đang lật
  const nextLeaf = dir > 0 ? flipped : flipped - 1;
  return live.length > 0 && leafIsCover(nextLeaf);              // sắp lật bìa mà còn trang đang bay
}
function drainHeld() {
  if (!held || flights.some(f => f.kind === "drag")) return;
  const d = Math.sign(held);
  if (mustWait(d)) return;                                      // endFlight sẽ gọi lại
  held -= d;
  flipOnce(d, true);
  if (held) setTimeout(drainHeld, 120);                         // các lần chờ còn lại: lật chồng như bình thường
}

/* --- trang đứng yên: trang trên cùng của chồng trái và chồng phải (bỏ qua các tờ đang bay) --- */
function staticSides() {
  const fly = new Set();
  flights.forEach(f => f.leaves.forEach(L => fly.add(L)));
  let left = null, right = null;
  for (let L = flipped - 1; L >= 0; L--) if (!fly.has(L)) { left = 2 * L + 1; break; }
  for (let L = flipped; L < LEAVES; L++) if (!fly.has(L)) { right = 2 * L; break; }
  return { left, right };
}
function renderStatics() {
  const used = new Set();
  flights.forEach(f => { if (f.cur) used.add(f.cur); if (f.oth) used.add(f.oth); });
  const { left, right } = staticSides();
  sideEls.forEach((el, i) => {
    if (used.has(el)) return;
    if (el.parentNode !== bookEl) bookEl.appendChild(el);
    el.style.cssText = "";
    el.hidden = !(i === left || i === right);
  });
  paintBookShadow();
}

function renderFlip(fl, P) {
  fl.P = P;
  if (fl.hard) renderHard(fl, thetaOf(P) * 180 / Math.PI);
  else renderCurl(fl, P);
}

function renderCurl(fl, P) {
  const { s, cur, oth, C } = fl, W = PW, H = PH;
  const d = Math.hypot(P.x - C.x, P.y - C.y);
  if (d < 0.5) {                                           // chưa gấp
    if (cur) { cur.style.clipPath = "none"; cur.style.visibility = "visible"; }
    if (oth) oth.style.visibility = "hidden";
    fl.revealShade.style.opacity = fl.flapShade.style.opacity = 0;
    fl.flapEl.style.filter = "none";
    return;
  }
  const n = { x: (P.x - C.x) / d, y: (P.y - C.y) / d };    // pháp tuyến đường gấp
  const M = { x: (P.x + C.x) / 2, y: (P.y + C.y) / 2 };    // điểm giữa
  const side = q => dot(sub(q, M), n);
  const rect = [{ x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: H }, { x: 0, y: H }];
  const stay = clipPoly(rect, q => side(q));               // phía gáy: giữ nguyên
  const fold = clipPoly(rect, q => -side(q));              // phía góc: bị gấp
  const refl = q => { const t = 2 * side(q); return { x: q.x - t * n.x, y: q.y - t * n.y }; };
  const toBook = q => ({ x: W + s * q.x, y: q.y });

  // 1. phần trang còn nằm yên
  if (cur) {
    cur.style.visibility = stay.length < 3 ? "hidden" : "visible";
    cur.style.clipPath = polyCss(stay.map(q => ({ x: s > 0 ? q.x : W - q.x, y: q.y })));
  }

  // 2. mặt sau của phần gấp: biến đổi affine = lật gương + đối xứng qua đường gấp
  if (oth) {
    const map = (lx, ly) => {
      const xf = s > 0 ? lx - W : lx;                     // vị trí cuối cùng so với gáy
      return toBook(refl({ x: -s * xf, y: ly }));
    };
    const p0 = map(0, 0), p1 = map(1, 0), p2 = map(0, 1);
    oth.style.visibility = "visible";
    oth.style.transform = `matrix(${p1.x - p0.x},${p1.y - p0.y},${p2.x - p0.x},${p2.y - p0.y},${p0.x},${p0.y})`;
    oth.style.clipPath = polyCss(fold.map(q => { const xf = -s * q.x; return { x: s > 0 ? xf + W : xf, y: q.y }; }));
  }

  // 3. lớp: chưa qua gáy thì nằm dưới các trang phía trên chồng cũ, qua gáy thì nằm trên chồng mới
  fl.flapEl.style.zIndex = P.x > 0 ? fl.curZ + 2 : fl.lateZ;

  // 4. ánh sáng & bóng
  const strength = Math.sin(Math.PI * Math.min(1, d / (2 * W)));
  // gần đáp xuống (hoặc gần về chỗ cũ) thì mọi bóng mờ dần về 0, để lúc kết thúc không bị "giật"
  const u = thetaOf(P) / Math.PI;
  const fade = smooth(Math.min(u / 0.12, (1 - u) / 0.22));
  const Mb = toBook(M), nb = { x: s * n.x, y: n.y };
  const ang = Math.atan2(nb.y, nb.x);
  placeStrip(fl.flapShade, fold.map(q => toBook(refl(q))), Mb, ang, W * 1.1);
  placeStrip(fl.revealShade, fold.map(toBook), Mb, ang + Math.PI, W * 0.55);
  fl.flapShade.style.opacity = ((0.35 + 0.65 * strength) * fade).toFixed(3);
  fl.revealShade.style.opacity = (Math.min(1, d / (0.15 * W)) * (0.4 + 0.6 * strength) * fade).toFixed(3);
  const blur = (W * 0.02 + W * 0.05 * strength) * fade, alpha = (0.15 + 0.3 * strength) * fade;
  fl.flapEl.style.filter = blur < 0.3 ? "none" : `drop-shadow(0 0 ${blur.toFixed(1)}px rgb(0 0 0 / ${alpha.toFixed(2)}))`;
}

function placeStrip(clipEl, poly, at, angle, width) {
  clipEl.style.clipPath = polyCss(poly);
  const strip = clipEl.firstElementChild;
  strip.style.width = width + "px";
  strip.style.height = PH * 4 + "px";
  strip.style.transform = `translate(${at.x}px, ${at.y}px) rotate(${angle}rad) translateY(-50%)`;
}

// Bìa cứng: xoay quanh gáy có phối cảnh, không cong
function renderHard(fl, deg) {
  const { s, cur, oth } = fl;
  paintBookShadow();
  // Trang nằm dưới bìa: tối khi bìa còn sát, sáng dần khi bìa mở ra (không lộ trắng quá sớm)
  const isFront = fl.leaf === 0;
  const st = staticSides();
  const beneath = sideEl(isFront ? st.right : st.left);
  const closeness = (s > 0) === isFront ? 1 - deg / 180 : deg / 180;
  if (beneath) beneath.style.filter = `brightness(${(1 - 0.55 * Math.pow(closeness, 1.2)).toFixed(3)})`;
  // phối cảnh gần: mép bìa nhấc về phía người xem nên che trang lâu hơn, giấy trắng không lộ sớm
  const persp = `perspective(${PW * 3.5}px)`;
  const shade = 1 - 0.2 * Math.sin(deg * Math.PI / 180);
  if (deg < 90) {
    if (cur) {
      cur.style.visibility = "visible";
      cur.style.transformOrigin = s > 0 ? "0 50%" : "100% 50%";
      cur.style.transform = `${persp} rotateY(${-s * deg}deg)`;
      cur.style.filter = `brightness(${shade})`;
    }
    if (oth) oth.style.visibility = "hidden";
  } else {
    if (cur) cur.style.visibility = "hidden";
    if (oth) {
      oth.style.visibility = "visible";
      oth.style.transformOrigin = s > 0 ? "100% 50%" : "0 50%";
      oth.style.transform = `${persp} rotateY(${s * (180 - deg)}deg)`;
      oth.style.filter = `brightness(${shade})`;
    }
  }
}

/* --- animation --- */
const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOutSine = t => -(Math.cos(Math.PI * t) - 1) / 2;   // tăng/giảm tốc nhẹ, dùng cho bìa
const easeOutSine = t => Math.sin(t * Math.PI / 2);
function tween(ms, fn, ease = easeInOut) {
  return new Promise(res => {
    const t0 = performance.now();
    (function step(t) {
      const k = Math.min(1, Math.max(0, t - t0) / ms);
      fn(ease(k));
      k < 1 ? requestAnimationFrame(step) : res();
    })(t0);
  });
}

// Chạy góc trang từ vị trí hiện tại tới đích (lật xong) hoặc về chỗ cũ (hủy)
async function runFlight(fl, commit, ms) {
  const P0 = fl.P, th0 = thetaOf(P0), th1 = commit ? Math.PI : 0;
  const off = sub(P0, arcPoint(th0, fl.C));               // lệch so với cung chuẩn (khi kéo tay)
  const fresh = P0.x === fl.C.x && P0.y === fl.C.y;      // lật bằng chạm/nút (không kéo tay)
  let ease = fresh ? easeInOut : easeOut;
  if (fl.hard) { ms = Math.round(ms * COVER_MS / TURN_MS); ease = fresh ? easeInOutSine : easeOutSine; }
  await tween(ms, e => {
    const base = arcPoint(th0 + (th1 - th0) * e, fl.C);
    renderFlip(fl, clampP({ x: base.x + off.x * (1 - e), y: base.y + off.y * (1 - e) }, fl.C));
  }, ease);
  endFlight(fl);
}

/* Bấm liên tục: mỗi lần bấm lật ngay 1 trang, không chờ trang trước nằm yên, tốc độ giữ nguyên. */
function flipOnce(dir, fromQueue = false) {
  if (ptr && ptr.dragging) return;
  if (flights.some(f => f.kind === "drag")) return;          // đang kéo tay / đang thả tay
  if (flights.some(f => f.committed && f.hard)) return;       // bìa đang lật: bỏ qua các lần bấm, sổ dừng ở 2 trang đầu
  if ((!fromQueue && held) || mustWait(dir)) {                // giữ đúng thứ tự các lần bấm đang chờ
    const pending = flipped + held + dir;
    if (pending >= 0 && pending <= LEAVES) held += dir;
    return;
  }
  let fl = null;
  if (peek) {
    if (peek.fl.s === dir) { fl = peek.fl; fl.kind = "auto"; peek = null; }
    else endPeek();
  }
  if (!fl) {
    if (!canFlip(dir)) return;
    fl = makeFlight(dir, "bottom", flipped, flipped + dir, "auto");
  }
  fl.committed = true;
  flipped = fl.to;
  shiftTiming(fl.hard ? COVER_MS : TURN_MS);
  updateState();
  runFlight(fl, true, TURN_MS);
}

function goToLeaf(target) {
  target = Math.max(0, Math.min(LEAVES, target));
  if (flights.length || ptr || target === flipped) return;
  if (peek) endPeek();
  const dir = target > flipped ? 1 : -1;
  const fl = makeFlight(dir, "bottom", flipped, target, "auto");
  fl.committed = true;
  flipped = target;
  shiftTiming(fl.hard ? COVER_MS : TURN_MS);
  updateState();
  runFlight(fl, true, TURN_MS);
}
function slideTo(v) {
  view = v;
  shiftTiming(SLIDE_MS);
  updateState();
}
function soloStep(dir) {
  if (!held && !(ptr && ptr.dragging) && flipped > 0 && flipped < LEAVES) {
    const against = flights.some(f => f.committed && f.s !== dir);
    if (!against && dir > 0 && view === "L" && viewable(2 * flipped)) return slideTo("R");
    if (!against && dir < 0 && view === "R" && viewable(2 * flipped - 1)) return slideTo("L");
  }
  flipOnce(dir);
}
const next = () => solo ? padStep(1) : flipOnce(1);
const prev = () => solo ? padStep(-1) : flipOnce(-1);
function goToKey(key) {
  const i = keyToSide[key];
  if (i === undefined) return;
  if (solo) { const j = padList.indexOf(i); if (j >= 0) padGo(j); return; }
  goToLeaf(Math.ceil(i / 2));
}

/* --- vị trí sổ: đóng thì bìa ở giữa, mở thì 2 trang ở giữa --- */
// sổ trượt vào giữa cùng nhịp với bìa
const shiftTiming = ms => bookEl.style.setProperty("--shift-ms", Math.round(ms) + "ms");
function setShift(f) {
  bookEl.classList.toggle("closed-front", !solo && f === 0);
  bookEl.classList.toggle("closed-back", !solo && f === LEAVES);
  bookEl.classList.toggle("solo-l", solo && view === "L");
  bookEl.classList.toggle("solo-r", solo && view === "R");
}

/* --- kéo góc trang bằng tay / chuột, chạm để lật, rê chuột vào góc để hé --- */
let ptr = null;                 // { id, x, y, dir, dragging, hist, tapOnly }
let peek = null;                // { dir, fl } lần hé góc đang hiện

function bookPoint(e) {
  const r = bookEl.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (PW * 2 / r.width), y: (e.clientY - r.top) * (PH / r.height) };
}
function zoneAt(p) {           // điểm có nằm gần góc ngoài của trang không
  const z = PW * 0.16;
  const dir = p.x > PW ? 1 : -1;
  const outer = dir > 0 ? PW * 2 - p.x : p.x;
  if (outer > z || !canFlip(dir)) return null;
  if (solo && (dir > 0) !== (view === "R")) return null;      // điện thoại dựng: chỉ hé góc trang đang nhìn
  if (p.y < z) return { dir, corner: "top" };
  if (p.y > PH - z) return { dir, corner: "bottom" };
  return null;
}
const interactive = t => t.closest("a, input, select, textarea, label, button, .no-flip");

function framePoint(fl, p) {   // điểm trên sổ -> hệ tọa độ frame của lần lật
  return { x: fl.s * (p.x - PW), y: p.y };
}

function endPeek() {
  if (!peek) return;
  const fl = peek.fl;
  peek = null;
  if (flights.includes(fl) && !fl.committed && fl.kind === "peek") endFlight(fl);
}

bookEl.addEventListener("pointermove", e => {
  const p = bookPoint(e);
  if (ptr && ptr.id === e.pointerId) {
    const dx = p.x - ptr.x, dy = p.y - ptr.y;
    if (solo && !ptr.dragging && ptr.swipe === undefined && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      // vuốt: nếu kéo đúng trang đang nhìn thì kéo cong góc giấy như thường; nếu không thì chỉ là vuốt sang trang
      const d = dx < 0 ? 1 : -1;
      const own = (d > 0 && view === "R") || (d < 0 && view === "L");
      if (ptr.tapOnly || !own || !canFlip(d)) { ptr.swipe = d; ptr.tapOnly = true; return; }
      ptr.swipe = null; ptr.dir = d;
    }
    if (ptr.tapOnly) return;
    if (!ptr.dragging && Math.hypot(dx, dy) > 8) {
      ptr.dragging = true;
      let fl = peek && peek.fl.s === ptr.dir ? peek.fl : null;
      if (peek && !fl) endPeek();
      if (!fl) fl = makeFlight(ptr.dir, ptr.y < PH / 2 ? "top" : "bottom", flipped, flipped + ptr.dir, "drag");
      fl.kind = "drag";
      peek = null;
      ptr.fl = fl;
      ptr.grab = sub(fl.P, framePoint(fl, ptr));          // giữ khoảng cách tay – góc
    }
    if (ptr.dragging) {
      const fl = ptr.fl, f = framePoint(fl, p);
      renderFlip(fl, clampP({ x: f.x + ptr.grab.x, y: f.y + ptr.grab.y }, fl.C));
      ptr.hist.push({ x: f.x, t: e.timeStamp });
      if (ptr.hist.length > 6) ptr.hist.shift();
    }
    return;
  }
  // rê chuột: hé góc (chỉ khi không có trang nào đang lật)
  if (e.pointerType !== "mouse" || flights.some(f => f.kind !== "peek")) return;
  const z = zoneAt(p);
  if (z && !peek) {
    const fl = makeFlight(z.dir, z.corner, flipped, flipped + z.dir, "peek");
    peek = { dir: z.dir, fl };
    const target = { x: PW * 0.9, y: z.corner === "top" ? PW * 0.08 : PH - PW * 0.08 };
    const from = fl.P;
    tween(180, e2 => { if (peek && peek.fl === fl) renderFlip(fl, clampP({ x: from.x + (target.x - from.x) * e2, y: from.y + (target.y - from.y) * e2 }, fl.C)); }, easeOut);
  } else if (!z && peek) endPeek();
});
bookEl.addEventListener("pointerleave", () => { if (!ptr) endPeek(); });

// Kéo ảnh trong sổ: trình duyệt mặc định "kéo ảnh ra ngoài" → chặn để cú giữ-kéo lật trang
document.addEventListener("dragstart", e => { if (e.target.closest && e.target.closest(".stage")) e.preventDefault(); }, true);
bookEl.addEventListener("pointerdown", e => {
  if (!e.isPrimary || interactive(e.target)) return;
  if (e.target.tagName === "IMG") e.preventDefault();      // không cho trình duyệt bắt đầu kéo ảnh
  startMusicOnce();
  const p = bookPoint(e);
  const dir = peek ? peek.dir
    : solo ? (p.x - (view === "L" ? 0 : PW) > PW * 0.35 ? 1 : -1)   // 1 trang: chạm 2/3 bên phải = tới, 1/3 trái = lui
    : (p.x > PW ? 1 : -1);
  // đang có trang bay: chỉ nhận chạm (lật thêm), không cho kéo tay
  const tapOnly = flights.some(f => f.kind !== "peek");
  if (!tapOnly && !canFlip(dir)) return;
  ptr = { id: e.pointerId, x: p.x, y: p.y, dir, dragging: false, hist: [], tapOnly };
  bookEl.setPointerCapture(e.pointerId);
});

function release(e) {
  if (!ptr || ptr.id !== e.pointerId) return;
  const { dragging, hist, dir, fl, swipe } = ptr;
  ptr = null;
  if (!dragging) {                                  // chạm = lật trọn trang
    if (e.type === "pointerup") solo ? soloStep(swipe || dir) : flipOnce(dir);
    else endPeek();
    return;
  }
  let v = 0;
  if (hist.length > 1) { const a = hist[0], b = hist[hist.length - 1]; v = (b.x - a.x) / Math.max(1, b.t - a.t); }
  const commit = e.type === "pointerup" && (fl.P.x < 0 || v < -0.35);
  const remain = commit ? (fl.P.x + PW) / (2 * PW) : (PW - fl.P.x) / (2 * PW);
  const ms = 180 + 460 * Math.max(0.1, remain);
  if (commit) { fl.committed = true; flipped = fl.to; shiftTiming(fl.hard ? ms * COVER_MS / TURN_MS : ms); updateState(); }
  runFlight(fl, commit, ms).then(() => { fl.kind = "auto"; });
}
bookEl.addEventListener("pointerup", release);
bookEl.addEventListener("pointercancel", release);

/* ---------- 4. Số trang, nút, nhạc theo trang ---------- */
const whereEl = document.getElementById("where");
// ảnh: chỉ tải ảnh của các trang quanh trang đang mở (trang sắp lật tới đã có ảnh sẵn)
function warmPhotos() {
  const at = solo ? padList[pi] : 2 * flipped;
  for (let i = at - 6; i <= at + 8; i++) {
    const el = sideEl(i);
    if (el) el.querySelectorAll('img[loading="lazy"]').forEach(im => { im.loading = "eager"; });
  }
}
function updateState() {
  if (typeof padList !== "undefined") setTimeout(warmPhotos, 0);
  if (solo) return padState();
  const left = 2 * flipped - 1, right = 2 * flipped;
  if (solo) {
    // Lật xong rồi mới trượt: trong lúc trang đang lật, khung nhìn đứng yên (không chuyển động 2 thứ cùng lúc)
    let target = null;
    if (wantView) { target = pickView(flipped, wantView); wantView = null; }
    else if (flipped > lastFlipped) target = pickView(flipped, "L");    // lật tới: đọc tiếp trang trái của cặp mới
    else if (flipped < lastFlipped) target = pickView(flipped, "R");    // lật lui: đọc trang phải của cặp trước
    if (target) pendingView = target;
    const flying = flights.some(f => f.committed);
    if (!flying && pendingView) {
      if (pendingView !== view) shiftTiming(SLIDE_MS);
      view = pendingView; pendingView = null;
    }
    if (!pendingView) view = pickView(flipped, view);
  } else pendingView = null;
  lastFlipped = flipped;
  setShift(flipped);
  paintStacks();
  const lookAt = pendingView || view;                                  // số trang: trang sắp đọc
  const shown = solo ? [lookAt === "L" ? left : right] : [left, right];
  whereEl.textContent = flipped === 0 ? "Bìa" : flipped === LEAVES ? "Bìa sau"
    : shown.filter(s => sides[s] && !["blank", "back"].includes(sides[s].kind)).map(pageNo).join(" – ") || " ";
  document.getElementById("btn-prev").disabled = flipped === 0;
  document.getElementById("btn-next").disabled = flipped === LEAVES;
  updateMusic(left, right);
}

/* ---------- 5. Nút bấm, phím, liên kết trong sổ ---------- */
bookEl.addEventListener("click", e => {
  const go = e.target.closest("[data-goto]");
  if (go) { startMusicOnce(); goToKey(go.dataset.goto); }
});
document.addEventListener("keydown", e => {
  if (e.target.closest("input, select, textarea")) return;
  if (e.key === "ArrowRight") { startMusicOnce(); next(); }
  if (e.key === "ArrowLeft") { startMusicOnce(); prev(); }
});
document.getElementById("btn-next").addEventListener("click", () => { startMusicOnce(); next(); });
document.getElementById("btn-prev").addEventListener("click", () => { startMusicOnce(); prev(); });
document.getElementById("btn-toc").addEventListener("click", () => { startMusicOnce(); goToKey("toc"); });

/* ---------- 6b. Điện thoại dựng đứng: SỔ LẬT LÊN (như lịch / sổ ghi món)
   Gáy (lò xo) ở mép trên. Mỗi trang là 1 tờ; lật tới: tờ giấy cong mềm, nhấc mép dưới lên, vòng qua mép trên
   rồi ra sau sổ; lật lui: tờ giấy từ sau sổ vòng qua mép trên rồi hạ xuống. Cuốn sổ đứng yên, tỉ lệ 3:4.
   Dùng lại đúng các trang của sổ ngang (chuyển phần tử trang qua lại, không nhân bản) nên form, nút thích... vẫn chạy. */
const padEl = document.createElement("div");
padEl.className = "pad"; padEl.hidden = true;
const padBind = document.createElement("div"); padBind.className = "pad-bind pb-back";        // nửa sau các vòng lò xo
const padBindFront = document.createElement("div"); padBindFront.className = "pad-bind pb-front"; // nửa trước
const padBase = document.createElement("div"); padBase.className = "pad-base";
padEl.append(padBase);
stageEl.appendChild(padEl);
const padList = sides.map((s, i) => i).filter(i => sides[i].kind !== "blank");
const padSheets = padList.map(i => {
  const w = document.createElement("div");
  w.className = "psheet";
  const dim = document.createElement("div"); dim.className = "pdim";
  w.appendChild(dim);
  padEl.appendChild(w);
  return w;
});
padEl.append(padBind, padBindFront);
const PN = padList.length;
let pi = 0;                          // tờ đang nằm trên cùng (sau khi mọi tờ đang lật đáp xong)
let padUnder = null;                 // khi nhảy lùi nhiều trang: tờ cũ vẫn nằm dưới cho tới khi tờ mới hạ xuống
const pflights = [];
const PAD_MS = 1100;                 // thời gian lật 1 tờ
const PSTRIPS = 10, PBEND = 55;      // giấy mềm: số dải & độ uốn

/* Lò xo 3D: mỗi vòng là một vòng tròn kim loại quanh trục lò xo (nằm ngang, ngay trên mép giấy), hơi nghiêng như dây xoắn.
   Vòng xỏ qua lỗ đục (lỗ trong suốt thật). Mỗi vòng vẽ thành 2 nửa: nửa sau luôn nằm dưới tờ giấy, nửa trước luôn nằm trên
   (kể cả tờ đang lật) — xếp lớp cố định nên mọi trình duyệt (cả Safari) đều đúng: lò xo không bao giờ bị tờ giấy che. */
const RING_TILT = 68;                         // độ nghiêng vòng lò xo (90 = nhìn thẳng cạnh vòng)
let RING_R = 20, HOLE_Y = 14, AXIS_Y = -6;
function buildRings() {
  const n = Math.max(8, Math.round(PW / 24)), rp = PW / n;
  HOLE_Y = PW * 0.038; RING_R = PW * 0.056; AXIS_Y = HOLE_Y - RING_R;
  const root = document.documentElement.style;
  root.setProperty("--rp", rp + "px");
  root.setProperty("--hy", HOLE_Y + "px");
  root.setProperty("--hr", (PW * 0.0125) + "px");
  const wire = Math.max(2, PW * 0.0085);
  [padBind, padBindFront].forEach(box => {
    box.style.top = AXIS_Y + "px";
    box.style.perspective = Math.round(PH * 3.2) + "px";
    box.innerHTML = "";
    for (let k = 0; k < n; k++) {
      const r = document.createElement("i");
      r.style.cssText = `left:${(rp * (k + 0.5) - RING_R).toFixed(1)}px;top:${(-RING_R).toFixed(1)}px;width:${(2 * RING_R).toFixed(1)}px;height:${(2 * RING_R).toFixed(1)}px;border-width:${wire.toFixed(2)}px;transform:rotateY(${RING_TILT}deg)`;
      box.appendChild(r);
    }
  });
}
function enterPad() {
  // vị trí hiện tại của sổ ngang → tờ tương ứng
  const side = flipped <= 0 ? 0 : flipped >= LEAVES ? sides.length - 1 : 2 * flipped - 1;
  pi = padList.findIndex(i => i >= side); if (pi < 0) pi = PN - 1;
  if (padMemo && padMemo.flipped === flipped) pi = padMemo.pi;      // xoay qua xoay lại: về đúng trang đang đọc
  padSheets.forEach((w, j) => { const el = sideEls[padList[j]]; el.style.cssText = ""; el.hidden = false; w.insertBefore(el, w.firstChild); });
  bookEl.hidden = true; padEl.hidden = false;
}
let padMemo = null;
function exitPad() {
  pflights.slice().forEach(f => { f.root.remove(); pflights.splice(pflights.indexOf(f), 1); });
  const side = padList[pi];
  flipped = side === 0 ? 0 : sides[side].kind === "back" ? LEAVES : Math.ceil(side / 2);
  padMemo = { flipped, pi };
  sideEls.forEach(el => bookEl.appendChild(el));
  padEl.hidden = true; bookEl.hidden = false;
  lastFlipped = flipped;
  renderStatics();
}
function padRender() {
  const flying = new Set(pflights.map(f => f.j));
  let top = -1;
  if (padUnder !== null && !flying.has(padUnder)) top = padUnder;
  else for (let j = pi; j < PN; j++) if (!flying.has(j)) { top = j; break; }
  padSheets.forEach((w, j) => {
    w.hidden = j !== top;
    w.style.zIndex = 10;
    if (j === top) w.querySelector(":scope > .pdim").style.opacity = 0;
  });
  padBase.hidden = top >= PN - 1;                         // tờ cuối (bìa sau) thì không còn mép giấy bên dưới
  return top;
}
function padState() {
  setTimeout(warmPhotos, 0);
  const side = padList[pi];
  flipped = side === 0 ? 0 : sides[side].kind === "back" ? LEAVES : Math.ceil(side / 2);   // để nhạc theo mục
  whereEl.textContent = side === 0 ? "Bìa" : sides[side].kind === "back" ? "Bìa sau" : String(pageNo(side));
  document.getElementById("btn-prev").disabled = pi === 0;
  document.getElementById("btn-next").disabled = pi >= PN - 1;
  updateMusic(side, side);
}

function padFlight(dir, j, kind) {
  const w = padSheets[j], el = sideEls[padList[j]];
  const fl = { s: dir, j, kind, u: 0, committed: false, hard: el.classList.contains("hard") };
  const hy = HOLE_Y;
  // dải 0: mép trên + hàng lỗ (giữ nguyên kích thước); các dải sau: thân tờ giấy
  const n = fl.hard ? 2 : PSTRIPS + 1, hb = (PH - 2 * hy) / (n - 1);
  fl.hy = hy; fl.hb = hb;
  const root = document.createElement("div");
  root.className = "pad3d";
  root.style.top = AXIS_Y + "px";                          // gốc = trục lò xo
  root.style.perspective = Math.round(PH * 3.2) + "px";
  const strips = [];
  for (let i = 0; i < n; i++) {
    const y0 = i === 0 ? 0 : 2 * hy + (i - 1) * hb, h = i === 0 ? 2 * hy : hb;
    const st = document.createElement("div"); st.className = "pstrip"; st.style.height = h + "px";
    const f = document.createElement("div"); f.className = "pface";
    const k = w.cloneNode(true);
    k.querySelectorAll("[id]").forEach(x => x.removeAttribute("id"));
    k.querySelectorAll(".pdim").forEach(x => x.remove());          // bóng của trang lúc còn nằm dưới: không mang theo khi lật
    k.hidden = false; k.style.cssText = `top:${3 - y0}px;height:${PH}px;bottom:auto;z-index:auto;transform:none`;   // 3px = phần chồng mép giữa các dải
    f.appendChild(k);
    const fd = document.createElement("div"); fd.className = "dim3d"; f.appendChild(fd);
    const b = document.createElement("div"); b.className = "pface pback" + (fl.hard ? " hard" : "") + (i === 0 ? " p0" : "");
    const bd = document.createElement("div"); bd.className = "dim3d"; b.appendChild(bd);
    if (i === 0) { st.style.top = -hy + "px"; st.style.transformOrigin = `50% ${hy}px`; }   // xoay quanh lỗ
    st.append(f, b);
    root.appendChild(st);
    strips.push({ el: st, f, b, fd, bd, up: null });
  }
  padEl.appendChild(root);
  fl.root = root; fl.strips = strips;
  pflights.push(fl);
  padRender();
  padDraw(fl, 0);
  return fl;
}

function padDraw(fl, u) {
  fl.u = u;
  if (fl.sq == null) {
    const room = padEl.getBoundingClientRect().top - stageEl.getBoundingClientRect().top - 6;   // khoảng trống phía trên sổ
    fl.sq = Math.max(0.26, Math.min(1, room * 0.82 / PH));
  }
  // 0 = nằm trên sổ, 180 = vắt lên trên, ~340 = nằm sau sổ (phần sau sổ đi nhanh)
  const END = 340;
  const f = q => q < 0.8 ? 270 * q / 0.8 : 270 + (END - 270) * (q - 0.8) / 0.2;
  const A = fl.s > 0 ? f(u) : f(1 - u);
  const r = A * Math.PI / 180;
  const bend = fl.hard ? 0 : PBEND * Math.sin(r) * (A < 180 ? 1 : 0.8);
  const n = fl.strips.length;
  const phis = fl.strips.map((_, i) => {
    const k = n === 1 ? 0 : i / (n - 1);
    return A + (i === 0 ? 0 : bend * (Math.pow(k, 1.6) - 0.25 * k));
  });
  const shadeAt = phi => 0.3 * (1 - Math.abs(Math.cos(phi * Math.PI / 180))) + 0.1 * smooth((phi - 175) / 30);
  const above = smooth((A - 60) / 50) * (1 - smooth((A - 250) / 50));
  const kq = 1 - (1 - fl.sq) * above;
  // lỗ chạy theo vòng lò xo nghiêng: vị trí lỗ quanh trục (y, z) và lệch ngang x theo độ nghiêng của vòng
  const t = RING_TILT * Math.PI / 180;
  const hx = -RING_R * Math.cos(t) * Math.sin(r);
  const hyy = RING_R * Math.cos(r), hz = RING_R * Math.sin(t) * Math.sin(r);
  let y = 0, z = 0;
  fl.strips.forEach((st, i) => {
    const phi = phis[i], pr = phi * Math.PI / 180;
    if (i === 0) {
      st.el.style.transform = `translate3d(${hx.toFixed(2)}px,${hyy.toFixed(2)}px,${hz.toFixed(2)}px) rotateX(${phi.toFixed(2)}deg)`;
      y = hyy + fl.hy * Math.cos(pr); z = hz + fl.hy * Math.sin(pr);
    } else {
      st.el.style.transform = `translate3d(${hx.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px) rotateX(${phi.toFixed(2)}deg) scaleY(${kq.toFixed(3)})`;
      y += fl.hb * kq * Math.cos(pr); z += fl.hb * kq * Math.sin(pr);
    }
    const up = Math.cos(pr) >= 0;
    if (st.up !== up) { st.up = up; st.f.style.visibility = up ? "visible" : "hidden"; st.b.style.visibility = up ? "hidden" : "visible"; }
    const a0 = shadeAt(i === 0 ? phi : (phis[i - 1] + phi) / 2), a1 = shadeAt(i === n - 1 ? phi : (phi + phis[i + 1]) / 2);
    const g = d => `linear-gradient(${d}, rgb(0 0 0 / ${a0.toFixed(3)}), rgb(0 0 0 / ${a1.toFixed(3)}))`;
    st.fd.style.background = g("to bottom"); st.bd.style.background = g("to top");
  });
  // lớp: phía trước sổ → trên trang đang mở, dưới nửa trước lò xo; vòng ra sau sổ → dưới cả sổ
  // nhiều tờ lật cùng lúc: tờ số nhỏ hơn (lật trước / nằm trên trong sổ) luôn nằm trên tờ số lớn hơn
  fl.A = A;
  fl.root.style.zIndex = A <= 185 ? 20 + (PN - fl.j) : 1;
  if (padHeld && fl.committed) queueMicrotask(padDrain);
  // trang bên dưới tối khi tờ giấy còn sát, sáng dần khi tờ nhấc lên
  padShadow();
}
// bóng đổ lên trang đang nằm: chỉ theo tờ đang ở GẦN trang nhất (góc nhỏ nhất), không để các tờ giành nhau làm bóng nhấp nháy
function padShadow() {
  const top = padRender();
  if (top < 0) return;
  let close = 180;
  pflights.forEach(f => { if (f.A != null && f.A < close) close = f.A; });
  padSheets[top].querySelector(":scope > .pdim").style.opacity = (0.3 * Math.pow(1 - close / 180, 1.5)).toFixed(3);
}

function endPad(fl) {
  const i = pflights.indexOf(fl);
  if (i >= 0) pflights.splice(i, 1);
  fl.root.remove();
  if (!pflights.length) padUnder = null;
  padShadow();
  if (padHeld) padDrain();
  padState();
}
async function runPad(fl, commit, ms) {
  const u0 = fl.u, u1 = commit ? 1 : 0, fresh = u0 === 0;
  await tween(ms, e => padDraw(fl, u0 + (u1 - u0) * e), fresh ? easeInOutSine : easeOutSine);
  endPad(fl);
}
const padBusyAgainst = dir => pflights.some(f => f.committed && (f.s !== dir || f.hard)) || pflights.some(f => f.kind === "drag");
/* Bấm liên tục: giống sổ ngang — mỗi lần bấm lật ngay 1 tờ, không chờ tờ trước đáp xuống.
   Chỉ bìa là phải chờ các tờ đang bay đáp xong (padHeld giữ lần bấm đó lại). */
let padHeld = 0;
const padReady = () => true;
function padStep(dir, fromQueue) {
  if (padBusyAgainst(dir)) return;                    // bìa đang lật / đang lật ngược chiều / đang kéo tay: bỏ qua
  if (!fromQueue && padHeld && Math.sign(padHeld) !== dir) { padHeld = 0; return; }
  const target = pi + padHeld + dir;
  if (target < 0 || target > PN - 1) return;
  if (!padReady(dir) || (!fromQueue && padHeld)) { padHeld += dir; return; }
  const j = dir > 0 ? pi : pi - 1;
  if (sideEls[padList[j]].classList.contains("hard") && pflights.length) { padHeld += dir; return; }   // bìa: chờ các tờ khác đáp xong
  pi += dir;
  const fl = padFlight(dir, j, "auto");
  fl.committed = true;
  padState();
  runPad(fl, true, fl.hard ? PAD_MS * 1.1 : PAD_MS);
}
function padDrain() {
  if (!padHeld) return;
  const dir = Math.sign(padHeld);
  if (!padReady(dir)) return;
  const j = dir > 0 ? pi : pi - 1;
  if (j < 0 || j > PN - 1 || (dir > 0 && pi >= PN - 1)) { padHeld = 0; return; }
  if (sideEls[padList[j]].classList.contains("hard") && pflights.length) return;
  padHeld -= dir;
  padStep(dir, true);
}
function padGo(target) {
  target = Math.max(0, Math.min(PN - 1, target));
  if (target === pi || pflights.length) return;
  const dir = target > pi ? 1 : -1;
  let j;
  if (dir > 0) j = pi;                                // tờ hiện tại lật đi, lộ thẳng trang đích bên dưới
  else { j = target; padUnder = pi; }                 // trang đích từ sau sổ vòng lên, hạ xuống trên trang cũ
  pi = target;
  const fl = padFlight(dir, j, "auto");
  fl.committed = true;
  padState();
  runPad(fl, true, PAD_MS);
}

/* chạm / vuốt trên sổ lật lên: chạm = lật lên; vuốt lên = lật lên; vuốt xuống = lật lùi */
let pptr = null;
padEl.addEventListener("pointerdown", e => {
  if (!e.isPrimary || interactive(e.target)) return;
  if (e.target.tagName === "IMG") e.preventDefault();
  startMusicOnce();
  pptr = { id: e.pointerId, x: e.clientX, y: e.clientY };
  padEl.setPointerCapture(e.pointerId);
});
padEl.addEventListener("pointermove", e => {
  if (!pptr || pptr.id !== e.pointerId || pptr.mode) return;
  const dx = e.clientX - pptr.x, dy = e.clientY - pptr.y;
  if (Math.hypot(dx, dy) > 12) {
    if (Math.abs(dy) >= Math.abs(dx)) { pptr.mode = "swipe"; pptr.dir = dy < 0 ? 1 : -1; }
    else pptr.mode = "none";                          // vuốt ngang: không làm gì
  }
});
function padRelease(e) {
  if (!pptr || pptr.id !== e.pointerId) return;
  const p = pptr; pptr = null;
  if (e.type !== "pointerup" || p.mode === "none") return;
  padStep(p.mode === "swipe" ? p.dir : 1);            // chạm ở đâu cũng lật lên
}
padEl.addEventListener("pointerup", padRelease);
padEl.addEventListener("pointercancel", padRelease);
padEl.addEventListener("click", e => {
  const go = e.target.closest("[data-goto]");
  if (go) { startMusicOnce(); goToKey(go.dataset.goto); }
});

/* Trang mỗi mục: nếu danh sách quán dài quá trang thì thu nhỏ chữ danh sách cho vừa (không bị đè lên chân trang) */
/* Trang quán: "Lưu ý" quá dài so với chỗ trống thì cắt bớt, cuối dòng có "… xem thêm";
   bấm vào đó thì hiện toàn bộ lời nhận xét trong 1 hộp giữa màn hình. Chữ giữ nguyên cỡ. */
function fitLists() {
  sideEls.forEach((el, i) => {
    if (sides[i].kind !== "place") return;
    const pf = el.querySelector(".pf"), note = el.querySelector(".review[data-full]");
    if (!pf || !note) return;
    const hid = []; for (let a = el; a && a !== document.body; a = a.parentElement) if (a.hidden) { hid.push(a); a.hidden = false; }
    const vis = el.style.visibility; el.style.visibility = "hidden";
    const em = parseFloat(getComputedStyle(el).fontSize);
    const lastBottom = () => { let b = 0; el.querySelectorAll(".page > :not(.pf)").forEach(k => { b = Math.max(b, k.getBoundingClientRect().bottom); }); return b; };
    const fits = () => pf.getBoundingClientRect().top - lastBottom() >= 0.9 * em;   // trang quán: giữ khoảng cách cũ
    const full = note.dataset.full;
    note.textContent = "“" + full + "”";
    if (!fits()) {
      const words = full.split(/\s+/);
      const show = n => { note.innerHTML = "“" + esc(words.slice(0, n).join(" ").replace(/[\s,.;:–-]+$/, "")) +
        `…” <button type="button" class="see-more">xem thêm</button>`; };
      let lo = 0, hi = words.length - 1;               // số chữ nhiều nhất mà vẫn vừa trang
      while (lo < hi) { const mid = Math.ceil((lo + hi) / 2); show(mid); if (fits()) lo = mid; else hi = mid - 1; }
      if (lo >= 3) show(lo);
      else note.innerHTML = `<button type="button" class="see-more">Xem review</button>`;   // quá ít chỗ: chỉ để nút mở nhận xét
    }
    el.style.visibility = vis; hid.forEach(a => a.hidden = true);
  });
}

// hộp đọc toàn bộ lời nhận xét
const noteBox = document.createElement("div");
noteBox.className = "note-modal"; noteBox.hidden = true;
noteBox.innerHTML = `<div class="nm-card" role="dialog" aria-modal="true" aria-labelledby="nm-title">
  <button type="button" class="nm-close" aria-label="Đóng">×</button>
  <h3 class="script" id="nm-title"></h3><p class="nm-text"></p></div>`;
document.body.appendChild(noteBox);
function openNote(btn) {
  const page = btn.closest(".page"), dd = btn.closest(".review[data-full]");
  noteBox.querySelector(".nm-card").style.setProperty("--c", page ? getComputedStyle(page).getPropertyValue("--c") : "");
  noteBox.querySelector("#nm-title").textContent = page ? page.querySelector(".pname").textContent : "";
  noteBox.querySelector(".nm-text").textContent = dd.dataset.full;
  noteBox.hidden = false;
  noteBox.querySelector(".nm-close").focus();
}
const closeNote = () => { noteBox.hidden = true; };
document.addEventListener("click", e => {
  const more = e.target.closest(".see-more");
  if (more) { e.preventDefault(); e.stopPropagation(); openNote(more); return; }
  if (e.target.closest(".nm-close") || e.target === noteBox) closeNote();
}, true);
document.addEventListener("keydown", e => { if (e.key === "Escape" && !noteBox.hidden) closeNote(); }, true);

/* ---------- 7. Kích thước: luôn vừa màn hình, sổ nằm giữa ---------- */
function resize() {
  const w = stageEl.clientWidth - 44, h = stageEl.clientHeight - 30;   // chừa chỗ cho mép giấy và bóng
  const wasSolo = solo;
  solo = stageEl.clientWidth < stageEl.clientHeight * 0.9;               // điện thoại / máy tính bảng dựng đứng
  document.documentElement.classList.toggle("is-solo", solo);           // nền đổi bố cục theo
  document.body.classList.toggle("solo", solo);
  if (solo) {
    // sổ lật lên: 1 tờ, giữ tỉ lệ 3:4 như sổ ngang; chừa khoảng trống phía trên cho tờ giấy vòng qua
    const sw = stageEl.clientWidth, sh = stageEl.clientHeight;
    PW = Math.max(120, Math.floor(Math.min(sw - 28, (sh - 90) * 3 / 4, 560)));
    PH = Math.round(PW * 4 / 3);
    document.documentElement.style.setProperty("--padx", Math.round((sw - PW) / 2) + "px");
    // đặt sổ ở giữa (cách đều trên/dưới), không sát các element dưới đáy; chừa đủ chỗ cho vòng xoắn ở trên
    document.documentElement.style.setProperty("--pady", Math.round(Math.max(22, (sh - PH) / 2 + 6)) + "px");
  } else {
    PW = Math.max(120, Math.floor(Math.min(w / 2, h / (4 / 3), 520)));   // trang tỉ lệ 3:4
    PH = Math.round(PW * 4 / 3);
  }
  document.documentElement.style.setProperty("--pw", PW + "px");
  document.documentElement.style.setProperty("--ph", PH + "px");
  if (solo !== wasSolo) solo ? enterPad() : exitPad();
  fitLists();
  if (solo) { buildRings(); padRender(); }
  else if (!flights.length) { endPeek(); renderStatics(); paintStacks(); }
  if (typeof whereEl !== "undefined") updateState();
}
window.addEventListener("resize", resize);
/* ---------- 6. Nhạc ---------- */
const tracks = {};
let musicOn = true, musicStarted = false, currentSrc = null;
// mỗi lần mở trang nhạc luôn ở "bật" (không nhớ lần tắt trước)

function trackFor(left, right) {
  const s = sides[right] && sides[right].kind !== "back" ? sides[right] : sides[left];
  const sec = s && s.section ? sectionById(s.section) : null;
  return sec ? sec.music : MUSIC.main;
}
function audio(src) {
  if (!tracks[src]) {
    const a = new Audio(src);
    a.loop = true; a.volume = 0; a.preload = "none";
    a.addEventListener("error", () => { a.dataset.missing = "1"; });
    tracks[src] = a;
  }
  return tracks[src];
}
function fade(a, to, ms = 600) {
  const from = a.volume, t0 = performance.now(), id = (a._fade = (a._fade || 0) + 1);   // lần fade mới thay lần cũ
  (function step(t) {
    if (a._fade !== id) return;
    const k = Math.max(0, Math.min(1, (t - t0) / ms));      // khung hình có thể mang mốc thời gian sớm hơn t0 → không để âm
    a.volume = Math.max(0, Math.min(1, from + (to - from) * k));
    if (k < 1) requestAnimationFrame(step);
    else if (to === 0) a.pause();
  })(t0);
}
function updateMusic(left, right) {
  const src = flipped === 0 ? MUSIC.main : trackFor(left, right);
  if (!musicStarted || !musicOn) { currentSrc = src; return; }
  if (src === currentSrc && tracks[src] && !tracks[src].paused) return;   // đang phát đúng bài thì thôi (chưa tạo bài nào thì phải tạo)
  if (currentSrc && tracks[currentSrc] && currentSrc !== src) fade(tracks[currentSrc], 0);
  currentSrc = src;
  const a = audio(src);
  if (a.dataset.missing) return;
  a.play().then(() => fade(a, 0.6)).catch(() => {});
}
function startMusicOnce() {      // trình duyệt chỉ cho phát nhạc sau cú chạm đầu tiên
  if (musicStarted) return;
  musicStarted = true;
  updateMusic(2 * flipped - 1, 2 * flipped);
}
// chạm bất kỳ đâu trên trang (cả nền ngoài sổ) cũng tính là cú chạm đầu tiên
document.addEventListener("pointerdown", () => startMusicOnce(), { once: true, capture: true });
const musicBtn = document.getElementById("btn-music");
function paintMusicBtn() {
  musicBtn.setAttribute("aria-pressed", musicOn);
  musicBtn.textContent = musicOn ? "♪ Nhạc: bật" : "♪ Nhạc: tắt";
}
musicBtn.addEventListener("click", () => {
  musicOn = !musicOn;
  paintMusicBtn();
  if (musicOn) { musicStarted = true; const s = currentSrc; currentSrc = null; updateMusic(2 * flipped - 1, 2 * flipped); if (!currentSrc) currentSrc = s; }
  else Object.values(tracks).forEach(a => fade(a, 0, 300));
});
paintMusicBtn();

/* ---------- 9. Hộp góp ý ---------- */
const form = document.getElementById("sform");
const otherBox = document.getElementById("s-rother");
const otherInput = document.getElementById("s-other");
const statusEl = document.getElementById("s-status");
otherBox.addEventListener("change", () => { otherInput.hidden = !otherBox.checked; if (otherBox.checked) otherInput.focus(); });

const REQUIRED = [["s-name", "tên quán"], ["s-addr", "địa chỉ"], ["s-stars", "số sao"], ["s-cat", "loại quán"], ["s-exp", "trải nghiệm riêng"]];
const val = id => document.getElementById(id).value.trim();

// bỏ viền đỏ khi người dùng sửa ô đó
document.addEventListener("input", e => { if (e.target.closest(".sform")) e.target.removeAttribute("aria-invalid"); });
document.addEventListener("change", e => { if (e.target.name === "khoang-cach") document.getElementById("dist-chips").removeAttribute("aria-invalid"); });

form.addEventListener("submit", async e => {
  e.preventDefault();
  const missing = [];
  REQUIRED.forEach(([id, label]) => {
    const el = document.getElementById(id);
    let bad = !el.value.trim();
    if (id === "s-stars" && !bad) { const n = Number(el.value); bad = !(n >= 1 && n <= 5); }
    el.toggleAttribute("aria-invalid", bad);
    if (bad) missing.push({ el, label: id === "s-stars" && el.value.trim() ? "số sao (từ 1 đến 5)" : label });
  });
  const distPicked = document.querySelector('#dist-chips input:checked');
  const distBox = document.getElementById("dist-chips");
  distBox.toggleAttribute("aria-invalid", !distPicked);
  if (!distPicked) missing.push({ el: distBox.querySelector("input"), label: "khoảng cách" });
  if (missing.length) {
    statusEl.className = "sstatus err";
    statusEl.textContent = missing.length > 2
      ? `Còn ${missing.length} ô bắt buộc chưa điền (viền đỏ).`
      : "Bạn còn thiếu: " + missing.map(m => m.label).join(", ") + ".";
    missing[0].el.focus();
    return;
  }

  const reasons = [...document.querySelectorAll("#reason-chips input:checked")].map(c => c.value).filter(v => v !== "__other");
  const data = new URLSearchParams({
    "form-name": "goi-y",
    "ten-quan": val("s-name"),
    "dia-chi": val("s-addr"),
    "loai-quan": val("s-cat"),
    "nen-thu": val("s-try"),
    "ly-do": reasons.join(", "),
    "khac": otherBox.checked ? val("s-other") : "",
    "trai-nghiem": val("s-exp"),
    "so-sao": val("s-stars"),
    "khoang-cach": distPicked.value,
    "nguoi-goi-y": val("s-who"),
    "lop": val("s-class")
  });

  const preview = location.protocol === "file:" || ["localhost", "127.0.0.1"].includes(location.hostname) || location.hostname.includes("claude");
  if (preview) { done("Bản xem thử: chưa gửi thật."); return; }

  const btn = document.getElementById("s-send");
  btn.disabled = true; statusEl.className = "sstatus"; statusEl.textContent = "Đang gửi…";
  try {
    const res = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: data.toString() });
    if (!res.ok) throw new Error(res.status);
    done("Đã gửi! Cảm ơn bạn nha.");
  } catch (err) {
    statusEl.className = "sstatus err";
    statusEl.textContent = "Chưa gửi được. Kiểm tra mạng rồi thử lại nhé.";
  } finally { btn.disabled = false; }

  function done(msg) {
    form.reset(); otherInput.hidden = true;
    statusEl.className = "sstatus"; statusEl.textContent = msg;
  }
});

/* ---------- 10. Nút 👍 cho từng quán ----------
   - Mọi quán bắt đầu từ 0. Mỗi máy bấm 1 lần / quán (bấm lại để bỏ), nhớ trong localStorage.
   - Tổng lượt lưu trên Netlify (netlify/functions/votes.mjs). Số luôn hiện, tự cập nhật vài giây một lần.
   - Admin reset ở trang admin.html; máy nào đã bấm trước lần reset sẽ thấy nút trở lại chưa bấm.
   - Bản xem thử (không có Netlify) chỉ đếm lượt bấm trên chính máy đó. */
const VOTE_API = "/api/votes";
const IS_PREVIEW = location.protocol === "file:" || ["localhost", "127.0.0.1"].includes(location.hostname) || location.hostname.includes("claude");
let voteCounts = {};
let myVotes = {}, myVer = {};                     // myVer[id] = "lượt reset" của quán lúc máy này bấm
try { myVotes = JSON.parse(localStorage.getItem("so-tay-votes")) || {}; } catch (e) {}
try { myVer = JSON.parse(localStorage.getItem("so-tay-votes-v")) || {}; } catch (e) {}
const saveMyVotes = () => { try { localStorage.setItem("so-tay-votes", JSON.stringify(myVotes)); localStorage.setItem("so-tay-votes-v", JSON.stringify(myVer)); } catch (e) {} };
// Quán đã bị admin reset sau khi máy này bấm → bỏ dấu đã bấm
function dropStale() {
  let changed = false;
  Object.keys(myVotes).forEach(id => {
    const v = (voteCounts[id] || {}).v || 0;
    if ((myVer[id] || 0) !== v) { delete myVotes[id]; delete myVer[id]; changed = true; }
  });
  if (changed) saveMyVotes();
}

// 999 → "999", 1000 → "1k", 1250 → "1.2k", 15300 → "15k", 2400000 → "2.4m"
function shortCount(n) {
  n = Math.max(0, Math.floor(n || 0));
  const units = [[1e9, "b"], [1e6, "m"], [1e3, "k"]];
  for (const [size, unit] of units) {
    if (n >= size) {
      const v = n / size;
      const shown = v < 10 ? Math.floor(v * 10) / 10 : Math.floor(v);
      return String(shown).replace(/\.0$/, "") + unit;
    }
  }
  return String(n);
}

function paintVotes() {
  document.querySelectorAll(".votes").forEach(box => {
    const id = box.dataset.place, up = (voteCounts[id] || {}).up || 0;
    const voted = myVotes[id] === "up";
    box.querySelector(".vote-up").setAttribute("aria-pressed", voted);
    const n = box.querySelector(".vcount");
    n.textContent = shortCount(up);
    n.title = `${up.toLocaleString("vi-VN")} lượt thích`;
  });
}

async function loadVotes() {
  if (IS_PREVIEW) {           // bản xem thử: bắt đầu từ 0, chỉ cộng lượt bấm của máy này
    PLACES.forEach(p => { voteCounts[p.id] = { up: 0, down: 0, v: 0 }; });
    Object.entries(myVotes).forEach(([id, d]) => { if (voteCounts[id] && d) voteCounts[id][d]++; });
  } else {
    try { const res = await fetch(VOTE_API); if (res.ok) { voteCounts = await res.json(); dropStale(); } } catch (e) {}
  }
  paintVotes();
}

// "Thời gian thực": hỏi lại số lượt mỗi 30 giây khi đang xem trang quán (tab đang mở)
const LIVE_MS = 30000;   // 30 giây: đỡ tốn lượt gọi máy chủ (credit Netlify); bấm 👍 vẫn cập nhật ngay
let pending = 0;                                   // đang gửi lượt bấm thì tạm bỏ qua kết quả cũ
async function refreshVotes() {
  if (IS_PREVIEW || document.hidden || pending) return;
  if (!document.querySelector(".side:not([hidden]) .votes")) return;
  try {
    const res = await fetch(VOTE_API, { cache: "no-store" });
    if (res.ok && !pending) { voteCounts = await res.json(); dropStale(); paintVotes(); }
  } catch (e) {}
}
setInterval(refreshVotes, LIVE_MS);
document.addEventListener("visibilitychange", refreshVotes);

async function castVote(id, dir) {
  const from = myVotes[id] || null;
  const to = from === dir ? null : dir;            // bấm lại = bỏ chọn; bấm nút kia = đổi
  const c = voteCounts[id] = voteCounts[id] || { up: 0, down: 0, v: 0 };
  const v = c.v || 0;
  if (from) c[from] = Math.max(0, c[from] - 1);
  if (to) c[to] = (c[to] || 0) + 1;
  if (to) { myVotes[id] = to; myVer[id] = v; } else { delete myVotes[id]; delete myVer[id]; }
  saveMyVotes(); paintVotes();
  if (IS_PREVIEW) return;
  pending++;
  try {
    const res = await fetch(VOTE_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, from, to, v }) });
    if (res.ok) { voteCounts[id] = await res.json(); if (to) myVer[id] = voteCounts[id].v || 0; saveMyVotes(); paintVotes(); }
  } catch (e) { /* mất mạng: giữ số tạm trên máy */ }
  finally { pending--; }
}

document.addEventListener("click", e => {
  const btn = e.target.closest(".vote");
  if (!btn) return;
  castVote(btn.closest(".votes").dataset.place, btn.dataset.vote);
});

/* Phông chữ tải xong: đo lại. Nếu cách chia trang mục khác lúc đầu (do phông dự phòng) thì tải lại 1 lần. */
if (document.fonts && document.fonts.status !== "loaded") {
  document.fonts.ready.then(() => {
    fitLists();
    const changed = SECTIONS.some(sec => paginateList(sec).map(pg => pg.length).join(",") !== LIST_SPLIT[sec.id]);
    const sig = SECTIONS.map(sec => paginateList(sec).map(pg => pg.length).join(",")).join("|");
    let tried = false; try { tried = sessionStorage.getItem("so-tay-refit") === sig; } catch (e) {}
    if (changed && !tried) { try { sessionStorage.setItem("so-tay-refit", sig); } catch (e) {} location.reload(); }
  });
}

/* ---------- Bắt đầu ---------- */
resize();
updateState();
loadVotes();
requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove("preload")));
