import CloudsBackground from './components/CloudsBackground.jsx';
import Projects from './components/Projects.jsx';
import ProfileLinks from './components/ProfileLinks.jsx';
import avatar from './assets/avatar.jpg';

export default function App() {
  return (
    <>
      <CloudsBackground />
      <main className="page" aria-label="AKDworks">
        <section className="hero" aria-labelledby="profile-name">
          <div className="profile">
            <img
              className="profile__avatar"
              src={avatar}
              alt="AKDworks – anime avatar with a cat"
              width="160"
              height="160"
              fetchPriority="high"
            />
            <div className="profile__text">
              <h1 id="profile-name">AKDworks</h1>
              <p>Developer &amp; AI enthusiast</p>
              <ProfileLinks />
            </div>
          </div>
          <a className="hero__scroll" href="#projects">
            Projects
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </section>
        <Projects />
      </main>
    </>
  );
}
