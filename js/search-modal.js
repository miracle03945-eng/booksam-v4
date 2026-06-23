// ══════════════════════════════════════════════
//  Search Modal  —  search-modal.js
// ══════════════════════════════════════════════

// 노출할 시리즈 고정 목록
const SM_SERIES_LIST = [
  { name: 'Phonics NOW',         cat: 'elementary', match: 'Phonics NOW',         desc: '알파벳부터 문장까지 술술, 탄탄한 영어 읽기의 첫걸음! 파닉스를 체계적이고 재미있게 배울 수 있도록 설계된 5단계 시리즈' },
  { name: 'Benchmark Reading',   cat: 'elementary', match: 'Benchmark Reading',   desc: '미국 초등 교과서 기반의 단계별 영어 독해 학습서. 풍부한 논픽션·픽션 지문으로 리딩 실력을 체계적으로 향상' },
  { name: 'I Love Reading',      cat: 'middle',     match: 'I Love Reading',      desc: '중학 교과 연계 독해 시리즈. 다양한 주제의 지문과 핵심 문법 포인트로 독해 기초부터 실전까지 완성' },
  { name: 'I Love Grammar',      cat: 'middle',     match: 'I Love Grammar',      desc: '중학 필수 문법을 쉽고 빠르게! 핵심 문법 규칙을 명확한 설명과 풍부한 연습 문제로 완벽 정리' },
  { name: '문제로 풀자 중학영문법', cat: 'middle',     match: '문제로 풀자 중학영문법', desc: '최신 개정 교육 과정을 완벽 반영한 최다 문항 수의 중등 문법 학습서 레벨 1, 2, 3' },
  { name: 'Grammar Sharp',       cat: 'high',       match: 'Grammar Sharp',       desc: '고등 영어 문법의 핵심을 날카롭게! 수능·내신 대비 필수 문법 개념 정리와 실전 문제로 고득점 완성' },
  { name: 'Booster Voca',        cat: 'middle',     match: 'Booster Voca',        desc: '중등 필수 어휘를 체계적으로! 기본·실력·완성 3단계 구성으로 내신과 수능 어휘를 한 번에 완성' },
  { name: 'Reading Prime',       cat: 'high',       match: 'Reading Prime',       desc: '최신 경향을 반영한 6단계 중고등 독해 필독서 시리즈. 수능 유형 지문으로 독해력·사고력을 동시에 강화' },
];

// 조건 검색용 카테고리 목록 (하위 호환)
const SM_SERIES = {
  elementary: ['Phonics NOW','Benchmark Reading'],
  middle:     ['I Love Reading','I Love Grammar','문제로 풀자 중학영문법'],
  high:       ['Grammar Sharp'],
  elt:        []
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
        <button class="sm-tab-btn sm-tab-cond active" data-tab="cond" onclick="smSwitchTab('cond')">조건 검색</button>
        <button class="sm-tab-btn sm-tab-series" data-tab="series" onclick="smSwitchTab('series')">시리즈 검색</button>
      </div>
      <button class="sm-close-btn" onclick="closeSearchModal()">✕</button>
    </div>
    <div class="sm-body">

      <!-- ① 조건 검색 -->
      <div class="sm-content active" id="sm-cond">
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
  smSwitchTab('cond');
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
  const list = cat === 'all' ? SM_SERIES_LIST : SM_SERIES_LIST.filter(s => s.cat === cat);
  const catLabel = {elementary:'초등', middle:'중학', high:'고등', elt:'ELT'};

  document.getElementById('smSeriesGrid').innerHTML = list.map(s => {
    const matched = books.filter(b => b.title.includes(s.match));
    const imgs = matched.filter(b => b.img).slice(0, 4).map(b =>
      `<img src="${b.img}" alt="${b.title}" onerror="this.style.display='none'">`
    ).join('');
    const label = catLabel[s.cat] || '';
    return `
      <div class="sm-series-card" onclick="location.href='books.html?series=${encodeURIComponent(s.name)}'">
        <div class="sm-series-imgs">${imgs || '<div class="sm-series-no-img">📚</div>'}</div>
        <div class="sm-series-info">
          <div class="sm-series-top">
            ${label ? `<span class="sm-series-badge">${label}</span>` : ''}
            <span class="sm-series-count">${matched.length}권</span>
          </div>
          <div class="sm-series-name">${s.name}</div>
          ${s.desc ? `<div class="sm-series-desc">${s.desc}</div>` : ''}
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
