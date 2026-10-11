import { ALL_BREEDS, GROOMING_LEVEL_LABELS, type BreedInfo } from '../src/data/breedData';
import { layout, ctaBox, esc, SITE, img, credit, crumbs } from './layout';

// Proper Bulgarian names + URL slugs. The app's breed data keeps loose aliases for matching
// user input ("Чао Чао", "Малтезе"), which aren't what people search for.
const DISPLAY: Record<string, { name: string; slug: string }> = {
  'German Shepherd': { name: 'Немска овчарка', slug: 'nemska-ovcharka' },
  'Labrador Retriever': { name: 'Лабрадор ретривър', slug: 'labrador-retrivar' },
  'Golden Retriever': { name: 'Голдън ретривър', slug: 'goldan-retrivar' },
  Rottweiler: { name: 'Ротвайлер', slug: 'rotvayler' },
  Doberman: { name: 'Доберман', slug: 'doberman' },
  Poodle: { name: 'Пудел', slug: 'pudel' },
  'Miniature Poodle': { name: 'Мини пудел', slug: 'mini-pudel' },
  'French Bulldog': { name: 'Френски булдог', slug: 'frenski-buldog' },
  Bulldog: { name: 'Английски булдог', slug: 'angliyski-buldog' },
  'Siberian Husky': { name: 'Сибирско хъски', slug: 'sibirsko-haski' },
  Beagle: { name: 'Бийгъл', slug: 'biygal' },
  'Border Collie': { name: 'Бордър коли', slug: 'bordar-koli' },
  'Shih Tzu': { name: 'Ши тцу', slug: 'shi-tsu' },
  'Yorkshire Terrier': { name: 'Йоркширски териер', slug: 'yorkshirski-terier' },
  Maltese: { name: 'Малтийска болонка', slug: 'maltiyska-bolonka' },
  Dachshund: { name: 'Дакел (такса)', slug: 'dakel-taksa' },
  Boxer: { name: 'Боксер', slug: 'bokser' },
  'Great Dane': { name: 'Немски дог', slug: 'nemski-dog' },
  'Cocker Spaniel': { name: 'Кокер шпаньол', slug: 'koker-shpanyol' },
  'Jack Russell Terrier': { name: 'Джак ръсел териер', slug: 'dzhak-rasel-terier' },
  Chihuahua: { name: 'Чихуахуа', slug: 'chihuahua' },
  Pomeranian: { name: 'Померан', slug: 'pomeran' },
  'Cane Corso': { name: 'Кане корсо', slug: 'kane-korso' },
  'Bernese Mountain Dog': { name: 'Бернско планинско куче', slug: 'bernsko-planinsko-kuche' },
  'Australian Shepherd': { name: 'Австралийска овчарка', slug: 'avstraliyska-ovcharka' },
  'Cavalier King Charles Spaniel': { name: 'Кавалер Кинг Чарлз шпаньол', slug: 'kavaler-king-charlz-shpanyol' },
  'Miniature Schnauzer': { name: 'Миниатюрен шнауцер', slug: 'miniatyuren-shnaucer' },
  'Alaskan Malamute': { name: 'Аляски маламут', slug: 'alyaski-malamut' },
  'Saint Bernard': { name: 'Санбернар', slug: 'sanbernar' },
  Samoyed: { name: 'Самоед', slug: 'samoed' },
  Dalmatian: { name: 'Далматинец', slug: 'dalmatinec' },
  Weimaraner: { name: 'Ваймаранер', slug: 'vaymaraner' },
  Bullmastiff: { name: 'Булмастиф', slug: 'bulmastif' },
  'Chow Chow': { name: 'Чау-чау', slug: 'chau-chau' },
  'Shar-Pei': { name: 'Шар пей', slug: 'shar-pey' },
  'American Staffordshire Terrier': { name: 'Американски стафордширски териер', slug: 'amerikanski-stafordshirski-terier' },
  Akita: { name: 'Акита ину', slug: 'akita-inu' },
  'Bichon Frise': { name: 'Бишон фризе', slug: 'bishon-frize' },
};

const SIZE_BG: Record<BreedInfo['size'], string> = {
  toy: 'миниатюрна', small: 'малка', medium: 'средна', large: 'едра', giant: 'гигантска',
};
const TRAIN_BG: Record<BreedInfo['trainability'], string> = {
  easy: 'лесна', moderate: 'умерена', challenging: 'трудна',
};
const SIZE_LEVEL: Record<BreedInfo['size'], number> = { toy: 1, small: 2, medium: 3, large: 4, giant: 5 };
const EXERCISE_LEVEL: Record<BreedInfo['exerciseLevel'], number> = { low: 2, moderate: 3, high: 4, 'very-high': 5 };
const GROOM_LEVEL: Record<BreedInfo['groomingFrequency'], number> = { minimal: 1, occasional: 2, regular: 3, frequent: 4, intensive: 5 };
const TRAIN_LEVEL: Record<BreedInfo['trainability'], number> = { easy: 5, moderate: 3, challenging: 2 };

export interface BreedPage { breed: BreedInfo; name: string; slug: string; path: string }

export const breedPages = (): BreedPage[] =>
  ALL_BREEDS.map(breed => {
    const d = DISPLAY[breed.names[0]];
    if (!d) throw new Error(`No SEO display name for breed "${breed.names[0]}"`);
    return { breed, name: d.name, slug: d.slug, path: `/porodi/${d.slug}/` };
  }).sort((a, b) => a.name.localeCompare(b.name, 'bg'));

const range = ([a, b]: [number, number], unit: string) => (a === b ? `${a} ${unit}` : `${a}–${b} ${unit}`);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const meter = (label: string, level: number, note: string) =>
  `<div class="meter"><b>${esc(label)}</b><div class="bar">${[1, 2, 3, 4, 5]
    .map(i => `<i class="${i <= level ? 'on' : ''}"></i>`).join('')}</div><small>${esc(note)}</small></div>`;

const weightRow = (label: string, [min, max]: [number, number], scaleMax: number) =>
  `<div class="row"><span>${label}</span><div class="track"><div class="range" style="left:${((min / scaleMax) * 100).toFixed(1)}%;` +
  `width:${Math.max(((max - min) / scaleMax) * 100, 4).toFixed(1)}%"><span>${range([min, max], 'кг')}</span></div></div></div>`;

/** Card thumbnail: small variant only (cards are ≤ 300 px wide). */
const thumb = (key: string, alt: string) =>
  `<img src="/img/${key}-sm.jpg" alt="${esc(alt)}" width="480" height="360" loading="lazy" decoding="async">`;

const breedCard = (o: BreedPage) =>
  `<a class="pcard" href="${o.path}" data-size="${o.breed.size}" data-name="${esc(o.name.toLowerCase())}">${thumb(`porodi/${o.slug}`, o.name)}` +
  `<div class="body"><strong>${esc(o.name)}</strong><span>${range(o.breed.weightKg.male, 'кг')} · ${range(o.breed.lifespanYears, 'години')}</span>` +
  `<em class="pill">${SIZE_BG[o.breed.size]} порода</em></div></a>`;

export const renderBreedPage = (p: BreedPage, all: BreedPage[]) => {
  const b = p.breed;
  const lower = p.name.charAt(0).toLowerCase() + p.name.slice(1);
  const photoKey = `porodi/${p.slug}`;
  const description =
    `${p.name}: характер, здраве, тегло (${range(b.weightKg.male, 'кг')}), продължителност на живота ` +
    `${range(b.lifespanYears, 'г.')}, нужда от движение и грижа за козината. Наръчник на eDog.bg.`;
  const sameSize = all.filter(o => o.breed.size === b.size && o.slug !== p.slug);
  const related = (sameSize.length >= 3 ? sameSize : all.filter(o => o.slug !== p.slug)).slice(0, 3);
  const scaleMax = Math.max(b.weightKg.male[1], b.weightKg.female[1]) * 1.35;
  const groomShort = GROOMING_LEVEL_LABELS[b.groomingFrequency].bg.split(' — ')[0];
  const breadcrumbs = [
    { name: 'Начало', path: '/' },
    { name: 'Породи кучета', path: '/porodi/' },
    { name: p.name, path: p.path },
  ];

  const kidsText = b.goodWithKids ? 'Обикновено се разбира чудесно с деца' : 'С малки деца е нужно повече внимание и социализация';
  const dogsText = b.goodWithDogs ? 'а с други кучета е дружелюбна' : 'а срещите с други кучета изискват добра социализация';
  const trainText = b.trainability === 'easy'
    ? 'бързо схваща нови команди'
    : b.trainability === 'challenging' ? 'нужни са търпение, последователност и много награди' : 'с последователност и награди се справя добре';

  const body = `
<section class="hero">
  <div class="wrap">
    <div>
      ${crumbs(breadcrumbs)}
      <h1>${esc(p.name)}</h1>
      <p class="lead">${esc(p.name)} е ${SIZE_BG[b.size]} порода с произход ${esc(b.origin.bg)} —
      ${b.temperament.bg.slice(0, 3).map(t => esc(t.toLowerCase())).join(', ')}. Живее средно ${range(b.lifespanYears, 'години')}
      и има нужда от около ${b.exerciseMinPerDay} минути движение на ден.</p>
      <ul class="badges">
        <li>📏 ${cap(SIZE_BG[b.size])} порода</li>
        <li>⚖️ ${range(b.weightKg.male, 'кг')}</li>
        <li>⏳ ${range(b.lifespanYears, 'години')}</li>
        <li>📍 ${esc(b.origin.bg)}</li>
        ${b.hypoallergenic ? '<li>🌿 Хипоалергенна</li>' : ''}
      </ul>
    </div>
    <figure>${img(photoKey, `${p.name} — снимка на породата`, { eager: true, sizes: '(max-width: 860px) 100vw, 520px' })}${credit(photoKey)}</figure>
  </div>
</section>

<main class="wrap"><div class="narrow">

<section class="section card">
  <div class="icon-h"><span class="ic">📊</span><h2>Профил на породата</h2></div>
  <div class="meters">
    ${meter('Нужда от движение', EXERCISE_LEVEL[b.exerciseLevel], `~${b.exerciseMinPerDay} мин/ден`)}
    ${meter('Грижа за козината', GROOM_LEVEL[b.groomingFrequency], groomShort)}
    ${meter('Лесна за обучение', TRAIN_LEVEL[b.trainability], TRAIN_BG[b.trainability])}
    ${meter('С деца', b.goodWithKids ? 5 : 2, b.goodWithKids ? 'отлично' : 'с внимание')}
    ${meter('С други кучета', b.goodWithDogs ? 5 : 2, b.goodWithDogs ? 'добре' : 'с внимание')}
    ${meter('Размер', SIZE_LEVEL[b.size], SIZE_BG[b.size])}
  </div>
</section>

<section class="section">
  <div class="icon-h"><span class="ic lav">🧠</span><h2>Характер</h2></div>
  <ul class="tags">${b.temperament.bg.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
  <p>${kidsText}, ${dogsText}. Обучението е ${TRAIN_BG[b.trainability]} — ${trainText}.</p>
</section>

<section class="section two">
  <div class="card">
    <div class="icon-h"><span class="ic rose">🩺</span><h2>Здраве</h2></div>
    <p>При ${esc(lower)} по-често се срещат:</p>
    <ul class="dot">${b.commonConditions.bg.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
  </div>
  <div class="card">
    <div class="icon-h"><span class="ic mint">⚖️</span><h2>Нормално тегло</h2></div>
    <div class="weight">
      ${weightRow('Мъжки', b.weightKg.male, scaleMax)}
      ${weightRow('Женски', b.weightKg.female, scaleMax)}
    </div>
    <p style="font-size:14.5px;color:var(--muted);margin:0">Наднорменото тегло натоварва ставите и сърцето — претегляйте кучето поне веднъж месечно.</p>
  </div>
</section>
<div class="note">Склонността на породата не означава, че всяко куче ще развие тези проблеми. Редовните прегледи,
ваксините и обезпаразитяването са най-добрата профилактика — обсъдете ги с ветеринарния си лекар.</div>

<section class="section card">
  <div class="icon-h"><span class="ic sun">✂️</span><h2>Козина и грижа</h2></div>
  <p>${esc(b.coatDescription.bg)}</p>
  <p style="margin-bottom:0">Нужда от грижа: <strong>${esc(GROOMING_LEVEL_LABELS[b.groomingFrequency].bg)}</strong>.</p>
</section>

<section class="section fact-card"><strong>Любопитно</strong><p>${esc(b.funFact.bg)}</p></section>

${ctaBox(
  `Имате ${lower}?`,
  'Създайте безплатен профил в eDog: напомняния за ваксини и обезпаразитяване, дигитален паспорт и проследяване на теглото спрямо нормата за породата.'
)}

<section class="section">
  <div class="icon-h"><span class="ic">🐾</span><h2>Подобни породи</h2></div>
  <div class="cards">${related.map(breedCard).join('')}</div>
</section>

<section class="section">
  <div class="icon-h"><span class="ic sun">📚</span><h2>Полезно за всички стопани</h2></div>
  <div class="cards">
    <a class="pcard" href="/statii/vaksinacii-na-kuche-kalendar/">${thumb('statii/vaksinacii-na-kuche-kalendar', 'Ветеринар преглежда куче')}<div class="body"><strong>Ваксинационен календар</strong><span>Кога и кои ваксини</span></div></a>
    <a class="pcard" href="/statii/obezparazityavane-na-kuche/">${thumb('statii/obezparazityavane-na-kuche', 'Куче се чеше в тревата')}<div class="body"><strong>Обезпаразитяване</strong><span>Колко често и с какво</span></div></a>
  </div>
</section>

</div></main>
`;

  return layout(
    {
      path: p.path,
      title: `${p.name} — характер, здраве и грижа | eDog.bg`,
      description,
      image: photoKey,
      ogType: 'article',
      breadcrumbs,
      jsonLd: [{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: `${p.name}: характер, здраве и грижа`,
        description,
        image: `${SITE}/img/${photoKey}.jpg`,
        inLanguage: 'bg',
        mainEntityOfPage: SITE + p.path,
        publisher: { '@type': 'Organization', name: 'eDog.bg', url: SITE },
      }],
    },
    body,
    'porodi'
  );
};

export const renderBreedIndex = (all: BreedPage[]) => {
  const breadcrumbs = [{ name: 'Начало', path: '/' }, { name: 'Породи кучета', path: '/porodi/' }];
  const sizes: BreedInfo['size'][] = ['toy', 'small', 'medium', 'large', 'giant'];
  const present = sizes.filter(s => all.some(o => o.breed.size === s));

  const body = `
<section class="hero-dark">
  ${img('hero/porodi', 'Кучета си играят в есенни листа', { eager: true, sizes: '100vw' })}
  <div class="wrap">
    ${crumbs(breadcrumbs)}
    <h1>Породи кучета</h1>
    <p class="lead">Характер, нормално тегло, здраве и грижа за ${all.length} от най-обичаните породи в България —
    всичко, което е добре да знаете, преди и след като вземете куче.</p>
  </div>
  ${credit('hero/porodi')}
</section>

<main class="wrap">
  <div class="filters">
    <input type="search" id="q" placeholder="Търси порода… (напр. лабрадор)" aria-label="Търси порода">
    <button class="chip on" data-size="">Всички</button>
    ${present.map(s => `<button class="chip" data-size="${s}">${cap(SIZE_BG[s])}</button>`).join('')}
  </div>
  <div class="cards" id="list">${all.map(breedCard).join('')}</div>
  <p class="empty" id="empty">Няма порода с това име. Опитайте друго търсене.</p>
  ${ctaBox('Всичко за здравето на кучето ви — на едно място', 'Напомняния за ваксини, дигитален паспорт, QR профил при изгубване и проследяване на теглото според породата.')}
</main>
<script>
(function () {
  var q = document.getElementById('q'), chips = document.querySelectorAll('.chip'),
      cards = document.querySelectorAll('#list .pcard'), empty = document.getElementById('empty'), size = '';
  function apply() {
    var t = q.value.trim().toLowerCase(), n = 0;
    cards.forEach(function (c) {
      var ok = (!size || c.dataset.size === size) && (!t || c.dataset.name.indexOf(t) > -1);
      c.style.display = ok ? '' : 'none';
      if (ok) n++;
    });
    empty.style.display = n ? 'none' : 'block';
  }
  q.addEventListener('input', apply);
  chips.forEach(function (ch) {
    ch.addEventListener('click', function () {
      chips.forEach(function (x) { x.classList.remove('on'); });
      ch.classList.add('on');
      size = ch.dataset.size;
      apply();
    });
  });
})();
</script>
`;

  return layout(
    {
      path: '/porodi/',
      title: 'Породи кучета — характер, здраве и грижа | eDog.bg',
      description: `Наръчник за ${all.length} популярни породи кучета: характер, тегло, продължителност на живота, здравни рискове и грижа за козината.`,
      image: 'hero/porodi',
      breadcrumbs,
    },
    body,
    'porodi'
  );
};
