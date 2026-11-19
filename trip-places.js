// Google Maps place/Plus Code checked 2026-11-19. Area markers are representative points.
// Hotel identity, address and coordinates are maintained only here.
window.TRIP_HOTEL = {
  name: '東急博多卓越', japaneseName: '博多エクセルホテル東急', status: '暫定／未訂',
  address: '〒810-0801 福岡県福岡市博多区中洲4-6-7', phone: '092-262-0109',
  plusCode: 'HCV4+33', googleQuery: '博多エクセルホテル東急'
};
// All short Plus Codes share the Fukuoka 8Q5G prefix. Cell centre precision ~14 m.
function tripDecodePlus(shortCode) {
  const alphabet = '23456789CFGHJMPQRVWX';
  const code = ('8Q5G' + shortCode).replace('+', '');
  let lat = -90, lng = -180, resolution = 20;
  for (let i = 0; i < 10; i += 2) {
    lat += alphabet.indexOf(code[i]) * resolution;
    lng += alphabet.indexOf(code[i + 1]) * resolution;
    if (i < 8) resolution /= 20;
  }
  return { lat: lat + resolution / 2, lng: lng + resolution / 2 };
}
const place = (name, type, plusCode, googleQuery = name) => ({ name, type, ...tripDecodePlus(plusCode), googleQuery, googlePlusCode: plusCode });
window.TRIP_PLACES = {
  hotel: { ...place(window.TRIP_HOTEL.name + '（暫定）', '酒店', window.TRIP_HOTEL.plusCode, window.TRIP_HOTEL.googleQuery) },
  airport: { name: '福岡機場國際航廈', type: '交通', lat: 33.584404, lng: 130.4438232, googleQuery: 'Fukuoka Airport International Terminal 739 Aoki' },
  sweets: { name: '國內線 SWEETS HALL', type: '景點', lat: 33.5975372, lng: 130.4476183, googleQuery: '福岡空港 SWEETS HALL' },
  kushida: place('櫛田神社', '景點', 'HCV6+55'),
  kawabata: place('川端通商店街', '景點', 'HCV5+C8'),
  canal: place('Canal City 一番賞（運河城內）', '景點', 'HCQ6+V9', '一番くじ公式ショップ キャナルシティ博多店'),
  nakasu: { name: '中洲／川端晚餐區（屋台候補）', type: '餐廳', lat: 33.5899407, lng: 130.4089399, googleQuery: '中洲屋台', area: true },
  shirogane: place('白金茶房', '餐廳', 'HCH4+85'),
  ohori: place('大濠公園', '景點', 'H9PG+FH'),
  teamlab: { name: 'teamLab Forest Fukuoka（E・ZO 5F）', type: '景點', lat:33.5954597, lng:130.3637533, googleQuery:'teamLab Forest Fukuoka BOSS E ZO FUKUOKA' },
  castle: place('舞鶴公園／福岡城跡（候選）', '景點', 'H9PM+37', '福岡城跡'),
  tenjin: { name: '天神／西鐵福岡站一帶', type: '交通', lat: 33.5886887, lng: 130.3999665, googleQuery: '西鉄福岡 天神駅', area: true },
  hakata: place('JR博多站', '交通', 'HCQC+V7', '博多駅'),
  fukkodai: place('JR福工大前站', '交通', 'MCXR+92', '福工大前駅'),
  shingu: { name: '新宮港／相島渡船場', type: '交通', lat: 33.7178711, lng: 130.4238084, googleQuery: '相島渡船新宮待合所' },
  ainoshima: { ...place('相島港與聚落散步', '景點', 'Q947+VP', '相島渡船待合所'), area: true },
  tateru: place('博多鶏soba 建 TATERU', '餐廳', 'HCR6+C3'),
  fukushima: place('福島八幡宮', '景點', '6H55+JP', '福島八幡宮 八女'),
  katsukiya: place('かつきや 八女本店', '餐廳', '6H55+PQ'),
  yame: { ...place('八女福島白壁老街', '景點', '6H55+XF', '八女福島の町並み'), area: true },
  agito: place('AGITO HIRAO', '餐廳', 'HCF3+8Q'),
  dazaifuStation: place('太宰府站', '交通', 'GG9J+JH', '太宰府駅'),
  loop: place('Loop a Bread', '餐廳', 'GG9J+JV', 'Loop a Bread Dazaifu'),
  tenmangu: place('太宰府天滿宮／參道', '景點', 'GGCM+GW', '太宰府天満宮')
};
window.tripGoogleUrl = (stop) => 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(stop.googleQuery) + '&travelmode=walking';
document.querySelectorAll('[data-hotel-name]').forEach(el => { el.textContent = window.TRIP_HOTEL.name; });
document.querySelectorAll('[data-hotel-japanese]').forEach(el => { el.textContent = window.TRIP_HOTEL.japaneseName; });
document.querySelectorAll('[data-hotel-address]').forEach(el => { el.textContent = window.TRIP_HOTEL.address; });
document.querySelectorAll('[data-hotel-phone]').forEach(el => { el.textContent = window.TRIP_HOTEL.phone; el.href = 'tel:+81' + window.TRIP_HOTEL.phone.replace(/-/g, '').slice(1); });
document.querySelectorAll('[data-hotel-status]').forEach(el => { el.textContent = window.TRIP_HOTEL.status; });
document.querySelectorAll('[data-hotel-map]').forEach(el => { el.href = window.tripGoogleUrl(window.TRIP_PLACES.hotel); });
// Timeline time, day and stop order are read from the same visible itinerary, never duplicated.
window.tripMapStops = () => [...document.querySelectorAll('.day-card .timeline li[data-stops]')].flatMap(li => li.dataset.stops.split(' ').filter(Boolean).map(id => ({
  ...window.TRIP_PLACES[id], id,
  day: Number(li.closest('.day-card').id.slice(3)), time: li.querySelector('time').textContent.trim()
})));

