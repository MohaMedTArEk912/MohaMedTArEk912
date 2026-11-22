import { ComicChapter } from '../ComicChapter';


export function Vol2FullStackSpread() {
  return <ComicChapter volume={2} title="Cloud & Delivery" role="DevOps Engineer · Digital Egypt Pioneers Initiative (DEPI) · Jun 2025 – Dec 2025"
    picture={{ art: 'devops', alt: 'An illustrated cloud infrastructure operations room' }}
    heading="From commit to cloud" artRight
    bullets={['Won third place for Best Project in the DEPI DevOps track.', 'Automated builds and deployments with GitHub Actions and Jenkins.', 'Provisioned AWS infrastructure with Terraform and Ansible.']}>
    <a className="journal-link" href="https://github.com/Devopsians12/Devopsians">Project repository ↗</a>
  </ComicChapter>;
}
