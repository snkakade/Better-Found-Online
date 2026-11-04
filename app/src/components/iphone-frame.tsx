import type { ReactNode } from "react";
import "./iphone-frame.css";

/** Decorative device hardware shared by every mobile website preview. */
export function IPhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="case-device case-device-phone">
      <span className="iphone-button iphone-button--action" aria-hidden="true" />
      <span className="iphone-button iphone-button--volume-up" aria-hidden="true" />
      <span className="iphone-button iphone-button--volume-down" aria-hidden="true" />
      <span className="iphone-button iphone-button--power" aria-hidden="true" />
      <span className="iphone-button iphone-button--camera" aria-hidden="true" />
      <div className="iphone-body">
        <div className="case-device-phone-screen">
          <div className="iphone-status" aria-hidden="true">
            <span className="iphone-time">9:41</span>
            <span className="case-device-phone-island"><span className="iphone-lens" /></span>
            <svg className="iphone-status-icons" viewBox="0 0 66 14" fill="none">
              <g fill="currentColor"><rect x="0" y="9" width="3" height="4" rx=".7" /><rect x="5" y="6" width="3" height="7" rx=".7" /><rect x="10" y="3" width="3" height="10" rx=".7" /><rect x="15" y="0" width="3" height="13" rx=".7" /></g>
              <path d="M23 4a10 10 0 0 1 14 0M26 7a6 6 0 0 1 8 0M29 10a2 2 0 0 1 2 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <rect x="43" y="1" width="20" height="11" rx="3" stroke="currentColor" strokeOpacity=".6" /><rect x="45" y="3" width="16" height="7" rx="1.5" fill="currentColor" /><path d="M65 5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="iphone-viewport">{children}</div>
          <div className="iphone-home-area" aria-hidden="true"><span /></div>
        </div>
      </div>
    </div>
  );
}
