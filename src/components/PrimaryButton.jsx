import { Link } from "react-router-dom";
import { trackEvent } from "../utils/analytics";

export default function PrimaryButton({
  to,
  children,
  secondary = false,
  eventLabel,
  onClick
}) {

  const handleClick = (e) => {

    // automatic analytics event if provided
    if (eventLabel) {
      trackEvent("navigation", eventLabel);
    }

    // allow custom handlers
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      style={{
        display: "inline-block",
        padding: "12px 18px",
        border: "1px solid #334155",
        borderRadius: "10px",
        textDecoration: "none",
        color: "white",
        background: secondary ? "transparent" : "#111827",
        transition: "background 0.18s ease, border-color 0.18s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#475569";
        if (!secondary) e.currentTarget.style.background = "#172033";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#334155";
        if (!secondary) e.currentTarget.style.background = "#111827";
      }}
    >
      {children}
    </Link>
  );
}
