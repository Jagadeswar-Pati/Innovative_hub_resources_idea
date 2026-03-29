"use client";

import { useState } from "react";
import { INITIAL_NOTIFICATIONS } from "@/lib/data/notifications";
import type { AppNotification, NotifType } from "@/lib/types/notification";
import { Icon } from "@/components/ui/Icon";

const iconMap: Record<NotifType, "heart" | "explore" | "community" | "lock" | "user" | "star"> = {
  like: "heart",
  comment: "explore",
  join: "community",
  unlock: "lock",
  follow: "user",
  feature: "star",
};

const colorMap: Record<NotifType, string> = {
  like: "#F44336",
  comment: "#2196F3",
  join: "#4CAF50",
  unlock: "#F5A623",
  follow: "#9C27B0",
  feature: "#F5A623",
};

export function NotificationsSection() {
  const [notifs, setNotifs] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  return (
    <div className="mx-auto max-w-[680px] p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-syne mb-1 text-[28px] font-extrabold">Notifications</h1>
          <p className="text-sm text-[var(--muted)]">
            {notifs.filter((n) => !n.read).length} unread notifications
          </p>
        </div>
        <button
          type="button"
          onClick={() => setNotifs((p) => p.map((n) => ({ ...n, read: true })))}
          className="cursor-pointer border-0 bg-transparent text-[13px] text-[var(--gold)]"
        >
          Mark all read
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {notifs.map((n, i) => (
          <div
            key={n.id}
            role="button"
            tabIndex={0}
            onClick={() => setNotifs((p) => p.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setNotifs((p) => p.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
              }
            }}
            className="card flex cursor-pointer items-center gap-3.5 px-4 py-3.5"
            style={{
              opacity: n.read ? 0.65 : 1,
              borderLeftWidth: n.read ? 1 : 2,
              borderLeftStyle: "solid",
              borderLeftColor: n.read ? "var(--border)" : colorMap[n.type],
              animation: `fadeUp 0.4s ease ${i * 0.04}s forwards`,
            }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: `${colorMap[n.type]}18`,
                color: colorMap[n.type],
              }}
            >
              <Icon name={iconMap[n.type]} size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug">{n.text}</p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">{n.time}</p>
            </div>
            {!n.read && <div className="notif-dot shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
}
