'use client';
import { useEffect } from 'react';

export default function LiveChatWidget() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.__pr_chat_loaded) return;
    if (document.getElementById('pr-chat-widget')) return;
    window.__pr_chat_loaded = true;

    const btn = document.createElement('button');
    btn.id = 'pr-chat-widget';
    btn.setAttribute('aria-label', 'Open chat with our team');
    btn.style.cssText = 'position:fixed;bottom:20px;right:20px;width:60px;height:60px;border-radius:50%;background:#ca9c3a;color:#0f1733;border:none;cursor:pointer;box-shadow:0 4px 24px rgba(0,0,0,0.18);z-index:50;display:flex;align-items:center;justify-content:center;';
    btn.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>';

    const panel = document.createElement('div');
    panel.id = 'pr-chat-panel';
    panel.style.cssText = 'position:fixed;bottom:90px;right:20px;width:340px;max-width:calc(100vw - 40px);background:white;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,0.18);overflow:hidden;display:none;z-index:51;font-family:inherit;';
    panel.innerHTML = `
      <div style="background:#0f1733;color:white;padding:18px 20px;">
        <div style="font-weight:600;font-size:16px;">Chat with our team</div>
        <div style="font-size:12px;opacity:0.7;margin-top:2px;">We typically reply within an hour during business hours.</div>
      </div>
      <div style="padding:18px 20px;color:#374151;font-size:14px;line-height:1.5;">
        <p style="margin:0 0 12px 0;">Hi 👋 What can we help you with today?</p>
        <a href="/contact" style="display:block;padding:10px 14px;border:1px solid #e5e7eb;border-radius:8px;color:#0f1733;text-decoration:none;margin-bottom:8px;font-weight:500;">📋 Send a written enquiry</a>
        <a href="tel:" id="pr-chat-call" style="display:block;padding:10px 14px;border:1px solid #e5e7eb;border-radius:8px;color:#0f1733;text-decoration:none;margin-bottom:8px;font-weight:500;">📞 Request a call back</a>
        <a href="/properties" style="display:block;padding:10px 14px;border:1px solid #e5e7eb;border-radius:8px;color:#0f1733;text-decoration:none;font-weight:500;">🏡 Browse listings</a>
      </div>
    `;

    let isOpen = false;
    function toggle() {
      isOpen = !isOpen;
      panel.style.display = isOpen ? 'block' : 'none';
    }
    btn.addEventListener('click', toggle);

    document.body.appendChild(btn);
    document.body.appendChild(panel);
    return () => {
      btn.remove();
      panel.remove();
      window.__pr_chat_loaded = false;
    };
  }, []);
  return null;
}
