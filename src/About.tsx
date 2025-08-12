import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from './components/ui/navigation-menu';

const About: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('about');

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="bg-myBlack text-white min-h-screen flex flex-col">
      {/* Navigation Header */}
      <header className="w-full p-4 flex flex-col">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-myBlue cursor-pointer" 
              onClick={() => handleNavigation('/homepage')}>
            FriendlyBet
          </h1>
          
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1 bg-myBlue text-white rounded hover:bg-blue-600 transition-colors"
            >
              {i18n.language === 'es' ? 'EN' : 'ES'}
            </button>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className={navigationMenuTriggerStyle({ variant: "transparent" })}
                    onClick={() => handleNavigation('/homepage')}>
                    {t('navigation.home')}
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className={navigationMenuTriggerStyle({ variant: "transparent" })}
                    onClick={() => handleNavigation('/login')}>
                    {t('navigation.login')}
                  </NavigationMenuLink>
                </NavigationMenuItem>
                            
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className={navigationMenuTriggerStyle({ variant: "transparent" })}
                    onClick={() => handleNavigation('/about')}>
                    {t('navigation.about')}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-6 lg:px-32 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-myBlue">
            {t('title')}
          </h1>

          {/* Who We Are Section */}
          <section className="mb-8">
            <h2 className="text-3xl font-semibold mb-4 text-myBlue">
              {t('sections.whoWeAre.title')}
            </h2>
            <div className="space-y-4 text-lg leading-relaxed">
              <p>{t('sections.whoWeAre.description')}</p>
              <p>{t('sections.whoWeAre.background')}</p>
              <p>{t('sections.whoWeAre.relationship')}</p>
            </div>
          </section>

          {/* Why We Created This Game */}
          <section className="mb-8">
            <h2 className="text-3xl font-semibold mb-4 text-myBlue">
              {t('sections.whyCreated.title')}
            </h2>
            <div className="space-y-4 text-lg leading-relaxed">
              <p>{t('sections.whyCreated.purpose')}</p>
              <p>{t('sections.whyCreated.goal')}</p>
              <p>{t('sections.whyCreated.usage')}</p>
            </div>
          </section>

          {/* How It Works */}
          <section className="mb-8">
            <h2 className="text-3xl font-semibold mb-4 text-myBlue">
              {t('sections.howItWorks.title')}
            </h2>
            <p className="text-lg mb-6 leading-relaxed">
              {t('sections.howItWorks.description')}
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="font-semibold mb-2 text-myBlue">
                  {t('sections.howItWorks.steps.step1.title')}
                </h3>
                <p className="text-gray-300">
                  {t('sections.howItWorks.steps.step1.description')}
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="font-semibold mb-2 text-myBlue">
                  {t('sections.howItWorks.steps.step2.title')}
                </h3>
                <p className="text-gray-300">
                  {t('sections.howItWorks.steps.step2.description')}
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="font-semibold mb-2 text-myBlue">
                  {t('sections.howItWorks.steps.step3.title')}
                </h3>
                <p className="text-gray-300">
                  {t('sections.howItWorks.steps.step3.description')}
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="font-semibold mb-2 text-myBlue">
                  {t('sections.howItWorks.steps.step4.title')}
                </h3>
                <p className="text-gray-300">
                  {t('sections.howItWorks.steps.step4.description')}
                </p>
              </div>
            </div>
          </section>

          {/* Scoring System */}
          <section className="mb-8">
            <h2 className="text-3xl font-semibold mb-4 text-myBlue">
              {t('sections.scoring.title')}
            </h2>
            <div className="bg-blue-900/30 p-6 rounded-lg border border-blue-700">
              <ul className="space-y-2 text-lg">
                <li><strong>{t('sections.scoring.exactScore')}</strong></li>
                <li><strong>{t('sections.scoring.correctWinner')}</strong></li>
                <li><strong>{t('sections.scoring.incorrect')}</strong></li>
              </ul>
            </div>
          </section>

          {/* Under the Hood */}
          <section className="mb-8">
            <h2 className="text-3xl font-semibold mb-4 text-myBlue">
              {t('sections.underTheHood.title')}
            </h2>
            <p className="text-lg mb-4 leading-relaxed">
              {t('sections.underTheHood.description')}
            </p>
            
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-4">
              <ul className="space-y-2">
                {(t('sections.underTheHood.technologies', { returnObjects: true }) as string[]).map((tech: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <span className="text-myBlue mr-2">•</span>
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-4 text-lg leading-relaxed">
              <p>{t('sections.underTheHood.futurePlans')}</p>
              <p>{t('sections.underTheHood.additionalSports')}</p>
            </div>
          </section>

          {/* Social Features */}
          <section className="mb-8">
            <h2 className="text-3xl font-semibold mb-4 text-myBlue">
              {t('sections.socialFeatures.title')}
            </h2>
            <p className="text-lg leading-relaxed">
              {t('sections.socialFeatures.description')}
            </p>
          </section>

          {/* Join the Game */}
          <section className="mb-8">
            <h2 className="text-3xl font-semibold mb-4 text-myBlue">
              {t('sections.joinGame.title')}
            </h2>
            <div className="space-y-4 text-lg leading-relaxed">
              <p>{t('sections.joinGame.description')}</p>
              <p>{t('sections.joinGame.feedback')}</p>
            </div>
          </section>

          {/* Reminder */}
          <section className="mb-8 text-center">
            <div className="bg-green-900/30 p-6 rounded-lg border border-green-700">
              <p className="text-xl font-semibold mb-2">
                {t('sections.reminder.fun')}
              </p>
              <p className="text-lg">
                {t('sections.reminder.justGame')}
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full p-4 bg-gray-900 text-center mt-5">
        <p>{t('footer')}</p>
      </footer>
    </div>
  );
};

export default About;