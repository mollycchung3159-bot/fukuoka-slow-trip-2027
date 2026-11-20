(() => {
  const panel = document.getElementById('tripMap');
  const status = document.getElementById('mapStatus');
  const heading = document.getElementById('mapHeading');
  const list = document.getElementById('mapStops');
  const allButton = document.getElementById('mapAll');
  const transport = document.getElementById('mapTransport');
  const strip = document.getElementById('mapStopStrip');
  let numbered = [], markers = [];
  function activate(group) {
    strip.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(group.some(v => button.dataset.key === `${v.day}-${v.order}`))));
  }
  function transportCard(leg) {
    const card=document.createElement('li');card.className='transport-leg';
    const details=document.createElement('details');
    const summary=document.createElement('summary');summary.textContent=leg.mode+' · '+leg.duration+' · '+leg.to.name+' →';
    const title=document.createElement('strong'); title.textContent=leg.from.name+' → '+leg.to.name;
    const note=document.createElement('p');note.textContent=leg.note;
    const link=document.createElement('a');link.href=leg.url;link.target='_blank';link.rel='noopener';link.textContent='查看這段路線 ↗';
    details.append(summary,title,note,link);card.append(details);return card;
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
    document.querySelector('.map-legend').hidden = selected !== 'all';
    document.querySelectorAll('.day-jump [data-day]').forEach(a => {
      a.setAttribute('aria-pressed', String(Number(a.dataset.day) === selected));
    });
    heading.textContent = selected === 'all' ? '六日地圖總覽' : `Day ${selected} · ${labels[selected - 1]}`;
    drawTransport();
    panel.dataset.selectedDay = String(selected);
    list.replaceChildren();
    numbered = []; markers = []; strip.replaceChildren();
    for (let day = 1; day <= 6; day++) {
      visits.filter(s => s.day === day).forEach((stop, i) => {
        const item = { ...stop, order: i + 1 }; numbered.push(item);
        const button=document.createElement('button');button.type='button';button.dataset.key=`${day}-${item.order}`;button.setAttribute('aria-pressed','false');
        button.textContent=`${selected==='all'?`Day ${day} · `:''}${item.order} ${item.name}`;
        button.addEventListener('click',()=>{const entry=markers.find(m=>m.group.some(v=>v.day===day&&v.order===item.order));if(entry){map.flyTo(entry.marker.getLatLng(),Math.max(map.getZoom(),14),{animate:!reducedMotion,duration:.35});entry.marker.openPopup();activate(entry.group);}});
        strip.append(button);
        const li = document.createElement('li');
        const a = document.createElement('a'); a.href = window.tripGoogleUrl(item); a.target = '_blank'; a.rel = 'noopener';
        a.textContent = `${selected === 'all' ? `Day ${day} · ` : ''}${item.time} · ${i + 1} ${item.name}`;
        li.append(a); list.append(li);
      });
    }
    if (!map) return;
    layer.clearLayers();
    fitMap();
    const boxes = [];
    for (let day = 1; day <= 6; day++) {
      const route = numbered.filter(s => s.day === day);
      window.tripTransportLegs(day).forEach(leg => {
        if(!route.length) return;
        const popup=document.createElement('ol');popup.className='transport-legs';popup.append(transportCard(leg));
        L.polyline([[leg.from.lat,leg.from.lng],[leg.to.lat,leg.to.lng]], {color:colors[day-1],weight:3,dashArray:'5 7',opacity:.8}).addTo(layer).bindPopup(popup);
      });
      // Merge repeat visits to the same place so return-trip labels remain readable.
      const groups = new Map();
      route.forEach(s => { const key = s.id; if (!groups.has(key)) groups.set(key, []); groups.get(key).push(s); });
      groups.forEach(group => {
        const s = group[0];
        const text = document.createElement('div'); text.className = 'map-pin'; text.style.setProperty('--pin-color', colors[day - 1]);
        const number = document.createElement('b'); number.textContent = s.order; text.append(number);
        const point = map.latLngToContainerPoint([s.lat, s.lng]);
        let dx = -22, dy = -22;
        // Spread nearby labels so each remains tappable at the fitted overview zoom.
        const offsets = [[0,0],[44,0],[-44,0],[0,44],[0,-44],[44,44],[-44,44],[44,-44],[-44,-44],[88,0],[-88,0],[0,88],[0,-88],[88,44],[-88,44],[88,-44],[-88,-44]];
        for (const [x,y] of offsets) {
          const box = {x:point.x-22+x,y:point.y-22+y};
          if (box.x<2||box.y<2||box.x+44>map.getSize().x-2||box.y+44>map.getSize().y-2) continue;
          if (boxes.some(b=>Math.abs(b.x-box.x)<44&&Math.abs(b.y-box.y)<44)) continue;
          dx=-22+x;dy=-22+y;break;
        }
        boxes.push({x:point.x+dx,y:point.y+dy});
        if (dx!==-22||dy!==-22) L.polyline([[s.lat,s.lng],map.containerPointToLatLng([point.x+dx+22,point.y+dy+22])],{color:colors[day-1],weight:1,interactive:false}).addTo(layer);
        const marker = L.marker([s.lat, s.lng], { icon: L.divIcon({ className: 'trip-marker', html: text.outerHTML, iconSize: [44, 44], iconAnchor: [-dx, -dy] }), title: `Day ${day} ${group.map(v => v.order).join('、')} ${s.name}`, alt: s.name, riseOnHover: true }).addTo(layer);
        marker.bindPopup(popupNode(group));
        marker.on('click',()=>activate(group));markers.push({marker,group});
      });
    }
  }
  function fitMap() {
    if(!map||!numbered.length)return;
    map.invalidateSize({pan:false});
    map.fitBounds(L.latLngBounds(numbered.map(s=>[s.lat,s.lng])),{padding:[40,40],maxZoom:15,animate:false});
  }
  window.addEventListener('trip:day', event => { selected = event.detail.day; draw(); });
  allButton.addEventListener('click', () => { selected = 'all'; history.replaceState(null,'','#itinerary'); draw(); });
  function initialize() {
    if (map || !window.L) return;
    map = L.map(panel, { dragging: !L.Browser.mobile && !matchMedia('(pointer: coarse)').matches, scrollWheelZoom: false, tap: false, zoomControl: false });
    L.control.zoom({position:'bottomright'}).addTo(map);
    layer = L.layerGroup().addTo(map);
    // CARTO now requires an account-issued key; use muted OSM without a broken key watermark.
    tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, className:'muted-basemap', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · 虛線只示順序，並非導航路線' }).addTo(map);
    tileLayer.on('tileerror', () => { status.textContent = '部分圖磚未能載入；地點與導航清單仍可查看。'; });
    status.textContent = '按日期切換；點數字或下方站點查看時間與導航。手機可單指捲頁。';
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
  let resizeTimer;
  new ResizeObserver(() => { clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(map)draw();},120); }).observe(panel);
  new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)&&map)draw();},{threshold:.1}).observe(panel);
  const initial = /^#day([1-6])$/.exec(location.hash);
  if (initial) selected = Number(initial[1]);
  else { const open = document.querySelector('.day-card.open'); if (open) selected = Number(open.id.slice(3)); }
  draw(); load();
})();