import React from 'react';

// Paper-style pet passport: A6 pages (105 × 148 mm), bilingual BG/EN labels and the same
// numbered sections as the paper booklet. Deliberately carries no official insignia (EU flag,
// emblems, stamps) and marks every page as a digital copy, so it can't pass as the real document.

interface PassportBookletProps {
  dog: any;
  owner?: { name?: string; email?: string; phone?: string } | null;
  vaccinations: any[];
  healthRecords: any[];
  photoUrl?: string;
  /** 'pages' = one page after another (screen, PDF); 'spreads' = open booklet, two pages side by side (print) */
  layout?: 'pages' | 'spreads';
}

const RABIES = /rabi|бяс|бесн/i;
const ECHINOCOCCUS = /milprazon|милпразон|praziquantel|празиквант|drontal|дронтал|milbemax|милбемакс|cestal|prazi/i;
const ANTI_PARASITE = /паразит|parasit|foresto|форесто|seresto|bravecto|бравекто|nexgard|некстгард|simparica|симпарика|frontline|фронтлайн|advocate|stronghold|scalibor|обезпараз|deworm|flea|tick|кърлеж|бълх|ivermect|ивермект/i;
const NON_TREATMENT_TYPES = new Set(['illness', 'injury']);

const fmt = (d?: string | Date | null) => {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(date.getDate())}.${p(date.getMonth() + 1)}.${date.getFullYear()}`;
};

const sexLabel = (sex?: string) => {
  if (!sex) return '';
  if (/^m|мъж/i.test(sex)) return 'Мъжки / Male';
  if (/^f|жен/i.test(sex)) return 'Женски / Female';
  return sex;
};

const chunk = <T,>(items: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out.length ? out : [[]];
};

// Product name for treatment tables: the medication (+ dosage) when recorded, otherwise the record title
const recordText = (r: any) => (r.medication ? [r.medication, r.dosage].filter(Boolean).join(' ') : r.title || '');
const matchText = (r: any) => [r.title, r.medication, r.description].filter(Boolean).join(' ');

// ── Building blocks ─────────────────────────────────────────────────────────

const Field: React.FC<{ bg: string; en: string; value?: React.ReactNode; tall?: boolean }> = ({ bg, en, value, tall }) => (
  <div className="pp-field">
    <div className="pp-label">{bg} <span className="pp-en">/ {en}</span></div>
    <div className={`pp-value${tall ? ' pp-tall' : ''}`}>{value || ' '}</div>
  </div>
);

const Section: React.FC<{ num: string; bg: string; en: string }> = ({ num, bg, en }) => (
  <div className="pp-section">
    <span className="pp-num">{num}</span>
    <span>{bg}<br /><span className="pp-en">{en}</span></span>
  </div>
);

const Stamp = () => (
  <div className="pp-stamp">Подпис и печат на ветеринарния лекар<br /><span className="pp-en">Signature and stamp of the veterinarian</span></div>
);

const Page: React.FC<{ n?: number; children: React.ReactNode; className?: string }> = ({ n, children, className = '' }) => (
  <div className={`pp-page ${className}`}>
    <div className="pp-watermark">eDog</div>
    <div className="pp-content">{children}</div>
    {n !== undefined && (
      <div className="pp-footer">
        <span>Дигитално копие — не е официален документ · <span className="pp-en">Digital copy — not an official document</span></span>
        <span className="pp-pageno">{n}</span>
      </div>
    )}
  </div>
);

// ── Booklet ─────────────────────────────────────────────────────────────────

export const PassportBooklet: React.FC<PassportBookletProps> = ({ dog, owner, vaccinations, healthRecords, photoUrl, layout = 'pages' }) => {
  const byDate = (a: any, b: any, key: string) => new Date(a[key]).getTime() - new Date(b[key]).getTime();
  const rabies = vaccinations.filter(v => RABIES.test(v.vaccine_name || '')).sort((a, b) => byDate(a, b, 'date_given'));
  const otherVacs = vaccinations.filter(v => !RABIES.test(v.vaccine_name || '')).sort((a, b) => byDate(a, b, 'date_given'));

  const treatments = healthRecords.filter(r => !NON_TREATMENT_TYPES.has(r.type));
  const echinococcus = treatments.filter(r => ECHINOCOCCUS.test(matchText(r))).sort((a, b) => byDate(a, b, 'date'));
  const antiParasite = treatments
    .filter(r => !ECHINOCOCCUS.test(matchText(r)) && ANTI_PARASITE.test(matchText(r)))
    .sort((a, b) => byDate(a, b, 'date'));
  const examinations = healthRecords
    .filter(r => (r.type === 'vet-visit' || r.type === 'checkup') && !echinococcus.includes(r) && !antiParasite.includes(r))
    .sort((a, b) => byDate(a, b, 'date'));

  const nameParts = (owner?.name || '').trim().split(/\s+/);
  const surname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0] || '';

  const pages: { key: string; node: (n: number) => React.ReactNode }[] = [];

  // Cover
  pages.push({
    key: 'cover',
    node: () => (
      <Page className="pp-cover">
        <div className="pp-cover-frame">
          <svg className="pp-cover-emblem" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeWidth="0.6" />
            <ellipse cx="32" cy="38" rx="9" ry="7.5" fill="currentColor" />
            <ellipse cx="21" cy="27" rx="3.6" ry="4.6" fill="currentColor" />
            <ellipse cx="28" cy="21" rx="3.6" ry="4.8" fill="currentColor" />
            <ellipse cx="36" cy="21" rx="3.6" ry="4.8" fill="currentColor" />
            <ellipse cx="43" cy="27" rx="3.6" ry="4.6" fill="currentColor" />
          </svg>
          <div className="pp-cover-title">ПАСПОРТ<br />НА ДОМАШЕН ЛЮБИМЕЦ</div>
          <div className="pp-cover-sub">PET PASSPORT</div>
          <div className="pp-cover-name">{dog?.name}</div>
          <div className="pp-cover-bottom">
            eDog · Дигитално копие<br />
            <span>Digital copy — not an official document</span>
          </div>
        </div>
      </Page>
    ),
  });

  // I. Owner
  pages.push({
    key: 'owner',
    node: (n) => (
      <Page n={n}>
        <div className="pp-passno">
          <span>Номер на паспорта / <span className="pp-en">Passport number</span></span>
          <strong>{dog?.passportNumber || ' '}</strong>
        </div>
        <Section num="I." bg="Данни за собственика" en="Details of ownership" />
        <Field bg="Фамилия" en="Surname" value={surname} />
        <Field bg="Име" en="First name" value={firstName} />
        <Field bg="Адрес" en="Address" />
        <div className="pp-row">
          <Field bg="Пощенски код" en="Post code" />
          <Field bg="Град" en="City" />
        </div>
        <Field bg="Държава" en="Country" />
        <Field bg="Телефон" en="Telephone" value={owner?.phone} />
        <Field bg="Ел. поща" en="E-mail" value={owner?.email} />
      </Page>
    ),
  });

  // II. Description + III. Marking
  pages.push({
    key: 'animal',
    node: (n) => (
      <Page n={n}>
        <Section num="II." bg="Описание на животното" en="Description of the animal" />
        <div className="pp-animal">
          <div className="pp-animal-fields">
            <Field bg="Име" en="Name" value={dog?.name} />
            <Field bg="Вид" en="Species" value="Куче / Dog" />
            <Field bg="Порода" en="Breed" value={dog?.breed} />
            <Field bg="Пол" en="Sex" value={sexLabel(dog?.sex)} />
          </div>
          <div className="pp-photo">
            {photoUrl
              ? <img src={photoUrl} alt="" crossOrigin="anonymous" />
              : <span>Снимка<br /><span className="pp-en">Photo</span></span>}
          </div>
        </div>
        <div className="pp-row">
          <Field bg="Дата на раждане" en="Date of birth" value={fmt(dog?.dateOfBirth)} />
          <Field bg="Цвят" en="Colour" value={dog?.colour} />
        </div>
        <Field bg="Особени белези" en="Notable characteristics" value={dog?.features} />

        <Section num="III." bg="Маркиране на животното" en="Marking of the animal" />
        <Field bg="Номер на транспондера" en="Transponder code" value={dog?.microchipId ? <span className="pp-mono">{dog.microchipId}</span> : ''} />
        <div className="pp-row">
          <Field bg="Дата на поставяне" en="Date of application" />
          <Field bg="Място" en="Location" />
        </div>
      </Page>
    ),
  });

  // IV. Issuing
  pages.push({
    key: 'issuing',
    node: (n) => (
      <Page n={n}>
        <Section num="IV." bg="Издаване на паспорта" en="Issuing of the passport" />
        <Field bg="Име на ветеринарния лекар" en="Name of the authorised veterinarian" />
        <Field bg="Адрес" en="Address" />
        <div className="pp-row">
          <Field bg="Пощенски код" en="Post code" />
          <Field bg="Град" en="City" />
        </div>
        <Field bg="Телефон / Ел. поща" en="Telephone / E-mail" />
        <div className="pp-row">
          <Field bg="Номер на паспорта" en="Passport number" value={dog?.passportNumber} />
          <Field bg="Дата на издаване" en="Date of issue" />
        </div>
        <Stamp />
        <p className="pp-note">
          Това е дигитално копие на данните, въведени в eDog на {fmt(new Date())}. Не замества паспорта,
          издаден от ветеринарен лекар.<br />
          <span className="pp-en">This is a digital copy of the data entered in eDog. It does not replace the passport issued by a veterinarian.</span>
        </p>
      </Page>
    ),
  });

  // V. Rabies
  chunk(rabies, 3).forEach((group, gi) => {
    pages.push({
      key: `rabies-${gi}`,
      node: (n) => (
        <Page n={n}>
          <Section num="V." bg="Ваксинация срещу бяс" en="Vaccination against rabies" />
          {Array.from({ length: 3 }, (_, i) => group[i]).map((v, i) => (
            <div className="pp-entry" key={i}>
              <Field bg="Производител и наименование на ваксината" en="Manufacturer and name of vaccine" value={v?.vaccine_name} />
              <div className="pp-row pp-row-3">
                <Field bg="Партиден №" en="Batch number" value={v?.batch_number} />
                <Field bg="Дата на ваксинация" en="Vaccination date" value={fmt(v?.date_given)} />
                <Field bg="Валидна до" en="Valid until" value={fmt(v?.next_due_date)} />
              </div>
              <Field bg="Ветеринарен лекар" en="Authorised veterinarian" value={v?.veterinarian} />
            </div>
          ))}
        </Page>
      ),
    });
  });

  // VI. Titration (always empty — eDog doesn't track it)
  pages.push({
    key: 'titration',
    node: (n) => (
      <Page n={n}>
        <Section num="VI." bg="Тест за титруване на антитела срещу бяс" en="Rabies antibody titration test" />
        {[0, 1].map(i => (
          <div className="pp-entry" key={i}>
            <div className="pp-row">
              <Field bg="Дата на вземане на кръвна проба" en="Date of blood sampling" />
              <Field bg="Резултат" en="Result" />
            </div>
            <Field bg="Ветеринарен лекар" en="Authorised veterinarian" />
          </div>
        ))}
      </Page>
    ),
  });

  // VII. Echinococcus + VIII. Other anti-parasite — 4 entries per page each
  const treatmentPages = (list: any[], num: string, bg: string, en: string, keyPrefix: string) =>
    chunk(list, 4).forEach((group, gi) => {
      pages.push({
        key: `${keyPrefix}-${gi}`,
        node: (n) => (
          <Page n={n}>
            <Section num={num} bg={bg} en={en} />
            <table className="pp-table">
              <thead>
                <tr>
                  <th>Продукт<br /><span className="pp-en">Product</span></th>
                  <th>Дата<br /><span className="pp-en">Date</span></th>
                  <th>Ветеринарен лекар<br /><span className="pp-en">Veterinarian</span></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }, (_, i) => group[i]).map((r, i) => (
                  <tr key={i}>
                    <td><div className="pp-cell">{r ? recordText(r) : ' '}</div></td>
                    <td className="pp-nowrap">{fmt(r?.date)}</td>
                    <td>{r?.veterinarian || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Page>
        ),
      });
    });

  treatmentPages(echinococcus, 'VII.', 'Обработка срещу Echinococcus multilocularis', 'Echinococcus multilocularis treatment', 'echino');
  treatmentPages(antiParasite, 'VIII.', 'Други противопаразитни обработки', 'Other anti-parasite treatments', 'parasite');

  // IX. Other vaccinations
  chunk(otherVacs, 3).forEach((group, gi) => {
    pages.push({
      key: `vacc-${gi}`,
      node: (n) => (
        <Page n={n}>
          <Section num="IX." bg="Други ваксинации" en="Other vaccinations" />
          {Array.from({ length: 3 }, (_, i) => group[i]).map((v, i) => (
            <div className="pp-entry" key={i}>
              <Field bg="Производител и наименование на ваксината" en="Manufacturer and name of vaccine" value={v?.vaccine_name} />
              <div className="pp-row pp-row-3">
                <Field bg="Партиден №" en="Batch number" value={v?.batch_number} />
                <Field bg="Дата на ваксинация" en="Vaccination date" value={fmt(v?.date_given)} />
                <Field bg="Валидна до" en="Valid until" value={fmt(v?.next_due_date)} />
              </div>
              <Field bg="Ветеринарен лекар" en="Authorised veterinarian" value={v?.veterinarian} />
            </div>
          ))}
        </Page>
      ),
    });
  });

  // X. Clinical examinations
  chunk(examinations, 4).forEach((group, gi) => {
    pages.push({
      key: `exam-${gi}`,
      node: (n) => (
        <Page n={n}>
          <Section num="X." bg="Клиничен преглед" en="Clinical examination" />
          <table className="pp-table pp-table-exam">
            <thead>
              <tr>
                <th>Дата<br /><span className="pp-en">Date</span></th>
                <th>Преглед / бележки<br /><span className="pp-en">Examination / notes</span></th>
                <th>Ветеринарен лекар<br /><span className="pp-en">Veterinarian</span></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }, (_, i) => group[i]).map((r, i) => (
                <tr key={i}>
                  <td className="pp-nowrap">{fmt(r?.date) || ' '}</td>
                  <td><div className="pp-cell">{r ? [r.title, r.description].filter((v, k, a) => v && a.indexOf(v) === k).join(' — ') : ''}</div></td>
                  <td>{r?.veterinarian || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Page>
      ),
    });
  });

  // XII. Others — blank lines, like the paper booklet
  pages.push({
    key: 'others',
    node: (n) => (
      <Page n={n}>
        <Section num="XII." bg="Други" en="Others" />
        <div className="pp-lines">{Array.from({ length: 14 }, (_, i) => <div key={i} />)}</div>
      </Page>
    ),
  });

  const rendered = pages.map((p, i) => <React.Fragment key={p.key}>{p.node(i)}</React.Fragment>);

  return (
    <div className={`pp-book pp-${layout}`}>
      <style>{BOOKLET_CSS}</style>
      {layout === 'spreads'
        ? chunk(rendered, 2).map((pair, i) => <div key={i} className="pp-spread">{pair}</div>)
        : rendered}
    </div>
  );
};

const BOOKLET_CSS = `
.pp-book.pp-pages { display: flex; gap: 6mm; }
.pp-spread { display: flex; justify-content: center; }
.pp-spread .pp-page { box-shadow: none; }
.pp-spread .pp-page + .pp-page { border-left: 0.2mm dashed #b8bfd0; }
.pp-page {
  position: relative; width: 105mm; height: 148mm; box-sizing: border-box; overflow: hidden;
  padding: 7mm 7mm 10mm; color: #1d2433; font-family: 'Inter', Arial, sans-serif;
  background-color: #fbf7ec;
  background-image:
    radial-gradient(ellipse at 50% 40%, rgba(31,58,110,0.06), transparent 65%),
    repeating-linear-gradient(45deg, rgba(31,58,110,0.035) 0 0.25mm, transparent 0.25mm 2.2mm),
    repeating-linear-gradient(-45deg, rgba(31,58,110,0.035) 0 0.25mm, transparent 0.25mm 2.2mm);
  box-shadow: 0 1px 2px rgba(0,0,0,0.08), 0 6px 18px rgba(0,0,0,0.08);
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.pp-content { position: relative; z-index: 1; }
.pp-watermark {
  position: absolute; left: 50%; top: 52%; transform: translate(-50%, -50%) rotate(-30deg);
  font-size: 34mm; font-weight: 800; color: rgba(31,58,110,0.045); letter-spacing: -1mm; pointer-events: none; user-select: none;
}
.pp-en { color: #6b7389; font-weight: 400; }
.pp-section {
  display: flex; gap: 2.2mm; align-items: flex-start; margin: 1mm 0 3mm; padding-bottom: 1.2mm;
  border-bottom: 0.35mm solid #1f3a6e; color: #1f3a6e; font-size: 7.2pt; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.15mm; line-height: 1.25;
}
.pp-section .pp-en { color: #4d6390; font-weight: 600; }
.pp-num { font-family: Georgia, 'Times New Roman', serif; font-size: 10pt; line-height: 1; }
.pp-field { margin-bottom: 2.2mm; min-width: 0; }
.pp-label { font-size: 5.4pt; line-height: 1.2; color: #3c4560; margin-bottom: 0.6mm; }
.pp-value {
  min-height: 4.4mm; padding: 0.3mm 0.5mm; border-bottom: 0.2mm dotted #7c86a0;
  font-family: 'Courier New', Courier, monospace; font-size: 8.4pt; font-weight: 700; color: #14213f;
  line-height: 1.25; overflow-wrap: anywhere;
}
.pp-tall { min-height: 9mm; }
.pp-mono { letter-spacing: 0.5mm; }
.pp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; }
.pp-row-3 { grid-template-columns: 1fr 1fr 1fr; gap: 2mm; }
/* keep values on one baseline when a bilingual label wraps */
.pp-row > .pp-field { display: flex; flex-direction: column; justify-content: flex-end; }
.pp-entry {
  border: 0.25mm solid #a3acc2; border-radius: 1mm; padding: 2mm 2.2mm 0.6mm; margin-bottom: 2.6mm;
  background: rgba(255,255,255,0.4);
}
.pp-entry .pp-field { margin-bottom: 1.6mm; }
.pp-passno {
  display: flex; justify-content: space-between; align-items: baseline; gap: 2mm; margin-bottom: 4mm;
  padding: 1.6mm 2mm; border: 0.3mm solid #1f3a6e; border-radius: 1mm; font-size: 5.6pt; color: #3c4560;
}
.pp-passno strong { font-family: 'Courier New', Courier, monospace; font-size: 9pt; color: #14213f; }
.pp-animal { display: grid; grid-template-columns: 1fr 27mm; gap: 3mm; }
.pp-photo {
  width: 27mm; height: 33mm; border: 0.3mm solid #7c86a0; background: #fff; overflow: hidden;
  display: flex; align-items: center; justify-content: center; text-align: center; font-size: 5.6pt; color: #6b7389;
}
.pp-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pp-stamp {
  margin-top: 4mm; height: 26mm; border: 0.3mm dashed #8b93a7; border-radius: 1mm;
  display: flex; align-items: flex-end; justify-content: center; padding-bottom: 1.5mm;
  font-size: 5.2pt; color: #6b7389; text-align: center; line-height: 1.3;
}
.pp-note { margin-top: 3mm; font-size: 5.4pt; line-height: 1.4; color: #4a5268; }
.pp-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.pp-table th {
  font-size: 5.2pt; font-weight: 600; text-align: left; color: #3c4560; line-height: 1.25;
  border: 0.25mm solid #a3acc2; padding: 1mm; background: rgba(31,58,110,0.05);
}
.pp-table th:nth-child(1) { width: 42%; }
.pp-table th:nth-child(2) { width: 22%; }
.pp-table td {
  height: 22mm; vertical-align: top; border: 0.25mm solid #a3acc2; padding: 1.2mm;
  font-family: 'Courier New', Courier, monospace; font-size: 7.4pt; font-weight: 700; color: #14213f;
  overflow-wrap: anywhere; line-height: 1.3;
}
.pp-nowrap { white-space: nowrap; }
.pp-table-exam th:nth-child(1) { width: 22%; }
.pp-table-exam th:nth-child(2) { width: 50%; }
.pp-cell { max-height: 20mm; overflow: hidden; }
.pp-lines div { height: 7.5mm; border-bottom: 0.2mm dotted #7c86a0; }
.pp-footer {
  position: absolute; left: 7mm; right: 7mm; bottom: 3.5mm; z-index: 1;
  display: flex; justify-content: space-between; align-items: flex-end; gap: 3mm;
  font-size: 4.6pt; color: #7a8296; line-height: 1.3;
}
.pp-pageno { font-family: Georgia, serif; font-size: 7pt; color: #1f3a6e; }

/* Cover */
.pp-cover { background: #1b2c55; background-image: radial-gradient(ellipse at 50% 35%, rgba(255,255,255,0.08), transparent 70%); padding: 6mm; }
.pp-cover .pp-watermark { display: none; }
.pp-cover .pp-content { height: 100%; }
.pp-cover-frame {
  height: 100%; box-sizing: border-box; border: 0.5mm solid #c9ad6a; outline: 0.25mm solid #c9ad6a; outline-offset: -1.6mm;
  display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #e2c88a; padding: 6mm;
}
.pp-cover-emblem { width: 26mm; height: 26mm; margin-bottom: 7mm; color: #d6ba78; }
.pp-cover-title { font-family: Georgia, 'Times New Roman', serif; font-size: 12pt; font-weight: 700; letter-spacing: 0.4mm; line-height: 1.35; }
.pp-cover-sub { margin-top: 2.5mm; font-family: Georgia, 'Times New Roman', serif; font-size: 9pt; letter-spacing: 1.2mm; }
.pp-cover-name { margin-top: 10mm; font-size: 11pt; font-weight: 600; color: #f1e2b8; letter-spacing: 0.3mm; }
.pp-cover-bottom { margin-top: auto; font-size: 5.6pt; line-height: 1.5; color: rgba(226,200,138,0.8); }
.pp-cover-bottom span { color: rgba(226,200,138,0.6); }
`;
