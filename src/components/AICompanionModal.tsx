import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RefreshCw,
  X,
  Bot,
  User,
  Copy,
  Check,
  Languages,
  ChevronDown,
  Info,
  Lightbulb,
  Music,
  ExternalLink,
  CloudSun,
  TrendingUp,
  MapPin,
  Sliders,
  Smile,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageCode } from '../utils/translations';
import { UserProfile } from '../services/dbApi';
import { SPOKEN_DIALECTS, SpokenDialect, getDialectById } from '../utils/dialectDefinitions';
import { classifyIntent, buildConversationalReply, ConversationTurn } from '../utils/conversationEngine';
import { MusicSearchResult } from '../services/musicProvider';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'companion';
  text: string;
  audioText?: string;
  timestamp: string;
  dialect?: string;
  intent?: string;
  actionableTip?: string;
  suggestedQuestions?: string[];
  musicData?: MusicSearchResult;
  appAction?: {
    type: 'OPEN_FIELD_ANALYSIS' | 'OPEN_WEATHER' | 'OPEN_MANDI' | 'OPEN_LEAF_DOCTOR' | 'OPEN_MUSIC' | 'OPEN_UNITS' | string;
    label: string;
  };
}

export type CompanionVoiceState = 'IDLE' | 'LISTENING' | 'UNDERSTANDING' | 'RESPONDING' | 'SPEAKING';

interface AICompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  crop?: string;
  state?: string;
  fieldAreaAcres?: number;
  healthyPct?: number;
  stressPct?: number;
  onOpenCockpit?: () => void;
  onOpenFieldAnalysis?: () => void;
  onOpenWeather?: () => void;
  onOpenMandi?: () => void;
  onOpenLeafDoctor?: () => void;
  onOpenLanguageModal?: () => void;
}

export const AICompanionModal: React.FC<AICompanionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  crop = 'Wheat',
  state = 'Haryana',
  fieldAreaAcres = 2.5,
  healthyPct = 76,
  stressPct = 18,
  onOpenCockpit,
  onOpenFieldAnalysis,
  onOpenWeather,
  onOpenMandi,
  onOpenLeafDoctor,
  onOpenLanguageModal,
}) => {
  const { language, setLanguage, spokenDialect, setSpokenDialect, spokenDialectObj } = useLanguage();

  const [inputMessage, setInputMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [wasInterrupted, setWasInterrupted] = useState<boolean>(false);

  // Stale Response Protection Refs
  const currentRequestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Continuous Hands-Free Voice Mode
  const [isContinuousVoiceMode, setIsContinuousVoiceMode] = useState<boolean>(false);
  const isContinuousVoiceModeRef = useRef<boolean>(false);

  useEffect(() => {
    isContinuousVoiceModeRef.current = isContinuousVoiceMode;
  }, [isContinuousVoiceMode]);

  // Voice Interaction State Machine
  const [voiceState, setVoiceState] = useState<CompanionVoiceState>('IDLE');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Stop speech and listening when modal closes
  useEffect(() => {
    if (!isOpen) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setVoiceState('IDLE');
      setSpeakingMessageId(null);
      setIsContinuousVoiceMode(false);
    }
  }, [isOpen]);

  // Dynamic friendly initial conversation welcome when modal opens
  useEffect(() => {
    if (messages.length === 0 && isOpen) {
      const initialGreeting: ChatMessage = {
        id: 'msg-welcome',
        sender: 'companion',
        text: `${spokenDialectObj.greetingSample} बता भाई, आज के बात करन का मन सै? कोई बात करनी हो, हाल-चाल साझा करना हो या खेत-खलिहान का कुछ पूछना हो, मैं हाजिर सूँ!`,
        audioText: `${spokenDialectObj.greetingSample} बता भाई, आज के बात करन का मन सै?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dialect: spokenDialectObj.name,
        suggestedQuestions: [
          'तू कैसा है भाई?',
          'आज क्या कर रहा है?',
          'एक मजेदार जोक सुना दे',
          'एक शांत बांसुरी धुन बजा दे',
          'आज का मौसम कैसा रहेगा?',
          'मंडी में क्या भाव है?',
        ],
      };
      setMessages([initialGreeting]);
    }
  }, [isOpen, spokenDialectObj]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Web Speech Synthesis (Speaking) handler with interruption support
  const speakText = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    // Toggle off if already speaking this message
    if (voiceState === 'SPEAKING' && speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setVoiceState('IDLE');
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*_#`~]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.lang = spokenDialectObj.voiceLangCode || 'hi-IN';
    utterance.rate = spokenDialectObj.speechRate || 0.95;
    utterance.pitch = spokenDialectObj.speechPitch || 1.0;

    utterance.onstart = () => {
      setVoiceState('SPEAKING');
      setSpeakingMessageId(msgId);
    };

    utterance.onend = () => {
      setVoiceState('IDLE');
      setSpeakingMessageId(null);
      // Continuous hands-free live conversation loop
      if (isContinuousVoiceModeRef.current) {
        setTimeout(() => {
          if (isContinuousVoiceModeRef.current) {
            startListening();
          }
        }, 350);
      }
    };

    utterance.onerror = () => {
      setVoiceState('IDLE');
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Immediate Interruption Handler (Full Duplex / Barge-in)
  const interruptVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (voiceState === 'SPEAKING') {
      setWasInterrupted(true);
      setTimeout(() => setWasInterrupted(false), 2500);
    }
    setVoiceState('IDLE');
    setSpeakingMessageId(null);
  };

  // Start Speech Recognition (Microphone) with Instant Barge-in
  const startListening = () => {
    if (voiceState === 'SPEAKING') {
      interruptVoice();
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your query in the box.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = spokenDialectObj.voiceLangCode || 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setVoiceState('LISTENING');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage(transcript);
          // Auto-send voice input for direct conversational flow with immediate barge-in
          handleSendMessage(transcript);
        }
        setVoiceState('IDLE');
      };

      recognition.onerror = () => {
        setVoiceState('IDLE');
      };

      recognition.onend = () => {
        setVoiceState('IDLE');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition error:', err);
      setVoiceState('IDLE');
    }
  };

  // Stop Speech Recognition
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setVoiceState('IDLE');
  };

  // Toggle listening
  const toggleListening = () => {
    if (voiceState === 'SPEAKING') {
      interruptVoice();
      startListening();
      return;
    }

    if (voiceState === 'LISTENING') {
      stopListening();
    } else {
      startListening();
    }
  };

  // Toggle Continuous Hands-Free Live Voice Mode
  const toggleContinuousVoice = () => {
    const nextState = !isContinuousVoiceMode;
    setIsContinuousVoiceMode(nextState);

    if (nextState) {
      if (voiceState === 'SPEAKING') {
        interruptVoice();
      }
      startListening();
    } else {
      stopListening();
    }
  };

  // Send message handler with conversation engine, stale request protection, and barge-in
  const handleSendMessage = async (textToSend?: string) => {
    const message = (textToSend || inputMessage).trim();
    if (!message || loading) return;

    // Interrupt any ongoing speech immediately (Barge-in)
    interruptVoice();

    // Abort any ongoing network request to ensure Stale Response Protection
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const requestId = ++currentRequestIdRef.current;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);
    setVoiceState('UNDERSTANDING');

    const historyForEngine: ConversationTurn[] = messages.slice(-6).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      text: m.text,
      intent: m.intent as any,
    }));

    try {
      const response = await fetch('/api/ai-companion/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          message,
          language,
          dialect: `${spokenDialectObj.name} (${spokenDialectObj.nativeName})`,
          state: currentUser?.state || state,
          crop: currentUser?.primaryCrop || crop,
          farmDetails: {
            areaAcres: currentUser?.totalLandAcres || fieldAreaAcres,
            healthyPct,
            stressPct,
          },
          history: historyForEngine,
        }),
      });

      const data = await response.json();

      // Discard if newer request arrived while fetching (Stale Response Protection)
      if (requestId !== currentRequestIdRef.current) {
        return;
      }

      if (data && data.reply) {
        // Dynamic spoken dialect switching if requested by user
        if (data.targetDialectId && data.targetDialectId !== spokenDialect) {
          setSpokenDialect(data.targetDialectId);
        }

        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'companion',
          text: data.reply,
          audioText: data.audioText || data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          dialect: spokenDialectObj.name,
          intent: data.intent,
          actionableTip: data.actionableTip,
          suggestedQuestions: data.suggestedQuestions,
          appAction: data.appAction,
          musicData: data.musicData,
        };

        setMessages((prev) => [...prev, botMsg]);
        setVoiceState('RESPONDING');

        // Automatically speak friendly voice reply
        if (botMsg.audioText) {
          speakText(botMsg.audioText, botMsg.id);
        }
      } else {
        throw new Error('No reply received from server');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return; // Request was cleanly aborted due to user interruption or newer prompt
      }

      if (requestId !== currentRequestIdRef.current) {
        return;
      }

      console.warn('Using client-side conversation engine fallback:', error);
      // Guarantee natural, friendly conversation even when offline or during network latency!
      const fallbackResult = buildConversationalReply(
        message,
        spokenDialectObj.id,
        historyForEngine,
        {
          crop: currentUser?.primaryCrop || crop,
          state: currentUser?.state || state,
          healthyPct,
          stressPct,
        },
        language
      );

      if (fallbackResult.targetDialectId && fallbackResult.targetDialectId !== spokenDialect) {
        setSpokenDialect(fallbackResult.targetDialectId);
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'companion',
        text: fallbackResult.reply,
        audioText: fallbackResult.audioText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dialect: spokenDialectObj.name,
        intent: fallbackResult.intent,
        actionableTip: fallbackResult.actionableTip,
        suggestedQuestions: fallbackResult.suggestedQuestions,
        appAction: fallbackResult.appAction,
        musicData: fallbackResult.musicData,
      };

      setMessages((prev) => [...prev, botMsg]);
      setVoiceState('RESPONDING');

      if (botMsg.audioText) {
        speakText(botMsg.audioText, botMsg.id);
      }
    } finally {
      if (requestId === currentRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleActionClick = (actionType: string) => {
    if (actionType === 'OPEN_FIELD_ANALYSIS') {
      if (onOpenFieldAnalysis) onOpenFieldAnalysis();
      else if (onOpenCockpit) onOpenCockpit();
    } else if (actionType === 'OPEN_WEATHER') {
      if (onOpenWeather) onOpenWeather();
    } else if (actionType === 'OPEN_MANDI') {
      if (onOpenMandi) onOpenMandi();
    } else if (actionType === 'OPEN_LEAF_DOCTOR') {
      if (onOpenLeafDoctor) onOpenLeafDoctor();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] bg-black/40 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#FBFAF5] border border-[#E6E1D3] rounded-[14px] shadow-[0_1px_3px_rgba(40,50,35,0.06)] overflow-hidden w-full max-w-2xl h-[92vh] max-h-[780px] flex flex-col text-[#1E2B1F]">
        {/* Modal Top Header */}
        <div className="bg-[#FBFAF5] px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-[#E6E1D3]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-[8px] bg-[#E3E8D8] flex items-center justify-center border border-[#E6E1D3]">
                <Bot className="w-6 h-6 text-[#2D5A36]" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#2D5A36] border-2 border-[#FBFAF5] flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#1E2B1F]">
                  BhooSaathi AI • भू-साथी
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[6px] bg-[#E3E8D8] text-[#2D5A36] border border-[#E6E1D3]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A36]" />
                  Friend & Agronomist
                </span>
              </div>
              <p className="text-xs text-[#6B7266] font-medium">
                आपकी अपनी देसी बोली में सच्चा हमसफ़र और सलाहकार
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                interruptVoice();
                onClose();
              }}
              className="w-9 h-9 rounded-[8px] bg-[#FBFAF5] hover:bg-[#F4F0E6] text-[#6B7266] hover:text-[#1E2B1F] border border-[#D9D4C4] flex items-center justify-center transition-colors cursor-pointer"
              title="Close BhooSaathi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Local Spoken Dialect & Screen Language Quick Switcher Bar */}
        <div className="bg-[#FBFAF5] px-4 py-2.5 border-b border-[#E6E1D3] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Mic className="w-3.5 h-3.5 text-[#2D5A36]" />
            <span className="text-[#6B7266] font-medium">बोलने की बोली:</span>
            <select
              value={spokenDialect}
              onChange={(e) => setSpokenDialect(e.target.value)}
              className="bg-[#FBFAF5] border border-[#D9D4C4] text-[#2F3A2E] font-medium rounded-[8px] px-2.5 py-1 text-xs cursor-pointer focus:outline-none focus:border-[#2D5A36]"
              aria-label="Select Spoken Dialect"
            >
              {SPOKEN_DIALECTS.map((d) => (
                <option key={d.id} value={d.id} className="bg-[#FBFAF5] text-[#2F3A2E]">
                  {d.nativeName} ({d.name})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* Hands-Free Live Voice Mode Toggle */}
            <button
              type="button"
              onClick={toggleContinuousVoice}
              className={`px-2.5 py-1 rounded-[8px] text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isContinuousVoiceMode
                  ? 'bg-[#2D5A36] text-white border-[#2D5A36]'
                  : 'bg-[#FBFAF5] text-[#2D5A36] hover:bg-[#F4F0E6] border-[#D9D4C4]'
              }`}
              title="Toggle Hands-Free Live Voice Loop"
            >
              <Mic className={`w-3.5 h-3.5 ${isContinuousVoiceMode ? 'text-white' : 'text-[#2D5A36]'}`} />
              <span>{isContinuousVoiceMode ? 'लाइव आवाज चालू' : 'हैंड्स-फ्री आवाज'}</span>
            </button>

            {onOpenLanguageModal && (
              <button
                type="button"
                onClick={() => {
                  interruptVoice();
                  onOpenLanguageModal();
                }}
                className="text-[11px] text-[#2D5A36] hover:bg-[#F4F0E6] bg-[#FBFAF5] px-2.5 py-1 rounded-[8px] border border-[#D9D4C4] flex items-center gap-1.5 transition-colors cursor-pointer font-medium"
                title="Open detailed Language & Dialect Settings"
              >
                <Languages className="w-3.5 h-3.5 text-[#2D5A36]" />
                <span>All Dialects</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Voice State Indicator, Interrupt & Barge-in Bar */}
        {wasInterrupted && (
          <div className="bg-[#FFFBEB] px-4 py-2 border-b border-[#FDE68A] flex items-center justify-between text-xs text-[#D9922B]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D9922B]" />
              <span className="font-semibold">
                बात रोक दी गई (Barge-in / Interrupted), आपकी नई बात सुनी जा रही है
              </span>
            </div>
            <span className="text-[10px] text-[#D9922B] font-mono">Full-Duplex</span>
          </div>
        )}

        {voiceState === 'SPEAKING' && (
          <div className="bg-[#E3E8D8] px-4 py-2 border-b border-[#E6E1D3] flex items-center justify-between text-xs text-[#2D5A36]">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-[#2D5A36]" />
              <span className="font-semibold">
                भू-साथी {spokenDialectObj.nativeName} में बोल रहा है...
              </span>
              <span className="hidden sm:inline text-[10px] text-[#6B7266] font-normal">
                (बोलकर या टैप करके रोकें)
              </span>
            </div>

            {/* Direct Interrupt Button */}
            <button
              type="button"
              onClick={interruptVoice}
              className="bg-[#F8E3E0] hover:bg-[#F8B4B4] border border-[#F8B4B4] text-[#C0392B] px-2.5 py-1 rounded-[8px] text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Interrupt AI speaking"
            >
              <VolumeX className="w-3.5 h-3.5 text-[#C0392B]" />
              <span>रुकें (Interrupt)</span>
            </button>
          </div>
        )}

        {voiceState === 'LISTENING' && (
          <div className="bg-[#F8E3E0] px-4 py-2 border-b border-[#F8B4B4] flex items-center justify-between text-xs text-[#C0392B]">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C0392B]" />
              <span className="font-semibold">
                सुण रया सूँ... {spokenDialectObj.nativeName} में बोलिए
              </span>
            </div>
            <button
              type="button"
              onClick={toggleListening}
              className="text-[11px] underline text-[#C0392B] cursor-pointer"
            >
              बोलना बंद करें
            </button>
          </div>
        )}

        {voiceState === 'UNDERSTANDING' && (
          <div className="bg-[#E3E8D8] px-4 py-1.5 border-b border-[#E6E1D3] flex items-center gap-2 text-xs text-[#2D5A36]">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2D5A36]" />
            <span className="font-medium">समझ रहा हूँ... (Understanding your question)</span>
          </div>
        )}

        {/* Chat Message Scrollable View */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#F4F1E8]">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isPlayingThis = voiceState === 'SPEAKING' && speakingMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[92%] sm:max-w-[85%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-[8px] flex items-center justify-center text-sm shrink-0 ${
                    isUser
                      ? 'bg-[#2D5A36] text-white font-semibold'
                      : 'bg-[#E3E8D8] border border-[#E6E1D3] text-[#2D5A36] font-semibold'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-2">
                  <div
                    className={`p-3.5 sm:p-4 rounded-[14px] text-sm leading-relaxed border ${
                      isUser
                        ? 'bg-[#2D5A36] border-[#2D5A36] text-white rounded-tr-[2px]'
                        : 'bg-[#FBFAF5] border-[#E6E1D3] text-[#2F3A2E] rounded-tl-[2px] shadow-[0_1px_3px_rgba(40,50,35,0.06)]'
                    }`}
                  >
                    {!isUser && msg.dialect && (
                      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#E6E1D3] text-[10px] text-[#2D5A36] font-semibold">
                        <span>{msg.dialect}</span>
                        <span className="text-[#6B7266]">{msg.timestamp}</span>
                      </div>
                    )}

                    <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                    {/* Legal Music Player */}
                    {!isUser && msg.musicData && (
                      <div className="mt-3 p-3.5 rounded-[14px] bg-[#FBFAF5] border border-[#E6E1D3] shadow-xs">
                        <div className="flex items-start gap-3">
                          {msg.musicData.track.thumbnail ? (
                            <img
                              src={msg.musicData.track.thumbnail}
                              alt={msg.musicData.track.title}
                              referrerPolicy="no-referrer"
                              className="w-14 h-14 rounded-[8px] object-cover border border-[#E6E1D3] shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-[8px] bg-[#E3E8D8] border border-[#E6E1D3] flex items-center justify-center shrink-0 text-[#2D5A36]">
                              <Music className="w-6 h-6" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-[10px] text-[#2D5A36] font-bold uppercase tracking-wider mb-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A36]" />
                              <span>{msg.musicData.track.provider} • Legal Stream</span>
                            </div>
                            <h4 className="text-sm font-bold text-[#1E2B1F] truncate">
                              {msg.musicData.track.title}
                            </h4>
                            <p className="text-xs text-[#6B7266] truncate">
                              {msg.musicData.track.artist}
                            </p>
                            <p className="text-[11px] text-[#6B7266] mt-1 line-clamp-2">
                              {msg.musicData.track.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-[#E6E1D3] flex flex-wrap items-center justify-between gap-2">
                          <a
                            href={msg.musicData.track.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-[#2D5A36] hover:bg-[#23472A] text-white font-semibold text-xs px-3.5 py-1.5 rounded-[8px] shadow-xs cursor-pointer"
                          >
                            <span>▶ चलाएं ({msg.musicData.track.provider})</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <span className="text-[10px] text-[#6B7266] flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-[#2D5A36]" />
                            Copyright Compliant
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Integrated Feature Action Button */}
                    {!isUser && msg.appAction && (
                      <div className="mt-3 pt-2.5 border-t border-[#E6E1D3]">
                        <button
                          type="button"
                          onClick={() => handleActionClick(msg.appAction!.type)}
                          className="w-full sm:w-auto bg-[#2D5A36] hover:bg-[#23472A] text-white font-semibold text-xs px-3.5 py-2 rounded-[8px] flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                        >
                          <span>{msg.appAction.label}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    )}

                    {!isUser && (
                      <div className="flex items-center gap-2 pt-2.5 mt-2 border-t border-[#E6E1D3]">
                        <button
                          type="button"
                          onClick={() => speakText(msg.audioText || msg.text, msg.id)}
                          className={`text-xs px-2.5 py-1 rounded-[8px] border flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isPlayingThis
                              ? 'bg-[#2D5A36] text-white font-semibold border-[#2D5A36]'
                              : 'bg-[#FBFAF5] text-[#2D5A36] hover:bg-[#F4F0E6] border-[#D9D4C4]'
                          }`}
                          title="Listen with Indian Voice Synthesis"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{isPlayingThis ? 'Playing (रुकें)...' : 'Audio Voice'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="text-xs px-2.5 py-1 rounded-[8px] bg-[#FBFAF5] text-[#6B7266] hover:text-[#1E2B1F] hover:bg-[#F4F0E6] border border-[#D9D4C4] flex items-center gap-1 transition-colors cursor-pointer"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#2D5A36]" />
                              <span className="text-[#2D5A36]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Technical Tip */}
                  {!isUser && msg.actionableTip && (
                    <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[8px] p-2.5 text-xs text-[#D9922B] flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-[#D9922B] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#D9922B] block">खेती सलाह:</span>
                        <span className="text-[#2F3A2E]">{msg.actionableTip}</span>
                      </div>
                    </div>
                  )}

                  {/* Suggested Follow-up Chips */}
                  {!isUser && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(q)}
                          className="text-[11px] bg-[#FBFAF5] hover:bg-[#F4F0E6] border border-[#D9D4C4] text-[#2F3A2E] hover:text-[#2D5A36] px-2.5 py-1 rounded-[8px] transition-all text-left cursor-pointer flex items-center gap-1"
                        >
                          <span>{q}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-center text-[#6B7266] text-xs">
              <div className="w-8 h-8 rounded-[8px] bg-[#E3E8D8] text-[#2D5A36] flex items-center justify-center">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#FBFAF5] border border-[#E6E1D3] p-3 rounded-[14px] rounded-tl-[2px] flex items-center gap-2 shadow-[0_1px_3px_rgba(40,50,35,0.06)]">
                <span className="w-2 h-2 rounded-full bg-[#2D5A36] animate-pulse" />
                <span className="text-[#2F3A2E]">BhooSaathi सोच रहा है...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar & Voice Mic */}
        <div className="p-3 sm:p-4 bg-[#FBFAF5] border-t border-[#E6E1D3]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Voice Mic Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`w-11 h-11 rounded-[8px] flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                voiceState === 'LISTENING'
                  ? 'bg-[#C0392B] text-white'
                  : 'bg-[#FBFAF5] hover:bg-[#F4F0E6] text-[#2D5A36] border border-[#D9D4C4]'
              }`}
              title={
                voiceState === 'LISTENING'
                  ? 'Listening... Tap to Stop'
                  : `Tap to Speak in ${spokenDialectObj.nativeName}`
              }
            >
              {voiceState === 'LISTENING' ? (
                <MicOff className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 text-[#2D5A36]" />
              )}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                voiceState === 'LISTENING'
                  ? 'Listening in your dialect...'
                  : `${spokenDialectObj.nativeName} में कुछ भी कहिए (उदा. राम-राम, तू कैसा है)...`
              }
              className="flex-1 min-w-0 bg-[#FBFAF5] border border-[#D9D4C4] rounded-[8px] px-4 py-2.5 text-sm text-[#2F3A2E] placeholder-[#9A9D92] focus:outline-none focus:border-[#2D5A36]"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="w-11 h-11 rounded-[8px] bg-[#2D5A36] hover:bg-[#23472A] disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
              title="Send Message"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </form>

          {/* Quick Action Category Pills */}
          <div className="flex items-center justify-between text-xs text-[#6B7266] mt-2.5 px-1">
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
              <button
                type="button"
                onClick={() => handleSendMessage('तू कैसा है भाई?')}
                className="bg-[#FBFAF5] hover:bg-[#F4F0E6] border border-[#D9D4C4] text-[#2F3A2E] px-3 py-1.5 rounded-[8px] cursor-pointer transition-all whitespace-nowrap text-xs"
              >
                हाल-चाल
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('एक मजेदार जोक सुना दे')}
                className="bg-[#FBFAF5] hover:bg-[#F4F0E6] border border-[#D9D4C4] text-[#2F3A2E] px-3 py-1.5 rounded-[8px] cursor-pointer transition-all whitespace-nowrap text-xs"
              >
                चुटकुला
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('मेरी फसल की स्थिति कैसी है?')}
                className="bg-[#FBFAF5] hover:bg-[#F4F0E6] border border-[#D9D4C4] text-[#2F3A2E] px-3 py-1.5 rounded-[8px] cursor-pointer transition-all whitespace-nowrap text-xs"
              >
                फसल सलाह
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('आज का मौसम कैसा रहेगा?')}
                className="bg-[#FBFAF5] hover:bg-[#F4F0E6] border border-[#D9D4C4] text-[#2F3A2E] px-3 py-1.5 rounded-[8px] cursor-pointer transition-all whitespace-nowrap text-xs"
              >
                मौसम
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('मंडी में क्या भाव है?')}
                className="bg-[#FBFAF5] hover:bg-[#F4F0E6] border border-[#D9D4C4] text-[#2F3A2E] px-3 py-1.5 rounded-[8px] cursor-pointer transition-all whitespace-nowrap text-xs"
              >
                मंडी भाव
              </button>
            </div>

            <span className="flex items-center gap-1 text-[11px] text-[#2D5A36] font-semibold hidden sm:inline-flex whitespace-nowrap ml-2">
              <Check className="w-3.5 h-3.5" /> Conversation-First AI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
