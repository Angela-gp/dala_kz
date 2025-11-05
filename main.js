// Сияние под курсором
document.querySelectorAll('.btn').forEach(b=>{
  b.addEventListener('pointermove', e=>{
    const r = b.getBoundingClientRect();
    b.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    b.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

// Сохранение/продолжение (демо)
const cont = document.getElementById('continueBtn');
function refreshContinue(){ cont.toggleAttribute('disabled', !localStorage.getItem('steppe:save')); }
refreshContinue();

document.getElementById('startBtn').onclick = ()=>{
  localStorage.setItem('steppe:save', JSON.stringify({ ts: Date.now(), chapter: 1 }));
  refreshContinue();
  alert('Новая игра: Пролог — Странник (демо).');
};
cont.onclick = ()=> alert('Загрузка сохранения… (демо)');

// Модалка настроек (минимально из примера)
const settingsBtn = document.getElementById('settingsBtn');
settingsBtn.addEventListener('click', ()=>{
  const dlg = document.createElement('dialog');
  dlg.innerHTML = `
    <div class="modal-hd"><h3>Настройки</h3><button class="ghost" id="x">Закрыть</button></div>
    <div class="modal-bd">
      <div class="field"><label>Громкость музыки</label><input type="range" min="0" max="100" value="35"></div>
      <div class="field"><label>Полноэкранный режим</label><button class="ghost" id="fs">Переключить</button></div>
    </div>
    <div class="modal-ft"><button class="ghost" id="save">Сохранить</button></div>`;
  document.body.appendChild(dlg);
  dlg.showModal();
  dlg.querySelector('#x').onclick = ()=> dlg.close();
  dlg.querySelector('#save').onclick = ()=> dlg.close();
  dlg.querySelector('#fs').onclick = async ()=>{
    if(!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };
  dlg.addEventListener('close', ()=> dlg.remove());
});

// Музыка (опционально)
const bgm = document.getElementById('bgm');

// ====== Магазин: выезжающая панель и контент ======
(() => {
  const storeBtn    = document.getElementById('storeBtn');
  const backdrop    = document.getElementById('storeBackdrop');
  const store       = document.getElementById('store');
  const storeBody   = document.getElementById('storeBody');
  const storeClose  = document.getElementById('storeClose');

  if(!storeBtn || !backdrop || !store || !storeBody || !storeClose) return;

  let rendered = false;

  const packsData = {
    starter: {
      title: 'Стартовый набор',
      price: '₸1 990',
      features: ['Бустер ресурсов ×1','Оружие: «Кинжал степи»','Талисман «Беркут» (иконка)'],
      items: [
        { img: 'starter_booster.jpg',  title: 'Бустер ресурсов ×1',    price: '₸690' },
        { img: 'starter_dagger.jpg',   title: 'Кинжал степи',         price: '₸890' },
        { img: 'starter_talisman.jpg', title: 'Талисман «Беркут»',    price: '₸590' }
      ],
      desc: 'Быстрый старт без гринда: мягкий буст экономики и ранний доступ к первому оружию.'
    },
    standard: {
      title: 'Стандартный набор',
      price: '₸4 990',
      features: ['Бустер ресурсов ×3','Конь: «Сары-Арқа» (скин)','Оружие: «Сабля Отырар»','Ранний доступ к событию'],
      items: [
        { img: 'standard_boosters.jpg', title: 'Бустер ресурсов ×3',  price: '₸1 490' },
        { img: 'standard_horse.jpg',    title: 'Скин коня «Сары-Арқа»', price: '₸2 490' },
        { img: 'standard_sabre.jpg',    title: 'Сабля «Отырар»',      price: '₸1 990' }
      ],
      desc: 'Ускорение прогресса на 1–2 главы вперёд + эксклюзивный конь и сабля.'
    },
    skins: {
      title: 'Коллекция скинов',
      price: 'от ₸990',
      features: ['Всадник «Золото степи»','Беркут «Небесный»','Доспех «Караханид»'],
      items: [
        { img: 'skins_rider.jpg',  title: 'Всадник «Золото степи»', price: '₸1 490' },
        { img: 'skins_eagle.jpg',  title: 'Беркут «Небесный»',      price: '₸990'  },
        { img: 'skins_armor.jpg',  title: 'Доспех «Караханид»',     price: '₸1 990'}
      ],
      desc: 'Полная визуальная кастомизация героя, беркута и доспехов (без игрового преимущества).'
    }
  };

  function card(key, tagText, tagPro=false){
    const p = packsData[key];
    return `
      <div class="pack pack--${key}">
        <div class="pack-hd">
          <span class="tag ${tagPro ? 'tag--pro' : ''}">${tagText}</span>
          <span class="price">${p.price}</span>
        </div>
        <ul class="pack-list">
          ${p.features.map(f=>`<li>${f}</li>`).join('')}
        </ul>
        <div class="pack-actions">
          <button class="btn more" data-pack="${key}">Подробнее</button>
          <button class="btn buy"  data-pack="${key}">Купить</button>
        </div>
      </div>
    `;
  }

  function renderPacksOnce(){
    if(rendered) return;
    storeBody.innerHTML =
      card('starter','Стартовый') +
      card('standard','Стандарт', true) +
      card('skins','Скины');

    // обработчики Купить
    storeBody.querySelectorAll('.buy').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const pk = btn.dataset.pack;
        alert(`Покупка: ${packsData[pk].title} (демо).`);
      });
    });

    // обработчики Подробнее (модалка с 3 карточками)
    const dlg     = document.getElementById('packDialog');
    const titleEl = document.getElementById('packTitle');
    const contEl  = document.getElementById('packContent');
    const buyEl   = document.getElementById('packBuy');
    const closeEl = document.getElementById('packClose');
    let currentPack = null;

    function placeholder(img){
      // Если файла нет — показываем мягкую заглушку
      return `<div class="item-img" style="display:flex;align-items:center;justify-content:center;font-size:12px;opacity:.7">no image</div>`;
    }

    function openPackDetails(key){
  currentPack = key;
  const p = packsData[key];
  titleEl.textContent = (key === 'skins') ? 'Коллекция скинов' : p.title;

  // ряд маленьких карточек
  const itemsHTML = p.items.map(it => `
    <div class="item-chip">
      <img src="${it.img}" alt="${it.title}">
      <div class="item-title">${it.title}</div>
      <div class="item-price">${it.price}</div>
      <button class="item-buy" data-item="${it.title}">Купить</button>
    </div>
  `).join('');

  contEl.innerHTML = `
    <p style="margin:0 0 10px; color:#dbe4ff">${p.desc}</p>
    <div class="items-row">${itemsHTML}</div>
  `;
  buyEl.textContent = (key==='skins') ? 'Открыть коллекцию' : 'Купить набор';
  dlg.showModal();

  // обработчики мини-кнопок «Купить»
  contEl.querySelectorAll('.item-buy').forEach(b=>{
    b.addEventListener('click', ()=>{
      alert('Покупка: ' + b.dataset.item + ' (демо).');
    });
  });
}

    storeBody.querySelectorAll('.more').forEach(btn=>{
      btn.addEventListener('click', ()=> openPackDetails(btn.dataset.pack));
    });

    closeEl.addEventListener('click', ()=> dlg.close());
    dlg.addEventListener('close', ()=> { currentPack = null; });

    buyEl.addEventListener('click', ()=>{
      if(!currentPack) return;
      alert(`Покупка: ${packsData[currentPack].title} (демо).`);
    });

    rendered = true;
  }

  function openStore(){
    renderPacksOnce();
    backdrop.hidden = false; store.hidden = false;
    requestAnimationFrame(()=>{ backdrop.setAttribute('open',''); store.setAttribute('open',''); });
  }
  function closeStore(){
    backdrop.removeAttribute('open'); store.removeAttribute('open');
    setTimeout(()=>{ backdrop.hidden = true; store.hidden = true; }, 320);
  }

  storeBtn.addEventListener('click', openStore);
  storeClose.addEventListener('click', closeStore);
  backdrop.addEventListener('click', closeStore);
  window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && !store.hidden) closeStore(); });
})();

// Параллакс героя (усилен)
(() => {
  const heroImg = document.querySelector('.heroImg');
  const shell = document.querySelector('.shell');
  if(!heroImg || !shell) return;

  function lerp(a,b,t){ return a + (b-a)*t; }
  let rx=0, ry=0, tx=0, ty=0;

  function apply(){
    heroImg.style.transform =
      `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 140px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(1.18)`;
  }

  shell.addEventListener('pointermove', (e)=>{
    const r = shell.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;

    const maxTilt = 8;    // градусов
    const maxShift = 26;  // пикселей

    ry = lerp(ry, nx * maxTilt, 0.15);
    rx = lerp(rx, -ny * maxTilt, 0.15);
    tx = lerp(tx, nx * maxShift, 0.15);
    ty = lerp(ty, ny * maxShift, 0.15);
    apply();
  });

  shell.addEventListener('pointerleave', ()=>{ rx=ry=tx=ty=0; apply(); });
})();

// Подсказка в консоли, если ключевые изображения не рядом
['fon.jpg','logop.png','character.png'].forEach(name=>{
  const img = new Image(); img.src = name;
  img.onerror = ()=> console.warn('Файл не найден рядом с index.html →', name);
});

// ==== Летопись: Пролог ====
(() => {
  const dlg   = document.getElementById('chronicle');
  const close = document.getElementById('chronClose');
  const card  = document.getElementById('chronCard');
  const btnCheck = document.getElementById('chronCheck');
  const btnReset = document.getElementById('chronReset');
  const inputs = () => Array.from(dlg.querySelectorAll('.blank'));

  if(!dlg) return;

  // нормализация: убираем пробелы, приводим к нижнему, е=ё
  const norm = s => (s||'').toString().trim().toLowerCase()
    .replaceAll('ё','е');

  function checkAll(){
    let allOk = true;
    inputs().forEach(inp=>{
      const okList = (inp.dataset.answers||'').split('|').map(norm);
      const isOk = okList.includes(norm(inp.value));
      inp.classList.toggle('ok', isOk);
      inp.classList.toggle('bad', !isOk && inp.value.length>0);
      allOk = allOk && isOk;
    });
    card.classList.remove('state-ok','state-bad');
    card.classList.add(allOk ? 'state-ok' : 'state-bad');
  }

  function resetAll(){
    inputs().forEach(inp=> inp.value = '');
    inputs().forEach(inp=> inp.classList.remove('ok','bad'));
    card.classList.remove('state-ok','state-bad');
  }

  // Кнопки
  btnCheck.addEventListener('click', checkAll);
  btnReset.addEventListener('click', resetAll);
  close.addEventListener('click', ()=> dlg.close());

  // Открываем летопись после «Начать новую игру»
  const startBtn = document.getElementById('startBtn');
  const contBtn  = document.getElementById('continueBtn');

  function openChronicle(){
    resetAll();
    dlg.showModal();
  }

  // Переподключаем старт: сохраняем и открываем хронику
  if(startBtn){
    startBtn.onclick = ()=>{
      localStorage.setItem('steppe:save', JSON.stringify({ ts: Date.now(), chapter: 1 }));
      refreshContinue && refreshContinue();
      openChronicle();
    };
  }
  // Для «Продолжить» тоже можно показать (демо)
  if(contBtn){
    contBtn.onclick = ()=> openChronicle();
  }
})();
