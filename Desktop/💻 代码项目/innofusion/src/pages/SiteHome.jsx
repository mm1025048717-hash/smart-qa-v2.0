import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, CheckCircle, Globe, ArrowRight } from 'lucide-react';
import { useI18n } from '../i18n.jsx';
import MiniCanvas from '../components/MiniCanvas.jsx';

export default function SiteHome() {
  const go = (hash) => { window.location.hash = hash; };
  useEffect(() => {
    document.title = 'bubblefusion — Fuse Ideas, Form Plans.';
  }, []);
  return (
    <div className="w-full min-h-screen bg-white text-gray-800 font-sans">
      <Header onTry={() => go('#/lab')} />
      <main>
        <section id="home-hero"><Hero onTry={() => go('#/lab')} /></section>
        <section id="home-why" className="scroll-mt-16"><WhySection /></section>
        <section id="home-mod1" className="pt-16"><FeatureRow
          title={useI18n().t('site.feature1.title')}
          desc={useI18n().t('site.feature1.desc')}
          bullets={[
            useI18n().t('site.feature1.bullet1'),
            useI18n().t('site.feature1.bullet2'),
            useI18n().t('site.feature1.bullet3'),
          ]}
          ctaText={useI18n().t('site.feature1.cta')}
          mediaSrc="/images/feature-1.svg"
          align="right"
        /></section>
        <section id="home-mod2"><FeatureRow
          title={useI18n().t('site.feature2.title')}
          desc={useI18n().t('site.feature2.desc')}
          bullets={[
            useI18n().t('site.feature2.bullet1'),
            useI18n().t('site.feature2.bullet2'),
            useI18n().t('site.feature2.bullet3'),
          ]}
          ctaText={useI18n().t('site.feature2.cta')}
          mediaSrc="/images/feature-2.svg"
          align="left"
        /></section>
        <section id="home-mod3"><FeatureRow
          title={useI18n().t('site.feature3.title')}
          desc={useI18n().t('site.feature3.desc')}
          bullets={[
            useI18n().t('site.feature3.bullet1'),
            useI18n().t('site.feature3.bullet2'),
            useI18n().t('site.feature3.bullet3'),
          ]}
          ctaText={useI18n().t('site.feature3.cta')}
          mediaSrc="/images/feature-3.svg"
          align="right"
        /></section>
        <section id="home-gallery" className="scroll-mt-16"><GallerySection /></section>
        <section id="founder" className="scroll-mt-16"><FounderSection /></section>
        <section id="home-testimonials" className="scroll-mt-16"><Testimonials /></section>
        <section id="home-pricing" className="scroll-mt-16"><Pricing /></section>
        <section id="home-cta" className="scroll-mt-16"><CTA onTry={() => go('#/lab')} /></section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Header({ onTry }) {
  const { lang, setLang, t } = useI18n();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full top-0 z-40 bg-white/80 backdrop-blur-sm transition-shadow duration-300 border-b ${scrolled ? 'shadow-md border-gray-200' : 'border-transparent'}`}>
      <div className="mx-auto max-w-5xl px-4 h-20 flex items-center gap-4">
        <div className="flex items-center gap-2 font-semibold min-w-[140px]">
          <img src="/bubble-icon.svg" className="w-7 h-7" />
          <span className="font-display tracking-wide text-black text-lg">{t('site.brand')}</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-base text-gray-500 flex-1 justify-center">
          <a href="#home-why" className="hover:text-black transition-colors">{t('site.nav.why')}</a>
          <a href="#home-gallery" className="hover:text-black transition-colors">{t('site.nav.gallery')}</a>
          <a href="#home-pricing" className="hover:text-black transition-colors">{t('site.nav.pricing')}</a>
        </nav>
        <div className="flex items-center gap-3 min-w-[220px] justify-end">
          <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="h-10 px-4 rounded-full border border-gray-300 bg-transparent flex items-center gap-2 hover:bg-gray-100 transition-colors text-gray-600">
            {lang === 'zh' ? 'EN' : '中'}
          </button>
          <button onClick={() => window.location.hash = '#/workbench'} className="h-12 px-6 rounded-lg text-white bg-bfl-primary hover:bg-bfl-primary-600 transition-all font-bold text-lg">
            {t('site.nav.launch')}
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({ onTry }) {
  const { t } = useI18n();
  return (
    <section className="relative h-screen flex flex-col items-center justify-center text-center text-black overflow-hidden">
      <img
        src="/images/hero-bg-lovart-light.svg"
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        alt="background"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-white/50 z-10" />

      <div className="relative z-20 p-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
        >
          <h1 className="text-6xl md:text-8xl font-black font-display uppercase tracking-tighter">
            {t('site.brand')}
          </h1>
          <p className="mt-4 text-2xl md:text-3xl text-bfl-primary font-bold max-w-3xl mx-auto">
            {t('site.hero.sub')}
          </p>
          <button
            onClick={onTry}
            className="mt-10 px-12 py-5 rounded-lg text-xl font-bold bg-bfl-primary text-white hover:bg-bfl-primary-600 transition-colors"
          >
            {t('site.hero.try')}
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function WhySection() {
  const { t } = useI18n();
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 text-center">
        <SectionHead badge={t('site.why.badge')} title={t('site.why.title')} center />
        <div className="mt-12">
          <MiniCanvas />
        </div>
      </div>
    </section>
  );
}

function FeatureRow({ title, desc, bullets = [], ctaText = 'Try Now', align = 'right', mediaSrc }) {
  const text = (
    <div className="max-w-xl">
      <h3 className="text-3xl font-bold font-display text-black tracking-tight">{title}</h3>
      <p className="mt-4 text-lg text-gray-500 leading-relaxed">{desc}</p>
      {bullets.length ? (
        <ul className="mt-6 text-lg text-gray-500 space-y-4">
          {bullets.map((b,i)=> 
            <li key={i} className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-bfl-primary flex-shrink-0 mt-1" />
              <span>{b}</span>
            </li>
          )}
        </ul>
      ) : null}
      <button 
        onClick={() => window.location.hash = '#/workbench'}
        className="mt-8 h-12 px-6 rounded-full border border-gray-300 hover:bg-gray-100 transition-all duration-300 flex items-center gap-2 text-base text-gray-600 font-medium hover:shadow-md hover:-translate-y-px"
      >
        {ctaText}
        <ArrowRight size={16} />
      </button>
    </div>
  );
  const media = (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 h-96 relative overflow-hidden flex items-center justify-center p-8">
      <img src={mediaSrc} alt={title} className="w-full h-full object-contain" />
    </div>
  );
  return (
    <section className="bg-white py-12 md:py-20">
      <div className="mx-auto max-w-5xl px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {align === 'left' ? (<>
          {media}
          {text}
        </>) : (<>
          {text}
          {media}
        </>)}
      </div>
    </section>
  );
}

function GallerySection() {
  const { t } = useI18n();
  const items = [
    { title: t('site.gallery.item1.title'), src: '/images/gallery-item-1.svg' },
    { title: t('site.gallery.item2.title'), src: '/images/gallery-item-2.svg' },
    { title: t('site.gallery.item3.title'), src: '/images/gallery-item-3.svg' },
    { title: t('site.gallery.item4.title'), src: '/images/gallery-item-4.svg' },
  ];
  return (
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <SectionHead title={t('site.gallery.title')} sub={t('site.gallery.sub')} center />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
          {items.map((it,i)=> (
            <div key={i} className="aspect-[16/9] rounded-xl border border-gray-200 bg-white relative overflow-hidden group transition-all duration-300 p-6 flex items-center justify-center">
              <img src={it.src} alt={it.title} className="w-full h-full object-contain opacity-80 group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute bottom-5 text-center text-gray-500 text-base">{it.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FounderSection() {
  const { t } = useI18n();
  const tags = t('site.founder.tags').split('｜');
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          <div className="md:col-span-1 text-center md:text-left">
            <img src="/images/founder-portrait.svg" alt="Founder Portrait" className="w-48 h-48 mx-auto md:mx-0" />
            <h3 className="mt-6 text-3xl font-bold font-display text-black">{t('site.founder.name')}</h3>
            <p className="text-gray-500 text-lg">{t('site.founder.role')}</p>
            <div className="mt-6 flex items-center justify-center md:justify-start gap-3">
              <button className="h-10 px-5 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors text-sm text-gray-600 font-medium">原型</button>
              <button className="h-10 px-5 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors text-sm text-gray-600 font-medium">视频</button>
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="text-3xl text-gray-800 leading-tight font-display italic">“{t('site.founder.quote')}”</p>
            <p className="mt-8 text-xl text-gray-500 leading-relaxed max-w-3xl">{t('site.founder.card_desc')}</p>
            
            <div className="mt-12">
              <h4 className="text-base font-semibold tracking-wider text-bfl-primary uppercase">专业领域</h4>
              <div className="mt-4 flex flex-wrap gap-3">
                {tags.map((tag, i) => (
                  <span key={i} className="px-4 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-base text-gray-600">{tag}</span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const { t } = useI18n();
  const items = [
    { name: t('site.testimonials.item1.name'), role: t('site.testimonials.item1.role'), quote: t('site.testimonials.item1.quote') },
    { name: t('site.testimonials.item2.name'), role: t('site.testimonials.item2.role'), quote: t('site.testimonials.item2.quote') },
    { name: t('site.testimonials.item3.name'), role: t('site.testimonials.item3.role'), quote: t('site.testimonials.item3.quote') },
  ];
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="mx-auto max-w-5xl px-4">
        <SectionHead title={t('site.testimonials.title')} center />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <Reveal key={i}>
              <div className="p-8 rounded-2xl border border-gray-200 bg-white h-full flex flex-col justify-between">
                <div className="text-xl text-gray-800 leading-relaxed font-display italic">“{t.quote}”</div>
                <div className="pt-6 mt-6 border-t border-gray-200 text-base text-gray-800 font-sans">
                  <div className="font-semibold text-lg">{t.name}</div>
                  <div className="text-gray-500">{t.role}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const { t } = useI18n();
  const plans = [
    { name: t('site.pricing.plan.starter'), price: 0, features: ['AI 搜索（限量）','交互画布','3 个方案模板'] },
    { name: t('site.pricing.plan.team'), price: 29, highlight: true, features: ['不限看板','Agent 协作','导出与分享','优先支持'] },
    { name: t('site.pricing.plan.pro'), price: 69, features: ['团队权限','自定义模板','多模型接入','审计日志'] },
  ];
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-5xl px-4">
        <SectionHead title={t('site.pricing.title')} sub={t('site.pricing.sub')} center />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p, i) => (
            <Reveal key={i}>
              <div className={`p-8 rounded-2xl border ${p.highlight?'border-bfl-primary/50 bg-blue-50':'border-gray-200 bg-white'} h-full flex flex-col`}> 
                <div className="flex items-baseline justify-between">
                  <div className="text-xl font-semibold text-black">{p.name}</div>
                  <div>
                    <span className="text-5xl font-bold text-black">${p.price}</span>
                    <span className="text-base text-gray-500">/{t('site.pricing.perMonth')}</span>
                  </div>
                </div>
                <ul className="mt-8 space-y-3 text-lg text-gray-500 list-disc pl-5 flex-1">
                  {p.features.map((f, idx) => <li key={idx}>{f}</li>)}
                </ul>
                <button className={`mt-8 w-full h-14 rounded-full text-lg font-medium transition-colors ${p.highlight?'bg-bfl-primary text-white hover:bg-bfl-primary-600':'border border-gray-300 bg-white text-black hover:bg-gray-100'}`}>{t('site.pricing.cta')}</button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA({ onTry }) {
  const { t } = useI18n();
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <div className="p-10 rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white flex flex-col items-center text-center">
          <h2 className="text-4xl font-bold font-display text-black tracking-tight">{t('site.cta.title')}</h2>
          <p className="text-lg text-gray-500 mt-4">{t('site.cta.sub')}</p>
          <button onClick={onTry} className="mt-8 h-12 px-8 rounded-full bg-bfl-primary hover:bg-bfl-primary-600 text-white flex items-center justify-center text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-[0_0_30px_rgba(60,80,255,0.3)]">{t('site.cta.try')}</button>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer id="about" className="border-t border-gray-200 bg-white scroll-mt-16">
      <div className="mx-auto max-w-5xl px-4 py-12 text-base">
        <div className="text-center text-gray-500">© {new Date().getFullYear()} bubblefusion. All rights reserved.</div>
      </div>
    </footer>
  );
}

function SectionHead({ badge, title, sub, center }) {
  return (
    <div className={center ? 'text-center' : ''}>
      {badge && <h2 className="text-base font-semibold tracking-wider text-bfl-primary uppercase">{badge}</h2>}
      <p className={`mt-1 text-4xl font-bold font-display text-black tracking-tight`}>{title}</p>
      {sub && <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed">{sub}</p>}
    </div>
  );
}

function Reveal({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.4 }}
    >
      {children}
    </motion.div>
  );
}


