(() => {
  'use strict';
  const views = {
    dashboard: ['Dashboard', 'Pantau konsistensi kebiasaan dan perkembangan pekerjaanmu.'],
    habit: ['Habit Harian', 'Bangun rutinitas konsisten. Centang kebiasaan yang berhasil kamu lakukan.'],
    tasks: ['Pekerjaan', 'Atur prioritas, kelola tugas, dan selesaikan pekerjaan sesuai jadwal.']
  };
  const $ = id => document.getElementById(id);
  const app = document.querySelector('.app');
  const side = document.querySelector('.side');
  const oldNav = side?.querySelector('.navitem');
  const metrics = document.querySelector('.metrics');
  const sectionGrid = document.querySelector('.section-grid');
  const habitSection = sectionGrid?.querySelector('.section-card:not(.task-section)');
  const taskSection = sectionGrid?.querySelector('.section-card.task-section');
  if (!app || !oldNav || !metrics || !sectionGrid || !habitSection || !taskSection) return;

  const nav = document.createElement('nav');
  nav.className = 'sidebar-links';
  nav.setAttribute('aria-label','Menu utama');
  const svg = {
    dashboard: '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="5" rx="2"/><rect x="13" y="10" width="8" height="11" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/>',
    habit: '<path d="M20 12.6V20H4V4h10"/><path d="m8 11 3 3L21 4"/>',
    tasks: '<rect x="4" y="4" width="16" height="17" rx="3"/><path d="M8 10h8M8 14h8M8 18h5"/>'
  };
  nav.innerHTML = Object.keys(views).map(key => '<button type="button" class="navitem" data-navigate="'+key+'" title="'+views[key][0]+'"><span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+svg[key]+'</svg></span><span class="nav-label">'+views[key][0]+'</span><span class="dot"></span></button>').join('');
  oldNav.replaceWith(nav);

  const title = document.querySelector('.hero h1');
  const subtitle = document.querySelector('.hero p');
  const crumb = document.querySelector('.topline strong');
  const chart = document.createElement('section');
  chart.className = 'analytics';
  chart.id = 'analyticsPanel';
  chart.setAttribute('aria-label','Grafik produktivitas');
  chart.innerHTML = `
  <div class="analytics-heading"><div><span class="section-kicker">ANALISIS AKTIVITAS</span><h2>Grafik Produktivitas</h2><p>Persentase habit dan pekerjaan selesai berdasarkan tanggal.</p></div><div class="chart-switch" aria-label="Rentang grafik"><button type="button" data-range="7" class="active" aria-pressed="true">7 Hari</button><button type="button" data-range="14" aria-pressed="false">14 Hari</button><button type="button" data-range="30" aria-pressed="false">30 Hari</button></div></div>
  <div class="analytics-legend"><span><i class="legend-dot habit-dot"></i>Habit</span><span><i class="legend-dot task-dot"></i>Pekerjaan</span><span class="analytics-hint" id="chartCaption"></span></div>
  <div class="graph-outer"><div class="graph-layout" id="graphLayout"><div class="graph-axis" aria-hidden="true"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><div class="graph-plot"><div class="graph-guides" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div><div class="graph-bars" id="graphBars" role="img" aria-label="Grafik progres habit dan pekerjaan"></div></div></div></div>
  <div class="insights"><div class="insight"><span>Rata-rata habit</span><strong id="avgHabit">—</strong><small id="habitRatio">0 dari 0 checklist</small></div><div class="insight"><span>Rata-rata pekerjaan</span><strong id="avgTasks">—</strong><small id="taskRatio">0 dari 0 tugas</small></div><div class="insight"><span>Hari habit terpenuhi</span><strong id="perfectDays">0 hari</strong><small id="insightWindow">Dalam 7 hari terakhir</small></div></div>`;
  const shortcuts = document.createElement('div');
  shortcuts.className = 'dashboard-shortcuts';
  shortcuts.innerHTML = '<button class="shortcut" type="button" data-navigate="habit"><span class="shortcut-icon purple-icon">✓</span><span><strong>Habit Harian</strong><small>Kelola dan centang kebiasaanmu</small></span><span class="shortcut-arrow" aria-hidden="true">›</span></button><button class="shortcut" type="button" data-navigate="tasks"><span class="shortcut-icon green-icon">▤</span><span><strong>Checklist Pekerjaan</strong><small>Lihat dan kelola tugas harian</small></span><span class="shortcut-arrow" aria-hidden="true">›</span></button>';
  sectionGrid.before(chart,shortcuts);

  let currentView = views[location.hash.slice(1)] ? location.hash.slice(1) : 'dashboard';
  let graphRange = 7;
  function renderView(){
    const v = views[currentView];
    title.innerHTML = v[0]+'<span style="color:var(--purple)">.</span>';
    subtitle.textContent = v[1];
    crumb.textContent = v[0];
    nav.querySelectorAll('[data-navigate]').forEach(b => {
      const active = b.dataset.navigate === currentView;
      b.classList.toggle('active',active);
      if(active) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current');
    });
    metrics.hidden = currentView !== 'dashboard';
    chart.hidden = currentView !== 'dashboard';
    shortcuts.hidden = currentView !== 'dashboard';
    sectionGrid.hidden = currentView === 'dashboard';
    habitSection.hidden = currentView !== 'habit';
    taskSection.hidden = currentView !== 'tasks';
  }
  function navigate(view){
    if(!views[view]) return;
    currentView = view;
    if(location.hash !== '#'+view) location.hash = view;
    renderView();
    window.scrollTo(0,0);
  }
  nav.addEventListener('click',e=>{const b=e.target.closest('[data-navigate]');if(b)navigate(b.dataset.navigate)});
  shortcuts.addEventListener('click',e=>{const b=e.target.closest('[data-navigate]');if(b)navigate(b.dataset.navigate)});
  window.addEventListener('hashchange',()=>{const key=location.hash.slice(1);if(views[key]){currentView=key;renderView()}});

  const addDay=(iso,delta)=>{const d=new Date(iso+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+delta);return d.toISOString().slice(0,10)};
  const displayDate=(iso,opts)=>new Intl.DateTimeFormat('id-ID',{timeZone:'UTC',...opts}).format(new Date(iso+'T12:00:00Z'));
  const selected=()=> $('datePick')?.value || new Date().toISOString().slice(0,10);
  function getData(){
    try{
      const data=JSON.parse(localStorage.getItem('rizky_hidayat_tracker_v2')||localStorage.getItem('iky_creator_hub_tracker_v1')||'{}');
      return {habits:Array.isArray(data.habits)?data.habits:[],tasks:Array.isArray(data.tasks)?data.tasks:[],habitLog:data.habitLog&&typeof data.habitLog==='object'?data.habitLog:{}};
    }catch{return {habits:[],tasks:[],habitLog:{}}}
  }
  function drawGraph(){
    const data=getData(),end=selected(),n=graphRange;
    let hd=0,ht=0,td=0,tt=0,perfect=0,html='';
    for(let i=n-1;i>=0;i--){
      const day=addDay(end,-i),hTotal=data.habits.length,hDone=data.habits.filter(h=>data.habitLog[day]?.[h.id]).length;
      const tasks=data.tasks.filter(t=>t.date===day),tTotal=tasks.length,tDone=tasks.filter(t=>t.done).length;
      ht+=hTotal;hd+=hDone;tt+=tTotal;td+=tDone;
      if(hTotal>0&&hTotal===hDone)perfect++;
      const hp=hTotal?Math.round(100*hDone/hTotal):0,tp=tTotal?Math.round(100*tDone/tTotal):0;
      const d=displayDate(day,{day:'numeric',month:'short'}),label=n<=14?displayDate(day,{weekday:'short'}):displayDate(day,{day:'numeric'});
      html+='<div class="graph-day '+(day===end?'today':'')+'"><div class="graph-columns"><div class="graph-bar habit '+(!hTotal?'no-data':'')+'" style="--bar-height:'+hp+'%" title="'+d+': habit '+hDone+'/'+hTotal+' ('+hp+'%)"></div><div class="graph-bar task '+(!tTotal?'no-data':'')+'" style="--bar-height:'+tp+'%" title="'+d+': pekerjaan '+tDone+'/'+tTotal+' ('+tp+'%)"></div></div><div class="graph-date">'+label+'</div></div>';
    }
    const bars=$('graphBars');
    bars.innerHTML=html;
    bars.style.setProperty('--days',n);
    bars.setAttribute('aria-label','Grafik '+n+' hari. Habit selesai '+hd+' dari '+ht+', pekerjaan selesai '+td+' dari '+tt);
    $('graphLayout').style.minWidth=n===30?'740px':n===14?'480px':'380px';
    $('avgHabit').textContent=ht?Math.round(hd/ht*100)+'%':'—';
    $('avgTasks').textContent=tt?Math.round(td/tt*100)+'%':'—';
    $('habitRatio').textContent=hd+' dari '+ht+' checklist';
    $('taskRatio').textContent=td+' dari '+tt+' tugas';
    $('perfectDays').textContent=perfect+' hari';
    $('insightWindow').textContent='Dalam '+n+' hari terakhir';
    $('chartCaption').textContent=n+' hari hingga '+displayDate(end,{day:'numeric',month:'short',year:'numeric'});
    chart.querySelectorAll('[data-range]').forEach(b=>{const active=Number(b.dataset.range)===n;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
  }
  chart.addEventListener('click',e=>{const b=e.target.closest('[data-range]');if(b){graphRange=Number(b.dataset.range);drawGraph()}});
  window.rhUpdateAnalytics=drawGraph;
  renderView();
  drawGraph();
})();