import React from 'react';
import { X, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h3 className="text-sm font-bold text-gray-900 dark:text-[#e2e2e6] mb-2">{title}</h3>
    <div className="text-sm text-gray-500 dark:text-[#8b919d] leading-relaxed space-y-2">{children}</div>
  </div>
);

const Li: React.FC<{ label: string; text: string }> = ({ label, text }) => (
  <li><span className="font-medium text-gray-700 dark:text-[#c1c7d3]">{label}</span>{text}</li>
);

const EmailLink = () => (
  <a href="mailto:edog.adm@gmail.com" className="text-[#005da7] dark:text-[#a4c9ff] hover:underline">
    edog.adm@gmail.com
  </a>
);

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
  const { i18n } = useTranslation();
  const bg = i18n.language === 'bg';

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="font-jakarta bg-[#fbf9f8] dark:bg-[#111316] w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex-shrink-0 flex items-center gap-3 px-6 py-4 bg-white dark:bg-[#1e2023] border-b border-gray-100 dark:border-white/5">
          <div className="w-9 h-9 bg-gradient-to-br from-[#005da7] to-[#0090e7] rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
            <Shield size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900 dark:text-[#e2e2e6] leading-tight">
              {bg ? 'Политика за поверителност' : 'Privacy Policy'}
            </h2>
            <p className="text-xs text-gray-400 dark:text-[#8b919d]">
              {bg ? 'Последна актуализация: май 2025' : 'Last updated: May 2025'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 dark:text-[#8b919d] hover:bg-gray-100 dark:hover:bg-[#282a2d] hover:text-gray-700 dark:hover:text-[#e2e2e6] transition-all flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-5 space-y-5">

            {bg ? <>
              <Section title="1. Администратор на данни">
                <p>eDog („ние", „нас", „нашият") се управлява като личен проект, базиран в Европейския съюз. За въпроси относно тази политика или личните ви данни, свържете се с нас на <EmailLink />.</p>
              </Section>
              <Section title="2. Данни, които събираме">
                <p>Събираме и обработваме следните категории лични данни:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <Li label="Данни за акаунт: " text="вашето ime и имейл адрес, предоставени при регистрация." />
                  <Li label="Профили на домашни любимци: " text="name на кучето, порода, дата на раждане, пол, тегло, номер на микрочип и снимка на профила." />
                  <Li label="Здравни записи: " text="ваксинационни записи, ветеринарни прегледи, медикаментозни дневници и история на теглото." />
                  <Li label="Съдържание на общността: " text="публикации, коментари и снимки, споделени в общностния фийд." />
                  <Li label="Данни за използване: " text="времеви печат на последното влизане, използван за показване на статуса на активността." />
                </ul>
              </Section>
              <Section title="3. Правно основание за обработка">
                <p>Обработваме личните ви данни на следните правни основания по GDPR:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <Li label="Изпълнение на договор " text="— за предоставяне на услугата eDog, за която сте се регистрирали." />
                  <Li label="Легитимни интереси " text="— за поддържане на сигурността на услугата и предотвратяване на измами." />
                  <Li label="Съгласие " text="— за незадължителни функции като push известия." />
                </ul>
              </Section>
              <Section title="4. Как използваме данните ви">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Предоставяме и поддържаме вашия акаунт и профилите на кучетата.</li>
                  <li>Генерираме съответстващи на ЕС цифрови паспорти за домашни любимци от вашите записи.</li>
                  <li>Показваме съдържание на общността, което решите да споделите.</li>
                  <li>Изпращаме напомняния за ваксинации и предстоящи прегледи (ако е активирано).</li>
                  <li>Подобряваме и защитаваме приложението.</li>
                </ul>
                <p>Ние <span className="font-medium text-gray-700 dark:text-[#c1c7d3]">не</span> продаваме личните ви данни на трети страни.</p>
              </Section>
              <Section title="5. Съхранение и сигурност на данните">
                <p>Вашите данни се съхраняват на сървъри в Европейския съюз. Прилагаме стандартни мерки за сигурност — криптирани връзки (HTTPS/TLS) и хеширани пароли. Достъпът до лични данни е ограничен до упълномощени системни администратори.</p>
              </Section>
              <Section title="6. Срок на съхранение">
                <p>Съхраняваме личните ви данни, докато акаунтът ви е активен. При изтриване на акаунта данните и свързаните профили на кучета се премахват в рамките на 30 дни, освен ако задължителното съхранение е предвидено от приложимото законодателство.</p>
              </Section>
              <Section title="7. Вашите права по GDPR">
                <p>Като субект на данни в ЕС имате следните права:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <Li label="Достъп " text="— заявете копие от всички лични данни, които съхраняваме за вас." />
                  <Li label="Коригиране " text="— коригирайте неточни или непълни данни." />
                  <Li label="Изтриване " text={'— поискайте изтриване на личните ви данни („право да бъдеш забравен").'} />
                  <Li label="Преносимост " text="— получете данните си в машинно четим формат." />
                  <Li label="Възражение " text="— възразете срещу обработването въз основа на легитимни интереси." />
                  <Li label="Ограничаване " text="— поискайте да ограничим обработването на вашите данни." />
                </ul>
                <p>За упражняване на тези права се свържете с нас на <EmailLink />. Ще отговорим в рамките на 30 дни.</p>
              </Section>
              <Section title="8. Бисквитки">
                <p>eDog използва само основни сесийни бисквитки, необходими за удостоверяване на самоличността. Не използваме проследяващи или рекламни бисквитки.</p>
              </Section>
              <Section title="9. Промени в тази политика">
                <p>Можем да актуализираме тази политика от tiempo на время. Промените ще бъдат публикувани в приложението. Продължаването на използването на eDog след публикуването представлява приемане на актуализираната политика.</p>
              </Section>
              <Section title="10. Контакт">
                <p>За въпроси, свързани с поверителността, изпратете ни имейл на <EmailLink />.</p>
              </Section>
            </> : <>
              <Section title="1. Data Controller">
                <p>eDog ("we", "us", "our") is operated as a personal project based in the European Union. For questions about this policy or your personal data, contact us at <EmailLink />.</p>
              </Section>
              <Section title="2. Data We Collect">
                <p>We collect and process the following categories of personal data:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <Li label="Account data: " text="your name and email address, provided at registration." />
                  <Li label="Pet profiles: " text="dog name, breed, date of birth, sex, weight, microchip number, and profile photo." />
                  <Li label="Health records: " text="vaccination records, veterinary appointments, medication logs, and weight history." />
                  <Li label="Community content: " text="posts, comments, and photos you share in the community feed." />
                  <Li label="Usage data: " text="last sign-in timestamp, used to display account activity status." />
                </ul>
              </Section>
              <Section title="3. Legal Basis for Processing">
                <p>We process your personal data under the following legal bases as defined by the GDPR:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <Li label="Contract performance " text="— to provide the eDog service you signed up for." />
                  <Li label="Legitimate interests " text="— to maintain service security and prevent fraud." />
                  <Li label="Consent " text="— for optional features such as push notifications." />
                </ul>
              </Section>
              <Section title="4. How We Use Your Data">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Provide and maintain your eDog account and dog profiles.</li>
                  <li>Generate EU-compliant digital pet passports from your records.</li>
                  <li>Display community content you choose to share.</li>
                  <li>Send reminders for vaccinations and upcoming appointments (if enabled).</li>
                  <li>Improve and secure the application.</li>
                </ul>
                <p>We do <span className="font-medium text-gray-700 dark:text-[#c1c7d3]">not</span> sell your personal data to third parties.</p>
              </Section>
              <Section title="5. Data Storage and Security">
                <p>Your data is stored on servers located within the European Union. We apply industry-standard security measures including encrypted connections (HTTPS/TLS) and hashed passwords. Access to personal data is restricted to authorised system administrators.</p>
              </Section>
              <Section title="6. Data Retention">
                <p>We retain your personal data for as long as your account is active. If you delete your account, your personal data and associated dog profiles are permanently removed from our systems within 30 days, except where retention is required by applicable law.</p>
              </Section>
              <Section title="7. Your Rights Under GDPR">
                <p>As a data subject in the EU, you have the following rights:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <Li label="Access " text="— request a copy of all personal data we hold about you." />
                  <Li label="Rectification " text="— correct inaccurate or incomplete data." />
                  <Li label="Erasure " text={'— request deletion of your personal data (“right to be forgotten”).'} />
                  <Li label="Portability " text="— receive your data in a machine-readable format." />
                  <Li label="Objection " text="— object to processing based on legitimate interests." />
                  <Li label="Restriction " text="— request that we restrict processing of your data." />
                </ul>
                <p>To exercise any of these rights, contact us at <EmailLink />. We will respond within 30 days.</p>
              </Section>
              <Section title="8. Cookies">
                <p>eDog uses only essential session cookies required for authentication. We do not use tracking or advertising cookies.</p>
              </Section>
              <Section title="9. Changes to This Policy">
                <p>We may update this Privacy Policy from time to time. Changes will be posted within the application. Continued use of eDog after changes are posted constitutes your acceptance of the updated policy.</p>
              </Section>
              <Section title="10. Contact">
                <p>For any privacy-related questions or to exercise your rights, email us at <EmailLink />.</p>
              </Section>
            </>}

          </div>

          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-gray-400 dark:text-[#414751]">eDog v1.0.0 · 2025 · EU</span>
            <span className="text-xs text-gray-400 dark:text-[#414751]">edog.dogpass.net</span>
          </div>
        </div>
      </div>
    </div>
  );
};
