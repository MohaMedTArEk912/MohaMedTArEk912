import { PORTFOLIO_DATA } from '../../data/portfolioData';
import { resumeExperience, resumeProjects, resumeSkills, resumeSummary, resumeTitle, resumeTraining } from './resumeData';
import './resume.css';

export function ProfessionalBlackWhiteResume() {
  const { profile } = PORTFOLIO_DATA;
  const { degree, department, university, period } = profile.education;

  return (
    <article className="resume-paper" aria-label={`${profile.name} résumé`}>
      <header className="resume-heading">
        <h1>{profile.name}</h1>
        <p className="resume-role">{resumeTitle}</p>
        <ul className="resume-contact" aria-label="Contact details">
          <li>{profile.location}</li>
          {profile.emails.map(email => <li key={email}><a href={`mailto:${email}`}>{email}</a></li>)}
          {profile.phones.map(phone => <li key={phone}><a href={`tel:${phone.replaceAll(' ', '')}`}>{phone}</a></li>)}
        </ul>
        <ul className="resume-contact" aria-label="Online profiles">
          <li><a href={profile.github} target="_blank" rel="noreferrer">GitHub</a></li>
          <li><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
        </ul>
      </header>

      <section className="resume-section resume-summary">
        <h2>Professional Summary</h2>
        <p>{resumeSummary}</p>
      </section>

      <section className="resume-section">
        <h2>Technical Skills</h2>
        <dl className="resume-skills">
          {resumeSkills.map(([label, skills]) => (
            <div key={label}><dt>{label}</dt>{' '}<dd>{skills}</dd></div>
          ))}
        </dl>
      </section>

      <section className="resume-section">
        <h2>Projects</h2>
        {resumeProjects.map(({ title, role, detail, url }) => (
          <div className="resume-entry" key={title}>
            <h3>
              <a href={url} target="_blank" rel="noreferrer" aria-label={`${title} on GitHub`}>{title}</a>
              {' '}<span className="resume-meta">· {role}</span>
            </h3>
            <p>{detail}</p>
          </div>
        ))}
      </section>

      <section className="resume-section">
        <h2>Professional Experience</h2>
        {resumeExperience.map(({ role, organization, period, detail }) => (
          <div className="resume-entry" key={organization}>
            <h3>
              {role} <span className="resume-meta">· {organization} · <span className="resume-date">{period}</span></span>
            </h3>
            <p>{detail}</p>
          </div>
        ))}
      </section>

      <section className="resume-section">
        <h2>Education</h2>
        <h3>{university} <span className="resume-meta">· <span className="resume-date">{period}</span></span></h3>
        <p>{degree} · {department}</p>
      </section>

      <section className="resume-section">
        <h2>Certifications &amp; Training</h2>
        <ul className="resume-training">
          {resumeTraining.map(({ title, issuer, date }) => (
            <li key={title}>
              <strong>{title}</strong> <span className="resume-meta">· {issuer} · <span className="resume-date">{date}</span></span>
            </li>
          ))}
        </ul>
      </section>

      <section className="resume-section">
        <h2>Additional Information</h2>
        <ul className="resume-details">
          {profile.languages.map(({ name, proficiency }) => (
            <li key={name}><strong>{name}</strong> · {proficiency}</li>
          ))}
          <li><strong>Military service</strong> · {profile.militaryStatus}</li>
        </ul>
      </section>
    </article>
  );
}
