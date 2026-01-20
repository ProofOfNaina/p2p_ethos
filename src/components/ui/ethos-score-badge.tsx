import { cn } from "@/lib/utils";
import { getTrustTier } from "@/lib/ethos-api";
import { Shield, Star, Crown, Zap, AlertTriangle } from "lucide-react";

interface EthosScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const tierIcons = {
  UNTRUSTED: AlertTriangle,
  BASIC: Shield,
  TRUSTED: Star,
  VERIFIED: Zap,
  ELITE: Crown,
};

const tierStyles = {
  UNTRUSTED: "bg-destructive/20 text-destructive border-destructive/30",
  BASIC: "bg-warning/20 text-warning border-warning/30",
  TRUSTED: "bg-success/20 text-success border-success/30",
  VERIFIED: "bg-info/20 text-info border-info/30",
  ELITE: "bg-elite/20 text-elite border-elite/30 shadow-elite",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs gap-1",
  md: "px-3 py-1.5 text-sm gap-1.5",
  lg: "px-4 py-2 text-base gap-2",
};

const iconSizes = {
  sm: 12,
  md: 16,
  lg: 20,
};

export function EthosScoreBadge({ score, size = "md", showLabel = true, className }: EthosScoreBadgeProps) {
  const tier = getTrustTier(score);
  const Icon = tierIcons[tier.key as keyof typeof tierIcons];

  return (
    <div
      className={cn(
        "inline-flex items-center font-medium rounded-full border backdrop-blur-sm transition-all duration-300",
        tierStyles[tier.key as keyof typeof tierStyles],
        sizeStyles[size],
        tier.key === "ELITE" && "animate-score-pulse",
        className
      )}
    >
      <Icon size={iconSizes[size]} className="flex-shrink-0" />
      <span className="font-bold tabular-nums">{score}</span>
      {showLabel && <span className="opacity-80">{tier.label}</span>}
    </div>
  );
}

export function EthosScoreDisplay({ score, className }: { score: number; className?: string }) {
  const tier = getTrustTier(score);
  
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className={cn(
        "text-5xl font-bold font-display tabular-nums",
        tier.key === "ELITE" ? "text-gradient-elite" : "text-gradient-hero"
      )}>
        {score}
      </div>
      <EthosScoreBadge score={score} size="lg" showLabel />
    </div>
  );
}
