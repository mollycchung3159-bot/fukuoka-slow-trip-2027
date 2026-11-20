(() => {
  const panel = document.getElementById('tripMap');
  const status = document.getElementById('mapStatus');
  const heading = document.getElementById('mapHeading');
  const list = document.getElementById('mapStops');
  const allButton = document.getElementById('mapAll');
  const transport = document.getElementById('mapTransport');
  function transportCard(leg) {
    const card=document.createElement('li');card.className='transport-leg';
    const title=document.createElement('strong'); title.textContent=leg.from.name+' → '+leg.to.name;
    const summary=document.createElement('p');summary.className='transport-summary';summary.textContent=leg.mode+' · '+leg.duration;
    const note=document.createElement('p');note.textContent=leg.note;
    const link=document.createElement('a');link.href=leg.url;link.target='_blank';link.rel='noopener';link.textContent='查看這段路線 ↗';
    card.append(title,summary,note,link);return card;
  }
  function drawTransport() {
    transport.replaceChildren();
    for(let day=1;day<=6;day++) {
      if(selected!=='all'&&selected!==day) continue;
      const group=document.createElement(selected==='all'?'details':'div');
      const title=document.createElement(selected==='all'?'summary':'h4');title.textContent='Day '+day+' · 逐站交通';
      const legs=document.createElement('ol');legs.className='transport-legs';
      window.tripTransportLegs(day).forEach(leg=>legs.append(transportCard(leg)));
      group.append(title,legs);transport.append(group);
    }
  }
  let map, layer, tileLayer, selected = 'all', loading = false;
  const colors = ['#a44832', '#426b59', '#2c668e', '#825c91', '#9b6b21', '#555f69'];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const labels = ['博多／中洲', '白金／大濠／teamLab／天神', '相島＋住吉晚餐', '八女＋平尾晚餐', '太宰府＋千代壽司晚餐', '酒店→國內線→國際線'];
  const stopData = () => window.tripMapStops();
  function popupNode(visits) {
    const root = document.createElement('div');
    const title = document.createElement('strong'); title.textContent = visits[0].name; root.append(title);
    const info = document.createElement('p'); info.textContent = visits.map(v => `Day ${v.day} · ${v.time} · ${v.order}`).join(' ／ '); root.append(info);
    if (visits[0].area) { const note = document.createElement('p'); note.textContent = '區域代表位置，實際停留按當日安排。'; root.append(note); }
    const link = document.createElement('a'); link.href = window.tripGoogleUrl(visits[0]); link.target = '_blank'; link.rel = 'noopener'; link.textContent = 'Google Maps 導航 ↗'; root.append(link);
    return root;
  }
  function draw() {
    const data = stopData();
    const visits = data.filter(s => selected === 'all' || s.day === selected);
    allButton.setAttribute('aria-pressed', String(selected === 'all'));
    document.querySelectorAll('.day-jump a').forEach(a => {
      const active = Number(a.hash.slice(4)) === selected;
      if (active) a.setAttribute('aria-current', 'date'); else a.removeAttribute('aria-current');
    });
    heading.textContent = selected === 'all' ? '六日地圖總覽' : `Day ${selected} · ${labels[selected - 1]}`;
    drawTransport();
    panel.dataset.selectedDay = String(selected);
    list.replaceChildren();
    const numbered = [];
    for (let day = 1; day <= 6; day++) {
      visits.filter(s => s.day === day).forEach((stop, i) => {
        const item = { ...stop, order: i + 1 }; numbered.push(item);
        const li = document.createElement('li');
        const a = document.createElement('a'); a.href = window.tripGoogleUrl(item); a.target = '_blank'; a.rel = 'noopener';
        a.textContent = `${selected === 'all' ? `Day ${day} · ` : ''}${item.time} · ${i + 1} ${item.name}`;
        li.append(a); list.append(li);
      });
    }
    if (!map) return;
    layer.clearLayers();
    if (numbered.length) {
      map.invalidateSize();
      map.fitBounds(L.latLngBounds(numbered.map(s => [s.lat, s.lng])), { padding: [48, 64], maxZoom: 15, animate: false });
    }
    const boxes = [];
    for (let day = 1; day <= 6; day++) {
      const route = numbered.filter(s => s.day === day);
      window.tripTransportLegs(day).forEach(leg => {
        if(!route.length) return;
        const popup=document.createElement('ol');popup.className='transport-legs';popup.append(transportCard(leg));
        L.polyline([[leg.from.lat,leg.from.lng],[leg.to.lat,leg.to.lng]], {color:colors[day-1],weight:4,dashArray:'5 7',opacity:.65}).addTo(layer).bindPopup(popup);
      });
      // Merge repeat visits to the same place so return-trip labels remain readable.
      const groups = new Map();
      route.forEach(s => { const key = s.id; if (!groups.has(key)) groups.set(key, []); groups.get(key).push(s); });
      groups.forEach(group => {
        const s = group[0];
        const text = document.createElement('div'); text.className = 'map-pin'; text.style.setProperty('--pin-color', colors[day - 1]);
        const number = document.createElement('b'); number.textContent = group.map(v => v.order).join('·');
        const time = document.createElement('small'); time.textContent = s.time; text.append(number, time);
        const point = map.latLngToContainerPoint([s.lat, s.lng]);
        let dx = -36, dy = -38;
        // Spread nearby labels so each remains tappable at the fitted overview zoom.
        const offsets = [[0,0],[76,0],[-76,0],[0,50],[0,-50],[76,50],[-76,50],[76,-50],[-76,-50],[0,100],[0,-100]];
        for (const [x,y] of offsets) {
          const box = {x:point.x-36+x,y:point.y-38+y};
          if (box.x<2||box.y<2||box.x+72>map.getSize().x-2||box.y+46>map.getSize().y-2) continue;
          if (boxes.some(b=>Math.abs(b.x-box.x)<74&&Math.abs(b.y-box.y)<48)) continue;
          dx=-36+x;dy=-38+y;break;
        }
        boxes.push({x:point.x+dx,y:point.y+dy});
        if (dx!==-36||dy!==-38) L.polyline([[s.lat,s.lng],map.containerPointToLatLng([point.x+dx+36,point.y+dy+23])],{color:colors[day-1],weight:1,interactive:false}).addTo(layer);
        const marker = L.marker([s.lat, s.lng], { icon: L.divIcon({ className: 'trip-marker', html: text.outerHTML, iconSize: [72, 46], iconAnchor: [-dx, -dy] }), title: `Day ${day} ${group.map(v => v.order).join('、')} ${s.name}`, alt: s.name, riseOnHover: true }).addTo(layer);
        marker.bindPopup(popupNode(group));
      });
    }
  }
  window.addEventListener('trip:day', event => { selected = event.detail.day; draw(); });
  allButton.addEventListener('click', () => { selected = 'all'; draw(); });
  function initialize() {
    if (map || !window.L) return;
    map = L.map(panel, { dragging: !L.Browser.mobile && !matchMedia('(pointer: coarse)').matches, scrollWheelZoom: false, tap: false, zoomControl: true });
    layer = L.layerGroup().addTo(map);
    tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors' }).addTo(map);
    tileLayer.on('tileerror', () => { status.textContent = '部分圖磚未能載入；地點與導航清單仍可查看。'; });
    status.textContent = '按日期切換範圍；手機單指可捲頁，地圖用＋／－縮放。虛線只示順序，並非導航路線。';
    panel.dataset.ready = 'true'; draw();
    // Read-only public diagnostics used by interaction QA.
    window.tripMapState = () => ({ selected, bounds: map.getBounds().toBBoxString(), dragging: map.dragging.enabled(), stops: stopData().filter(s => selected === 'all' || s.day === selected) });
  }
  function load() {
    if (loading || map) return;
    if (!navigator.onLine) { status.textContent = '目前離線：地圖需要網絡，以下地點清單與六日行程仍可查看。'; return; }
    loading = true;
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css'; document.head.append(css);
    const script = document.createElement('script'); script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
    script.onload = () => { loading = false; initialize(); };
    script.onerror = () => { loading = false; status.textContent = '未能載入地圖，以下地點清單與行程仍可使用；連線後可重新開啟。'; };
    document.head.append(script);
  }
  window.addEventListener('online', load);
  window.addEventListener('offline', () => { status.textContent = '目前離線：地圖需要網絡，以下地點清單與行程仍可查看。'; });
  new ResizeObserver(() => { if (map) map.invalidateSize(); }).observe(panel);
  const initial = /^#day([1-6])$/.exec(location.hash);
  if (initial) selected = Number(initial[1]);
  else { const open = document.querySelector('.day-card.open'); if (open) selected = Number(open.id.slice(3)); }
  draw(); load();
})();

