import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/navigation";
import { SocialConnection } from "@/components/social-connection";
import { EthosScoreDisplay, EthosScoreBadge } from "@/components/ui/ethos-score-badge";
import { DealAgreementCard } from "@/components/deal-agreement-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/contexts/UserContext";
import { getTrustTier, getMaxConcurrentDeals } from "@/lib/ethos-api";
import { RefreshCw, Shield, TrendingUp, Clock, FileCheck, ArrowLeftRight, Loader2 } from "lucide-react";
import { useState } from "react";

const ProfilePage = () => {
  const { user, canAccessP2P, refreshEthosScore, isLoading, activeDeals } = useUser();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  if (!user) {
    navigate('/');
    return null;
  }

  const tier = getTrustTier(user.ethosScore);
  const maxDeals = getMaxConcurrentDeals(user.ethosScore);
  const completedDeals = activeDeals.filter(d => d.status === 'completed');
  const inProgressDeals = activeDeals.filter(d => d.status === 'in_progress');

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshEthosScore();
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20 pb-8">
        <div className="container px-4 max-w-4xl">
          {/* Profile Header */}
          <div className="bg-gradient-card border border-border/50 rounded-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-glow">
                  <Shield className="w-12 h-12 text-primary-foreground" />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-display font-bold mb-2">Your Profile</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                  {user.socials.map(social => (
                    <div 
                      key={social.platform}
                      className="bg-secondary/50 rounded-full px-3 py-1 text-sm flex items-center gap-2"
                    >
                      @{social.username}
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground text-sm">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="text-center">
                <EthosScoreDisplay score={user.ethosScore} />
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 gap-2"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Refresh Score
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-card border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">{completedDeals.length}</p>
                    <p className="text-sm text-muted-foreground">Completed Deals</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">{inProgressDeals.length}</p>
                    <p className="text-sm text-muted-foreground">Active Deals</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">${tier.maxTrade.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Max Trade</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center">
                    <ArrowLeftRight className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">{maxDeals}</p>
                    <p className="text-sm text-muted-foreground">Max Concurrent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="deals" className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="deals">Deal History</TabsTrigger>
              <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
            </TabsList>

            <TabsContent value="deals" className="space-y-4">
              {completedDeals.length === 0 ? (
                <Card className="bg-gradient-card border-border/50">
                  <CardContent className="py-12 text-center">
                    <FileCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="font-display font-semibold mb-2">No Deals Yet</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Complete your first P2P trade to see deal agreements here.
                    </p>
                    <Button onClick={() => navigate('/trading')} className="bg-gradient-hero text-primary-foreground">
                      Start Trading
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                completedDeals.map(deal => (
                  <DealAgreementCard key={deal.id} deal={deal} />
                ))
              )}
            </TabsContent>

            <TabsContent value="accounts">
              <SocialConnection />
              
              <Card className="bg-gradient-card border-border/50 mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Trust Tier Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <span className="text-muted-foreground">Current Tier</span>
                    <EthosScoreBadge score={user.ethosScore} size="md" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <span className="text-muted-foreground">Maximum Trade Amount</span>
                    <span className="font-display font-bold">${tier.maxTrade.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <span className="text-muted-foreground">Max Concurrent Deals</span>
                    <span className="font-display font-bold">{maxDeals}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <span className="text-muted-foreground">P2P Access</span>
                    <span className={canAccessP2P ? "text-success font-medium" : "text-destructive font-medium"}>
                      {canAccessP2P ? "Enabled" : "Requires 1400+ Score"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
