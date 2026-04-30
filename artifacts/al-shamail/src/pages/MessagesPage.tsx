import { useEffect, useMemo, useRef, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Send, MessageCircle, ArrowLeft, Plus, Trash2, Search, X } from "lucide-react";
import {
  useListMessageContacts,
  useGetConversation,
  useSendMessage,
  useGetCurrentUser,
  useDeleteConversation,
  getListMessageContactsQueryKey,
  getGetConversationQueryKey,
} from "@workspace/api-client-react";
import { B } from "@/lib/brand";
import { DashboardLayout, Card, GoldButton } from "@/components/DashboardLayout";

export default function MessagesPage() {
  const [, params] = useRoute<{ userId: string }>("/messages/:userId");
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const me = useGetCurrentUser();
  const myId = me.data?.user?.id;

  const otherId = params?.userId ? parseInt(params.userId, 10) : null;

  const contactsQ = useListMessageContacts({
    query: { refetchInterval: 8000 },
  });
  const contacts: any[] = (contactsQ.data as any)?.items ?? [];
  const activeContacts = useMemo(
    () => contacts.filter((c) => c.lastAt),
    [contacts],
  );
  const newContacts = useMemo(
    () => contacts.filter((c) => !c.lastAt),
    [contacts],
  );

  const convQ = useGetConversation(otherId ?? 0, {
    query: {
      enabled: !!otherId,
      refetchInterval: 5000,
    },
  });
  const conv: any = convQ.data;
  const messages: any[] = conv?.items ?? [];
  const otherUser = conv?.otherUser;

  const sendMutation = useSendMessage();
  const deleteConv = useDeleteConversation();
  const [draft, setDraft] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newSearch, setNewSearch] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const newFiltered = useMemo(() => {
    const term = newSearch.trim().toLowerCase();
    if (!term) return newContacts;
    return newContacts.filter((c) =>
      `${c.firstName} ${c.lastName} ${c.role ?? ""}`
        .toLowerCase()
        .includes(term),
    );
  }, [newContacts, newSearch]);

  const onPickNew = (id: number) => {
    setShowNew(false);
    setNewSearch("");
    navigate(`/messages/${id}`);
  };

  const onDeleteConversation = async () => {
    if (!otherId) return;
    const name = otherUser
      ? `${otherUser.firstName} ${otherUser.lastName}`.trim()
      : "this conversation";
    if (
      !window.confirm(
        `Delete the entire conversation with ${name}? Messages on both sides will be removed and cannot be recovered.`,
      )
    ) {
      return;
    }
    try {
      await deleteConv.mutateAsync({ userId: otherId });
      await qc.invalidateQueries({
        queryKey: getListMessageContactsQueryKey(),
      });
      await qc.invalidateQueries({
        queryKey: getGetConversationQueryKey(otherId),
      });
      navigate("/messages");
    } catch (err: any) {
      window.alert(err?.response?.data?.error ?? "Could not delete conversation.");
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, otherId]);

  useEffect(() => {
    setDraft("");
  }, [otherId]);

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otherId || !draft.trim()) return;
    await sendMutation.mutateAsync({
      data: { toUserId: otherId, body: draft.trim() },
    });
    setDraft("");
    await qc.invalidateQueries({
      queryKey: getGetConversationQueryKey(otherId),
    });
    await qc.invalidateQueries({
      queryKey: getListMessageContactsQueryKey(),
    });
  };

  return (
    <DashboardLayout title="Messages" subtitle="Chat with teachers and classmates.">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: 18,
          alignItems: "start",
        }}
      >
        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 800,
                fontSize: 17,
                color: B.navy,
                margin: 0,
              }}
            >
              Conversations
            </h2>
            <GoldButton
              type="button"
              onClick={() => setShowNew(true)}
              style={{ padding: "7px 12px", fontSize: 12 }}
              title="Start a new conversation"
            >
              <Plus size={13} /> New
            </GoldButton>
          </div>
          {contacts.length === 0 ? (
            <div style={{ color: B.muted, fontSize: 13, padding: "10px 0" }}>
              No contacts available yet.
            </div>
          ) : activeContacts.length === 0 ? (
            <div
              style={{
                color: B.muted,
                fontSize: 13,
                padding: "16px 0",
                textAlign: "center",
              }}
            >
              No conversations yet. Tap “New” to message someone.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {activeContacts.map((c) => {
                const active = c.id === otherId;
                return (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/messages/${c.id}`)}
                    style={{
                      textAlign: "left",
                      background: active ? B.navy : B.offW,
                      color: active ? B.white : B.text,
                      border: `1.5px solid ${active ? B.navy : "transparent"}`,
                      borderRadius: 12,
                      padding: "10px 12px",
                      cursor: "pointer",
                      display: "grid",
                      gridTemplateColumns: "36px 1fr auto",
                      alignItems: "center",
                      gap: 10,
                      fontFamily: "inherit",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: active ? B.gold : B.navy,
                        color: active ? B.navy : B.gold,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: 13,
                        fontFamily: "'Playfair Display', serif",
                      }}
                    >
                      {(c.firstName?.[0] ?? "?") + (c.lastName?.[0] ?? "")}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {c.firstName} {c.lastName}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: active ? "rgba(255,255,255,.7)" : B.muted,
                          marginTop: 2,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {c.lastBody ?? `Say hi to ${c.firstName} →`}
                      </div>
                    </div>
                    {c.unreadCount > 0 && !active && (
                      <span
                        style={{
                          background: B.gold,
                          color: B.navy,
                          fontWeight: 800,
                          fontSize: 11,
                          padding: "2px 7px",
                          borderRadius: 999,
                        }}
                      >
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          {!otherId ? (
            <div
              style={{
                padding: "60px 20px",
                textAlign: "center",
                color: B.muted,
              }}
            >
              <MessageCircle
                size={42}
                color={B.gold}
                style={{ marginBottom: 12, opacity: 0.7 }}
              />
              <div
                style={{
                  fontWeight: 700,
                  color: B.navy,
                  fontSize: 16,
                  marginBottom: 6,
                }}
              >
                Pick a contact to start chatting
              </div>
              <div style={{ fontSize: 13 }}>
                Your messages stay private between you and the recipient.
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "calc(100vh - 220px)",
                minHeight: 480,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  paddingBottom: 12,
                  borderBottom: `1.5px solid ${B.light}`,
                  marginBottom: 12,
                }}
              >
                <button
                  onClick={() => navigate("/messages")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: B.muted,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                  title="Back to contacts"
                >
                  <ArrowLeft size={16} />
                </button>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: B.navy,
                    color: B.gold,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  {(otherUser?.firstName?.[0] ?? "?") +
                    (otherUser?.lastName?.[0] ?? "")}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: B.navy, fontSize: 15 }}>
                    {otherUser
                      ? `${otherUser.firstName} ${otherUser.lastName}`
                      : "Conversation"}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: B.muted,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {otherUser?.role ?? ""}
                  </div>
                </div>
                </div>
                {messages.length > 0 && (
                  <button
                    onClick={onDeleteConversation}
                    disabled={deleteConv.isPending}
                    title="Delete conversation"
                    style={{
                      background: "rgba(220,38,38,.08)",
                      color: "#dc2626",
                      border: "1px solid rgba(220,38,38,.3)",
                      borderRadius: 8,
                      padding: "7px 11px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: deleteConv.isPending ? "not-allowed" : "pointer",
                      opacity: deleteConv.isPending ? 0.6 : 1,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontFamily: "inherit",
                    }}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                )}
              </div>

              <div
                ref={scrollRef}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  background: B.offW,
                  borderRadius: 12,
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {messages.length === 0 ? (
                  <div
                    style={{
                      color: B.muted,
                      textAlign: "center",
                      padding: "40px 0",
                      fontSize: 13,
                    }}
                  >
                    No messages yet — send the first one!
                  </div>
                ) : (
                  messages.map((m) => {
                    const mine = m.fromUserId === myId;
                    return (
                      <div
                        key={m.id}
                        style={{
                          alignSelf: mine ? "flex-end" : "flex-start",
                          maxWidth: "72%",
                          background: mine ? B.navy : B.white,
                          color: mine ? B.white : B.text,
                          border: mine ? "none" : `1.5px solid ${B.light}`,
                          borderRadius: 14,
                          padding: "9px 13px",
                          fontSize: 14,
                          lineHeight: 1.45,
                          wordBreak: "break-word",
                        }}
                      >
                        {m.body}
                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 10,
                            opacity: 0.6,
                            fontWeight: 600,
                            textAlign: "right",
                          }}
                        >
                          {formatTime(m.createdAt)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form
                onSubmit={onSend}
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 12,
                }}
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`Message ${otherUser?.firstName ?? ""}…`}
                  style={{
                    flex: 1,
                    background: B.white,
                    border: `1.5px solid ${B.light}`,
                    borderRadius: 12,
                    padding: "11px 14px",
                    fontSize: 14,
                    fontFamily: "inherit",
                    outline: "none",
                    color: B.text,
                  }}
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || sendMutation.isPending}
                  style={{
                    background: B.gold,
                    color: B.navy,
                    border: "none",
                    borderRadius: 12,
                    padding: "0 18px",
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Send size={14} /> Send
                </button>
              </form>
            </div>
          )}
        </Card>
      </div>

      {showNew && (
        <div
          onClick={() => setShowNew(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,26,60,.55)",
            zIndex: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: B.white,
              borderRadius: 16,
              width: "100%",
              maxWidth: 460,
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 18px 50px rgba(15,26,60,.35)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 18px",
                borderBottom: `1px solid ${B.light}`,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 800,
                    fontSize: 18,
                    color: B.navy,
                  }}
                >
                  New conversation
                </div>
                <div style={{ fontSize: 12, color: B.muted, marginTop: 2 }}>
                  Pick someone to start chatting with.
                </div>
              </div>
              <button
                onClick={() => setShowNew(false)}
                aria-label="Close"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: B.muted,
                  padding: 4,
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "12px 18px 0" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: B.offW,
                  border: `1px solid ${B.light}`,
                  borderRadius: 10,
                  padding: "8px 10px",
                }}
              >
                <Search size={14} color={B.muted} />
                <input
                  autoFocus
                  value={newSearch}
                  onChange={(e) => setNewSearch(e.target.value)}
                  placeholder="Search by name or role…"
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: 14,
                    color: B.text,
                  }}
                />
              </div>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "10px 10px 14px",
              }}
            >
              {newFiltered.length === 0 ? (
                <div
                  style={{
                    color: B.muted,
                    fontSize: 13,
                    textAlign: "center",
                    padding: "30px 10px",
                  }}
                >
                  {newContacts.length === 0
                    ? "You already have conversations with everyone available."
                    : "No matches."}
                </div>
              ) : (
                newFiltered.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onPickNew(c.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 10px",
                      borderRadius: 10,
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = B.offW)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: B.navy,
                        color: B.gold,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: 12,
                        fontFamily: "'Playfair Display', serif",
                      }}
                    >
                      {(c.firstName?.[0] ?? "") + (c.lastName?.[0] ?? "")}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          color: B.text,
                          fontSize: 13,
                        }}
                      >
                        {c.firstName} {c.lastName}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: B.muted,
                          textTransform: "uppercase",
                          letterSpacing: ".05em",
                          fontWeight: 700,
                        }}
                      >
                        {c.role}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
