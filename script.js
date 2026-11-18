const cards = document.querySelectorAll('.day-card');

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