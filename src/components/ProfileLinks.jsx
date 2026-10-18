export default function ProfileLinks() {
  return (
    <nav className="profile__links" aria-label="GitHub and contact">
      <a
        className="outline-link"
        href="https://github.com/AKDworks"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="AKDworks on GitHub (opens in a new tab)"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.07c-3.09.67-3.74-1.31-3.74-1.31-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.7 1.15 1.7 1.15.99 1.7 2.6 1.21 3.23.93.1-.72.39-1.21.71-1.49-2.46-.28-5.05-1.23-5.05-5.48 0-1.21.43-2.2 1.14-2.98-.12-.28-.49-1.41.11-2.94 0 0 .93-.3 3.05 1.14a10.63 10.63 0 0 1 5.55 0c2.12-1.44 3.05-1.14 3.05-1.14.6 1.53.23 2.66.11 2.94.71.78 1.14 1.77 1.14 2.98 0 4.26-2.59 5.2-5.06 5.47.4.35.75 1.02.75 2.06v3.04c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
        </svg>
        GitHub
      </a>
      <a className="outline-link" href="mailto:akdworks@yahoo.com" aria-label="Email akdworks@yahoo.com">
        <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Email
      </a>
    </nav>
  );
}
