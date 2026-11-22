import { createRoot } from 'react-dom/client';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { ProfessionalBlackWhiteResume } from './components/resume/ProfessionalBlackWhiteResume';
import { resumePdfUrl } from './components/resume/resumeData';

createRoot(document.getElementById('root')!).render(
  <div className="resume-frame">
    <nav className="resume-toolbar" aria-label="Résumé actions">
      <a href={import.meta.env.BASE_URL}><ArrowLeft size={16} aria-hidden="true" /> Portfolio</a>
      <div className="resume-toolbar-actions">
        <button type="button" onClick={() => window.print()}><Printer size={16} aria-hidden="true" /> Print</button>
        <a className="resume-download" href={resumePdfUrl} download><Download size={16} aria-hidden="true" /> Download PDF</a>
      </div>
    </nav>
    <main><ProfessionalBlackWhiteResume /></main>
  </div>,
);
