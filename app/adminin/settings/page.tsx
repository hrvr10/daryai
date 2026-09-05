import AdminBar from "@/components/admin/AdminBar";
import InstagramConnect from "@/components/admin/InstagramConnect";
import SyncButton from "@/components/admin/SyncButton";
import { getInstagramSettings } from "@/lib/db";
import { isFirebaseConfigured, isInstagramConfigured } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: { ig?: string; message?: string };
}) {
  const settings = await getInstagramSettings().catch(() => ({
    connected: false as const,
  }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <AdminBar active="settings" />

      <h1 className="mb-1 text-lg font-semibold">Instagram</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Connect your Instagram Business/Creator account to pull your reels in as
        products.
      </p>

      {searchParams.ig === "connected" && (
        <p className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Instagram connected. Now sync your reels.
        </p>
      )}
      {searchParams.ig === "error" && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {searchParams.message || "Could not connect Instagram."}
        </p>
      )}
      {!isFirebaseConfigured && (
        <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Firebase isn&apos;t configured — the connection can&apos;t be saved yet.
        </p>
      )}

      <div className="space-y-4 rounded-md border border-neutral-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">
              {settings.connected ? "Connected" : "Not connected"}
            </div>
            {settings.connected && (
              <div className="text-xs text-neutral-500">
                {"username" in settings && settings.username
                  ? `@${settings.username}`
                  : "account"}
                {"lastSyncAt" in settings && settings.lastSyncAt
                  ? ` · last sync ${new Date(
                      settings.lastSyncAt,
                    ).toLocaleString()}`
                  : ""}
              </div>
            )}
          </div>
          <InstagramConnect
            connected={settings.connected}
            configured={isInstagramConfigured}
          />
        </div>

        {settings.connected && (
          <div className="border-t border-neutral-200 pt-4">
            <SyncButton />
            <p className="mt-2 text-xs text-neutral-400">
              Instagram media URLs expire after ~2 days — re-sync regularly (or
              set up a cron hitting <code>/api/instagram/sync</code>).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
