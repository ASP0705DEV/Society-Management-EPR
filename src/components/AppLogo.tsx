import type { FC } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/stores/use-auth";
import { homePath } from "@/lib/format";

interface AppLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showSubtitle?: boolean;
  subtitleText?: string;
  className?: string;
  to?: string;
}

/**
 * AppLogoIcon: Compact inline badge for AI Smartgate Estate OS.
 */
export const AppLogoIcon: FC<{ size?: number; className?: string }> = ({
  className = "",
}) => {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 text-white font-black uppercase tracking-wider text-[11px] px-2 py-0.5 shadow-xs shrink-0 select-none ${className}`}
    >
      AI
    </span>
  );
};

export const AppLogo: FC<AppLogoProps> = ({
  size = "md",
  showText = true,
  showSubtitle = true,
  subtitleText = "Smart Society Operating System",
  className = "",
  to = "/",
}) => {
  const titleSizes = {
    sm: "text-xs sm:text-sm",
    md: "text-sm sm:text-base",
    lg: "text-base sm:text-lg md:text-xl",
    xl: "text-xl sm:text-2xl",
  }[size];

  const aiBadgeSizes = {
    sm: "text-[9px] px-1.5 py-0.5",
    md: "text-[10px] px-2 py-0.5",
    lg: "text-[11px] px-2.5 py-0.5",
    xl: "text-xs px-3 py-1",
  }[size];

  const content = (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 text-white font-black uppercase tracking-wider shadow-xs shrink-0 ${aiBadgeSizes}`}
          >
            AI
          </span>
          <span
            className={`font-black tracking-tight text-[#0f2b5c] dark:text-white leading-tight ${titleSizes}`}
          >
            Smartgate
          </span>
          <span
            className={`font-black tracking-tight text-slate-700 dark:text-slate-200 leading-tight ${titleSizes}`}
          >
            Estate OS
          </span>
        </div>
        {showSubtitle && subtitleText && (
          <p className="text-[10px] sm:text-[11px] font-bold text-muted tracking-wide mt-0.5">
            {subtitleText}
          </p>
        )}
      </div>
    </div>
  );

  const user = useAuth((state) => state.user);
  const targetDestination = to === "/" && user ? homePath(user.role) : to;

  if (!targetDestination) return content;

  return (
    <Link to={targetDestination} className="group cursor-pointer inline-flex items-center transition">
      {content}
    </Link>
  );
};

export default AppLogo;
