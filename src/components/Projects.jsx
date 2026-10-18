import vokeyraIcon from '../assets/projects/vokeyra.webp';
import akdImageIcon from '../assets/projects/akd-image.png';

const projects = [
  {
    id: 'vokeyra',
    name: 'Vokeyra',
    icon: vokeyraIcon,
    description: 'Voice typing for Windows and Linux. Speak, and turn your words into text – processed locally on your computer.',
    website: 'https://vokeyra-site.vercel.app/en/download/',
    action: 'Download',
    github: 'https://github.com/AKDworks/Vokeyra',
  },
  {
    id: 'akd-image',
    name: 'AKD Image',
    icon: akdImageIcon,
    description: 'A browser-based toolkit for editing images and animated GIFs. Your files stay on your device.',
    website: 'https://image.akdworks.com/',
    action: 'Visit website',
    github: 'https://github.com/AKDworks/AKD-Image',
  },
];

function LinkIcon({ github = false }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {github ? (
        <path fill="currentColor" d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.07c-3.09.67-3.74-1.31-3.74-1.31-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.7 1.15 1.7 1.15.99 1.7 2.6 1.21 3.23.93.1-.72.39-1.21.71-1.49-2.46-.28-5.05-1.23-5.05-5.48 0-1.21.43-2.2 1.14-2.98-.12-.28-.49-1.41.11-2.94 0 0 .93-.3 3.05 1.14a10.63 10.63 0 0 1 5.55 0c2.12-1.44 3.05-1.14 3.05-1.14.6 1.53.23 2.66.11 2.94.71.78 1.14 1.77 1.14 2.98 0 4.26-2.59 5.2-5.06 5.47.4.35.75 1.02.75 2.06v3.04c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
      ) : (
        <path d="M14 3h7v7M21 3l-11 11M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="projects" aria-labelledby="projects-title" tabIndex={-1}>
      <div className="projects__inner">
        <h2 id="projects-title">Projects</h2>
        <div className="projects__grid">
          {projects.map((project) => (
            <article key={project.id} className="project-card" aria-labelledby={`${project.id}-title`}>
              <header className="project-card__header">
                <img src={project.icon} alt="" width="48" height="48" loading="lazy" decoding="async" />
                <h3 id={`${project.id}-title`}>{project.name}</h3>
              </header>
              <p className="project-card__description">{project.description}</p>
              <div className="project-card__links">
                <a className="outline-link" href={project.website} target="_blank" rel="noopener noreferrer" aria-label={`${project.action}: ${project.name} (opens in a new tab)`}>
                  <LinkIcon />{project.action}
                </a>
                <a className="outline-link" href={project.github} target="_blank" rel="noopener noreferrer" aria-label={`${project.name} on GitHub (opens in a new tab)`}>
                  <LinkIcon github />GitHub
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
