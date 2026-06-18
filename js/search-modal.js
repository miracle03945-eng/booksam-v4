// ══════════════════════════════════════════════
//  Search Modal  —  search-modal.js
// ══════════════════════════════════════════════

const SM_SERIES = {
  elementary: ['Phonics NOW','Benchmark Reading','JET 공식기출문제집','Phonics Land','쓰기에 강한 초등영문법 그래머킹','Grammar POP Plus'],
  middle:     ['문제로 풀자 중학영문법','중등수학 SOS','Reading Prime','고득점 중학영어듣기 모의고사','Reading Sharp','부스터 보카','Grammar Sharp'],
  high:       ['BOOSTER','수직상승 어법/구문','초간단 수능영어 문법편','초간단 수능영어 유형편','초간단 수능영어 구문편','ACTIVATOR LISTENING for the TOEFL iBT®','ACTIVATOR READING for the TOEFL iBT®','TOEFL iBT® Codebreaker Reading'],
  elt:        ['Phonics NOW','GRAMMAR NOW','Sadlier Math','Write Now','Listening Star']
};

const SM_GRADE_GROUPS = [
  ['초등전체','예비초등','초등 1','초등 2','초등 3','초등 4','초등 5','초등 6'],
  ['중등전체','예비중등','중등 1','중등 2','중등 3'],
  ['고등전체','예비고등','고등 1','고등 2','고등 3'],
  ['일반']
];

const SM_CLASSES = [
  'ELT','교과서','기타 외국어및 일반','단기 특강',
  '독해','듣기','모의고사','문법/구문',
  '수능대비','수험서','쓰기','어휘',
  '예비초등','평가문제집','평가문제집/자습서'
];

function smGradeFilter(grade, b) {
  if (grade.startsWith('초등') || grade === '예비초등') return b.cat === 'elementary';
  if (grade.startsWith('중등') || grade === '예비중등') return b.cat === 'middle';
  if (grade.startsWith('고등') || grade === '예비고등') return b.cat === 'high';
  if (grade === '일반') return b.type === '일반';
  return true;
}

function smClassFilter(cls, b) {
  const a = b.area || '', t = b.type || '';
  if (cls === 'ELT')              return t === 'ELT';
  if (cls === '교과서')            return t === '교과서';
  if (cls === '기타 외국어및 일반') return t === '일반';
  if (cls === '단기 특강')         return a.includes('단기');
  if (cls === '독해')              return a === '독해';
  if (cls === '듣기')              return a === '듣기';
  if (cls === '모의고사')           return a === '모의고사';
  if (cls === '문법/구문')          return a === '문법/구문' || a === '문법';
  if (cls === '수능대비')           return a === '수능대비';
  if (cls === '수험서')            return a === '수험서' || a === '검정시험';
  if (cls === '쓰기')              return a === '쓰기';
  if (cls === '어휘')              return a === '어휘';
  if (cls === '예비초등')           return b.cat === 'elementary';
  if (cls === '평가문제집')         return a.includes('평가문제집');
  if (cls === '평가문제집/자습서')   return a.includes('평가문제집') || a.includes('자습서');
  return true;
}

// ─── State ────────────────────────────────────
let smSelectedGrades = new Set();
let smSelectedClasses = new Set();
let smSeriesCat = 'all';

// ─── Inject HTML ──────────────────────────────
function smInjectHTML() {
  const gradeHTML = SM_GRADE_GROUPS.map((group, gi) =>
    group.map(g => `<button class="sm-chip" data-grade="${g}" onclick="smToggleGrade(this,'${g}')">${g}</button>`).join('') +
    (gi < SM_GRADE_GROUPS.length - 1 ? '<span class="sm-chip-sep"></span>' : '')
  ).join('');

  const classHTML = SM_CLASSES.map(c =>
    `<button class="sm-chip" data-class="${c}" onclick="smToggleClass(this,'${encodeURIComponent(c)}')">${c}</button>`
  ).join('');

  const svgSearch = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;

  document.body.insertAdjacentHTML('beforeend', `
<div id="smOverlay" class="sm-overlay" onclick="smOverlayClick(event)">
  <div class="sm-panel">
    <div class="sm-header">
      <div class="sm-tabs">
        <button class="sm-tab-btn sm-tab-name active" data-tab="name" onclick="smSwitchTab('name')">교재명 검색</button>
        <button class="sm-tab-btn sm-tab-cond" data-tab="cond" onclick="smSwitchTab('cond')">조건 검색</button>
        <button class="sm-tab-btn sm-tab-series" data-tab="series" onclick="smSwitchTab('series')">시리즈 검색</button>
      </div>
      <button class="sm-close-btn" onclick="closeSearchModal()">✕</button>
    </div>
    <div class="sm-body">

      <!-- ① 교재명 검색 -->
      <div class="sm-content active" id="sm-name">
        <div class="sm-name-bar">
          <span class="sm-name-icon">${svgSearch}</span>
          <input id="smNameInput" class="sm-name-input" type="text" placeholder="교재명을 입력해주세요" onkeydown="if(event.key==='Enter')smSearchByName()">
          <button class="sm-name-btn" onclick="smSearchByName()">검색</button>
        </div>
        <div class="sm-result-info">검색하신 내용에 적합한 교재 총 <strong id="smNameCount" class="sm-red">0</strong>권이 검색되었습니다.</div>
        <div class="sm-results-grid" id="smNameResults"></div>
      </div>

      <!-- ② 조건 검색 -->
      <div class="sm-content" id="sm-cond">
        <div class="sm-filter-area">
          <div class="sm-filter-block">
            <div class="sm-filter-label">이용대상</div>
            <div class="sm-chip-group">${gradeHTML}</div>
          </div>
          <div class="sm-filter-block">
            <div class="sm-filter-label">분류 선택</div>
            <div class="sm-chip-group">${classHTML}</div>
          </div>
        </div>
        <div class="sm-result-info">검색하신 내용에 적합한 도서 총 <strong id="smCondCount" class="sm-red">0</strong>권이 검색되었습니다.</div>
        <div class="sm-results-grid" id="smCondResults"></div>
      </div>

      <!-- ③ 시리즈 검색 -->
      <div class="sm-content" id="sm-series">
        <div class="sm-series-tabbar">
          <button class="sm-stab active" data-cat="all" onclick="smSwitchSeries(this,'all')">전체</button>
          <button class="sm-stab" data-cat="elementary" onclick="smSwitchSeries(this,'elementary')">초등</button>
          <button class="sm-stab" data-cat="middle" onclick="smSwitchSeries(this,'middle')">중학</button>
          <button class="sm-stab" data-cat="high" onclick="smSwitchSeries(this,'high')">고등</button>
          <button class="sm-stab" data-cat="elt" onclick="smSwitchSeries(this,'elt')">ELT</button>
        </div>
        <div class="sm-series-grid" id="smSeriesGrid"></div>
      </div>
    </div>
    <a href="resources.html" class="sm-resource-btn">교재자료 검색하기 <span>go →</span></a>
  </div>
</div>`);

  smRenderCondResults();
  smRenderSeriesGrid('all');
}

// ─── Open / Close ─────────────────────────────
function openSearchModal() {
  document.getElementById('smOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  smSwitchTab('name');
  setTimeout(() => { const inp = document.getElementById('smNameInput'); if (inp) inp.focus(); }, 120);
}

function closeSearchModal() {
  document.getElementById('smOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function smOverlayClick(e) {
  if (e.target.id === 'smOverlay') closeSearchModal();
}

// ─── Tab ──────────────────────────────────────
function smSwitchTab(tab) {
  document.querySelectorAll('.sm-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.sm-content').forEach(c => c.classList.toggle('active', c.id === 'sm-' + tab));
}

// ─── 교재명 검색 ──────────────────────────────
function smSearchByName() {
  const q = (document.getElementById('smNameInput').value || '').trim().toLowerCase();
  const books = (typeof BOOKS !== 'undefined') ? BOOKS : [];
  const filtered = q ? books.filter(b => b.title.toLowerCase().includes(q) || (b.author || '').toLowerCase().includes(q)) : [];
  document.getElementById('smNameCount').textContent = filtered.length.toLocaleString();
  document.getElementById('smNameResults').innerHTML = filtered.map(smBookCard).join('');
}

// ─── 조건 검색 ────────────────────────────────
function smToggleGrade(btn, grade) {
  btn.classList.toggle('active');
  if (btn.classList.contains('active')) smSelectedGrades.add(grade);
  else smSelectedGrades.delete(grade);
  smRenderCondResults();
}

function smToggleClass(btn, cls) {
  const c = decodeURIComponent(cls);
  btn.classList.toggle('active');
  if (btn.classList.contains('active')) smSelectedClasses.add(c);
  else smSelectedClasses.delete(c);
  smRenderCondResults();
}

function smRenderCondResults() {
  const books = (typeof BOOKS !== 'undefined') ? BOOKS : [];
  let filtered = books;
  if (smSelectedGrades.size > 0)  filtered = filtered.filter(b => [...smSelectedGrades].some(g => smGradeFilter(g, b)));
  if (smSelectedClasses.size > 0) filtered = filtered.filter(b => [...smSelectedClasses].some(c => smClassFilter(c, b)));
  document.getElementById('smCondCount').textContent = filtered.length.toLocaleString();
  document.getElementById('smCondResults').innerHTML = filtered.map(smBookCard).join('');
}

// ─── 시리즈 검색 ──────────────────────────────
function smSwitchSeries(btn, cat) {
  document.querySelectorAll('.sm-stab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  smSeriesCat = cat;
  smRenderSeriesGrid(cat);
}

function smRenderSeriesGrid(cat) {
  const books = (typeof BOOKS !== 'undefined') ? BOOKS : [];
  let series = [];
  if (cat === 'all') {
    const seen = new Set();
    Object.entries(SM_SERIES).forEach(([c, names]) => names.forEach(n => {
      if (!seen.has(n)) { seen.add(n); series.push({name: n, cat: c}); }
    }));
  } else {
    series = (SM_SERIES[cat] || []).map(n => ({name: n, cat}));
  }

  const catLabel = {elementary:'초등', middle:'중학', high:'고등', elt:'ELT'};

  document.getElementById('smSeriesGrid').innerHTML = series.map(s => {
    const matched = books.filter(b => b.title.includes(s.name));
    const imgs = matched.slice(0, 3).map(b =>
      b.img ? `<img src="${b.img}" alt="${b.title}" onerror="this.style.display='none'">` : ''
    ).join('');
    const label = catLabel[s.cat] || '';
    return `
      <div class="sm-series-card" onclick="location.href='books.html?series=${encodeURIComponent(s.name)}'">
        <div class="sm-series-imgs">${imgs || '<div class="sm-series-no-img">📚</div>'}</div>
        <div class="sm-series-info">
          ${label ? `<span class="sm-series-badge">${label}</span>` : ''}
          <div class="sm-series-name">${s.name}</div>
          <div class="sm-series-count">${matched.length}권</div>
        </div>
      </div>`;
  }).join('');
}

// ─── Book card ────────────────────────────────
function smBookCard(b) {
  const price = b.price ? b.price.toLocaleString() + '원' : '';
  const img = b.img
    ? `<img src="${b.img}" alt="${b.title}" style="width:100%;height:100%;object-fit:cover;">`
    : `<span style="font-size:22px;">📖</span>`;
  return `
    <div class="sm-book-card" onclick="location.href='book-detail.html?id=${b.id}'">
      <div class="sm-book-thumb">${img}</div>
      <div class="sm-book-info">
        <div class="sm-book-title">${b.title}</div>
        <div class="sm-book-meta">${b.author || ''}</div>
        <div class="sm-book-meta">${b.publisher || 'YBM'}</div>
        <div class="sm-book-price">${price}</div>
      </div>
    </div>`;
}

// ─── Init ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', smInjectHTML);
