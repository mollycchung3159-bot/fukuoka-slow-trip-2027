(() => {
  const panel=document.getElementById('tripMap'),status=document.getElementById('mapStatus'),heading=document.getElementById('mapHeading'),list=document.getElementById('mapStops'),strip=document.getElementById('mapStopStrip'),transport=document.getElementById('mapTransport'),context=document.getElementById('mapContext');
  const colors=['#a44832','#426b59','#2c668e','#825c91','#8b5e19','#555f69'];
  const labels=['博多／中洲','白金／大濠／teamLab／天神','相島＋住吉晚餐','八女＋平尾晚餐','太宰府＋千代壽司晚餐','酒店→國內線→國際線'],shortLabels=['博多／中洲','福岡市內','相島','八女','太宰府','機場'];
  const focusIds=[['hotel','kushida','kawabata','canal','nakasu'],['shirogane','ohori','teamlab','tenjin'],['ainoshima'],['fukushima','katsukiya','yame'],['loop','tenmangu'],['sweets','airport']];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let selected=1,map,layer,loading=false,rendering=false,numbered=[],markers=[],summaryMarkers=[],focusedStop=null,overviewAnchors=[];
  const stops=()=>window.tripMapStops(),core=day=>stops().filter(s=>s.day===day&&focusIds[day-1].includes(s.id));
  function select(day){window.tripSelectDay(day);}
  function activate(group){let first;strip.querySelectorAll('button').forEach(b=>{const active=group.some(v=>b.dataset.key===v.key);b.setAttribute('aria-pressed',String(active));if(active&&!first)first=b;});if(first)strip.scrollTo({left:first.offsetLeft-strip.offsetLeft-8,behavior:reduced?'instant':'smooth'});}
  function transportCard(leg){
    const item=document.createElement('li');item.className='transport-leg';const detail=document.createElement('details'),summary=document.createElement('summary'),title=document.createElement('strong'),note=document.createElement('p'),link=document.createElement('a');
    summary.textContent=`${leg.mode} · ${leg.duration} · ${leg.to.name} →`;title.textContent=leg.from.name+' → '+leg.to.name;note.textContent=leg.note;link.href=leg.url;link.target='_blank';link.rel='noopener';link.textContent='查看這段路線 ↗';detail.append(summary,title,note,link);item.append(detail);return item;
  }
  function drawTransport(){transport.replaceChildren();for(let day=1;day<=6;day++){if(selected!=='all'&&selected!==day)continue;const group=document.createElement(selected==='all'?'details':'div'),title=document.createElement(selected==='all'?'summary':'h4'),legs=document.createElement('ol');title.textContent=`Day ${day} · 逐站交通`;legs.className='transport-legs';window.tripTransportLegs(day).forEach(leg=>legs.append(transportCard(leg)));group.append(title,legs);transport.append(group);}}
  function popup(group){
    const root=document.createElement('div'),title=document.createElement('strong'),visits=document.createElement('ul');title.textContent=group[0].name;visits.className='map-visit-list';root.append(title);
    group.forEach(v=>{const row=document.createElement('li'),time=document.createElement('b'),action=document.createElement('span');time.textContent=`${v.id==='hotel'?'🏨':`第${v.order}站`} · ${v.time}`;action.textContent=v.label||v.name;row.append(time,action);visits.append(row);});root.append(visits);
    if(group[0].area){const note=document.createElement('p');note.textContent='區域代表位置，實際停留按當日安排。';root.append(note);}const link=document.createElement('a');link.href=window.tripGoogleUrl(group[0]);link.target='_blank';link.rel='noopener';link.textContent='Google Maps 導航 ↗';root.append(link);return root;
  }
  const popupOptions={maxWidth:260,maxHeight:220,autoPanPaddingTopLeft:[16,16],autoPanPaddingBottomRight:[16,44],keepInView:true};
  function locate(item){
    const entry=markers.find(m=>m.group.some(v=>v.key===item.key));if(!map||!entry)return;
    markers.forEach(m=>{if(!focusIds[selected-1].includes(m.group[0].id))layer.removeLayer(m.marker);});
    entry.marker.addTo(layer);focusedStop=item.id;map.setView(entry.marker.getLatLng(),16,{animate:false});entry.marker.openPopup();activate(entry.group);drawContext();
  }
  const contextNames={hotel:'🏨 酒店',airport:'✈ 機場',hakata:'🚉 博多站',tenjin:'🚉 天神站',fukkodai:'🚉 福工大前',shingu:'⛴ 新宮港',tateru:'🍜 晚餐 · 住吉',agito:'🥩 晚餐 · 平尾',sushiemon:'🍣 晚餐 · 千代／博多',dazaifuStation:'🚉 太宰府站'};
  function drawContext(){
    context.replaceChildren();context.hidden=selected==='all';if(selected==='all')return;
    context.setAttribute('aria-label','當日其他站點方向與返回範圍');
    if(focusedStop){const back=document.createElement('button');back.type='button';back.className='map-return';back.textContent='↩ 返回當日範圍';back.addEventListener('click',()=>{map?.closePopup();drawMap();drawContext();});context.append(back);}
    const group=new Map();numbered.filter(s=>!focusIds[selected-1].includes(s.id)).forEach(s=>{if(!group.has(s.id))group.set(s.id,s);});
    const points=core(selected),center={lat:(Math.min(...points.map(s=>s.lat))+Math.max(...points.map(s=>s.lat)))/2,lng:(Math.min(...points.map(s=>s.lng))+Math.max(...points.map(s=>s.lng)))/2};
    for(const item of group.values()){
      const angle=Math.atan2((item.lng-center.lng)*Math.cos(center.lat*Math.PI/180),item.lat-center.lat),arrow=['↑','↗','→','↘','↓','↙','←','↖'][(Math.round(angle/(Math.PI/4))+8)%8];
      const b=document.createElement('button');b.type='button';b.dataset.stopId=item.id;b.textContent=`${contextNames[item.id]||item.name} ${arrow}`;b.title=`由${shortLabels[selected-1]}主要區域望向${item.name}；點擊查看`;
      b.setAttribute('aria-label',b.title);b.setAttribute('aria-pressed',String(focusedStop===item.id));b.addEventListener('click',()=>locate(item));context.append(b);
    }
    if(!context.childElementCount)context.hidden=true;
  }
  function draw(){
    document.getElementById('mapAll').setAttribute('aria-pressed',String(selected==='all'));document.querySelectorAll('.day-jump [data-day]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.day===selected)));document.querySelector('.map-legend').hidden=selected!=='all';heading.textContent=selected==='all'?'六日地圖總覽':`Day ${selected} · ${labels[selected-1]}`;panel.dataset.selectedDay=selected;strip.replaceChildren();list.replaceChildren();numbered=[];
    for(let day=1;day<=6;day++){let order=0;stops().filter(s=>s.day===day).forEach((s,i)=>{if(s.id!=='hotel')order++;if(selected!=='all'&&day!==selected)return;const item={...s,order:s.id==='hotel'?null:order,key:`${day}-${i}`};numbered.push(item);const li=document.createElement('li'),a=document.createElement('a');a.href=window.tripGoogleUrl(s);a.target='_blank';a.rel='noopener';a.textContent=`Day ${day} · ${s.time} · ${s.id==='hotel'?'🏨':order} ${s.name}`;li.append(a);list.append(li);if(selected==='all')return;const b=document.createElement('button');b.type='button';b.dataset.key=item.key;b.textContent=`${s.id==='hotel'?'🏨':order} ${s.name}`;b.title=`${s.time} · ${s.name}`;b.setAttribute('aria-label',b.title);b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>locate(item));strip.append(b);});}
    if(selected==='all')for(let day=1;day<=6;day++){const b=document.createElement('button');b.type='button';b.textContent=`Day ${day} · ${shortLabels[day-1]}`;b.addEventListener('click',()=>select(day));strip.append(b);}
    document.getElementById('mapFocusNote').textContent=selected==='all'?'每個標記代表一日；細線連到當日代表景點或機場位置，點擊查看詳情。':`先看${shortLabels[selected-1]}主要區域；邊緣方向提示及站點列可切到其他交通、酒店或晚餐。`;drawTransport();drawMap();drawContext();
  }
  function drawMap(fit=true){
    if(fit)focusedStop=null;if(!map)return;rendering=true;layer.clearLayers();markers=[];summaryMarkers=[];overviewAnchors=[];map.invalidateSize({pan:false});
    if(selected==='all'){
      const representativeIds=['nakasu','ohori','ainoshima','fukushima','tenmangu','airport'];
      const centers=representativeIds.map((id,i)=>({day:i+1,id,point:L.latLng(window.TRIP_PLACES[id].lat,window.TRIP_PLACES[id].lng)}));if(fit)map.fitBounds(L.latLngBounds(centers.map(s=>s.point)),{padding:[58,65],maxZoom:12,animate:false});const boxes=[];
      for(const {day,id,point} of centers){const p=map.latLngToContainerPoint(point),candidates=[];for(let y=4;y<=map.getSize().y-56;y+=56)for(let x=4;x<=map.getSize().x-100;x+=100)candidates.push({x,y});candidates.sort((a,b)=>Math.hypot(a.x+48-p.x,a.y+24-p.y)-Math.hypot(b.x+48-p.x,b.y+24-p.y));
        const free=a=>!boxes.some(b=>Math.abs(a.x-b.x)<98&&Math.abs(a.y-b.y)<54);
        const avoidsOrigins=a=>centers.every(c=>{const q=map.latLngToContainerPoint(c.point);return q.x<a.x-8||q.x>a.x+104||q.y<a.y-8||q.y>a.y+58;});
        const pos=candidates.find(a=>free(a)&&avoidsOrigins(a))||candidates.find(free)||candidates[0];boxes.push(pos);
        const labelCenter=map.containerPointToLatLng([pos.x+48,pos.y+25]);
        L.polyline([point,labelCenter],{color:colors[day-1],weight:1.5,opacity:.85,interactive:false,className:'overview-connector'}).addTo(layer);
        L.circleMarker(point,{radius:3,color:'#fff',weight:1,fillColor:colors[day-1],fillOpacity:1,interactive:false,className:'overview-origin'}).addTo(layer);
        overviewAnchors.push({day,id,lat:point.lat,lng:point.lng});
        const card=document.createElement('div');card.className='map-day-badge';card.style.setProperty('--pin-color',colors[day-1]);const b=document.createElement('b'),small=document.createElement('span');b.textContent=`Day ${day}`;small.textContent=shortLabels[day-1];card.append(b,small);const marker=L.marker(point,{icon:L.divIcon({className:'trip-day-marker',html:card.outerHTML,iconSize:[96,50],iconAnchor:[p.x-pos.x,p.y-pos.y]}),title:`Day ${day} · ${shortLabels[day-1]}`}).addTo(layer);marker.on('click',()=>select(day));summaryMarkers.push(marker);
      }
    }else{
      const focus=core(selected);if(fit)map.fitBounds(L.latLngBounds(focus.map(s=>[s.lat,s.lng])),{padding:[42,44],maxZoom:selected===5?15:new Set(focus.map(s=>s.id)).size===1?16:18,animate:false});const groups=new Map();numbered.forEach(v=>{if(!groups.has(v.id))groups.set(v.id,[]);groups.get(v.id).push(v);});
      // Long-distance transport remains in the list; only local legs are drawn in this regional view.
      window.tripTransportLegs(selected).forEach(leg=>{if(!focusIds[selected-1].includes(leg.from.id)||!focusIds[selected-1].includes(leg.to.id)||leg.from.id===leg.to.id)return;const content=document.createElement('ol');content.className='transport-legs';content.append(transportCard(leg));L.polyline([[leg.from.lat,leg.from.lng],[leg.to.lat,leg.to.lng]],{color:colors[selected-1],weight:3,dashArray:'5 7',opacity:.8}).addTo(layer).bindPopup(content,popupOptions);});
      groups.forEach(group=>{const s=group[0],html=document.createElement('div');html.className=s.id==='hotel'?'map-pin hotel-pin':'map-pin';html.style.setProperty('--pin-color',colors[selected-1]);html.textContent=s.id==='hotel'?'🏨':s.order;const marker=L.marker([s.lat,s.lng],{icon:L.divIcon({className:'trip-marker',html:html.outerHTML,iconSize:[44,44],iconAnchor:[22,22]}),title:`Day ${selected} · ${s.id==='hotel'?'酒店':s.order} ${s.name}`,riseOnHover:true}).bindPopup(popup(group),popupOptions);if(focusIds[selected-1].includes(s.id))marker.addTo(layer);marker.on('click',()=>activate(group));markers.push({marker,group});});
    }rendering=false;
  }
  window.addEventListener('trip:day',e=>{selected=e.detail.day;draw();});document.getElementById('mapAll').addEventListener('click',()=>select('all'));
  function initialize(){
    if(map||!window.L)return;map=L.map(panel,{dragging:!L.Browser.mobile&&!matchMedia('(pointer:coarse)').matches,scrollWheelZoom:false,touchZoom:true,zoomControl:false});L.control.zoom({position:'bottomright'}).addTo(map);layer=L.layerGroup().addTo(map);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map).on('tileerror',()=>{status.textContent='部分圖磚未能載入；地點及導航清單仍可使用。';});status.textContent='點標記或站點查看時間與導航；手機可雙指縮放、單指捲頁。';panel.dataset.ready='true';draw();map.on('zoomend',()=>{if(!rendering&&selected==='all')requestAnimationFrame(()=>drawMap(false));});
    window.tripMapState=()=>({selected,bounds:map.getBounds().toBBoxString(),zoom:map.getZoom(),dragging:map.dragging.enabled(),touchZoom:map.touchZoom.enabled(),focusIds:selected==='all'?[]:focusIds[selected-1],stops:numbered,summaryCount:summaryMarkers.length,overviewAnchors});
  }
  function load(){if(loading||map)return;if(!navigator.onLine){status.textContent='目前離線：地圖需要網絡，地點清單及行程仍可查看。';return;}loading=true;const css=document.createElement('link');css.rel='stylesheet';css.href='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';document.head.append(css);const script=document.createElement('script');script.src='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';script.onload=()=>{loading=false;initialize();};script.onerror=()=>{loading=false;status.textContent='未能載入地圖，地點清單及行程仍可使用。';};document.head.append(script);}
  window.addEventListener('online',load);window.addEventListener('offline',()=>{status.textContent='目前離線：地圖需要網絡，地點清單及行程仍可查看。';});let timer;new ResizeObserver(()=>{clearTimeout(timer);timer=setTimeout(()=>{drawMap();drawContext();},120);}).observe(panel);new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){drawMap();drawContext();}},{threshold:.1}).observe(panel);
  const query=new URLSearchParams(location.search).get('day'),hash=/^#day([1-6])$/.exec(location.hash);selected=query==='all'?'all':/^[1-6]$/.test(query||'')?+query:hash?+hash[1]:+(document.querySelector('.day-card.open')?.id.slice(3)||1);draw();load();
})();