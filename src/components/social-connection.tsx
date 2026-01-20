import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { Twitter, MessageCircle, Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ConnectionMode = 'twitter-username' | 'twitter-id' | 'discord' | null;

export function SocialConnection() {
  const { user, connectSocial, disconnectSocial, isConnecting } = useUser();
  const [mode, setMode] = useState<ConnectionMode>(null);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const twitterConnection = user?.socials.find(s => s.platform === 'twitter');
  const discordConnection = user?.socials.find(s => s.platform === 'discord');

  const handleConnect = async () => {
    if (!inputValue.trim()) {
      setError("Please enter a valid value");
      return;
    }

    setError(null);
    try {
      if (mode === 'twitter-username' || mode === 'twitter-id') {
        await connectSocial('twitter', inputValue.trim(), mode === 'twitter-id' ? inputValue.trim() : undefined);
      } else if (mode === 'discord') {
        await connectSocial('discord', inputValue.trim());
      }
      setInputValue("");
      setMode(null);
    } catch (err) {
      setError("Failed to connect. Please try again.");
    }
  };

  const ConnectionCard = ({ 
    platform, 
    icon: Icon, 
    label, 
    connection,
    connectionModes 
  }: { 
    platform: 'twitter' | 'discord';
    icon: React.ElementType;
    label: string;
    connection: typeof twitterConnection;
    connectionModes: { mode: ConnectionMode; label: string }[];
  }) => (
    <Card className={cn(
      "bg-gradient-card border-border/50 transition-all duration-300",
      connection && "border-success/50 shadow-glow"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              platform === 'twitter' ? "bg-[#1DA1F2]/20" : "bg-[#5865F2]/20"
            )}>
              <Icon className={cn(
                "w-5 h-5",
                platform === 'twitter' ? "text-[#1DA1F2]" : "text-[#5865F2]"
              )} />
            </div>
            <div>
              <CardTitle className="text-lg">{label}</CardTitle>
              {connection && (
                <CardDescription className="text-success flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  @{connection.username}
                </CardDescription>
              )}
            </div>
          </div>
          {connection && (
            <Button 
              variant="ghost" 
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => disconnectSocial(platform)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {connection ? (
          <div className="text-sm text-muted-foreground">
            Connected and verified
          </div>
        ) : (
          <div className="space-y-3">
            {!mode || !connectionModes.find(m => m.mode === mode) ? (
              <div className="flex flex-wrap gap-2">
                {connectionModes.map(({ mode: m, label: l }) => (
                  <Button
                    key={m}
                    variant="secondary"
                    size="sm"
                    onClick={() => setMode(m)}
                    className="text-xs"
                  >
                    {l}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {mode === 'twitter-username' && 'Twitter Username'}
                    {mode === 'twitter-id' && 'Twitter User ID'}
                    {mode === 'discord' && 'Discord Username'}
                  </Label>
                  <Input
                    placeholder={mode === 'twitter-id' ? '1234567890' : '@username'}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="mt-1"
                  />
                </div>
                {error && <p className="text-destructive text-xs">{error}</p>}
                <div className="flex gap-2">
                  <Button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    size="sm"
                    className="bg-gradient-hero text-primary-foreground"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect'
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMode(null);
                      setInputValue("");
                      setError(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ConnectionCard
        platform="twitter"
        icon={Twitter}
        label="Twitter / X"
        connection={twitterConnection}
        connectionModes={[
          { mode: 'twitter-username', label: 'Connect by Username' },
          { mode: 'twitter-id', label: 'Connect by User ID' }
        ]}
      />
      <ConnectionCard
        platform="discord"
        icon={MessageCircle}
        label="Discord"
        connection={discordConnection}
        connectionModes={[
          { mode: 'discord', label: 'Connect Discord' }
        ]}
      />
    </div>
  );
}
