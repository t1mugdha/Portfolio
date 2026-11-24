import { useState } from 'react';
import { profile, social } from '@/content/profile';
import { asset } from '@/lib/util';

type Errors = { name?: string; email?: string; message?: string };

/** Contact form. JavaScript checks every field before anything is sent. */
function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function validate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // stop the normal submit, like "return false"
    const form = e.currentTarget;
    const name = (document.getElementById('c-name') as HTMLInputElement).value.trim();
    const email = (document.getElementById('c-email') as HTMLInputElement).value.trim();
    const message = (document.getElementById('c-msg') as HTMLTextAreaElement).value.trim();

    const err: Errors = {};
    if (name == '') err.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(email)) err.email = 'Enter a valid email address';
    if (message.length < 10) err.message = 'Message must be at least 10 characters';
    setErrors(err);
    if (Object.keys(err).length > 0) return; // any field wrong: don't send

    const subject = encodeURIComponent('Portfolio message from ' + name);
    const body = encodeURIComponent(message + '\n\n- ' + name + ' (' + email + ')');
    window.location.href = 'mailto:' + profile.email + '?subject=' + subject + '&body=' + body;
    setSent(true);
    form.reset();
  }

  return (
    <form className="cform" onSubmit={validate} noValidate>
      <label htmlFor="c-name">Name</label>
      <input type="text" id="c-name" name="name" autoComplete="name" aria-invalid={!!errors.name} />
      <span className="cform-err" role="alert">{errors.name}</span>

      <label htmlFor="c-email">Email</label>
      <input type="email" id="c-email" name="email" autoComplete="email" aria-invalid={!!errors.email} />
      <span className="cform-err" role="alert">{errors.email}</span>

      <label htmlFor="c-msg">Message</label>
      <textarea id="c-msg" name="message" rows={4} aria-invalid={!!errors.message} />
      <span className="cform-err" role="alert">{errors.message}</span>

      <button type="submit" className="btn btn-primary">Send message</button>
      <p className="muted">{sent ? 'Your email app should open with the message ready to send.' : 'Opens your email app with the message filled in.'}</p>
    </form>
  );
}

export function ContactPanel() {
  const links = social.filter((l) => l.url);
  return (
    <>
      <p className="lead">
        Hiring, building something interesting, or just want to talk games and interfaces? Drop a letter in the box — email is the fastest way to reach me.
      </p>
      <ContactForm />
      <a className="mail" href={`mailto:${profile.email}`}>
        <span className="mail-label">Send a letter</span>
        <span className="mail-addr">{profile.email}</span>
      </a>
      <ul className="links">
        {links.map((l) =>
          l.url ? (
            <li key={l.label}>
              <a href={l.url} target="_blank" rel="noopener noreferrer">
                {l.label} ↗<span className="sr"> (opens in a new tab)</span>
              </a>
              <span className="link-handle">{l.handle}</span>
            </li>
          ) : null,
        )}
      </ul>
      {profile.availability && <p className="avail">● {profile.availability}</p>}
      <div className="actions">
        <a className="btn btn-primary" href={`mailto:${profile.email}`}>
          Email me
        </a>
        <a className="btn btn-ghost" href={asset(profile.cvPath)} download>
          ↓ CV (PDF)
        </a>
      </div>
    </>
  );
}
