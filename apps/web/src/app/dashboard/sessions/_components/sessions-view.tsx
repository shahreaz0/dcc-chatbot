"use client";

import { Button } from "@dcc-chatbot/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@dcc-chatbot/ui/components/card";
import { Globe, Laptop, ShieldCheck, Smartphone, Trash2 } from "lucide-react";
import { useGetSessions } from "../_hooks/use-get-sessions";
import { useRevokeSession } from "../_hooks/use-revoke-session";

export function SessionsView() {
  const { data: sessions = [], isLoading } = useGetSessions();
  const { mutate: revokeSession, isPending: isRevoking } = useRevokeSession();

  const getDeviceIcon = (userAgent?: string | null) => {
    if (!userAgent) return Laptop;
    if (
      userAgent.toLowerCase().includes("mobile") ||
      userAgent.toLowerCase().includes("android") ||
      userAgent.toLowerCase().includes("iphone")
    ) {
      return Smartphone;
    }
    return Laptop;
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-bold text-2xl tracking-tight">Active Sessions</h1>
        <p className="text-muted-foreground text-sm">
          Manage your logged-in devices and active security sessions
        </p>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-primary" /> Logged In Devices
          </CardTitle>
          <CardDescription>
            Revoke access from suspicious or old devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-lg bg-muted/40"
                />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground text-sm">
              No active sessions found.
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {sessions.map((sess) => {
                const Icon = getDeviceIcon(sess.userAgent);
                return (
                  <div
                    key={sess.id}
                    className="flex items-center justify-between px-2 py-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {sess.userAgent || "Unknown Browser / Device"}
                        </p>
                        <div className="mt-0.5 flex items-center gap-3 text-muted-foreground text-xs">
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />{" "}
                            {sess.ipAddress || "Local IP"}
                          </span>
                          <span>•</span>
                          <span>
                            Expires:{" "}
                            {new Date(sess.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => revokeSession(sess.id)}
                      disabled={isRevoking}
                      className="gap-1.5 border-destructive/30 text-destructive text-xs hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Revoke Access
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
