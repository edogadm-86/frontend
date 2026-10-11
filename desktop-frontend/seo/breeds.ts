import { ALL_BREEDS, GROOMING_LEVEL_LABELS, type BreedInfo } from '../src/data/breedData';
import { layout, ctaBox, esc, SITE } from './layout';

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
const EXERCISE_BG: Record<BreedInfo['exerciseLevel'], string> = {
  low: 'ниска', moderate: 'умерена', high: 'висока', 'very-high': 'много висока',
};
const TRAIN_BG: Record<BreedInfo['trainability'], string> = {
  easy: 'лесна', moderate: 'умерена', challenging: 'трудна',
};

export interface BreedPage { breed: BreedInfo; name: string; slug: string; path: string }

export const breedPages = (): BreedPage[] =>
  ALL_BREEDS.map(breed => {
    const d = DISPLAY[breed.names[0]];
    if (!d) throw new Error(`No SEO display name for breed "${breed.names[0]}"`);
    return { breed, name: d.name, slug: d.slug, path: `/porodi/${d.slug}/` };
  }).sort((a, b) => a.name.localeCompare(b.name, 'bg'));

const range = ([a, b]: [number, number], unit: string) => (a === b ? `${a} ${unit}` : `${a}–${b} ${unit}`);
const yesNo = (v: boolean) => (v ? 'Да' : 'Не особено');

export const renderBreedPage = (p: BreedPage, all: BreedPage[]) => {
  const b = p.breed;
  const lower = p.name.charAt(0).toLowerCase() + p.name.slice(1);
  const description =
    `${p.name}: характер, здраве, тегло (${range(b.weightKg.male, 'кг')}), продължителност на живота ` +
    `${range(b.lifespanYears, 'г.')}, нужда от движение и грижа за козината. Наръчник на eDog.bg.`;
  const related = all.filter(o => o.breed.size === b.size && o.slug !== p.slug).slice(0, 4);
  const fallbackRelated = related.length ? related : all.filter(o => o.slug !== p.slug).slice(0, 4);

  const body = `
<p class="lead">${esc(p.name)} е ${SIZE_BG[b.size]} порода с произход ${esc(b.origin.bg)}. Живее средно
${range(b.lifespanYears, 'години')}, а нуждата ѝ от движение е ${EXERCISE_BG[b.exerciseLevel]} —
около ${b.exerciseMinPerDay} минути на ден.</p>

<div class="facts">
  <div class="fact"><b>Произход</b><span>${esc(b.origin.bg)}</span></div>
  <div class="fact"><b>Размер</b><span>${SIZE_BG[b.size]}</span></div>
  <div class="fact"><b>Тегло (мъжки)</b><span>${range(b.weightKg.male, 'кг')}</span></div>
  <div class="fact"><b>Тегло (женски)</b><span>${range(b.weightKg.female, 'кг')}</span></div>
  <div class="fact"><b>Живот</b><span>${range(b.lifespanYears, 'години')}</span></div>
  <div class="fact"><b>Движение</b><span>~${b.exerciseMinPerDay} мин/ден</span></div>
  <div class="fact"><b>Обучаемост</b><span>${TRAIN_BG[b.trainability]}</span></div>
  <div class="fact"><b>Хипоалергенна</b><span>${b.hypoallergenic ? 'Да' : 'Не'}</span></div>
</div>

<h2>Характер</h2>
<ul class="tags">${b.temperament.bg.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
<p>С деца: <strong>${yesNo(b.goodWithKids)}</strong> · С други кучета: <strong>${yesNo(b.goodWithDogs)}</strong>.
Обучаемостта е ${TRAIN_BG[b.trainability]}${b.trainability === 'challenging' ? ' — нужни са търпение и последователност' : ''}.</p>

<h2>Здраве: за какво да внимавате</h2>
<p>При ${esc(lower)} по-често се срещат:</p>
<ul class="clean">${b.commonConditions.bg.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
<div class="note">Това не означава, че всяко куче от породата ще развие тези проблеми. Редовните прегледи,
ваксините и обезпаразитяването са най-добрата профилактика — обсъдете ги с ветеринарния си лекар.</div>

<h2>Тегло</h2>
<p>Нормалното тегло за възрастен мъжки е ${range(b.weightKg.male, 'кг')}, а за женски — ${range(b.weightKg.female, 'кг')}.
Наднорменото тегло натоварва ставите и сърцето, затова следете кантара поне веднъж месечно.</p>

<h2>Козина и грижа</h2>
<p>${esc(b.coatDescription.bg)}</p>
<p>Нужда от грижа: <strong>${esc(GROOMING_LEVEL_LABELS[b.groomingFrequency].bg)}</strong>.</p>

<h2>Любопитно</h2>
<p>${esc(b.funFact.bg)}</p>

${ctaBox(
  `Имате ${lower}?`,
  `Създайте безплатен профил в eDog: напомняния за ваксини и обезпаразитяване, дигитален паспорт и проследяване на теглото спрямо нормата за породата.`
)}

<h2>Полезно за всички стопани</h2>
<div class="grid">
  <a href="/statii/vaksinacii-na-kuche-kalendar/"><strong>Ваксинационен календар</strong><span>Кога и кои ваксини</span></a>
  <a href="/statii/obezparazityavane-na-kuche/"><strong>Обезпаразитяване</strong><span>Колко често и с какво</span></a>
</div>

<h2>Подобни породи</h2>
<div class="grid">${fallbackRelated.map(o => `<a href="${o.path}"><strong>${esc(o.name)}</strong><span>${SIZE_BG[o.breed.size]} порода</span></a>`).join('')}</div>
`;

  return layout(
    {
      path: p.path,
      title: `${p.name} — характер, здраве и грижа | eDog.bg`,
      description,
      h1: `${p.name}: характер, здраве и грижа`,
      ogType: 'article',
      breadcrumbs: [
        { name: 'Начало', path: '/' },
        { name: 'Породи кучета', path: '/porodi/' },
        { name: p.name, path: p.path },
      ],
      jsonLd: [{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: `${p.name}: характер, здраве и грижа`,
        description,
        inLanguage: 'bg',
        mainEntityOfPage: SITE + p.path,
        publisher: { '@type': 'Organization', name: 'eDog.bg', url: SITE },
      }],
    },
    body
  );
};

export const renderBreedIndex = (all: BreedPage[]) =>
  layout(
    {
      path: '/porodi/',
      title: 'Породи кучета — характер, здраве и грижа | eDog.bg',
      description: `Наръчник за ${all.length} популярни породи кучета: характер, тегло, продължителност на живота, здравни рискове и грижа за козината.`,
      h1: 'Породи кучета',
      breadcrumbs: [{ name: 'Начало', path: '/' }, { name: 'Породи кучета', path: '/porodi/' }],
    },
    `<p class="lead">Характер, нормално тегло, здравни рискове и грижа за ${all.length} от най-популярните породи в България.</p>
<div class="grid">${all
      .map(o => `<a href="${o.path}"><strong>${esc(o.name)}</strong><span>${range(o.breed.weightKg.male, 'кг')} · ${range(o.breed.lifespanYears, 'г.')}</span></a>`)
      .join('')}</div>
${ctaBox('Всичко за здравето на кучето ви — на едно място', 'Напомняния за ваксини, дигитален паспорт, QR профил при изгубване. Безплатно.')}`
  );
