import React from "react";
import "./subjectCard.css";

export default function SubjectCard({
  title,
  subtitle = "coding zone",
  color, // hover/active 색상 (예: getColorById(id))
  onClick,
  className = "",
  ...rest
}) {
  return (
    <button
      type="button"
      className={`subject-card ${className}`}
      style={{ "--hover-color": color || "#1A3F57" }}
      onClick={onClick}
      {...rest}
    >
      <div className="subject-top">{subtitle}</div>
      <div className="subject-title" title={title}>
        {title}
      </div>

      <span className="subject-arrow" aria-hidden="true">
        {/* inline SVG — 외부 패키지/설치 불필요 */}
        <svg viewBox="0 0 24 24" className="arrow-icon" focusable="false">
          <path
            d="M13.5 5l7 7-7 7M3.5 12h16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}
