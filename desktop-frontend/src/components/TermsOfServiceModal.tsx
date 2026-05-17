import React from 'react';
import { X, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TermsOfServiceModalProps {
  onClose: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h3 className="text-sm font-bold text-gray-900 dark:text-[#e2e2e6] mb-2">{title}</h3>
    <div className="text-sm text-gray-500 dark:text-[#8b919d] leading-relaxed space-y-2">{children}</div>
  </div>
);

const EmailLink = () => (
  <a href="mailto:edog.adm@gmail.com" className="text-[#005da7] dark:text-[#a4c9ff] hover:underline">
    edog.adm@gmail.com
  </a>
);

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ onClose }) => {
  const { i18n } = useTranslation();
  const bg = i18n.language === 'bg';

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="font-jakarta bg-[#fbf9f8] dark:bg-[#111316] w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex-shrink-0 flex items-center gap-3 px-6 py-4 bg-white dark:bg-[#1e2023] border-b border-gray-100 dark:border-white/5">
          <div className="w-9 h-9 bg-gradient-to-br from-[#005da7] to-[#0090e7] rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
            <FileText size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900 dark:text-[#e2e2e6] leading-tight">
              {bg ? 'Условия за ползване' : 'Terms of Service'}
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
              <Section title="1. Приемане на условията">
                <p>Като създавате акаунт или използвате eDog („Услугата"), вие се съгласявате да спазвате тези Условия за ползване. Ако не сте съгласни, моля, не използвайте Услугата.</p>
              </Section>
              <Section title="2. Описание на услугата">
                <p>eDog е приложение за управление на кучета, което позволява на собствениците да проследяват здравните записи на кучетата си, ваксинациите, прегледите, историята на теглото и да генерират цифрови паспорти за домашни любимци. То включва и функция за общност за споделяне на истории с други собственици на кучета.</p>
              </Section>
              <Section title="3. Регистрация на акаунт">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Трябва да предоставите точна и пълна информация при регистрация.</li>
                  <li>Отговорни сте за сигурността на данните за вашия акаунт.</li>
                  <li>Трябва да сте навършили поне 16 години, за да използвате Услугата.</li>
                  <li>Едно лице не може да създава множество акаунти.</li>
                  <li>Трябва незабавно да ни уведомите на <EmailLink />, ако подозирате неупълномощен достъп до вашия акаунт.</li>
                </ul>
              </Section>
              <Section title="4. Допустима употреба">
                <p>Вие се съгласявате да не:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Публикувате невярно, подвеждащо или вредно съдържание в общностния фийд.</li>
                  <li>Качвате съдържание, нарушаващо права на интелектуална собственост на трети страни.</li>
                  <li>Опитвате да получите неупълномощен достъп до акаунти или данни на други потребители.</li>
                  <li>Използвате Услугата за незаконни цели или в нарушение на приложимото законодателство на ЕС.</li>
                  <li>Извличате или систематично събирате данни от Услугата.</li>
                  <li>Въвеждате зловреден софтуер, вируси или друг злонамерен код.</li>
                </ul>
              </Section>
              <Section title="5. Информация за паспорт на домашен любимец">
                <p>eDog генерира цифрови документи за паспорт на домашни любимци въз основа на предоставената от вас информация. Тези документи се предоставят само за удобство и информационни цели. Вие носите пълна отговорност за точността на въведените здравни записи и за спазването на приложимите ветеринарни, пътни и митнически разпоредби.</p>
              </Section>
              <Section title="6. Съдържание на общността">
                <p>Вие запазвате собствеността върху съдържанието, което публикувате в общностния фийд. Чрез публикуването давате на eDog неизключителен, безвъзмезден лиценз за показване на съдържанието в рамките на Услугата. Запазваме си правото да премахваме съдържание, нарушаващо тези Условия или насоките на нашата общност, без предварително уведомление.</p>
              </Section>
              <Section title="7. Интелектуална собственост">
                <p>Наименованието eDog, логото, дизайнът на приложението и целият свързан софтуер са собственост на eDog и са защитени от приложимото законодателство. Нямате право да копирате, модифицирате или разпространявате Услугата или нейните компоненти без предварително писмено разрешение.</p>
              </Section>
              <Section title="8. Наличност и модификации">
                <p>Стремим се Услугата да бъде достъпна по всяко време, но не гарантираме непрекъснат достъп. Запазваме си правото да модифицираме, спираме или прекратяваме която и да е част от Услугата, като се стремим да осигурим разумно предизвестие за значителни промени.</p>
              </Section>
              <Section title="9. Отказ от гаранции">
                <p>Услугата се предоставя „такава, каквато е" и „при наличност", без гаранции от какъвто и да е вид. eDog не гарантира, че Услугата ще бъде без грешки или сигурна. Нищо в Услугата не представлява ветеринарен съвет.</p>
              </Section>
              <Section title="10. Ограничение на отговорността">
                <p>В максималната степен, позволена от приложимото законодателство, eDog не носи отговорност за косвени, случайни, специални или последващи щети, произтичащи от използването на Услугата. Нашата обща отговорност не надвишава сумата, платена от вас през 12-те месеца преди претенцията (за безплатна услуга — нула).</p>
              </Section>
              <Section title="11. Прекратяване">
                <p>Можете да изтриете акаунта си по всяко време чрез настройките на приложението. Можем да спрем или прекратим акаунта ви при нарушение на тези Условия. При прекратяване правото ви да използвате Услугата спира незабавно.</p>
              </Section>
              <Section title="12. Приложимо право">
                <p>Тези Условия се уреждат от законодателството на Европейския съюз. Всички спорове са под изключителната юрисдикция на компетентните съдилища в ЕС.</p>
              </Section>
              <Section title="13. Промени в тези условия">
                <p>Можем да актуализираме тези Условия от время на время. Актуализираната версия ще бъде публикувана в приложението с ревизирана дата. Продължаването на използването на Услугата след влизането в сила на промените представлява приемане на новите Условия.</p>
              </Section>
              <Section title="14. Контакт">
                <p>За въпроси относно тези Условия се свържете с нас на <EmailLink />.</p>
              </Section>
            </> : <>
              <Section title="1. Acceptance of Terms">
                <p>By creating an account or using eDog ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
              </Section>
              <Section title="2. Description of Service">
                <p>eDog is a dog management application that allows owners to track their dogs' health records, vaccinations, appointments, weight history, and generate digital pet passports. It also includes a community feature for sharing stories and experiences with other dog owners.</p>
              </Section>
              <Section title="3. Account Registration">
                <ul className="list-disc pl-5 space-y-1">
                  <li>You must provide accurate and complete information when registering.</li>
                  <li>You are responsible for maintaining the security of your account credentials.</li>
                  <li>You must be at least 16 years of age to use the Service.</li>
                  <li>One person may not create multiple accounts.</li>
                  <li>You must notify us immediately at <EmailLink /> if you suspect unauthorised access to your account.</li>
                </ul>
              </Section>
              <Section title="4. Acceptable Use">
                <p>You agree not to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Post false, misleading, or harmful content in the community feed.</li>
                  <li>Upload content that infringes third-party intellectual property rights.</li>
                  <li>Attempt to gain unauthorised access to other users' accounts or data.</li>
                  <li>Use the Service for any unlawful purpose or in violation of applicable EU law.</li>
                  <li>Scrape, harvest, or systematically collect data from the Service.</li>
                  <li>Introduce malware, viruses, or other malicious code.</li>
                </ul>
              </Section>
              <Section title="5. Pet Passport Information">
                <p>eDog generates digital pet passport documents based on information you provide. These documents are provided for convenience and informational purposes only. You are solely responsible for ensuring the accuracy of all health records entered and for compliance with applicable veterinary, travel, and import/export regulations.</p>
              </Section>
              <Section title="6. Community Content">
                <p>You retain ownership of content you post to the community feed. By posting, you grant eDog a non-exclusive, royalty-free licence to display that content within the Service. We reserve the right to remove content that violates these Terms or our community guidelines without prior notice.</p>
              </Section>
              <Section title="7. Intellectual Property">
                <p>The eDog name, logo, application design, and all associated software are the property of eDog and are protected by applicable intellectual property laws. You may not copy, modify, or distribute the Service or its components without prior written permission.</p>
              </Section>
              <Section title="8. Availability and Modifications">
                <p>We aim to keep the Service available at all times but do not guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue any part of the Service at any time, with reasonable notice of significant changes where possible.</p>
              </Section>
              <Section title="9. Disclaimer of Warranties">
                <p>The Service is provided "as is" and "as available" without warranties of any kind. eDog does not warrant that the Service will be error-free or secure. Nothing in the Service constitutes veterinary advice.</p>
              </Section>
              <Section title="10. Limitation of Liability">
                <p>To the maximum extent permitted by applicable law, eDog shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim (which, for a free service, is zero).</p>
              </Section>
              <Section title="11. Termination">
                <p>You may delete your account at any time through the application settings. We may suspend or terminate your account if you breach these Terms. Upon termination, your right to use the Service ceases immediately.</p>
              </Section>
              <Section title="12. Governing Law">
                <p>These Terms are governed by the laws of the European Union. Any disputes shall be subject to the exclusive jurisdiction of the competent courts in the EU.</p>
              </Section>
              <Section title="13. Changes to These Terms">
                <p>We may update these Terms from time to time. The updated version will be posted within the application with a revised date. Continued use of the Service after changes take effect constitutes acceptance of the new Terms.</p>
              </Section>
              <Section title="14. Contact">
                <p>For any questions about these Terms, contact us at <EmailLink />.</p>
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
