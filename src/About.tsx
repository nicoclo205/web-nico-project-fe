import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaHome } from "react-icons/fa";
import { GiSoccerField } from "react-icons/gi";
import { MdMeetingRoom } from "react-icons/md";
import { FiSettings, FiInfo, FiMail, FiCode } from "react-icons/fi";
import LanguageSelectorEnhanced from './components/LanguageSelectorEnhanced';

const About: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['about']);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#0e0f11] text-white page-transition-enter">

      {/* Sidebar */}
      <aside className="lg:w-20 w-full flex lg:flex-col flex-row items-center justify-around lg:justify-start py-4 lg:py-6 lg:space-y-8 space-x-4 lg:space-x-0 bg-[#121316]">
        <FaHome
          onClick={() => navigate('/homepage')}
          className="text-white w-12 h-12 p-3 rounded-2xl hover:bg-white/10 transition-all duration-200 ease-in-out cursor-pointer"
        />
        <GiSoccerField
          onClick={() => navigate('/soccer-matches')}
          className="text-white w-12 h-12 p-3 rounded-2xl hover:bg-white/10 transition-all duration-200 ease-in-out cursor-pointer"
        />
        <MdMeetingRoom
          onClick={() => navigate('/rooms')}
          className="text-white w-12 h-12 p-3 rounded-2xl hover:bg-white/10 transition-all duration-200 ease-in-out cursor-pointer"
        />
        <FiSettings
          onClick={() => navigate('/settings')}
          className="text-white w-12 h-12 p-3 rounded-2xl hover:bg-white/10 transition-all duration-200 ease-in-out cursor-pointer"
        />
        <FiInfo
          className="text-white w-12 h-12 p-3 rounded-2xl bg-green-600"
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8 md:mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{t('title')}</h1>
            <p className="text-gray-400 text-sm mt-1">FriendlyBet</p>
          </div>
          <LanguageSelectorEnhanced />
        </div>

        <div className="max-w-4xl mx-auto space-y-6">

          {/* Hero Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-green-900/40 to-green-700/10 border border-green-700/30 rounded-2xl p-6 md:p-8">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">⚽</span>
                <h2 className="text-2xl md:text-3xl font-bold text-white">FriendlyBet</h2>
              </div>
              <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-2xl">
                {t('sections.howItWorks.description')}
              </p>
            </div>
          </div>

          {/* Team + How to Play */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* The Team */}
            <div className="bg-[#1a1d21] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <span>👋</span> {t('sections.whoWeAre.title')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">N</div>
                  <div>
                    <p className="text-white font-medium">Nico</p>
                    <p className="text-gray-400 text-sm">Frontend · React & TypeScript</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">M</div>
                  <div>
                    <p className="text-white font-medium">Miguel</p>
                    <p className="text-gray-400 text-sm">Backend · Django & Python</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm pt-3 border-t border-white/10 leading-relaxed">
                  {t('sections.whoWeAre.relationship')}
                </p>
              </div>
            </div>

            {/* How to Play */}
            <div className="bg-[#1a1d21] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <span>🎮</span> {t('sections.howItWorks.title')}
              </h3>
              <div className="space-y-4">
                {[
                  { step: '1', title: t('sections.howItWorks.steps.step1.title'), desc: t('sections.howItWorks.steps.step1.description') },
                  { step: '2', title: t('sections.howItWorks.steps.step2.title'), desc: t('sections.howItWorks.steps.step2.description') },
                  { step: '3', title: t('sections.howItWorks.steps.step3.title'), desc: t('sections.howItWorks.steps.step3.description') },
                  { step: '4', title: t('sections.howItWorks.steps.step4.title'), desc: t('sections.howItWorks.steps.step4.description') },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-600/20 border border-green-600/40 flex items-center justify-center text-green-400 text-xs font-bold flex-shrink-0 mt-0.5">
                      {step}
                    </span>
                    <div>
                      <p className="text-white text-sm font-medium">{title}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scoring System */}
          <div className="bg-[#1a1d21] border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <span>🏆</span> {t('sections.scoring.title')}
            </h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              {t('sections.scoring.description')}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="text-center bg-green-900/20 border border-green-700/30 rounded-xl p-4">
                <div className="text-3xl font-bold text-green-400 mb-1">3</div>
                <div className="text-white text-sm font-semibold mb-1">{t('sections.scoring.exactScoreLabel')}</div>
                <div className="text-gray-400 text-xs leading-snug">{t('sections.scoring.exactScoreDesc')}</div>
              </div>
              <div className="text-center bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4">
                <div className="text-3xl font-bold text-yellow-400 mb-1">1</div>
                <div className="text-white text-sm font-semibold mb-1">{t('sections.scoring.winnerLabel')}</div>
                <div className="text-gray-400 text-xs leading-snug">{t('sections.scoring.winnerDesc')}</div>
              </div>
              <div className="text-center bg-red-900/20 border border-red-700/30 rounded-xl p-4">
                <div className="text-3xl font-bold text-red-400 mb-1">0</div>
                <div className="text-white text-sm font-semibold mb-1">{t('sections.scoring.wrongLabel')}</div>
                <div className="text-gray-400 text-xs leading-snug">{t('sections.scoring.wrongDesc')}</div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-white text-sm font-medium mb-1">📊 {t('sections.scoring.rankingTitle')}</p>
              <p className="text-gray-400 text-sm leading-relaxed">{t('sections.scoring.rankingDesc')}</p>
            </div>
          </div>

          {/* Tech Stack + Contact */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Tech Stack */}
            <div className="bg-[#1a1d21] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiCode className="text-green-400" /> {t('sections.underTheHood.title')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {['React', 'TypeScript', 'Django', 'Python', 'MySQL', 'Tailwind', 'Vercel', 'Docker'].map(tech => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-white/10 border border-white/10 rounded-full text-sm text-gray-300 font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-[#1a1d21] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiMail className="text-green-400" /> {t('sections.joinGame.title')}
              </h3>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                {t('sections.joinGame.description')}
              </p>
              <a
                href="mailto:global.niclami@gmail.com"
                className="inline-flex items-center gap-2 text-green-400 text-sm hover:text-green-300 transition-colors font-medium"
              >
                <FiMail className="w-4 h-4" />
                global.niclami@gmail.com
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-6">
            <p className="text-gray-600 text-sm">{t('footer')}</p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default About;
