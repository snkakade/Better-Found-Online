"use client";

import { useRef, useState, type FormEventHandler } from "react";
import { ArrowBendUpRight, ArrowUpRight, Browser, CalendarBlank, Check, FilmStrip, MagnifyingGlass, Megaphone, PlugsConnected, Question, WhatsappLogo } from "@phosphor-icons/react";
import "./project-enquiry.css";

const projectTypes = [
  { label: "Website", value: "Website Design & Development", icon: Browser },
  { label: "Search", value: "SEO & Search Visibility", icon: MagnifyingGlass },
  { label: "Paid marketing", value: "Paid Advertising & Performance Marketing", icon: Megaphone },
  { label: "Creative", value: "Creative Production", icon: FilmStrip },
  { label: "Social media", value: "Social Media Management", icon: CalendarBlank },
  { label: "CRM & integrations", value: "CRM & Integrations", icon: PlugsConnected },
  { label: "Not sure yet", value: "Not Sure Yet", icon: Question },
] as const;

type ProjectEnquiryProps = {
  onSubmit: FormEventHandler<HTMLFormElement>;
  inquiryReady: boolean;
  projectTypeError: string;
  onServicesChange: () => void;
};

/** Agency enquiry redesign: variance 8 / motion 4 / density 4.
 * Existing Outfit, native form controls and the site's shared action system. */
export function ProjectEnquiry({ onSubmit, inquiryReady, projectTypeError, onServicesChange }: ProjectEnquiryProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const nameInput = useRef<HTMLInputElement>(null);
  return (
    <section className="project-enquiry section-pad" id="contact" aria-labelledby="contact-title">
      <div className="enquiry-aside">
        <div>
          <p className="enquiry-kicker">Let’s work together</p>
          <h2 id="contact-title">Start your<br />next <span>project.</span></h2>
          <p className="enquiry-intro">Websites, campaigns, creative or connected tools. Share your goal and review your brief in WhatsApp.</p>
        </div>
        <button className="enquiry-mark" type="button" aria-label="Start filling in project details" onClick={() => nameInput.current?.focus()}><ArrowBendUpRight weight="light" aria-hidden="true" /></button>
        <div className="enquiry-direct">
          <p>Prefer a quick message?</p>
          <a href="https://wa.me/15707077078" target="_blank" rel="noopener noreferrer" data-cta><WhatsappLogo size={22} aria-hidden="true" /> Message us directly <ArrowUpRight size={18} aria-hidden="true" /></a>
        </div>
      </div>

      <form id="contact-form" className="enquiry-form" aria-label="Project enquiry" onSubmit={onSubmit}>
        <header className="enquiry-form-head"><h3>Project details</h3><p>Required fields are marked *</p></header>
        <div className="enquiry-fields">
          <label className="enquiry-field" htmlFor="contact-name"><span>Your name *</span><input ref={nameInput} id="contact-name" name="name" autoComplete="name" placeholder="Enter your full name" required /></label>
          <label className="enquiry-field" htmlFor="contact-email"><span>Your email *</span><input id="contact-email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required /></label>
          <label className="enquiry-field" htmlFor="contact-phone"><span>Your phone *</span><input id="contact-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="Country code + number" required /></label>
          <label className="enquiry-field" htmlFor="contact-company"><span>Company or website <small>Optional</small></span><input id="contact-company" name="company" autoComplete="organization" placeholder="Your business or website" /></label>
        </div>
        <fieldset className="enquiry-project-types" aria-invalid={projectTypeError ? "true" : undefined} aria-describedby={`enquiry-service-help${projectTypeError ? " contact-project-error" : ""}`}>
          <legend>Services *</legend>
          <div className="enquiry-service-heading"><p id="enquiry-service-help">Select all that apply</p><span className="enquiry-service-count" aria-live="polite" aria-atomic="true">{selected.length > 0 ? `${selected.length} selected` : ""}</span></div>
          <div className="enquiry-choice-grid">
            {projectTypes.map(({ label, value, icon: Icon }) => (
              <label className="enquiry-choice" key={value}>
                <input name="projectType" type="checkbox" value={value} checked={selected.includes(value)} onChange={(event) => {
                  const checked = event.currentTarget.checked;
                  setSelected(previous => checked ? [...previous, value] : previous.filter(item => item !== value));
                  onServicesChange();
                }} />
                <span className="enquiry-choice-face"><Icon className="enquiry-choice-icon" size={21} aria-hidden="true" /><span>{label}</span><Check className="enquiry-choice-check" size={12} weight="bold" aria-hidden="true" /></span>
              </label>
            ))}
          </div>
          {projectTypeError && <p id="contact-project-error" className="enquiry-project-error" role="alert">{projectTypeError}</p>}
        </fieldset>
        <label className="enquiry-field enquiry-goal" htmlFor="contact-details"><span>Desired outcome *</span><textarea id="contact-details" name="details" rows={3} placeholder="What should change, and when?" required /></label>
        <div className="enquiry-form-actions">
          <label className="enquiry-marketing-consent"><input name="marketingConsent" type="checkbox" value="yes" /><span>Optional: email or text me about relevant services and updates.</span></label>
          <button className="bfo-action bfo-action--primary enquiry-submit" type="submit" data-cta><span>Review in WhatsApp</span><span className="enquiry-submit-icon"><ArrowUpRight size={24} weight="bold" aria-hidden="true" /></span></button>
          <p className="enquiry-privacy-note">By continuing, you ask us to use these details to respond. WhatsApp receives the message only after you review and send it. See our <a href="/privacy">Privacy Notice</a>.</p>
        </div>
        {inquiryReady && <p className="enquiry-form-status" role="status">Your message is ready to review in WhatsApp. Nothing has been sent yet.</p>}
      </form>
    </section>
  );
}
