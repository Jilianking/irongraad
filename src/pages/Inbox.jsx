import { useState, useEffect, useCallback } from 'react';
import { Menu, Search, Bell, Filter, Check, MessageSquare, XCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { Link } from 'react-router-dom';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, where, limit, startAfter } from 'firebase/firestore';
import { db } from '../firebase';
import Toast from '../components/ui/Toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import React from 'react';

export default function Inbox() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageThreads, setMessageThreads] = useState([]);
  const [messageTypeFilter, setMessageTypeFilter] = useState('all');
  const [readStatusFilter, setReadStatusFilter] = useState('all');
  const [nameFilter, setNameFilter] = useState('');
  const [lastMessageRef, setLastMessageRef] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const MESSAGES_PER_PAGE = 25;
  const messagesEndRef = React.useRef(null);
  const [hiddenThreadEmails, setHiddenThreadEmails] = useState(new Set());

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleString();
      }
      if (timestamp instanceof Date) {
        return timestamp.toLocaleString();
      }
      if (typeof timestamp === 'number') {
        return new Date(timestamp * (timestamp < 1e12 ? 1000 : 1)).toLocaleString();
      }
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid date';
    }
  };

  useEffect(() => {
    const fetchMessageThreads = async () => {
      setLoading(true);
      try {
        const messagesRef = collection(db, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const threads = new Map();
        querySnapshot.docs.forEach(doc => {
          const message = { id: doc.id, ...doc.data() };
          const contactEmail = message.from === 'admin@irongraad.com' ? message.to : message.from;
          if (!threads.has(contactEmail)) {
            threads.set(contactEmail, {
              contactEmail,
              lastMessage: message,
              unreadCount: message.to === 'admin@irongraad.com' && !message.read ? 1 : 0
            });
          } else if (!message.read && message.to === 'admin@irongraad.com') {
            const thread = threads.get(contactEmail);
            thread.unreadCount = (thread.unreadCount || 0) + 1;
          }
        });
        const sortedThreads = Array.from(threads.values()).sort((a, b) => 
          (b.lastMessage.timestamp?.toMillis() || 0) - (a.lastMessage.timestamp?.toMillis() || 0)
        );
        setMessageThreads(sortedThreads);

        const projectContacts = [];
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        projectsSnapshot.forEach(doc => {
          projectContacts.push({ id: doc.id, ...doc.data() });
        });
        setContacts(projectContacts);

      } catch (error) {
        console.error('Error fetching message threads:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessageThreads();
  }, []);

  useEffect(() => {
    const storedHidden = localStorage.getItem('hiddenThreadEmails');
    if (storedHidden) {
      try {
        setHiddenThreadEmails(new Set(JSON.parse(storedHidden)));
      } catch (e) {
        console.error("Error parsing hiddenThreadEmails from localStorage", e);
        localStorage.removeItem('hiddenThreadEmails'); // Clear corrupted data
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('hiddenThreadEmails', JSON.stringify(Array.from(hiddenThreadEmails)));
  }, [hiddenThreadEmails]);

  const filteredThreads = messageThreads.filter(thread => {
    const matchesSearch = searchTerm === '' || 
      thread.lastMessage.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = messageTypeFilter === 'all' || thread.lastMessage.source === messageTypeFilter;
    
    const matchesReadStatus = readStatusFilter === 'all' ||
      (readStatusFilter === 'unread' && thread.unreadCount > 0) ||
      (readStatusFilter === 'read' && thread.unreadCount === 0);

    const contact = contacts.find(c => c.email === thread.contactEmail);
    const contactName = contact?.name || thread.contactEmail;
    const matchesName = nameFilter === '' || contactName.toLowerCase().includes(nameFilter.toLowerCase());
    
    const isHidden = hiddenThreadEmails.has(thread.contactEmail);

    return matchesSearch && matchesType && matchesReadStatus && matchesName && !isHidden;
  });

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact) {
        setMessages([]);
        setLastMessageRef(null);
        setHasMoreMessages(true);
        return;
      }
      setLoading(true);
      try {
        const messagesRef = collection(db, 'messages');
        const q = query(
          messagesRef,
          where('contactEmailPair', 'array-contains', selectedContact.email),
          orderBy('timestamp', 'desc'),
          limit(MESSAGES_PER_PAGE)
        );
        const querySnapshot = await getDocs(q);
        const fetchedMessages = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        
        setMessages(fetchedMessages.reverse());
        
        if (querySnapshot.docs.length > 0) {
          setLastMessageRef(querySnapshot.docs[querySnapshot.docs.length - 1]);
        } else {
          setLastMessageRef(null);
        }
        setHasMoreMessages(fetchedMessages.length === MESSAGES_PER_PAGE);
      } catch (error) {
        console.error('Error fetching messages for contact:', error);
        setToast("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [selectedContact]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;
    const adminEmail = 'admin@irongraad.com';
    const contactEmailPair = [adminEmail, selectedContact.email].sort();

    try {
      const messageDocData = {
        text: newMessage,
        from: adminEmail,
        to: selectedContact.email,
        timestamp: serverTimestamp(),
        read: false, 
        source: selectedContact.phone && messageThreads.find(t => t.contactEmail === selectedContact.email)?.lastMessage?.source === 'sms' ? 'sms' : 'email',
        contactEmailPair,
      };
      
      const isSmsConversation = selectedContact.phone && messageThreads.find(
        thread => thread.contactEmail === selectedContact.email
      )?.lastMessage?.source === 'sms';

      let docRef;
      if (isSmsConversation && selectedContact.phone) {
        const response = await fetch('/api/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: selectedContact.phone, text: newMessage })
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Failed to send SMS');
        
        messageDocData.twilioMessageId = result.twilioMessageId;
        messageDocData.status = result.status;
        docRef = await addDoc(collection(db, 'messages'), messageDocData);
        messageDocData.id = docRef.id;

      } else {
        docRef = await addDoc(collection(db, 'messages'), messageDocData);
        messageDocData.id = docRef.id;
      }
      
      setMessages(prev => [...prev, { ...messageDocData, id: docRef.id, timestamp: new Date() }]);
      setNewMessage('');
      setToast("Message sent successfully!");

      setMessageThreads(prevThreads => {
        const existingThreadIndex = prevThreads.findIndex(t => t.contactEmail === selectedContact.email);
        const updatedThread = {
          contactEmail: selectedContact.email,
          lastMessage: { ...messageDocData, id: docRef.id, timestamp: new Date() },
          unreadCount: 0,
        };
        if (existingThreadIndex > -1) {
          const newThreads = [...prevThreads];
          newThreads.splice(existingThreadIndex, 1);
          return [updatedThread, ...newThreads];
        }
        return [updatedThread, ...prevThreads];
      });

    } catch (error) {
      console.error('Error sending message:', error);
      setToast("Failed to send message. Please try again.");
    }
  };

  const loadOlderMessages = async () => {
    if (!selectedContact || !lastMessageRef || !hasMoreMessages || loadingMore) return;
    setLoadingMore(true);
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('contactEmailPair', 'array-contains', selectedContact.email),
        orderBy('timestamp', 'desc'),
        startAfter(lastMessageRef),
        limit(MESSAGES_PER_PAGE)
      );
      const querySnapshot = await getDocs(q);
      const olderMessages = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      if (olderMessages.length > 0) {
        setMessages(prev => [...olderMessages.reverse(), ...prev]);
        setLastMessageRef(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }
      setHasMoreMessages(olderMessages.length === MESSAGES_PER_PAGE);
    } catch (error) {
      console.error('Error loading older messages:', error);
      setToast("Failed to load older messages");
    } finally {
      setLoadingMore(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [selectedContact, loading, scrollToBottom, messages.length]);

  const handleHideThread = (e, contactEmail) => {
    e.stopPropagation(); // Prevent selecting the thread
    setHiddenThreadEmails(prev => new Set(prev).add(contactEmail));
  };

  const handleShowAllThreads = () => {
    setHiddenThreadEmails(new Set());
    // localStorage will be updated by the useEffect watching hiddenThreadEmails
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <div className="w-16 p-4 bg-white border-r border-gray-200 shrink-0">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Menu className="w-6 h-6 text-gray-600" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-white text-gray-900 w-64 p-6 h-full border-r border-gray-200">
            <DialogTitle className="sr-only">Main Navigation</DialogTitle>
            <DialogDescription className="sr-only">Primary navigation menu for the application.</DialogDescription>
            <ul className="space-y-4 text-2xl font-large mt-6">
              <li><Link to="/dashboard" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-lg transition-colors">Dashboard</Link></li>
              <li><Link to="/activeprojects" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-lg transition-colors">Active Projects</Link></li>
              <li><Link to="/newproject" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-lg transition-colors">New Project</Link></li>
              <li><Link to="/calendar" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-lg transition-colors">Calendar</Link></li>
              <li><Link to="/inbox" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-lg transition-colors">Inbox</Link></li>
            </ul>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex-1 flex flex-row overflow-hidden">
        <div className="w-1/3 bg-white border-r border-gray-200 p-4 flex flex-col h-full min-w-[300px] max-w-[400px]">
          <div className="space-y-4 mb-4 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>

            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                    {((messageTypeFilter !== 'all' || readStatusFilter !== 'all') || nameFilter !== '') && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs text-blue-700">
                        { (messageTypeFilter !== 'all' ? 1:0) + (readStatusFilter !== 'all' ? 1:0) + (nameFilter !== '' ? 1:0) }
                      </span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="start">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-sm text-gray-900 mb-2">Filter by Name</h3>
                      <Input
                        placeholder="Enter name or email..."
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="h-px bg-gray-200" />

                    <div>
                      <h3 className="font-medium text-sm text-gray-900 mb-2">Message Type</h3>
                      <div className="space-y-2">
                        {[
                          { value: 'all', label: 'All Messages' },
                          { value: 'sms', label: 'SMS Only' },
                          { value: 'email', label: 'Email Only' }
                        ].map(option => (
                          <button
                            key={option.value}
                            onClick={() => setMessageTypeFilter(option.value)}
                            className="flex items-center justify-between w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                          >
                            {option.label}
                            {messageTypeFilter === option.value && (
                              <Check className="w-4 h-4 text-blue-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-gray-200" />

                    <div>
                      <h3 className="font-medium text-sm text-gray-900 mb-2">Status</h3>
                      <div className="space-y-2">
                        {[
                          { value: 'all', label: 'All Messages' },
                          { value: 'unread', label: 'Unread' },
                          { value: 'read', label: 'Read' }
                        ].map(option => (
                          <button
                            key={option.value}
                            onClick={() => setReadStatusFilter(option.value)}
                            className="flex items-center justify-between w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                          >
                            {option.label}
                            {readStatusFilter === option.value && (
                              <Check className="w-4 h-4 text-blue-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {(messageTypeFilter !== 'all' || readStatusFilter !== 'all' || nameFilter !== '') && (
                <div className="flex gap-2 items-center flex-wrap">
                  {nameFilter !== '' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      Name: {nameFilter}
                    </span>
                  )}
                  {messageTypeFilter !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {messageTypeFilter === 'sms' ? 'SMS' : 'Email'}
                    </span>
                  )}
                  {readStatusFilter !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {readStatusFilter.charAt(0).toUpperCase() + readStatusFilter.slice(1)}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hiddenThreadEmails.size > 0 && (
                <button
                  onClick={handleShowAllThreads}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                  title="Show all hidden conversations"
                >
                  <Bell className="w-4 h-4" />
                  <span>Show Hidden ({hiddenThreadEmails.size})</span>
                </button>
              )}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-gray-800 shrink-0">Messages</h2>
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {filteredThreads.map(thread => {
                const contact = contacts.find(c => c.email === thread.contactEmail);
                const contactName = contact?.name || thread.contactEmail;
                const contactPhone = contact?.phone;
                return (
                  <div
                    key={thread.contactEmail}
                    onClick={() => setSelectedContact({ email: thread.contactEmail, name: contactName, phone: contactPhone })}
                    className={`group p-3 rounded-lg cursor-pointer relative ${
                      selectedContact?.email === thread.contactEmail
                        ? 'bg-blue-50 border border-blue-300'
                        : 'hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    <div className="font-semibold text-gray-800">{contactName}</div>
                    <div className="text-sm text-gray-600 truncate pr-6">
                      {thread.lastMessage.from === 'admin@irongraad.com' ? 'You: ' : ''}
                      {thread.lastMessage.text}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatTimestamp(thread.lastMessage.timestamp)}
                    </div>
                    {thread.unreadCount > 0 && (
                      <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {thread.unreadCount}
                      </div>
                    )}
                    <button
                      onClick={(e) => handleHideThread(e, thread.contactEmail)}
                      className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded-full transition-opacity"
                      title="Hide conversation"
                    >
                      <XCircle className="w-4 h-4 text-gray-500 hover:text-red-600" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col h-full">
          {selectedContact ? (
            <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
              <div className="bg-white border-b border-gray-200 p-4 shrink-0 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800">{selectedContact.name || selectedContact.email}</h2>
                {selectedContact.phone && (
                  <p className="text-sm text-gray-500">{selectedContact.phone}</p>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {hasMoreMessages && (
                  <div className="flex justify-center mb-4 sticky top-0 pt-2 pb-1 bg-gray-100/80 backdrop-blur-sm z-10">
                    <Button
                      variant="outline"
                      onClick={loadOlderMessages}
                      disabled={loadingMore}
                      className="shadow-sm"
                    >
                      {loadingMore ? "Loading..." : "Load Older Messages"}
                    </Button>
                  </div>
                )}
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-xl shadow max-w-[75%] flex flex-col ${
                      message.from === 'admin@irongraad.com'
                        ? 'bg-blue-600 text-white ml-auto rounded-br-none'
                        : 'bg-white text-gray-800 mr-auto rounded-bl-none border border-gray-200'
                    }`}
                  >
                    <p className="text-base">{message.text}</p>
                    <div className="flex items-center justify-end text-xs mt-2 gap-2 opacity-80">
                      {message.type === 'project_update' && (
                        <span className="px-1.5 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">Update</span>
                      )}
                      {message.source === 'sms' && (
                        <span className="px-1.5 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700">SMS</span>
                      )}
                      {message.from === 'admin@irongraad.com' && message.status && (
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                          message.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          message.status === 'failed' ? 'bg-red-100 text-red-700' :
                          message.status === 'sent' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                        </span>
                      )}
                      <span className="min-w-max">{formatTimestamp(message.timestamp)}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="bg-white border-t border-gray-200 p-4 shrink-0 shadow-sm">
                <div className="flex gap-3">
                  <Input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 py-3"
                  />
                  <Button type="submit" size="lg" className="px-6">
                    Send
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center h-full text-gray-500 text-lg bg-gray-50">
              <MessageSquare className="w-16 h-16 mb-4 text-gray-400" />
              <p className="font-medium">Select a conversation</p>
              <p className="text-sm">Choose a message thread from the left to start chatting.</p>
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}