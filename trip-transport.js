// Planning estimates checked 2026-11-19. These are not live or confirmed 2027 departures.
// Keys refer to the shared place IDs. Ordering is derived from the visible daily timeline.
window.TRIP_TRANSPORT = {
 'ohori>teamlab':['步行＋地下鐵＋步行','約35–50分鐘','湖邊步行至大濠公園站，乘空港線往唐人町，再步行約15–20分鐘到 BOSS E・ZO FUKUOKA 5樓；包含一般候車及館內上樓，13:30左右離開公園。','transit'],
 'teamlab>hotel':['步行＋地下鐵','約35–50分鐘','16:00左右離館，步行至唐人町，乘空港線往中洲川端，再步行回酒店；預留16:45左右到達，休息後才往天神。','transit'],
 'airport>hotel':['接駁巴士＋地下鐵＋步行','約35–55分鐘','國際線乘免費接駁巴士到國內線，轉空港線到中洲川端，再步行約3–5分鐘；不含入境及取行李。','transit'],
 'hotel>kushida':['步行','約12–18分鐘','沿川端方向慢行；不含午餐及入住時間。','walking'],
 'kushida>kawabata':['步行','約3–5分鐘','由神社走入川端通商店街。','walking'],
 'kawabata>canal':['步行','約10–15分鐘','經櫛田神社方向前往運河城 South Building B1；另留店內找路時間。','walking'],
 'canal>nakasu':['步行','約10–15分鐘','晚餐只標示中洲代表位置；按最終店舖調整。','walking'],
 'hotel>shirogane':['地下鐵＋步行','約25–40分鐘','中洲川端乘空港線到天神，轉七隈線天神南→藥院，再步行約10–15分鐘；含轉乘及一般候車。','transit'],
 'shirogane>ohori':['步行＋地下鐵','約35–50分鐘','步行到藥院，乘七隈線至天神南，步行轉空港線至大濠公園站，再步行入園。','transit'],
 'ohori>castle':['步行','約15–25分鐘','由湖邊走往舞鶴公園／福岡城跡；視乎起點及是否登天守台。候選景點可略過。','walking'],
 'castle>hotel':['步行＋地下鐵','約25–40分鐘','步行到赤坂站，乘空港線至中洲川端，再步行回酒店。若留在湖邊，改由大濠公園站上車。','transit'],
 'hotel>tenjin':['步行','約15–25分鐘','到天神／西鐵福岡站一帶；購物地點分散，按目的店舖微調。','walking'],
 'hotel>hakata':['步行＋地下鐵','約20–30分鐘','中洲川端乘空港線至博多；包括進站、一般候車及往JR月台步行。','transit'],
 'hakata>fukkodai':['JR鹿兒島本線','車上約17–25分鐘','選停福工大前的班次；另留5–15分鐘候車，實際依當日車次。','transit'],
 'fukkodai>shingu':['マリンクス巴士','車上約10–15分鐘','去程相らんど線第1路線，目標10:59→11:10；另留步行至站牌及候車。現行參考班表，並非2027保證車次。','transit'],
 'shingu>ainoshima':['渡船しんぐう','船程約17分鐘','目標11:30→11:47；到港後買票及候船，至少提早20分鐘。風浪可能停航。','transit'],
 'ainoshima>shingu':['渡船しんぐう','船程約17分鐘','目標16:00→16:17；15:30回碼頭候船。17:30末班只作備援，不保證有位。','transit'],
 'shingu>fukkodai':['マリンクス巴士','車上約10–15分鐘','回程相らんど線第2路線，目標16:28開出；另留候車及轉JR時間。','transit'],
 'fukkodai>hakata':['JR鹿兒島本線','車上約17–25分鐘','加候車及轉乘後，預留約17:15–17:45抵博多；依當日班次。','transit'],
 'hakata>tateru':['步行','約15–20分鐘','往住吉1-6-8；抵博多後先休息，18:30才吃晚餐，排隊另計。','walking'],
 'hotel>fukushima':['地下鐵＋JR＋堀川巴士＋步行','約100–130分鐘','中洲川端→博多；JR至羽犬塚約50–65分鐘，再乘堀川巴士約20分鐘至福島一帶，步行約5–10分鐘；含轉乘緩衝。10:00出門較合理約11:40–12:10到達，原11:15屬偏緊目標。','transit'],
 'fukushima>katsukiya':['步行','約1–3分鐘','餐廳就在福島八幡宮境內，毋須乘車。','walking'],
 'katsukiya>yame':['步行','約3–10分鐘','走往白壁老街；在老街內慢逛及額外工藝館時間另計。','walking'],
 'yame>hotel':['步行＋堀川巴士＋JR＋地下鐵','約100–130分鐘','步行至福島一帶站牌→羽犬塚→博多→中洲川端；巴士約20分鐘、JR約50–65分鐘，含一般轉乘。16:15出發約17:55–18:25到酒店，休息時間較短。','transit'],
 'hotel>agito':['步行＋西鐵＋步行','約30–45分鐘','步行至西鐵福岡（天神），乘普通列車至西鐵平尾，出站再步行約3分鐘。19:00訂位建議18:15–18:30離開酒店。','transit'],
 'tenjin>dazaifuStation':['西鐵電車／二日市轉車','約30–45分鐘','天神大牟田線→西鐵二日市→太宰府線；含一般候車及轉車，酒店出發全程仍留60–75分鐘。','transit'],
 'dazaifuStation>loop':['步行','約2–5分鐘','往宰府2-7-5，先買明太子法包。','walking'],
 'loop>tenmangu':['步行','約8–12分鐘','沿參道前往天滿宮；小店、食小食及參拜時間另計。','walking'],
 'tenmangu>tenjin':['步行＋西鐵電車','約45–65分鐘','步行回太宰府站約10–15分鐘，經西鐵二日市轉車回天神；飲茶後才出發。','transit'],
 'tenjin>hotel':['步行','約15–25分鐘','購物後返回中洲酒店；若行李或體力需要，可改空港線天神→中洲川端。','walking'],
 'hotel>sweets':['步行＋地下鐵','約30–45分鐘','中洲川端乘空港線到福岡空港（國內線），再步行至SWEETS HALL；含候車及航廈內步行。','transit'],
 'sweets>airport':['步行＋免費航廈接駁巴士','約25–40分鐘','巴士車程約10–15分鐘，另留步行及候車；12:20離開購物區，目標13:00前到國際線。','transit']
};
window.tripTransportLegs = day => {
 const stops=window.tripMapStops().filter(s=>s.day===day).filter((s,i,all)=>i===0||s.id!==all[i-1].id);
 if([2,4,5].includes(day)) stops.unshift({...window.TRIP_PLACES.hotel,id:'hotel',day,time:'酒店出發'});
 return stops.slice(1).map((to,i)=>{
  const from=stops[i], key=from.id+'>'+to.id, info=window.TRIP_TRANSPORT[key];
  if(!info) throw new Error('Missing transport estimate: '+key);
  return {day,from,to,mode:info[0],duration:info[1],note:info[2],travelmode:info[3],url:'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(from.googleQuery)+'&destination='+encodeURIComponent(to.googleQuery)+'&travelmode='+info[3]};
 });
};

