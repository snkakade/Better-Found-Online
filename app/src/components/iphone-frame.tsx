import type { ReactNode } from "react";
import "./iphone-frame.css";

/** Decorative device hardware shared by every mobile website preview. */
export function IPhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="case-device case-device-phone">
      <div className="iphone-body">
        <div className="case-device-phone-screen">
          <div className="iphone-status" aria-hidden="true">
            <span className="iphone-time">9:41</span>
            <svg className="iphone-status-icons" viewBox="0 0 66 14" fill="none">
              <g fill="currentColor"><rect x="0" y="9" width="3" height="4" rx=".7" /><rect x="5" y="6" width="3" height="7" rx=".7" /><rect x="10" y="3" width="3" height="10" rx=".7" /><rect x="15" y="0" width="3" height="13" rx=".7" /></g>
              <path d="M23 4a10 10 0 0 1 14 0M26 7a6 6 0 0 1 8 0M29 10a2 2 0 0 1 2 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <rect x="43" y="1" width="20" height="11" rx="3" stroke="currentColor" strokeOpacity=".6" /><rect x="45" y="3" width="16" height="7" rx="1.5" fill="currentColor" /><path d="M65 5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="iphone-viewport">{children}</div>
          <div className="iphone-home-area" aria-hidden="true"><span /></div>
        </div>
        <img className="iphone-hardware" src="/assets/devices/iphone-16-pro-black.webp" srcSet="/assets/devices/iphone-16-pro-black-554.webp 554w, /assets/devices/iphone-16-pro-black.webp 1109w" sizes="(max-width: 900px) 45vw, 300px" width="1109" height="2294" alt="" aria-hidden="true" draggable="false" decoding="async" />
      </div>
    </div>
  );
}
