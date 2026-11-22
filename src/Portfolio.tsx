import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { ArrowDown, ArrowUpRight, BookOpen, Download, ExternalLink, FileText, MapPin, Menu, X } from 'lucide-react';
import { PORTFOLIO_DATA } from './data/portfolioData';
import { resumePdfUrl, resumeUrl } from './components/resume/resumeData';
import { GmailIcon } from './components/dom/GmailIcon';
import { handleGmailComposeClick } from './utils/openGmailCompose';
import './styles/edition.css';

const profile = PORTFOLIO_DATA.profile;
const comicUrl = `${import.meta.env.BASE_URL}comic/`;
const [akasha, icu, quiz, library] = PORTFOLIO_DATA.projects;
const cases: {
  name: string;
  type: string;
  image: string;
  role: string;
  intro: string;
  detail: string[];
  stack: string[];
  link: string;
  liveUrl?: string;
}[] = [
  { name: akasha.title, type: 'AI & architecture', image: 'akasha-blueprint', role: akasha.role, intro: akasha.architectureSummary, detail: akasha.keyFeatures, stack: akasha.techStack, link: akasha.githubUrl, liveUrl: akasha.liveUrl },
  { name: 'DEPI Cloud Infrastructure', type: 'DevOps & cloud', image: 'devops', role: 'DevOps Engineer', intro: 'An award-winning deployment pipeline for containerized services on AWS.', detail: ['Containerized services with Docker and deployed them on Kubernetes.', 'Automated CI/CD with GitHub Actions and Jenkins.', 'Provisioned AWS infrastructure and monitored services with Prometheus and Grafana.'], stack: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Ansible', 'Jenkins', 'GitHub Actions', 'Prometheus', 'Grafana'], link: 'https://github.com/Devopsians12/Devopsians' },
  { name: icu.title, type: 'Real-time systems', image: 'icu-monitoring', role: icu.role, intro: icu.architectureSummary, detail: icu.keyFeatures, stack: icu.techStack, link: icu.githubUrl, liveUrl: icu.liveUrl },
  { name: quiz.title, type: 'Full-stack development', image: 'quiz', role: quiz.role, intro: quiz.architectureSummary, detail: quiz.keyFeatures, stack: quiz.techStack, link: quiz.githubUrl, liveUrl: quiz.liveUrl },
  { name: library.title, type: 'Team engineering', image: 'library', role: library.role, intro: library.architectureSummary, detail: library.keyFeatures, stack: library.techStack, link: library.githubUrl, liveUrl: library.liveUrl },
];

const work = [
  ['May 2026 – Present', 'Project Coordinator', 'Eyouth · Digilians', 'I coordinate training schedules and onboarding, track milestones, and work with mentors to resolve day-to-day delivery issues.'],
  ['Jun 2025 – May 2026', 'Programming Instructor', '3C School', 'I taught programming and algorithms through hands-on lessons, debugging exercises, and student projects.'],
  ['Jul 2024 – Dec 2024', 'Technical Support Representative', 'Vodafone · Data & Fixed', 'I diagnosed broadband, DSL, and router issues and escalated infrastructure incidents to network engineers.'],
  ['Sep 2023 – Jan 2024', 'Technical Support Representative', 'Vodafone · Corporate', 'I handled enterprise connectivity requests and coordinated incident resolution with technical teams and account managers.'],
];
const skills = [
  ['Application development', 'React, Node.js, Express, Socket.IO, REST APIs, HTML, CSS, Tailwind CSS'],
  ['Programming & data', 'JavaScript, TypeScript, Python, Java, C, MongoDB, MySQL, Neo4j'],
  ['Cloud & delivery', 'Docker, Kubernetes, AWS, Terraform, Ansible, Jenkins, GitHub Actions'],
  ['Engineering practice', 'Git, code review, system design, Prometheus, Grafana, network security'],
];
const links = [['Projects', 'projects'], ['Experience', 'experience'], ['Skills', 'skills'], ['Contact', 'contact']] as const;
type SectionId = typeof links[number][1];
type CaseStudy = typeof cases[number];

function easeInOutQuart(t: number): number {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

function CaseDialog({ item, dismiss }: { item: CaseStudy; dismiss: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return <dialog ref={ref} className="case-dialog" aria-labelledby="case-title"
    onCancel={dismiss} onClick={event => { if (event.target === ref.current) dismiss(); }}>
    <button type="button" autoFocus className="close-case" aria-label="Close case study" onClick={dismiss}><X /></button>
    <article className="dialog-scroll" tabIndex={0} aria-label="Case study details">
      <div className="dialog-art"><img src={'./comic/' + item.image + '.webp'} alt="" /></div>
      <div className="dialog-copy"><span className="kicker">{item.type}</span><h2 id="case-title">{item.name}</h2><p className="byline">{item.role}</p><ul className="case-bullets">{item.detail.map(point => <li key={point}>{point}</li>)}</ul>
      <ul className="tech-list" aria-label="Technologies">{item.stack.map(tag => <li key={tag}>{tag}</li>)}</ul>
      <div className="actions">
        {item.liveUrl && <a className="ink-button red" href={item.liveUrl} target="_blank" rel="noopener noreferrer">Open live app <ExternalLink size={16}/></a>}
        <a className="ink-button" href={item.link} target="_blank" rel="noopener noreferrer">View repository <ExternalLink size={16}/></a>
      </div></div>
    </article>
  </dialog>;
}

export default function Portfolio() {
  const [item, setItem] = useState<CaseStudy | null>(null);
  const [menu, setMenu] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const [arrivedSection, setArrivedSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [navJumping, setNavJumping] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const scrollRafRef = useRef<number | null>(null);
  const arrivalTimerRef = useRef<number | null>(null);

  const cancelSmoothScroll = useCallback(() => {
    if (scrollRafRef.current !== null) {
      cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = null;
      setNavJumping(false);
    }
  }, []);

  const triggerArrival = useCallback((id: string) => {
    if (arrivalTimerRef.current !== null) {
      window.clearTimeout(arrivalTimerRef.current);
    }
    setArrivedSection(null);
    requestAnimationFrame(() => {
      setArrivedSection(id);
      const targetEl = document.getElementById(id);
      if (targetEl) {
        if (targetEl.hasAttribute('data-reveal')) {
          targetEl.setAttribute('data-visible', 'true');
        }
        targetEl.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => {
          el.setAttribute('data-visible', 'true');
        });
      }
      arrivalTimerRef.current = window.setTimeout(() => {
        setArrivedSection(current => (current === id ? null : current));
        arrivalTimerRef.current = null;
      }, 950);
    });
  }, []);

  const navigateToSection = useCallback((id: string, event?: MouseEvent<HTMLAnchorElement>) => {
    event?.preventDefault();
    setMenu(false);
    cancelSmoothScroll();

    const targetEl = id === 'top' ? rootRef.current : document.getElementById(id);
    if (!targetEl) return;

    const headerHeight = headerRef.current?.getBoundingClientRect().height ?? 76;
    const rawTargetY = id === 'top'
      ? 0
      : Math.max(0, window.scrollY + targetEl.getBoundingClientRect().top - headerHeight - 8);
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const targetY = Math.min(rawTargetY, maxScroll);

    if (id !== 'top') {
      setActiveSection(id as SectionId);
    } else {
      setActiveSection(null);
    }

    const hash = id === 'top' ? '' : `#${id}`;
    if (window.location.hash !== hash) {
      window.history.pushState(null, '', hash || window.location.pathname + window.location.search);
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const startY = window.scrollY;
    const distance = targetY - startY;

    if (reducedMotion || Math.abs(distance) < 4) {
      window.scrollTo(0, targetY);
      if (id !== 'top') triggerArrival(id);
      return;
    }

    const duration = Math.min(820, Math.max(460, Math.abs(distance) * 0.42));
    const startTime = performance.now();
    setNavJumping(true);

    const step = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = easeInOutQuart(progress);
      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        scrollRafRef.current = requestAnimationFrame(step);
      } else {
        scrollRafRef.current = null;
        setNavJumping(false);
        if (id !== 'top') triggerArrival(id);
      }
    };

    scrollRafRef.current = requestAnimationFrame(step);
  }, [cancelSmoothScroll, triggerArrival]);

  // Cancel programmatic scroll immediately if the user takes over scrolling
  useEffect(() => {
    const onUserInterrupt = () => cancelSmoothScroll();
    const onKeyInterrupt = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
        cancelSmoothScroll();
      }
    };
    window.addEventListener('wheel', onUserInterrupt, { passive: true });
    window.addEventListener('touchstart', onUserInterrupt, { passive: true });
    window.addEventListener('keydown', onKeyInterrupt);
    return () => {
      window.removeEventListener('wheel', onUserInterrupt);
      window.removeEventListener('touchstart', onUserInterrupt);
      window.removeEventListener('keydown', onKeyInterrupt);
      cancelSmoothScroll();
      if (arrivalTimerRef.current !== null) window.clearTimeout(arrivalTimerRef.current);
    };
  }, [cancelSmoothScroll]);

  // Scroll progress bar, sticky masthead state, and active section scroll-spy
  useEffect(() => {
    let rafId = 0;
    const sectionIds = links.map(([, id]) => id);

    const updateScrollState = () => {
      rafId = 0;
      const scrollY = window.scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
      rootRef.current?.style.setProperty('--scroll-progress', progress.toFixed(4));
      setScrolled(scrollY > 18);

      const headerHeight = headerRef.current?.getBoundingClientRect().height ?? 76;
      const probeY = scrollY + headerHeight + Math.min(180, window.innerHeight * 0.28);

      if (scrollY + window.innerHeight >= document.documentElement.scrollHeight - 24) {
        setActiveSection('contact');
        return;
      }

      let current: SectionId | null = null;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = window.scrollY + el.getBoundingClientRect().top;
        if (probeY >= top) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(updateScrollState);
    };

    updateScrollState();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Scroll-triggered reveal animations using IntersectionObserver
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealEls = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));

    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      revealEls.forEach(el => el.setAttribute('data-visible', 'true'));
      return;
    }

    root.classList.add('edition-anim');

    // Reveal elements already above or inside the initial viewport immediately
    const viewportCutoff = window.innerHeight * 0.96;
    revealEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= viewportCutoff) {
        el.setAttribute('data-visible', 'true');
      }
    });

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-visible', 'true');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    revealEls.forEach(el => {
      if (el.getAttribute('data-visible') !== 'true') {
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
      root.classList.remove('edition-anim');
    };
  }, []);

  // Handle initial hash arrival polish (e.g. direct visit to /#contact)
  useEffect(() => {
    const initialHash = window.location.hash.replace(/^#/, '');
    if (!initialHash) return;
    const timer = window.setTimeout(() => {
      const targetEl = document.getElementById(initialHash);
      if (targetEl) {
        const headerHeight = headerRef.current?.getBoundingClientRect().height ?? 76;
        const targetY = Math.max(0, window.scrollY + targetEl.getBoundingClientRect().top - headerHeight - 8);
        window.scrollTo(0, targetY);
        triggerArrival(initialHash);
      }
    }, 60);
    return () => window.clearTimeout(timer);
  }, [triggerArrival]);

  return <div ref={rootRef} className="edition" id="top">
    <a className="skip" href="#main">Skip to portfolio</a>
    <header ref={headerRef} className={scrolled ? 'mast is-scrolled' : 'mast'} data-jumping={navJumping ? 'true' : undefined}>
      <div className="wrap mast-inner">
        <a className="brand" href="#top" aria-label="The Architect Chronicles home" onClick={event => navigateToSection('top', event)}>
          <span className="monogram">MT</span><span>The Architect<br/>Chronicles</span>
        </a>
        <nav aria-label="Portfolio navigation" className={menu ? 'edition-nav expanded' : 'edition-nav'} id="edition-nav">
          {links.map(([name, id]) => (
            <a
              href={'#' + id}
              key={id}
              className={activeSection === id ? 'is-active' : undefined}
              aria-current={activeSection === id ? 'location' : undefined}
              onClick={event => navigateToSection(id, event)}
            >
              {name}
            </a>
          ))}
          <a className="mobile-resume" href={resumeUrl}>Résumé</a>
        </nav>
        <a className="comic-entry" href={comicUrl}><BookOpen size={16} aria-hidden="true"/> Interactive comic</a>
        <a className="header-resume" href={resumeUrl}>Résumé <ArrowUpRight size={16}/></a>
        <button className="menu-toggle" aria-expanded={menu} aria-controls="edition-nav" aria-label={menu ? 'Close navigation' : 'Open navigation'} onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button>
      </div>
      <div className="scroll-progress-track" aria-hidden="true"><span className="scroll-progress-bar" /></div>
    </header>
    <main id="main">
      <section className="cover"><div className="wrap cover-grid">
        <div className="cover-copy"><p className="series"><span aria-hidden="true"/> Engineering portfolio</p>
        <h1>Mohamed Tarek<br/><em>Hussien</em></h1>
        <h2>Full-Stack Software Engineer</h2>
        <p className="intro">I build MERN applications, connect people through real-time systems, and automate the infrastructure that keeps them running.</p>
        <div className="actions"><a className="ink-button red" href="#projects" onClick={event => navigateToSection('projects', event)}>Explore projects <ArrowDown size={17}/></a><a className="ink-button" href={resumePdfUrl} download><Download size={17}/> Download résumé</a></div>
        </div>
        <figure className="portrait"><img src="./comic/architect-cover.webp" alt="Comic portrait of Mohamed at his workstation overlooking Cairo" width="1280" height="720" fetchPriority="high"/><figcaption><MapPin size={14}/> Cairo, Egypt</figcaption></figure>
      </div></section>
      <div className="award-strip" data-reveal="up"><div className="wrap award-inner"><span className="star" aria-hidden="true">★</span><strong>Third place</strong><span>Best Project · Digital Egypt Pioneers Initiative, DevOps track</span><button onClick={() => setItem(cases[1])} aria-label="Read the DEPI project case study"><ArrowUpRight size={20}/></button></div></div>

      <section className="wrap chapter" id="projects" data-arrived={arrivedSection === 'projects' ? 'true' : undefined}>
        <div className="chapter-title" data-reveal="left"><BookOpen/><h2>Selected projects</h2><span/></div>
        <div className="case-grid">{cases.map((project, index) => (
          <article
            className="case-card"
            key={project.image}
            data-reveal="up"
            style={{ '--reveal-delay': `${(index % 3) * 85}ms` } as CSSProperties}
          >
            <button className="case-open" onClick={() => setItem(project)} aria-label={'Read case study for ' + project.name}>
              <span className="card-image"><img src={'./comic/' + project.image + '.webp'} alt="" loading="lazy" width="600" height="320"/><span className="card-type">{project.type}</span></span>
              <span className="card-body"><span className="card-title">{project.name}</span><span className="card-summary">{project.intro}</span><span className="read-link">Read case study <ArrowUpRight size={16}/></span></span>
            </button>
          </article>
        ))}</div>
      </section>
      <section id="experience" className="career" data-arrived={arrivedSection === 'experience' ? 'true' : undefined}>
        <div className="wrap chapter career-grid">
          <div data-reveal="left"><p className="series">Career history</p><h2 className="display">Experience</h2><p className="lead">My work has ranged from troubleshooting networks to teaching programming and coordinating technical training.</p></div>
          <ol className="timeline">{work.map(([date, title, company, desc], index) => (
            <li
              key={date}
              data-reveal="right"
              style={{ '--reveal-delay': `${index * 95}ms` } as CSSProperties}
            >
              <span className="kicker">{date}</span><h3>{title}</h3><strong>{company}</strong><p>{desc}</p>
            </li>
          ))}</ol>
        </div>
      </section>
      <section className="wrap chapter" id="skills" data-arrived={arrivedSection === 'skills' ? 'true' : undefined}>
        <div className="chapter-title" data-reveal="left"><FileText/><h2>Skills &amp; education</h2><span/></div>
        <div className="learning-grid">
          <div className="skill-sheet" data-reveal="left"><h3>Technical toolkit</h3>{skills.map(([label, tools]) => <div className="skill-row" key={label}><strong>{label}</strong><p>{tools}</p></div>)}</div>
          <div className="education" data-reveal="right" style={{ '--reveal-delay': '100ms' } as CSSProperties}>
            <h3>Education &amp; training</h3>
            <div className="skill-row">
              <strong>{profile.education.degree}</strong>
              <p>{profile.education.university} · {profile.education.department} · {profile.education.period}</p>
            </div>
            <div className="skill-row">
              <strong>DevOps Engineer Track</strong>
              <p>Digital Egypt Pioneers Initiative (DEPI) · Jun 2025 – Dec 2025</p>
            </div>
            {PORTFOLIO_DATA.certifications.map(cert => (
              <div className="skill-row" key={cert.title}>
                <strong>{cert.title}</strong>
                <p>{cert.issuer} · {cert.date}</p>
              </div>
            ))}
            <div className="skill-row">
              <strong>Languages</strong>
              <ul className="language-list">
                {profile.languages.map(({ name, proficiency }) => <li key={name}>{name} · {proficiency}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
    <footer id="contact" data-arrived={arrivedSection === 'contact' ? 'true' : undefined}>
      <div className="wrap footer-grid">
        <div data-reveal="up">
          <p className="series">Contact</p>
          <h2>Get in touch.</h2>
          <a
            className="email"
            href={profile.gmailComposeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleGmailComposeClick}
            aria-label="Open Gmail to compose an email to Mohamed"
            title="Open Gmail to compose an email to Mohamed"
          >
            <GmailIcon size={20} />
            <span>Email Mohamed</span>
            <span className="email-address">· {profile.emails[0]}</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
        <div className="contact-links" data-reveal="right" style={{ '--reveal-delay': '90ms' } as CSSProperties}>
          <a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight/></a>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight/></a>
          <a href={resumeUrl}>View résumé <ArrowUpRight/></a>
        </div>
      </div>
      <div className="wrap colophon"><span>© 2026 {profile.name}</span><a href={comicUrl}>Play the interactive comic <ArrowUpRight size={15}/></a></div>
    </footer>
    {item && <CaseDialog item={item} dismiss={() => setItem(null)}/>}
  </div>;
}
