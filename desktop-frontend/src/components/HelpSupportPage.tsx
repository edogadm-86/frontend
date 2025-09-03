import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  HelpCircle, 
  Mail, 
  Phone, 
  Clock, 
  Book, 
  MessageSquare, 
  FileText, 
  Video,
  ArrowLeft,
  ExternalLink,
  Heart,
  Shield,
  Users,
  Zap
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface HelpSupportPageProps {
  onClose: () => void;
}

export const HelpSupportPage: React.FC<HelpSupportPageProps> = ({ onClose }) => {
  const { t } = useTranslation();

  const helpSections = [
    {
      title: t('gettingStarted'),
      icon: Book,
      color: 'from-blue-500 to-cyan-500',
      items: [
        { title: t('addFirstDog'), description: t('addFirstDogDesc') },
        { title: t('setupProfile'), description: t('setupProfileDesc') },
        { title: t('recordVaccinations'), description: t('recordVaccinationsDesc') },
        { title: t('scheduleAppointments'), description: t('scheduleAppointmentsDesc') },
      ]
    },
    {
      title: t('healthManagement'),
      icon: Heart,
      color: 'from-red-500 to-pink-500',
      items: [
        { title: t('trackVaccinations'), description: t('trackVaccinationsDesc') },
        { title: t('manageHealthRecords'), description: t('manageHealthRecordsDesc') },
        { title: t('nutritionTracking'), description: t('nutritionTrackingDesc') },
        { title: t('generatePassport'), description: t('generatePassportDesc') },
      ]
    },
    {
      title: t('trainingFeatures'),
      icon: Shield,
      color: 'from-green-500 to-emerald-500',
      items: [
        { title: t('aiTrainingAssistant'), description: t('aiTrainingAssistantDesc') },
        { title: t('trackProgress'), description: t('trackProgressDesc') },
        { title: t('trainingVideos'), description: t('trainingVideosDesc') },
        { title: t('behaviorNotes'), description: t('behaviorNotesDesc') },
      ]
    },
    {
      title: t('communityFeatures'),
      icon: Users,
      color: 'from-purple-500 to-violet-500',
      items: [
        { title: t('shareStories'), description: t('shareStoriesDesc') },
        { title: t('joinEvents'), description: t('joinEventsDesc') },
        { title: t('askQuestions'), description: t('askQuestionsDesc') },
        { title: t('connectOwners'), description: t('connectOwnersDesc') },
      ]
    }
  ];

  const faqs = [
    {
      question: t('howToAddDog'),
      answer: t('howToAddDogAnswer')
    },
    {
      question: t('howToExportData'),
      answer: t('howToExportDataAnswer')
    },
    {
      question: t('howToChangeLanguage'),
      answer: t('howToChangeLanguageAnswer')
    },
    {
      question: t('howToSetReminders'),
      answer: t('howToSetRemindersAnswer')
    },
    {
      question: t('howToGeneratePassport'),
      answer: t('howToGeneratePassportAnswer')
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 max-w-6xl w-full max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-blue-500 text-white p-6 rounded-t-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <HelpCircle size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{t('helpSupport')}</h1>
                <p className="text-blue-100">{t('helpSupportSubtitle')}</p>
              </div>
            </div>
            <Button variant="glass" onClick={onClose} icon={<ArrowLeft size={16} />}>
              {t('close')}
            </Button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* About eDog */}
          <Card variant="gradient" className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('aboutEDog')}</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  {t('aboutEDogDescription')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Zap size={16} className="text-primary-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('comprehensiveHealthTracking')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield size={16} className="text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('euCompliantPassports')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users size={16} className="text-purple-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('communitySupport')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Heart size={16} className="text-red-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('aiPoweredInsights')}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Help Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {helpSections.map((section, index) => (
              <Card key={index} variant="gradient">
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`w-12 h-12 bg-gradient-to-r ${section.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <section.icon size={20} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{section.title}</h3>
                </div>
                <div className="space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <Card variant="gradient">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <MessageSquare className="mr-3 text-primary-500" />
              {t('frequentlyAskedQuestions')}
            </h3>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="group">
                  <summary className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors">
                    <span className="font-semibold text-gray-900 dark:text-white">{faq.question}</span>
                    <HelpCircle size={16} className="text-gray-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </Card>

          {/* Contact Support */}
          <Card variant="gradient" className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Mail size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-800 dark:text-green-300">{t('needMoreHelp')}</h3>
                <p className="text-green-600 dark:text-green-400">{t('contactSupportTeam')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                <Mail size={32} className="mx-auto mb-3 text-green-600" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('emailSupport')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('emailSupportDesc')}</p>
                <a 
                  href="mailto:edog.adm@gmail.com"
                  className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
                >
                  <span>edog.adm@gmail.com</span>
                  <ExternalLink size={14} />
                </a>
              </div>
              
              <div className="text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                <Clock size={32} className="mx-auto mb-3 text-blue-600" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('responseTime')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('responseTimeDesc')}</p>
                <span className="text-blue-600 dark:text-blue-400 font-medium">{t('within24Hours')}</span>
              </div>
              
              <div className="text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                <FileText size={32} className="mx-auto mb-3 text-purple-600" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('documentation')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('documentationDesc')}</p>
                <Button variant="outline" size="sm" icon={<ExternalLink size={14} />}>
                  {t('viewDocs')}
                </Button>
              </div>
            </div>
          </Card>

          {/* App Information */}
          <Card variant="gradient">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('appInformation')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">1.0.0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('version')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">2024</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('year')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">Desktop</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('platform')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">EU</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('compliance')}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};