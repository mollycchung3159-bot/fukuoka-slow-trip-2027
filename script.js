const cards = document.querySelectorAll('.day-card');

function updateBudget() {
 const people=Math.max(1,Math.min(20,Number(document.getElementById('budgetPeople').value)||1));
 const car=62000/people;
 const fmt=(amount)=>Math.ceil(amount).toLocaleString('en-US');
 for(const [id,value] of [['car',car],['twin',33200+34000+car],['single',51600+34000+car]]){
  document.getElementById(id+'Yen').textContent='¥'+fmt(value)+(id==='car'?'':'–'+fmt(value+16000));
  document.getElementById(id+'Hkd').textContent='HK$'+fmt(value*.05)+(id==='car'?'':'–'+fmt((value+16000)*.05));
 }
}
document.getElementById('budgetPeople').addEventListener('input',updateBudget);
updateBudget();
if('serviceWorker' in navigator){
 navigator.serviceWorker.register('./sw.js').then(()=>navigator.serviceWorker.ready).then(()=>{
  document.getElementById('offlineStatus').textContent='已儲存離線手帖：行程、預算、緊急資料及插畫可離線查看。';
 }).catch(()=>{document.getElementById('offlineStatus').textContent='未能儲存離線手帖，請保持連線並稍後重新開啟。';});
}

function setDayOpen(card, opening) {
  const button = card.querySelector('.day-summary');
  const detail = card.querySelector('.day-detail');
  card.classList.toggle('open', opening);
  button.setAttribute('aria-expanded', String(opening));
  detail.hidden = !opening;
}

cards.forEach((card) => {
  const button = card.querySelector('.day-summary');

  button.addEventListener('click', () => {
    setDayOpen(card, !card.classList.contains('open'));
  });
});

document.querySelectorAll('.day-jump a').forEach((link) => {
  link.addEventListener('click', () => {
    const card = document.querySelector(link.getAttribute('href'));
    if (card) setDayOpen(card, true);
  });
});

function openLinkedDay() {
  const card = [...cards].find((day) => `#${day.id}` === window.location.hash);
  if (card) setDayOpen(card, true);
}

openLinkedDay();
window.addEventListener('hashchange', openLinkedDay);

document.getElementById('expandAll').addEventListener('click', () => cards.forEach(card => setDayOpen(card, true)));
document.getElementById('collapseAll').addEventListener('click', () => cards.forEach(card => setDayOpen(card, false)));
function goToday(automatic = false) {
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const match = /^2027-03-(1[5-9]|20)$/.exec(date);
  const card = match && document.getElementById(`day${Number(match[1]) - 14}`);
  if (card) { setDayOpen(card, true); card.scrollIntoView(); }
  else if (!automatic) document.getElementById('todayStatus').textContent = '今日行程適用於2027年3月15–20日。';
}
document.querySelector('.today-button').addEventListener('click', () => goToday());
if (!window.location.hash) goToday(true);
document.querySelectorAll('[data-food-filter]').forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.foodFilter;
  let visible = 0;
  document.querySelectorAll('[data-food-day]').forEach(card => { card.hidden = filter !== 'all' && card.dataset.foodDay !== filter; if (!card.hidden) visible++; });
  document.querySelectorAll('[data-food-filter]').forEach(chip => chip.setAttribute('aria-pressed', String(chip === button)));
  document.getElementById('foodEmpty').hidden = visible > 0;
}));
document.querySelectorAll('a[href^="#food-"]').forEach(link => link.addEventListener('click', () => document.querySelector('[data-food-filter="all"]').click()));
document.querySelectorAll('[data-trip-check]').forEach(input => {
  const key = `fukuoka-check-${input.dataset.tripCheck}`;
  try { input.checked = localStorage.getItem(key) === 'true'; } catch {}
  input.addEventListener('change', () => { try { localStorage.setItem(key, String(input.checked)); } catch {} });
});

async function shareTrip() {
  const status = document.getElementById('shareStatus');
  const data = {
    title: '福岡，慢慢行。',
    text: '我哋2027年3月的福岡六日五夜慢遊行程',
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(data);
      if (status) status.textContent = '分享選單已開啟';
    } else {
      await navigator.clipboard.writeText(window.location.href);
      if (status) status.textContent = '行程網址已複製';
    }
  } catch (error) {
    if (error.name !== 'AbortError' && status) {
      status.textContent = '未能自動分享，請複製瀏覽器網址。';
    }
  }
}

document.getElementById('shareButton').addEventListener('click', shareTrip);
document.getElementById('shareButtonBottom').addEventListener('click', shareTrip);