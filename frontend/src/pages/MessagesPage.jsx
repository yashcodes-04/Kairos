import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building, Check, CheckCheck, Clock, GraduationCap, MessageSquare, Moon, Send, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

export default function MessagesPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const initialApplicationId = location.state?.applicationId ?? null;
  const recipientInfo = location.state?.recipientInfo ?? null;
  const [conversations, setConversations] = useState([]);
  const [activeAppId, setActiveAppId] = useState(initialApplicationId);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesContainerRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const prevAppIdRef = useRef(null);

  const scrollToBottom = (behavior = 'auto') => {
    if (messagesContainerRef.current) {
      if (behavior === 'smooth') {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      } else {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    // Considered at bottom if within 100px of bottom
    isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 100;
  };

  const loadConversations = async () => {
    if (!user?.id) return;
    try {
      const convos = await api.getConversations(user.id, user.role);
      setConversations(convos || []);
      if (convos?.length && !convos.some((c) => Number(c.application_id) === Number(activeAppId))) {
        setActiveAppId(initialApplicationId || convos[0].application_id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const loadMessages = async () => {
    if (!activeAppId) {
      setMessages([]);
      return;
    }
    setLoading(true);
    try {
      setMessages((await api.getMessages(activeAppId)) || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (initialApplicationId) setActiveAppId(initialApplicationId);
  }, [initialApplicationId]);

  useEffect(() => {
    loadMessages();
  }, [activeAppId]);

  useEffect(() => {
    if (!activeAppId || !user?.id) return;
    api.markMessagesAsSeen({ applicationId: activeAppId, viewerId: user.id, viewerRole: user.role })
      .then((seenMessages) => {
        if (!seenMessages.length) return;
        const seenIds = new Set(seenMessages.map((message) => message.id));
        setMessages((previous) => previous.map((message) => seenIds.has(message.id) ? { ...message, seen_at: seenMessages.find((item) => item.id === message.id)?.seen_at } : message));
        loadConversations();
      })
      .catch((err) => console.error('Failed to mark messages as seen:', err));
  }, [activeAppId, user?.id, user?.role]);

  useEffect(() => {
    const handleIncomingMessage = (event) => {
      const message = event.detail;
      if (message && Number(message.application_id) === Number(activeAppId)) {
        setMessages((previous) => previous.some((item) => item.id === message.id) ? previous : [...previous, message]);
      }
      loadConversations();
    };
    const handleStorageChange = (event) => {
      if (event.key === 'kairos_messages') {
        loadMessages();
        loadConversations();
      }
    };
    const handleMessagesSeen = (event) => {
      const seenMessages = event.detail?.messages || [];
      const seenIds = new Set(seenMessages.map((message) => message.id));
      if (seenIds.size) {
        setMessages((previous) => previous.map((message) => seenIds.has(message.id) ? { ...message, seen_at: seenMessages.find((item) => item.id === message.id)?.seen_at } : message));
      }
      loadConversations();
    };
    window.addEventListener('kairos_message_sent', handleIncomingMessage);
    window.addEventListener('kairos_messages_seen', handleMessagesSeen);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('kairos_message_sent', handleIncomingMessage);
      window.removeEventListener('kairos_messages_seen', handleMessagesSeen);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [activeAppId, user?.id]);

  useEffect(() => {
    if (activeAppId !== prevAppIdRef.current) {
      prevAppIdRef.current = activeAppId;
      isAtBottomRef.current = true;
      setTimeout(() => scrollToBottom('auto'), 40);
    } else if (isAtBottomRef.current) {
      scrollToBottom('smooth');
    }
  }, [messages, activeAppId]);

  const currentConversation = conversations.find((item) => Number(item.application_id) === Number(activeAppId)) || recipientInfo;
  const otherPersonName = user?.role === 'Recruiter'
    ? currentConversation?.student_name || 'Student'
    : currentConversation?.company_name || currentConversation?.recruiter_name || 'Employer';
  const otherPersonSub = user?.role === 'Recruiter'
    ? `${currentConversation?.student_college || 'Student'} · ${currentConversation?.job_title || 'Applicant'}`
    : `${currentConversation?.recruiter_name || 'Recruiter'} · ${currentConversation?.job_title || 'Role'}`;

  const formatMsgTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const text = inputText.trim();
    if (!text || !activeAppId || sending) return;
    setSending(true);
    try {
      const newMessage = await api.sendMessage({
        applicationId: activeAppId,
        senderId: user.id,
        senderRole: user.role,
        senderName: user.name || (user.role === 'Recruiter' ? user.company : 'Student'),
        text,
      });
      isAtBottomRef.current = true;
      setMessages((previous) => previous.some((message) => message.id === newMessage.id) ? previous : [...previous, newMessage]);
      setInputText('');
      loadConversations();
      setTimeout(() => scrollToBottom('smooth'), 40);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const homePath = user?.role === 'Recruiter' ? '/recruiter' : '/student';

  return (
    <div className="messages-page">
      <header className="messages-topbar">
        <Link to={homePath} className="dashboard-brand">
          <img src="/favicon.png" alt="Kairos" className="dashboard-brand-logo-img" />
          <span>Kairos<span className="brand-dot">.</span></span>
        </Link>
        <h1>Messages</h1>
        <div className="messages-header-actions">
          <button type="button" className="theme-button" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} title="Switch theme">
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button type="button" className="messages-back-btn" onClick={() => navigate(homePath)}>Back to workspace</button>
        </div>
      </header>

      <main className="messages-layout">
        <aside className="messages-sidebar" aria-label="Conversations">
          <div className="messages-sidebar-heading"><MessageSquare size={18} /><span>Conversations</span></div>
          {conversations.length === 0 ? (
            <p className="messages-sidebar-empty">No conversations yet.</p>
          ) : conversations.map((conversation) => {
            const isActive = Number(conversation.application_id) === Number(activeAppId);
            const name = user?.role === 'Recruiter' ? conversation.student_name : conversation.company_name;
            const unread = Number(conversation.unread_count || 0);
            return (
              <button
                key={conversation.application_id}
                type="button"
                className={`conversation-list-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveAppId(conversation.application_id)}
              >
                <span className="conversation-avatar">{user?.role === 'Recruiter' ? <GraduationCap size={17} /> : <Building size={17} />}</span>
                <span className="conversation-list-copy">
                  <strong>{name}</strong>
                  <small>{conversation.job_title}</small>
                </span>
                {unread > 0 && !isActive && (
                  <span className="conversation-unread-badge">{unread}</span>
                )}
              </button>
            );
          })}
        </aside>

        <section className="messages-conversation" aria-label="Active conversation">
          {activeAppId ? <>
            <div className="messages-conversation-header">
              <span className="conversation-avatar">{user?.role === 'Recruiter' ? <GraduationCap size={18} /> : <Building size={18} />}</span>
              <div><h2>{otherPersonName}</h2><p>{otherPersonSub}</p></div>
            </div>
            <div className="messages-stream" ref={messagesContainerRef} onScroll={handleScroll}>
              {loading ? <p className="messages-status">Loading messages...</p> : messages.length === 0 ? <p className="messages-status">Start the conversation.</p> : messages.map((message) => {
                const isOwn = Number(message.sender_id) === Number(user?.id) && message.sender_role === user?.role;
                const receipt = message.seen_at ? 'Seen' : 'Delivered';
                return <div key={message.id || `${message.created_at}-${message.sender_id}`} className={`message-row ${isOwn ? 'own' : 'other'}`}><div className="message-bubble"><strong>{isOwn ? 'You' : message.sender_name}</strong><span>{message.text}</span><small><Clock size={11} />{formatMsgTime(message.created_at)}{isOwn && <span className={`message-receipt ${message.seen_at ? 'seen' : ''}`}>{message.seen_at ? <CheckCheck size={12} /> : <Check size={12} />}{receipt}</span>}</small></div></div>;
              })}
            </div>
            <form className="messages-composer" onSubmit={handleSend}>
              <input type="text" value={inputText} onChange={(event) => setInputText(event.target.value)} placeholder="Write a message..." disabled={sending} autoFocus />
              <button type="submit" disabled={!inputText.trim() || sending} aria-label="Send message"><Send size={18} /></button>
            </form>
          </> : <div className="messages-no-selection"><MessageSquare size={32} /><h2>Select a conversation</h2><p>Choose a conversation from the list to view messages.</p></div>}
        </section>
      </main>
    </div>
  );
}
