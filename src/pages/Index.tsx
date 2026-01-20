import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/navigation";
import { SocialConnection } from "@/components/social-connection";
import { EthosScoreDisplay } from "@/components/ui/ethos-score-badge";
import { useUser } from "@/contexts/UserContext";
import { Shield, ArrowRight, Lock, Users, FileCheck, Zap, CheckCircle2 } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Trust-Based Trading",
    description: "Your Ethos score determines your trading capabilities—no collateral needed."
  },
  {
    icon: Users,
    title: "Social Verification",
    description: "Connect Twitter or Discord to build your on-chain reputation."
  },
  {
    icon: Lock,
    title: "Accept/Deny Control",
    description: "Order creators have final say on who fulfills their trades."
  },
  {
    icon: FileCheck,
    title: "Deal Agreements",
    description: "Every completed trade generates immutable proof for dispute resolution."
  }
];

const trustLevels = [
  { score: "1400+", label: "Basic", capability: "Request to fulfill orders" },
  { score: "1600+", label: "Trusted", capability: "Trade up to $1,000" },
  { score: "1800+", label: "Verified", capability: "Trade up to $5,000" },
  { score: "2000+", label: "Elite", capability: "Trade up to $25,000" },
];

const Index = () => {
  const { user, canAccessP2P, hasRequiredConnection } = useUser();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-glow opacity-50" />
          <div className="container px-4 py-20 md:py-32 relative">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm">
                <Zap className="w-4 h-4 text-primary" />
                <span>Reputation-Based P2P Trading</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">
                Trade Peer-to-Peer with{' '}
                <span className="text-gradient-hero">Trust, Not Collateral</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Your Ethos credibility score unlocks access to P2P trading. Higher scores mean 
                higher limits and more opportunities. No escrow required.
              </p>

              {canAccessP2P ? (
                <Button 
                  size="lg" 
                  className="bg-gradient-hero text-primary-foreground gap-2 text-lg px-8 shadow-glow"
                  onClick={() => navigate('/trading')}
                >
                  Start Trading
                  <ArrowRight className="w-5 h-5" />
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Connect your social accounts below to begin
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Connection Section */}
        <section className="container px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold mb-2">
                {hasRequiredConnection ? "Your Connected Accounts" : "Connect Your Identity"}
              </h2>
              <p className="text-muted-foreground">
                {hasRequiredConnection 
                  ? "Your Ethos score is fetched from your connected accounts."
                  : "Link at least one social account to access P2P trading."
                }
              </p>
            </div>

            <SocialConnection />

            {user && (
              <div className="mt-8 text-center animate-fade-in">
                <p className="text-sm text-muted-foreground mb-4">Your Ethos Score</p>
                <EthosScoreDisplay score={user.ethosScore} />
                
                {canAccessP2P ? (
                  <div className="mt-6 flex items-center justify-center gap-2 text-success">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>You can access P2P Trading!</span>
                  </div>
                ) : (
                  <div className="mt-6 text-warning">
                    You need a score of 1400+ to access P2P trading.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="container px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A trustless trading experience powered by social reputation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={i}
                  className="bg-gradient-card border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-all animate-slide-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Trust Levels */}
        <section className="container px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold mb-4">Trust Tiers</h2>
              <p className="text-muted-foreground">
                Your Ethos score determines your trading limits and capabilities
              </p>
            </div>

            <div className="space-y-4">
              {trustLevels.map((level, i) => (
                <div 
                  key={i}
                  className="bg-gradient-card border border-border/50 rounded-xl p-5 flex items-center justify-between hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-display font-bold text-primary">{level.score}</div>
                    <div>
                      <p className="font-medium">{level.label}</p>
                      <p className="text-sm text-muted-foreground">{level.capability}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 py-8">
          <div className="container px-4 text-center text-sm text-muted-foreground">
            <p>EthosP2P — Trust-Based Peer-to-Peer Trading</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
