import React, { useState, useRef, useEffect } from 'react';
import { 
  Sprout, 
  Store, 
  CloudSun, 
  Mic, 
  Eye, 
  EyeOff, 
  Facebook, 
  ArrowLeft, 
  Camera, 
  HelpCircle, 
  AlertTriangle, 
  Zap, 
  Clock, 
  Image as ImageIcon, 
  Bell, 
  User, 
  Home, 
  CheckCircle2, 
  ChevronUp, 
  PlayCircle, 
  Play, 
  Snail, 
  Download, 
  Calendar, 
  Settings, 
  BrainCircuit, 
  Leaf, 
  Search, 
  Star, 
  MapPin, 
  Droplets, 
  Wind, 
  ArrowRight, 
  ArrowUp, 
  ArrowDown, 
  Volume2, 
  VolumeX,
  ChevronDown, 
  ChevronRight, 
  ChevronLeft, 
  CloudFog, 
  Heart, 
  MessageCircle, 
  Share2, 
  Award, 
  Bot, 
  Send, 
  TrendingUp, 
  BarChart3, 
  TrendingDown, 
  X, 
  Plus, 
  Edit3, 
  Check, 
  CloudRain, 
  Sun, 
  Thermometer, 
  Gauge, 
  Eye as EyeIcon,
  Wheat,
  Scan,
  MoreVertical,
  Pencil,
  Volume1,
  Badge,
  Pause,
  Trash2,
  Delete,
  Sparkles,
  LogOut,
  Languages,
  Globe,
  Keyboard,
  StopCircle,
  Loader2
} from 'lucide-react';

/**
 * VACA: Voice-Assisted Crop Advisory
 * Updated: Integrated Gemini API for "Backend" logic & Web Speech API for TTS
 */

const apiKey = ""; // API Key injected by environment

// --- Helper: Call Gemini API ---
const callGeminiAPI = async (userPrompt, chatHistory = []) => {
  if (!apiKey) {
    // Fallback simulation if no API key is present (e.g. local without setup)
    return new Promise(resolve => {
       setTimeout(() => {
         resolve("I am VACA, your farming assistant. I can't connect to the AI brain right now (missing API Key), but I'm here to help!");
       }, 1500);
    });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
  // Construct context from history for continuity
  const historyContext = chatHistory.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
  })).slice(-6); // Keep last 6 messages for context

  const systemInstruction = "You are VACA (Voice-Assisted Crop Advisory), an expert agricultural AI assistant for farmers in Malaysia. You provide concise, practical advice on crops, weather, market prices, and pest control. Keep answers short (under 50 words) and friendly. Use metric units (kg, Celsius).";

  const payload = {
    contents: [
        ...historyContext,
        { role: "user", parts: [{ text: userPrompt }] }
    ],
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble connecting to the satellite. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Connection error. Please check your internet.";
  }
};

// --- Reusable Components for Auth Flow ---

const InputField = ({ label, type = "text", placeholder, isPassword = false }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mb-4">
      <label className="block text-green-900 text-sm font-bold mb-1 ml-1">{label}</label>
      <div className="relative">
        <input 
          type={isPassword && !showPassword ? "password" : "text"} 
          placeholder={placeholder}
          className="w-full bg-white border-2 border-green-800 rounded-xl py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-600 pr-12"
        />
        <button className="absolute right-3 top-3 text-gray-500 hover:text-green-700">
          <Mic size={20} />
        </button>
        
        {isPassword && (
          <button 
            className="absolute right-10 top-3 text-gray-500 hover:text-green-700"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

const AuthButton = ({ label, onClick, variant = 'primary', className = '' }) => {
  const baseStyle = "w-full font-bold py-3 rounded-xl shadow-md transition transform active:scale-95 flex items-center justify-center gap-2";
  const styles = {
    primary: "bg-green-900 text-white hover:bg-green-800",
    secondary: "bg-green-800 text-white hover:bg-green-700",
    google: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
    facebook: "bg-[#1877F2] text-white hover:bg-[#166fe5]"
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${styles[variant]} ${className}`}>
      {label}
    </button>
  );
};

// --- Reusable Gauge Component for Detail Page ---
const SensorGauge = ({ value, color, label, icon: Icon }) => (
    <div className="flex flex-col items-center">
        <div className="relative w-16 h-10 flex justify-center overflow-hidden">
            {/* Background Arc */}
            <div className="absolute top-0 w-14 h-14 rounded-full border-[6px] border-gray-100"></div>
            {/* Colored Arc */}
            <div 
                className={`absolute top-0 w-14 h-14 rounded-full border-[6px] ${color}`}
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)', transform: 'rotate(-45deg)' }} 
            ></div>
             <Icon size={16} className={`relative top-3 ${color.replace('border-', 'text-')}`} />
        </div>
        <span className="font-bold text-gray-800 text-sm -mt-2">{value}</span>
        <span className="text-[10px] text-gray-400 font-bold uppercase">{label}</span>
    </div>
);

// --- Simulated Mobile Keyboard Component ---
const MobileKeyboard = ({ onHide, onKeyPress, onDelete, onGo }) => (
    <div className="fixed bottom-0 left-0 right-0 h-[280px] bg-[#d1d5db] z-[60] flex flex-col animate-slideUp shadow-2xl">
        <div className="bg-[#f3f4f6] h-10 flex items-center justify-between px-4 border-b border-gray-300">
             <div className="text-gray-400 text-xs">Simulated Keyboard</div>
            <button onClick={onHide} className="text-[#007AFF] font-bold text-sm">Done</button>
        </div>
        <div className="flex-1 p-1.5 flex flex-col gap-2 pb-4 pt-2">
            {/* Row 1 */}
            <div className="flex gap-1.5 justify-center h-12">
                {['q','w','e','r','t','y','u','i','o','p'].map(k => (
                    <button key={k} onClick={() => onKeyPress(k)} className="flex-1 bg-white rounded-md shadow-sm flex items-center justify-center text-xl font-medium text-gray-900 active:bg-gray-200 active:scale-95 transition-transform">{k}</button>
                ))}
            </div>
            {/* Row 2 */}
            <div className="flex gap-1.5 justify-center h-12 px-4">
                {['a','s','d','f','g','h','j','k','l'].map(k => (
                    <button key={k} onClick={() => onKeyPress(k)} className="flex-1 bg-white rounded-md shadow-sm flex items-center justify-center text-xl font-medium text-gray-900 active:bg-gray-200 active:scale-95 transition-transform">{k}</button>
                ))}
            </div>
            {/* Row 3 */}
            <div className="flex gap-1.5 justify-center h-12 px-10">
                <button className="w-10 bg-[#acb3bf] rounded-md shadow-sm flex items-center justify-center active:bg-white active:scale-95 transition-transform"><ArrowUp size={18}/></button>
                {['z','x','c','v','b','n','m'].map(k => (
                    <button key={k} onClick={() => onKeyPress(k)} className="flex-1 bg-white rounded-md shadow-sm flex items-center justify-center text-xl font-medium text-gray-900 active:bg-gray-200 active:scale-95 transition-transform">{k}</button>
                ))}
                <button onClick={onDelete} className="w-10 bg-[#acb3bf] rounded-md shadow-sm flex items-center justify-center active:bg-white active:scale-95 transition-transform"><Delete size={18}/></button>
            </div>
            {/* Row 4 */}
            <div className="flex gap-1.5 justify-center h-12 px-1 mt-1">
                <button onClick={() => onKeyPress(' ')} className="w-20 bg-[#acb3bf] rounded-md shadow-sm flex items-center justify-center text-xs font-bold text-gray-700 active:bg-white">123</button>
                <button onClick={() => onKeyPress(' ')} className="flex-1 bg-white rounded-md shadow-sm active:bg-gray-200 flex items-center justify-center text-gray-400 text-sm">Space</button>
                <button onClick={onGo} className="w-20 bg-[#007AFF] rounded-md shadow-sm flex items-center justify-center text-white font-bold text-sm active:bg-blue-600 active:scale-95 transition-transform">Go</button>
            </div>
        </div>
    </div>
);


// --- Main Application Component ---

const VACA_App = () => {
  const [currentView, setCurrentView] = useState('landing');
  const [activeTab, setActiveTab] = useState('home');
  const [selectedFieldData, setSelectedFieldData] = useState(null);

  const navigateTab = (tabName) => {
      setActiveTab(tabName);
      setCurrentView(tabName);
  };

  const handleFieldClick = (field) => {
      setSelectedFieldData(field);
      setCurrentView('field-detail');
  };

  // --- Landing Page ---
  const LandingPage = () => (
    <div className="relative h-screen w-full flex flex-col justify-end pb-10 overflow-hidden bg-black">
      <img 
        src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000&auto=format&fit=crop" 
        alt="Wheat Field" 
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      
      <div className="relative z-10 px-6 flex flex-col items-center text-center">
        <div className="mb-6 flex flex-col items-center">
          <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm border-2 border-white/30 mb-4">
             <Sprout size={64} className="text-green-400" />
          </div>
          <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
            VOICE-<br/>ASSISTED<br/>
            <span className="text-yellow-400">CROP ADVISORY</span>
          </h1>
          <p className="text-gray-300 mt-2 text-sm font-medium">Powered by Smart Sensors & AI Analytics</p>
        </div>

        <button 
          onClick={() => { setCurrentView('signup'); }}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-green-900 font-bold text-xl py-4 rounded-2xl shadow-lg transition transform hover:scale-105 active:scale-95"
        >
          Get Started
        </button>
      </div>
    </div>
  );

  // --- Auth Layout Wrapper ---
  const AuthLayout = ({ title, subtitle, children }) => (
    <div className="min-h-screen bg-[#FFF8E7] flex flex-col px-6 pt-12 pb-6">
      <div className="flex flex-col items-center mb-6">
         <div className="relative w-48 h-32 mb-4">
            <CloudSun className="absolute top-0 right-10 text-yellow-500" size={40} />
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex items-end">
                <Store size={80} className="text-green-800 relative z-10" />
                <Sprout size={40} className="text-green-600 -ml-4" />
                <Sprout size={50} className="text-green-700 -ml-8" />
            </div>
            <div className="absolute bottom-1 left-0 right-0 h-2 bg-green-800/20 rounded-full"></div>
         </div>
         <h2 className="text-3xl font-bold text-green-900">{title}</h2>
         <p className="text-green-800/60 font-medium text-sm mt-1">{subtitle}</p>
      </div>
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );

  // --- Auth Screens ---
  const SignUpScreen = () => (
    <AuthLayout title="Get Started" subtitle="Enter your details below">
        <InputField label="Name" placeholder="Full Name" />
        <InputField label="Email" placeholder="yourname@email.com" />
        <InputField label="Password" type="password" placeholder="••••••••" isPassword />
        <InputField label="Confirm Password" type="password" placeholder="••••••••" isPassword />
        <div className="flex items-center gap-2 mb-6">
            <input type="checkbox" className="w-4 h-4 text-green-600 rounded focus:ring-green-500 border-gray-300" />
            <span className="text-xs text-green-900 font-medium">I agree to Term of Service and Privacy Policy</span>
        </div>
        <AuthButton label="Create Account" onClick={() => { setActiveTab('home'); setCurrentView('home'); }} variant="primary" className="mb-4" />
        <div className="text-center text-sm font-medium text-green-900 mb-6">
            Already have an account? <button onClick={() => setCurrentView('login')} className="font-bold underline">Click here</button>
        </div>
        <div className="space-y-3 mt-auto">
             <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 py-3 rounded-xl shadow-sm text-gray-700 font-bold text-sm">
                <div className="w-5 h-5 rounded-full bg-conic-gradient flex items-center justify-center font-bold text-blue-500">G</div>
                Sign Up with Google
             </button>
             <button className="w-full flex items-center justify-center gap-3 bg-[#1877F2] py-3 rounded-xl shadow-sm text-white font-bold text-sm">
                <Facebook size={18} fill="white" />
                Sign Up with Facebook
             </button>
        </div>
    </AuthLayout>
  );

  const LoginScreen = () => (
    <AuthLayout title="Welcome Back" subtitle="Enter your details below">
        <div className="mt-4">
            <InputField label="Email" placeholder="yourname@email.com" />
            <InputField label="Password" type="password" placeholder="••••••••" isPassword />
        </div>
        <div className="flex items-center gap-2 mb-8 mt-2">
            <input type="checkbox" className="w-4 h-4 text-green-600 rounded focus:ring-green-500 border-gray-300" />
            <span className="text-xs text-green-900 font-medium">Remember Me</span>
        </div>
        <AuthButton label="Login" onClick={() => { setActiveTab('home'); setCurrentView('home'); }} variant="primary" className="mb-4" />
        <AuthButton label="Forgot Password?" onClick={() => setCurrentView('forgot-password')} variant="secondary" className="mb-4 bg-green-800" />
        <div className="text-center text-sm font-medium text-green-900 mb-8">
            Don't have an account yet? Sign up <button onClick={() => setCurrentView('signup')} className="font-bold underline">here</button>
        </div>
        <div className="space-y-3 mt-auto">
             <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 py-3 rounded-xl shadow-sm text-gray-700 font-bold text-sm">
                <div className="w-5 h-5 rounded-full bg-conic-gradient flex items-center justify-center font-bold text-blue-500">G</div>
                Login with Google
             </button>
             <button className="w-full flex items-center justify-center gap-3 bg-[#1877F2] py-3 rounded-xl shadow-sm text-white font-bold text-sm">
                <Facebook size={18} fill="white" />
                Login with Facebook
             </button>
        </div>
    </AuthLayout>
  );

  const ForgotPasswordScreen = () => (
    <div className="min-h-screen bg-[#FFF8E7] flex flex-col px-6 pt-12 pb-6">
        <div className="flex items-center mb-6">
            <button onClick={() => setCurrentView('login')} className="text-green-900">
                <ArrowLeft size={24} />
            </button>
        </div>
        <div className="flex flex-col items-center mb-8 mt-4">
             <div className="relative w-48 h-32 mb-4 flex items-end justify-center">
                <Store size={100} className="text-green-900" />
                <div className="absolute top-2 right-4"><CloudSun size={32} className="text-gray-400" /></div>
             </div>
             <h2 className="text-2xl font-bold text-green-900 text-center">Forgot Password?</h2>
             <p className="text-green-800/70 font-medium text-sm mt-3 text-center px-4 leading-relaxed">
                Don't worry! It normally happens. Please enter the email address associated with your account.
             </p>
        </div>
        <InputField label="Email" placeholder="yourname@email.com" />
        <div className="mt-8 space-y-4">
            <AuthButton label="Send Code" onClick={() => alert("Code sent!")} variant="primary" />
            <AuthButton label="Back to Login" onClick={() => setCurrentView('login')} variant="secondary" />
        </div>
    </div>
  );

  // --- Bottom Navigation ---

  const BottomNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 flex justify-between items-end pb-6 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-50">
        <button onClick={() => navigateTab('home')} className={`flex-1 flex flex-col items-center gap-1 pb-2 ${activeTab === 'home' ? 'text-green-800' : 'text-gray-400'}`}>
            <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Home</span>
        </button>
        <button onClick={() => navigateTab('calendar')} className={`flex-1 flex flex-col items-center gap-1 pb-2 ${activeTab === 'calendar' ? 'text-green-800' : 'text-gray-400'}`}>
            <Calendar size={24} strokeWidth={activeTab === 'calendar' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Calendar</span>
        </button>
        <div className="relative -top-6 flex-1 flex justify-center">
            <button onClick={() => navigateTab('ai-advisory')} className={`w-16 h-16 rounded-full flex flex-col items-center justify-center border-4 border-white shadow-xl transition-transform active:scale-95 ${activeTab === 'ai-advisory' ? 'bg-[#1B4D3E] text-white' : 'bg-green-700 text-white'}`}>
                <BrainCircuit size={28} />
            </button>
        </div>
        <button onClick={() => navigateTab('field')} className={`flex-1 flex flex-col items-center gap-1 pb-2 ${activeTab === 'field' ? 'text-green-800' : 'text-gray-400'}`}>
            <Leaf size={24} strokeWidth={activeTab === 'field' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Field</span>
        </button>
        <button onClick={() => navigateTab('profile')} className={`flex-1 flex flex-col items-center gap-1 pb-2 ${activeTab === 'profile' ? 'text-green-800' : 'text-gray-400'}`}>
            <Settings size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Profile</span>
        </button>
    </div>
  );

  // --- Screens ---

  // 1. Home Screen
  const HomeScreen = () => (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col animate-fadeIn pb-32 font-sans">
      {/* Header */}
      <div className="bg-[#FDFBF7] p-4 flex justify-between items-center pt-8">
        <button onClick={() => setCurrentView('landing')} className="flex items-center text-gray-800 font-bold text-sm hover:text-green-700 transition">
            <ChevronLeft size={20}/> Back
        </button>
        <div className="flex items-center gap-2">
           <h1 className="text-3xl font-black text-green-900 tracking-wider drop-shadow-sm">VACA</h1>
           <div className="bg-green-100 p-2 rounded-full"><Mic size={20} className="text-green-700"/></div>
        </div>
        <button className="flex items-center text-green-800 font-bold text-sm gap-1">Help <ChevronRight size={16}/></button>
      </div>

      <div className="px-4 space-y-5">
        {/* Search */}
        <div className="relative">
            <input type="text" placeholder="Search" className="w-full bg-white rounded-full py-4 px-6 pr-12 shadow-sm border border-green-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
            <Mic className="absolute right-5 top-4 text-green-700" size={20} />
        </div>

        {/* Notification Alert */}
        <div 
            onClick={() => setCurrentView('tasks-management')}
            className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-4 shadow-sm relative overflow-hidden cursor-pointer transition active:scale-98"
        >
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200/20 rounded-full -mr-10 -mt-10 blur-xl"></div>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-orange-700 text-xs font-bold uppercase mb-1 tracking-wide">Notifications</h3>
                    <h2 className="text-gray-900 font-bold text-lg">Harvest</h2>
                </div>
                <div className="bg-orange-100 p-1.5 rounded-full text-orange-600">
                    <ChevronRight size={18} />
                </div>
            </div>
            <div className="flex items-center gap-2 mt-3 text-orange-900 font-bold bg-white/60 p-2 rounded-lg w-fit shadow-sm">
                <Star size={18} className="text-orange-500 fill-orange-500" />
                <span className="text-sm">Carrot field Harvesting in 3 days</span>
            </div>
        </div>

        {/* Weather Widget */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-800 rounded-[30px] p-6 text-white shadow-lg shadow-green-900/10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400/20 rounded-full -ml-8 -mb-8 blur-xl"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex flex-col">
                    <div className="flex items-center gap-1 font-bold text-lg">
                        <MapPin size={18} className="text-yellow-300" /> Subang jaya
                    </div>
                    <span className="text-xs font-medium opacity-80 ml-5">1/11/2025</span>
                </div>
            </div>
            
            <div className="flex justify-between items-center text-center relative z-10">
                <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-bold">30%</span>
                    <Droplets size={24} className="text-blue-200 fill-blue-200" />
                    <span className="text-[10px] font-medium opacity-90">Humidity</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-bold"><ArrowRight size={14}/></span>
                    <Wind size={24} className="text-white" />
                    <span className="text-[10px] font-medium opacity-90">Wind</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-bold">27°</span>
                    <CloudSun size={28} className="text-yellow-300" />
                    <span className="text-[10px] font-medium opacity-90">Temp</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-bold">0.8 km</span>
                    <CloudFog size={24} className="text-white" />
                    <span className="text-[10px] font-medium opacity-90">Fog</span>
                </div>
            </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-2 gap-4">
            
            {/* Left: Community Feed */}
            <div 
                onClick={() => setCurrentView('community')}
                className="bg-green-50/80 border border-green-100 rounded-2xl p-3 flex flex-col shadow-sm h-full relative cursor-pointer hover:bg-green-100/80 transition active:scale-98"
            >
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-sm text-green-900">Community Feed</h3>
                    <div className="bg-green-600 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">+Post</div>
                </div>
                
                <div className="space-y-2 flex-1">
                    <div className="bg-white rounded-xl p-2 shadow-sm border border-green-100">
                        <div className="flex gap-2">
                            <div className="w-8 h-8 bg-green-200 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-green-800">M</div>
                            <div className="overflow-hidden min-w-0">
                                <p className="font-bold text-[10px] truncate text-gray-800">Mohamad</p>
                                <p className="text-[8px] text-gray-500 truncate">Dsofbm lkjgosfk...</p>
                            </div>
                            <Volume2 size={14} className="ml-auto text-green-600 shrink-0" />
                        </div>
                        <div className="mt-2 h-1.5 bg-gray-100 rounded-full w-full">
                            <div className="h-full bg-green-500 w-1/3 rounded-full"></div>
                        </div>
                    </div>
                </div>
                <div className="text-[10px] font-bold text-center mt-3 text-green-700 hover:underline">See More Post {'>'}{'>'}</div>
            </div>

            {/* Right: Market Price */}
            <div 
                className="bg-yellow-50/80 border border-yellow-100 rounded-2xl p-3 flex flex-col shadow-sm h-full cursor-pointer transition hover:shadow-md hover:bg-yellow-100/50"
                onClick={() => setCurrentView('market-prices')}
            >
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-sm text-yellow-900">Market Price</h3>
                    <div className="bg-white px-1.5 py-0.5 rounded text-[8px] font-bold flex items-center shadow-sm text-gray-600 border border-yellow-100">
                        SELANGOR <ChevronDown size={8} className="ml-0.5" />
                    </div>
                </div>
                <div className="space-y-2.5 text-[10px] font-medium flex-1 px-1 text-gray-700">
                    <div className="flex justify-between items-center border-b border-yellow-200/50 pb-1">
                        <span>Paddy</span> <span className="text-gray-500">RM 2.4</span> <span className="text-green-700 flex items-center text-[9px] bg-green-100 px-1 rounded"><ArrowUp size={8}/> 3%</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-yellow-200/50 pb-1">
                        <span>Chili</span> <span className="text-gray-500">RM 1.4</span> <span className="text-green-700 flex items-center text-[9px] bg-green-100 px-1 rounded"><ArrowUp size={8}/> 2%</span>
                    </div>
                </div>
                 <button className="text-[10px] font-bold text-center mt-3 text-yellow-800 hover:underline">View All Prices {'>'}{'>'}</button>
            </div>
        </div>

        {/* Large AI Button */}
        <button 
            onClick={() => { setActiveTab('ai-advisory'); setCurrentView('voice-advisory'); }}
            className="w-full bg-[#FFC107] hover:bg-[#FFB300] text-green-900 font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-yellow-500/20 transition-all active:scale-95 border border-yellow-400 mt-2"
        >
            <Mic size={28} className="text-green-900" strokeWidth={2.5} />
            <span className="text-xl tracking-tight">Ask Your Ai Advisory</span>
        </button>

      </div>
      <BottomNavigation />
    </div>
  );

  // --- Task Management Screen ---
  const TaskManagementScreen = () => {
      const [tasks, setTasks] = useState([
          { id: 1, title: 'Inspect Irrigation System', date: 'Today', time: '7:00 AM', priority: 'High', color: 'red' },
          { id: 2, title: 'Apply Organic Fertilizer to Corn Field', date: 'Tomorrow', time: '10:00 AM', priority: 'Medium', color: 'orange' },
          { id: 3, title: 'Check Weather for Upcoming Harvest', date: 'Oct 28, 2024', time: '8:00 AM', priority: 'Low', color: 'green' },
      ]);

      const getPriorityColor = (priority) => {
          switch(priority) {
              case 'High': return 'bg-red-400 text-white';
              case 'Medium': return 'bg-[#FBBF24] text-white';
              case 'Low': return 'bg-[#4ADE80] text-white';
              default: return 'bg-gray-400 text-white';
          }
      };

      return (
        <div className="min-h-screen bg-white flex flex-col animate-fadeIn relative font-sans">
             {/* Header */}
            <div className="bg-white px-6 pt-10 pb-4 flex items-center gap-4 sticky top-0 z-30">
                <button onClick={() => setCurrentView('home')} className="flex items-center text-black font-bold text-sm hover:text-green-700 transition">
                    <ChevronLeft size={24}/>
                </button>
                <h1 className="text-2xl font-black text-black tracking-tight">Farm Tasks & Reminders</h1>
            </div>

            {/* Task List */}
            <div className="flex-1 px-5 space-y-4 overflow-y-auto pb-32">
                {tasks.map(task => (
                    <div key={task.id} className="bg-gray-100 rounded-[20px] p-5 relative">
                        {/* Priority Badge */}
                        <div className={`absolute top-5 right-5 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                        </div>

                        <div className="pr-16">
                            <h3 className="font-bold text-black text-lg leading-tight mb-2">{task.title}</h3>
                            <div className="text-gray-600 text-sm font-medium flex items-center gap-2 mb-4">
                                <span>{task.date}</span>
                                <span className="w-px h-3 bg-gray-400"></span>
                                <span>{task.time}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-6 mt-2">
                            {task.priority !== 'Low' && (
                                <button className="flex items-center gap-1.5 text-black font-bold text-sm hover:opacity-70 transition">
                                    <Pencil size={18} /> Edit
                                </button>
                            )}
                             <button className="flex items-center gap-1.5 text-red-400 font-bold text-sm hover:opacity-70 transition">
                                {task.priority === 'Low' && <Pencil size={18} className="text-black" />} 
                                {task.priority === 'Low' ? <span className="text-black ml-0">Edit</span> : null}
                                
                                {task.priority === 'Low' ? 
                                    <span className="text-red-400 ml-4">Delete</span> : 
                                    <span>Delete</span>
                                }
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sticky Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white z-20">
                <button className="w-full bg-[#2E5C31] text-white font-bold text-lg py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition">
                    Add New Task
                    <Sparkles size={20} className="text-green-200" />
                </button>
            </div>
        </div>
      );
  };

  // 2. Community Screen
  const CommunityScreen = () => {
      // Post Data State
      const [posts, setPosts] = useState([
          {
              id: 1,
              author: "Uncle Wan",
              role: "Top Contributor",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
              time: "2 hrs ago",
              image: "https://images.unsplash.com/photo-1591857177580-dc82b9e4e119?w=600&q=80",
              content: null,
              hasAudio: true,
              aiDetection: "AI Detected: Early Blight (92% Confidence)",
              comments: []
          },
          {
              id: 2,
              author: "Auntie May",
              role: "Expert",
              avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80",
              time: "5 hrs ago",
              content: "I used copper fungicide, and it worked well!",
              translation: "Translated by VACA AI",
              hasAudio: false,
              comments: []
          }
      ]);

      const [inputText, setInputText] = useState("");
      const [isRecording, setIsRecording] = useState(false);
      const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
      const [replyingTo, setReplyingTo] = useState(null); 

      // Handle sending text message (New Post OR Comment)
      const handleSendText = () => {
          if (!inputText.trim()) return;

          if (replyingTo) {
              // Add as comment
              const updatedPosts = posts.map(post => {
                  if (post.id === replyingTo) {
                      return {
                          ...post,
                          comments: [...post.comments, {
                              id: Date.now(),
                              author: "You",
                              content: inputText,
                              hasAudio: false
                          }]
                      };
                  }
                  return post;
              });
              setPosts(updatedPosts);
              setReplyingTo(null);
          } else {
              // Add as new post
              const newPost = {
                  id: Date.now(),
                  author: "You",
                  role: "Member",
                  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80",
                  time: "Just now",
                  content: inputText,
                  hasAudio: false,
                  comments: []
              };
              setPosts([newPost, ...posts]);
          }
          setInputText("");
          setIsKeyboardVisible(false); 
      };

      // Handle Confirm Voice (New Post OR Comment)
      const handleConfirmVoice = () => {
          if (replyingTo) {
               // Add voice comment
               const updatedPosts = posts.map(post => {
                  if (post.id === replyingTo) {
                      return {
                          ...post,
                          comments: [...post.comments, {
                              id: Date.now(),
                              author: "You",
                              hasAudio: true,
                              audioDuration: "0:12"
                          }]
                      };
                  }
                  return post;
              });
              setPosts(updatedPosts);
              setReplyingTo(null);
          } else {
              // Add voice post
              const newVoicePost = {
                  id: Date.now(),
                  author: "You",
                  role: "Member",
                  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80",
                  time: "Just now",
                  hasAudio: true,
                  audioDuration: "0:12",
                  comments: []
              };
              setPosts([newVoicePost, ...posts]);
          }
          setIsRecording(false);
      };

      // Start Reply Mode
      const handleReplyClick = (postId) => {
          setReplyingTo(postId);
      };

      // Cancel Reply Mode
      const cancelReply = () => {
          setReplyingTo(null);
          setInputText("");
      };

      const handleVoiceButton = () => setIsRecording(true);
      const handleCancelVoice = () => setIsRecording(false);

      const getReplyingToName = () => {
          const post = posts.find(p => p.id === replyingTo);
          return post ? post.author : "User";
      };

      return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col animate-fadeIn pb-40 relative">
        {/* Header */}
        <div className="bg-[#2D5A27] text-white p-6 pt-10 flex justify-between items-center shadow-md sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => navigateTab('home')} 
                    className="bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-sm transition active:scale-95"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold tracking-wide">Community</h1>
            </div>
            <div className="flex gap-3">
                 <button className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition"><Search size={20}/></button>
                 <button className="relative bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#2D5A27]"></span>
                 </button>
            </div>
        </div>

        <div className="px-4 py-6 space-y-6 overflow-y-auto">
            {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 animate-fadeIn">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-100">
                                <img src={post.avatar} alt={post.author} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-gray-900">{post.author}</h3>
                                    <span className="bg-[#FEF9C3] text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-yellow-200">
                                        {post.role === "Top Contributor" && <Award size={10} />} {post.role}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400">{post.time}</p>
                            </div>
                        </div>
                    </div>

                    {post.image && (
                        <div className="relative rounded-2xl overflow-hidden mb-4 shadow-sm">
                            <img src={post.image} alt="Post Content" className="w-full h-56 object-cover" />
                            {post.aiDetection && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-3 flex items-center gap-2 text-white">
                                    <Bot size={20} className="text-green-400" />
                                    <span className="text-xs font-bold">{post.aiDetection}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {post.content && (
                        <p className="text-gray-800 text-lg font-medium leading-relaxed mb-4">
                            {post.content}
                        </p>
                    )}

                    {post.hasAudio && (
                        <div className="bg-[#EAB308] rounded-full p-3 flex items-center gap-3 mb-4 shadow-sm">
                            <button className="bg-white rounded-full p-1.5 shadow-sm text-yellow-600 active:scale-90 transition">
                                <Play size={20} fill="currentColor" />
                            </button>
                            <div className="flex-1 flex items-center justify-center gap-1 h-6">
                                {[...Array(20)].map((_, i) => (
                                    <div key={i} className="w-1 bg-white/50 rounded-full" style={{height: Math.random() * 16 + 8 + 'px'}}></div>
                                ))}
                            </div>
                            {post.audioDuration && <span className="text-[10px] font-bold text-white/90 mr-2">{post.audioDuration}</span>}
                        </div>
                    )}

                    {post.translation && <p className="text-[10px] text-gray-400 mb-2">{post.translation}</p>}

                    <div className="flex justify-between items-center text-gray-500 border-t border-gray-100 pt-3">
                        <div className="flex gap-6">
                            <button className="flex items-center gap-1 hover:text-red-500 transition"><Heart size={20} /></button>
                            <button 
                                onClick={() => handleReplyClick(post.id)}
                                className={`flex items-center gap-1 transition ${replyingTo === post.id ? 'text-blue-600' : 'hover:text-blue-500'}`}
                            >
                                <MessageCircle size={20} />
                            </button>
                            <button className="flex items-center gap-1 hover:text-green-500 transition"><Share2 size={20} /></button>
                        </div>
                    </div>

                    {post.comments && post.comments.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-50 space-y-3">
                            {post.comments.map(comment => (
                                <div key={comment.id} className="flex gap-2 items-start bg-gray-50 p-2 rounded-xl">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0">Y</div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-gray-900">You</p>
                                        {comment.content && <p className="text-xs text-gray-700">{comment.content}</p>}
                                        {comment.hasAudio && (
                                            <div className="flex items-center gap-2 mt-1 bg-white p-1.5 rounded-lg border border-gray-200 w-fit">
                                                <div className="bg-[#2D5A27] rounded-full p-1 text-white"><Play size={10} fill="currentColor"/></div>
                                                <div className="h-3 w-16 bg-gray-200 rounded-full"></div>
                                                <span className="text-[9px] text-gray-500">{comment.audioDuration}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>

        {isRecording && (
            <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-6 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white w-full max-w-sm rounded-[30px] p-8 relative flex flex-col items-center shadow-2xl">
                    <div className="w-24 h-24 bg-[#EAB308] rounded-full flex items-center justify-center mb-6 text-[#422006] shadow-lg animate-pulse">
                        <Mic size={40} />
                    </div>
                    <h3 className="text-xl font-black text-[#1B4D3E] mb-2 tracking-tight">Recording...</h3>
                    <div className="flex items-center justify-center gap-1.5 h-12 mb-8 w-full">
                         {[...Array(8)].map((_, i) => (
                             <div key={i} className="w-2 bg-[#2D5A27] rounded-full animate-pulse" 
                                  style={{
                                      height: '100%', 
                                      animationDuration: `${0.4 + Math.random() * 0.5}s`,
                                      animationName: 'wave'
                                  }}
                             ></div>
                         ))}
                    </div>
                    <div className="flex gap-4 w-full">
                        <button 
                            onClick={handleCancelVoice} 
                            className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-200 transition active:scale-95"
                        >
                            <Trash2 size={20} /> Cancel
                        </button>
                        <button 
                            onClick={handleConfirmVoice} 
                            className="flex-1 py-3 bg-[#2D5A27] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#244820] transition active:scale-95"
                        >
                            <Send size={20} /> Send
                        </button>
                    </div>
                </div>
            </div>
        )}

        {isKeyboardVisible && <MobileKeyboard onHide={() => setIsKeyboardVisible(false)} />}

        <div 
            className={`fixed left-0 right-0 px-4 z-50 transition-all duration-300 ease-out bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7] to-transparent pt-4 pb-2 ${isKeyboardVisible ? 'bottom-[280px]' : 'bottom-[80px]'}`}
        >
            {replyingTo && (
                <div className="flex justify-between items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-t-xl text-xs font-bold border border-blue-100 border-b-0 mx-2 shadow-sm">
                    <span>Replying to {getReplyingToName()}...</span>
                    <button onClick={cancelReply} className="hover:bg-blue-100 p-1 rounded-full"><X size={14}/></button>
                </div>
            )}

            <div className={`flex items-center gap-3 ${replyingTo ? 'bg-white p-2 rounded-b-xl rounded-t-none border-t-0 shadow-lg mx-2 border border-gray-200' : ''}`}>
                <div className="flex-1 relative">
                    <input 
                        type="text" 
                        value={inputText}
                        onFocus={() => setIsKeyboardVisible(true)}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                        placeholder={replyingTo ? "Write a reply..." : "Write a comment or Leave a Voice..."} 
                        className="w-full bg-gray-100 rounded-full py-3.5 pl-6 pr-4 text-sm text-gray-600 border border-gray-200 focus:outline-none focus:border-green-500 shadow-sm"
                    />
                </div>
                <button 
                    onClick={handleVoiceButton}
                    className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-green-700 shadow-sm hover:bg-green-100 transition active:scale-95 shrink-0"
                >
                    <Mic size={24} />
                </button>
                <button 
                    onClick={() => setCurrentView('photo-advisory')}
                    className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-green-700 shadow-sm hover:bg-green-100 transition active:scale-95 shrink-0"
                >
                    <Camera size={24} />
                </button>
                <button 
                    onClick={handleSendText}
                    className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white shadow-md hover:bg-green-700 transition active:scale-95 shrink-0"
                >
                    <Send size={20} className="ml-0.5" />
                </button>
            </div>
        </div>
        
        {!isKeyboardVisible && <BottomNavigation />}
      </div>
      );
  };

  // 3. Market Price Screen
  const MarketPriceScreen = () => {
      const [marketTab, setMarketTab] = useState('sell');

      return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col animate-fadeIn pb-24">
            <div className="bg-[#1B4D3E] text-white p-6 pt-10 sticky top-0 z-50 shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigateTab('home')} className="hover:bg-white/20 p-2 rounded-full transition"><ArrowLeft size={24}/></button>
                        <h1 className="text-xl font-bold">Market Prices</h1>
                    </div>
                    <div className="flex items-center gap-1 text-xs bg-white/20 px-3 py-1.5 rounded-full">
                        <MapPin size={12} />
                        Selangor
                    </div>
                </div>

                <div className="bg-white/10 p-1 rounded-xl flex gap-1">
                    <button 
                        onClick={() => setMarketTab('sell')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${marketTab === 'sell' ? 'bg-[#4ADE80] text-[#064E3B] shadow-sm' : 'text-white hover:bg-white/10'}`}
                    >
                        Sell
                    </button>
                    <button 
                        onClick={() => setMarketTab('buy')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${marketTab === 'buy' ? 'bg-[#4ADE80] text-[#064E3B] shadow-sm' : 'text-white hover:bg-white/10'}`}
                    >
                        Buy
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-6">
                <div className="bg-[#FFF8E1] rounded-2xl p-5 shadow-sm border border-yellow-200">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="bg-yellow-100 p-2 rounded-lg text-yellow-700">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-sm">AI Market Forecast: Tomato</h3>
                            <p className="text-xs text-gray-600 leading-relaxed mt-1">
                                Price predicted to rise by <span className="text-green-600 font-bold">15%</span> next week due to high demand.
                            </p>
                        </div>
                    </div>
                    
                    <div className="relative h-32 w-full mt-2">
                        <div className="absolute inset-0 flex flex-col justify-between text-[8px] text-gray-400">
                            <div className="border-b border-dashed border-gray-200 w-full h-0"></div>
                            <div className="border-b border-dashed border-gray-200 w-full h-0"></div>
                            <div className="border-b border-dashed border-gray-200 w-full h-0"></div>
                            <div className="border-b border-gray-300 w-full h-0"></div>
                        </div>
                        
                        <svg viewBox="0 0 300 100" className="absolute inset-0 w-full h-full overflow-visible">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#EAB308" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path d="M0,80 Q30,75 60,60 T120,50 T180,45" fill="none" stroke="#CA8A04" strokeWidth="3" strokeLinecap="round" />
                            <path d="M0,80 Q30,75 60,60 T120,50 T180,45 V100 H0 Z" fill="url(#chartGradient)" stroke="none" />
                            <path d="M180,45 Q240,20 300,10" fill="none" stroke="#CA8A04" strokeWidth="3" strokeDasharray="5,5" strokeLinecap="round" />
                            <circle cx="180" cy="45" r="4" fill="#FFFFFF" stroke="#CA8A04" strokeWidth="2" />
                            <circle cx="300" cy="10" r="4" fill="#16A34A" stroke="#FFFFFF" strokeWidth="2" />
                        </svg>

                        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] text-gray-500 pt-2 font-medium">
                            <span>2 Weeks Ago</span>
                            <span className="text-yellow-700 font-bold">Today</span>
                            <span className="text-green-700 font-bold">Next Week</span>
                        </div>
                        
                        <div className="absolute top-0 right-0 bg-green-600 text-white text-[9px] px-2 py-1 rounded-full shadow-sm">
                            Target: RM 3.20
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-4">Market List</h3>
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition hover:shadow-md">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                                <img src="https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=200&q=80" alt="Chili" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-base">Red Chili</h4>
                                <div className="flex items-end gap-1 mt-1">
                                    <span className="text-xl font-black text-gray-800">RM 12.50</span>
                                    <span className="text-xs text-gray-400 mb-1 font-medium">/kg</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex justify-end mb-1">
                                    <div className="bg-green-100 p-1 rounded-full">
                                        <TrendingUp className="text-green-600" size={16} />
                                    </div>
                                </div>
                                <span className="text-green-600 font-bold text-sm">+5%</span>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition hover:shadow-md">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                                <img src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&q=80" alt="Tomato" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-base">Tomato</h4>
                                <div className="flex items-end gap-1 mt-1">
                                    <span className="text-xl font-black text-gray-800">RM 2.80</span>
                                    <span className="text-xs text-gray-400 mb-1 font-medium">/kg</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex justify-end mb-1">
                                    <div className="bg-gray-100 p-1 rounded-full">
                                        <TrendingUp className="text-gray-400" size={16} />
                                    </div>
                                </div>
                                <span className="text-gray-400 font-bold text-sm">Stable</span>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition hover:shadow-md">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                                <img src="https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=200&q=80" alt="Corn" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-base">Sweet Corn</h4>
                                <div className="flex items-end gap-1 mt-1">
                                    <span className="text-xl font-black text-gray-800">RM 1.50</span>
                                    <span className="text-xs text-gray-400 mb-1 font-medium">/kg</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex justify-end mb-1">
                                    <div className="bg-red-100 p-1 rounded-full">
                                        <TrendingDown className="text-red-500" size={16} />
                                    </div>
                                </div>
                                <span className="text-red-500 font-bold text-sm">-3%</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <button className="fixed bottom-24 right-6 bg-[#EAB308] text-[#422006] font-bold px-6 py-3 rounded-full shadow-xl flex items-center gap-2 active:scale-95 transition-transform border border-yellow-400/50 hover:bg-yellow-400 z-40">
                <Mic size={20} />
                Check Price
            </button>

            <BottomNavigation />
        </div>
      );
  };

  // --- UPDATED: Calendar Screen with Unified "Smart Farm Dashboard" Widget ---
  const CalendarScreen = () => {
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Water Tomatoes', done: false },
        { id: 2, title: 'Plant Corn Seeds', done: false },
        { id: 3, title: 'Harvest Rice', done: true }
    ]);
    const [showAddTask, setShowAddTask] = useState(false);
    const [addMode, setAddMode] = useState('menu'); 
    const [showWeatherDetail, setShowWeatherDetail] = useState(false); // Modal State
    const [calendarExpanded, setCalendarExpanded] = useState(false); // Expanded Calendar State
    
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [priority, setPriority] = useState('Medium');

    const handleAddTask = () => {
        setTasks([...tasks, { id: Date.now(), title: newTaskTitle || 'New Task', done: false }]);
        setAddMode('success');
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col animate-fadeIn pb-24 relative">
            <div className="bg-[#FDFBF7] p-6 pt-10 sticky top-0 z-30 flex justify-between items-center">
                <h1 className="text-2xl font-black text-[#1B4D3E] tracking-tight">Crop Calendar</h1>
                <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100">
                    <Bell size={20} className="text-green-700" />
                </div>
            </div>

            <div className="p-4 space-y-6">
                
                <div className="bg-[#FFF8E7] rounded-[30px] p-5 shadow-xl text-[#1B4D3E] relative overflow-hidden border border-orange-100">
                    
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start justify-between mb-6 relative z-10 shadow-sm">
                        <div>
                            <div className="flex items-center gap-1 text-xs font-bold text-blue-900/60 mb-1">
                                <MapPin size={10} /> Field 1 • Subang
                            </div>
                            <h2 className="text-lg font-black tracking-tight text-blue-900">Rain Sensor Alert</h2>
                            <p className="text-xs font-medium text-blue-800/80 mt-1 leading-tight">Heavy rain detected. Irrigation paused.</p>
                        </div>
                        <div className="bg-blue-100 p-2 rounded-xl text-blue-500 shadow-sm">
                            <CloudRain size={28} />
                        </div>
                    </div>

                    <div 
                        className={`bg-[#2D5A27] rounded-2xl p-4 mb-6 relative z-10 shadow-md transition-all duration-300 ${calendarExpanded ? 'pb-6' : ''}`}
                        onClick={() => setCalendarExpanded(!calendarExpanded)}
                    >
                        <div className="flex justify-between items-center mb-4 cursor-pointer">
                            <button className="text-white/70 hover:text-white"><ChevronLeft size={20} /></button>
                            <span className="text-sm font-bold tracking-wide text-white flex items-center gap-2">
                                OCTOBER 2025 {calendarExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                            </span>
                            <button className="text-white/70 hover:text-white"><ChevronRight size={20} /></button>
                        </div>

                        {!calendarExpanded && (
                            <>
                                <div className="flex justify-between text-center mb-2">
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                        <div key={i} className="text-[10px] text-white/60 font-bold w-9">{d}</div>
                                    ))}
                                </div>
                                <div className="flex justify-between text-center text-sm font-bold text-white items-center">
                                    <div className="w-9 opacity-40">29</div>
                                    <div className="w-9 opacity-40">30</div>
                                    <div className="w-9 h-9 bg-yellow-400 text-[#1B4D3E] rounded-full flex items-center justify-center shadow-lg transform scale-110 border-2 border-[#1B4D3E]">1</div>
                                    <div className="w-9">2</div>
                                    <div className="w-9">3</div>
                                    <div className="w-9">4</div>
                                    <div className="w-9">5</div>
                                </div>
                            </>
                        )}

                        {calendarExpanded && (
                            <div className="grid grid-cols-7 gap-y-4 text-center text-sm font-bold text-white animate-fadeIn">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                    <div key={i} className="text-[10px] text-white/60 font-bold mb-2">{d}</div>
                                ))}
                                {[...Array(31)].map((_, i) => {
                                    const day = i + 1;
                                    const hasWater = [2, 5, 12, 15, 20].includes(day);
                                    const hasSprout = [8, 16, 22, 23].includes(day);
                                    const hasHarvest = [4, 11, 17, 18].includes(day);
                                    const hasWarning = [2, 7, 21].includes(day);
                                    const isSelected = day === 10;

                                    return (
                                        <div key={day} className="flex flex-col items-center justify-start h-10 relative">
                                            <div className={`w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isSelected ? 'bg-white/20 border border-white' : ''}`}>
                                                {day}
                                            </div>
                                            {hasWater && <Droplets size={10} className="text-blue-300" />}
                                            {hasSprout && <Sprout size={10} className="text-green-300" />}
                                            {hasHarvest && <Wheat size={10} className="text-yellow-300" />}
                                            {hasWarning && (
                                                <div className="absolute top-0 right-0 -mr-1 -mt-1">
                                                    <AlertTriangle size={10} className="text-yellow-400 fill-yellow-400" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div 
                        className="relative z-10 cursor-pointer group"
                        onClick={() => setShowWeatherDetail(true)}
                    >
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-bold uppercase text-[#1B4D3E]/70 tracking-wider">5-Day Forecast</h3>
                            <div className="bg-[#2D5A27]/10 px-2 py-1 rounded-full text-[10px] font-bold text-[#2D5A27] flex items-center gap-1 group-hover:bg-[#2D5A27] group-hover:text-white transition-colors">
                                View Details <ArrowRight size={10} />
                            </div>
                        </div>
                        <div className="flex justify-between gap-2 overflow-x-auto no-scrollbar">
                            {[
                                { d: 'Wed', t: '30°', i: CloudSun, c: 'text-orange-500' },
                                { d: 'Thu', t: '25°', i: CloudRain, c: 'text-blue-600' },
                                { d: 'Fri', t: '28°', i: Sun, c: 'text-orange-500' },
                                { d: 'Sat', t: '29°', i: CloudSun, c: 'text-orange-500' },
                                { d: 'Sun', t: '31°', i: Sun, c: 'text-orange-500' },
                            ].map((f, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-1 min-w-[45px] p-2 rounded-xl border border-transparent hover:bg-white hover:shadow-sm transition-all">
                                    <span className="text-[10px] font-bold opacity-60 text-[#1B4D3E]">{f.d}</span>
                                    <f.i size={20} className={f.c} />
                                    <span className="text-xs font-bold text-[#1B4D3E]">{f.t}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pb-20">
                    <h3 className="font-bold text-gray-800 mb-3 text-lg">Today's Tasks</h3>
                    <div className="space-y-3">
                        {tasks.map(task => (
                            <div key={task.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition active:scale-98">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                        <Sprout size={20} />
                                    </div>
                                    <span className={`font-bold text-sm ${task.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                        {task.title}
                                    </span>
                                </div>
                                <button className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                    {task.done && <Check size={14} className="text-white" />}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <button 
                onClick={() => { setShowAddTask(true); setAddMode('menu'); }}
                className="fixed bottom-24 right-6 bg-[#EAB308] text-[#422006] w-14 h-14 rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-transform border border-yellow-400/50 hover:bg-yellow-400 z-20"
            >
                <Plus size={32} />
            </button>

            {showAddTask && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-fadeIn">
                    {addMode === 'menu' && (
                        <div className="bg-[#FFF8E7] w-full max-w-sm rounded-3xl p-6 relative">
                            <button onClick={() => setShowAddTask(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24}/></button>
                            <h2 className="text-xl font-bold text-center text-[#422006] mb-2">Add Task / Reminder</h2>
                            <p className="text-center text-sm text-[#422006]/60 mb-8">Choose how you want to add a task</p>
                            <div className="flex gap-4 justify-center">
                                <button onClick={() => setAddMode('voice')} className="flex-1 bg-[#EAB308] text-[#422006] py-6 rounded-2xl flex flex-col items-center gap-3 shadow-lg active:scale-95 transition"><Mic size={32} /><span className="font-bold">Voice</span></button>
                                <button onClick={() => setAddMode('form')} className="flex-1 bg-[#EAB308] text-[#422006] py-6 rounded-2xl flex flex-col items-center gap-3 shadow-lg active:scale-95 transition"><Edit3 size={32} /><span className="font-bold">Manual</span></button>
                            </div>
                        </div>
                    )}
                    {addMode === 'form' && (
                        <div className="bg-[#FFF8E7] w-full max-w-sm rounded-3xl p-6 relative">
                            <div className="flex items-center gap-3 mb-6">
                                <button onClick={() => setAddMode('menu')} className="bg-[#EAB308]/20 p-2 rounded-full text-[#EAB308]"><ArrowLeft size={20}/></button>
                                <h2 className="text-xl font-bold text-[#422006]">Add Task</h2>
                            </div>
                            <div className="space-y-4">
                                <div><label className="text-xs font-bold text-[#422006]/70 ml-1 mb-1 block">Task Title</label><input type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="w-full p-4 rounded-xl border border-[#EAB308]/30 bg-white focus:outline-none focus:border-[#EAB308]" placeholder="e.g. Water Tomatoes" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-xs font-bold text-[#422006]/70 ml-1 mb-1 block">Date</label><div className="bg-white p-4 rounded-xl border border-[#EAB308]/30 flex justify-between items-center text-gray-600"><span className="text-sm">Today</span><Calendar size={16} className="text-[#EAB308]" /></div></div>
                                    <div><label className="text-xs font-bold text-[#422006]/70 ml-1 mb-1 block">Time</label><div className="bg-white p-4 rounded-xl border border-[#EAB308]/30 flex justify-between items-center text-gray-600"><span className="text-sm">9:00 AM</span><Clock size={16} className="text-[#EAB308]" /></div></div>
                                </div>
                                <div><label className="text-xs font-bold text-[#422006]/70 ml-1 mb-1 block">Priority</label><div className="flex gap-2">{['High', 'Medium', 'Low'].map(p => (<button key={p} onClick={() => setPriority(p)} className={`flex-1 py-2 rounded-lg text-sm font-bold border transition ${priority === p ? 'bg-red-500 text-white border-red-500 shadow-md' : 'bg-white text-gray-500 border-gray-200'}`}>{p}</button>))}</div></div>
                                <button onClick={handleAddTask} className="w-full bg-[#2D5A27] text-white py-4 rounded-xl font-bold shadow-lg mt-4 active:scale-95 transition">Save Task</button>
                            </div>
                        </div>
                    )}
                    {addMode === 'voice' && (
                        <div className="bg-[#FFF8E7] w-full max-w-sm rounded-3xl p-8 relative flex flex-col items-center text-center">
                            <button onClick={() => setAddMode('menu')} className="absolute top-4 left-4 bg-[#EAB308]/20 p-2 rounded-full text-[#EAB308]"><ArrowLeft size={20}/></button>
                            <div className="w-32 h-32 rounded-full bg-[#EAB308]/20 flex items-center justify-center mb-6 animate-pulse"><div className="w-24 h-24 rounded-full bg-[#EAB308] flex items-center justify-center text-[#422006] shadow-lg"><Mic size={40} /></div></div>
                            <h3 className="text-xl font-bold text-[#422006] mb-2">Listening...</h3>
                            <p className="text-gray-500 text-sm mb-8">"Water the tomatoes tomorrow at 8am..."</p>
                            <div className="flex items-center justify-center gap-1 h-8 mb-8">{[...Array(10)].map((_, i) => (<div key={i} className="w-1.5 bg-[#2D5A27] rounded-full animate-bounce" style={{height: Math.random() * 100 + '%', animationDelay: i * 0.1 + 's'}}></div>))}</div>
                            <button onClick={() => setAddMode('form')} className="text-sm font-bold text-[#2D5A27] underline">Switch to Manual</button>
                        </div>
                    )}
                    {addMode === 'success' && (
                        <div className="bg-[#FFF8E7] w-full max-w-sm rounded-3xl p-8 relative flex flex-col items-center text-center animate-fadeIn">
                            <div className="w-24 h-24 rounded-full bg-[#2D5A27] flex items-center justify-center text-white shadow-lg mb-6"><Check size={48} strokeWidth={3} /></div>
                            <h2 className="text-2xl font-bold text-[#2D5A27] mb-2">Task Scheduled!</h2>
                            <div className="bg-white p-4 rounded-xl border border-gray-200 w-full mb-6 text-left shadow-sm"><p className="text-xs text-gray-400 font-bold uppercase mb-1">Summary Card</p><p className="font-bold text-gray-800 text-lg">{newTaskTitle || 'Water Tomatoes'}</p><p className="text-sm text-gray-500 mt-1 flex items-center gap-2"><Clock size={14}/> Tomorrow, 8:00 AM | <span className="text-red-500 font-bold">{priority} Priority</span></p></div>
                            <button onClick={() => { setShowAddTask(false); setNewTaskTitle(''); }} className="w-full bg-[#2D5A27] text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition">Done</button>
                        </div>
                    )}
                </div>
            )}

            {showWeatherDetail && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center animate-fadeIn backdrop-blur-sm">
                    <div className="bg-[#FFF8E7] w-full max-w-md rounded-t-[30px] p-6 pb-10 relative shadow-[0_-10px_40px_rgba(0,0,0,0.2)] max-h-[85vh] overflow-y-auto">
                        
                        <button onClick={() => setShowWeatherDetail(false)} className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition">
                            <X size={20} className="text-gray-600" />
                        </button>

                        <div className="mt-2">
                            <h2 className="text-xl font-bold text-gray-900">Weather Details</h2>
                            <p className="text-xs text-gray-500">Field 1 • Mantin, Negeri Sembilan</p>
                        </div>

                        <div className="bg-[#FDF6E3] p-6 rounded-3xl mt-6 flex justify-between items-center border border-yellow-200 shadow-sm">
                            <div>
                                <CloudSun size={64} className="text-yellow-500 mb-2" />
                                <div className="text-sm text-gray-600 font-medium">Partly Cloudy</div>
                            </div>
                            <div className="text-right">
                                <div className="text-5xl font-black text-gray-800">29°C</div>
                                <div className="text-xs text-gray-500 mt-1">H: 32° L: 24°</div>
                                <div className="text-xs text-gray-400">Feels like 34°C</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {[
                                { label: 'Wind', val: '15 km/h', sub: 'NE', icon: Wind },
                                { label: 'Humidity', val: '80%', sub: '', icon: Droplets },
                                { label: 'UV Index', val: 'High (8)', sub: '', icon: Sun },
                                { label: 'Pressure', val: '1012 hPa', sub: '', icon: Gauge },
                                { label: 'Visibility', val: '10 km', sub: '', icon: EyeIcon },
                                { label: 'Dew Point', val: '23°C', sub: '', icon: Thermometer },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-3 rounded-2xl border border-gray-100 flex flex-col justify-center items-start shadow-sm">
                                    <div className="flex items-center gap-1 text-gray-400 text-[10px] mb-1 font-bold uppercase">
                                        <stat.icon size={12} /> {stat.label}
                                    </div>
                                    <div className="font-bold text-gray-800 text-sm">{stat.val}</div>
                                    {stat.sub && <div className="text-[10px] text-gray-400">{stat.sub}</div>}
                                </div>
                            ))}
                        </div>

                        <div className="mt-6">
                            <h3 className="font-bold text-gray-800 mb-3 text-sm">Hourly Forecast</h3>
                            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                {[
                                    { time: 'Now', temp: '29°', icon: CloudSun, active: true },
                                    { time: '2 PM', temp: '31°', icon: CloudSun, active: false },
                                    { time: '3 PM', temp: '28°', icon: CloudRain, active: false },
                                    { time: '4 PM', temp: '25°', icon: CloudRain, active: false },
                                    { time: '5 PM', temp: '27°', icon: CloudFog, active: false },
                                ].map((h, i) => (
                                    <div key={i} className={`min-w-[60px] flex flex-col items-center p-3 rounded-2xl border ${h.active ? 'bg-[#2D5A27] text-white border-[#2D5A27]' : 'bg-white text-gray-600 border-gray-100'}`}>
                                        <span className="text-xs font-bold mb-2">{h.time}</span>
                                        <h.icon size={20} className={h.active ? 'text-white' : 'text-yellow-500'} />
                                        <span className="text-sm font-bold mt-2">{h.temp}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="font-bold text-gray-800 mb-3 text-sm">5-Day Forecast</h3>
                            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-4">
                                {[
                                    { day: 'Today', icon: CloudSun, low: 24, high: 32, range: 60 },
                                    { day: 'Wed', icon: CloudRain, low: 23, high: 28, range: 40 },
                                    { day: 'Thu', icon: CloudRain, low: 22, high: 26, range: 30 },
                                    { day: 'Fri', icon: CloudFog, low: 24, high: 30, range: 50 },
                                    { day: 'Sat', icon: Sun, low: 25, high: 33, range: 80 },
                                ].map((d, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <span className="font-bold text-gray-600 w-12">{d.day}</span>
                                        <d.icon size={18} className="text-gray-400" />
                                        <span className="text-gray-500 font-medium">{d.low}°</span>
                                        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden relative">
                                            <div className="absolute top-0 bottom-0 bg-[#422006] rounded-full opacity-80" style={{ left: '10%', width: `${d.range}%` }}></div>
                                        </div>
                                        <span className="text-gray-800 font-bold">{d.high}°</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            <BottomNavigation />
        </div>
    );
  };

  const FieldScreen = () => {
    const fields = [
      { id: 1, name: 'Potato Field 1', type: 'Vegetable', status: 'Needs Water', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&q=80' },
      { id: 2, name: 'Tomato Field 2', type: 'Vegetable', status: 'Healthy', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80' },
      { id: 3, name: 'Tomato Field 3', type: 'Vegetable', status: 'Healthy', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80' }, 
      { id: 4, name: 'Potato Field 2', type: 'Vegetable', status: 'Healthy', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&q=80' }, 
    ];

    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col animate-fadeIn pb-24 relative">
        <div className="bg-[#FDFBF7] px-6 pt-10 pb-4 flex items-center justify-between sticky top-0 z-30 shadow-sm border-b border-gray-100">
            <button onClick={() => navigateTab('home')} className="flex items-center text-gray-800 font-bold text-sm hover:text-green-700 transition">
                <ChevronLeft size={20}/> Back
            </button>
            <h1 className="text-xl font-black text-green-900 tracking-wide">My Fields</h1>
            <div className="w-16 flex justify-end">
                 <button className="relative bg-green-100 p-2 rounded-full hover:bg-green-200 transition">
                    <User size={20} className="text-green-800" />
                 </button>
            </div>
        </div>

        <div className="p-4 grid grid-cols-2 gap-4 overflow-y-auto">
            {fields.map((field) => (
                <div 
                    key={field.id} 
                    onClick={() => handleFieldClick(field)}
                    className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col gap-3 transition hover:shadow-md active:scale-95 cursor-pointer"
                >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                        <img src={field.image} alt={field.name} className="w-full h-full object-cover" />
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] font-bold text-white shadow-sm ${field.status === 'Needs Water' ? 'bg-red-500' : 'bg-[#2D5A27]'}`}>
                            {field.status}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">{field.name}</h3>
                        <p className="text-xs text-gray-400">{field.type}</p>
                    </div>
                </div>
            ))}
        </div>

        <button 
            onClick={() => setCurrentView('start-planting')}
            className="fixed bottom-24 right-6 w-14 h-14 bg-[#1B4D3E] rounded-full shadow-xl flex items-center justify-center text-white border-2 border-[#EAB308] z-40 active:scale-90 transition transform"
        >
            <Plus size={32} />
        </button>

        <BottomNavigation />
      </div>
    );
  };

  const FieldDetailScreen = () => {
      const field = selectedFieldData || { name: 'Potato Field 1', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&q=80' };
      const [showVoiceUI, setShowVoiceUI] = useState(false);

      const handlePlayVoiceAdvice = () => {
          setShowVoiceUI(true);
      };

      return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col animate-fadeIn pb-24 relative">
            <div className="bg-[#FDFBF7] px-6 pt-10 pb-4 flex items-center justify-between sticky top-0 z-30 shadow-sm border-b border-gray-100">
                <button onClick={() => setCurrentView('field')} className="flex items-center text-gray-800 font-bold text-sm hover:text-green-700 transition">
                    <ChevronLeft size={20}/> Back
                </button>
                <h1 className="text-xl font-black text-green-900 tracking-wide text-center flex-1 mx-2 truncate">{field.name} Details</h1>
                <button className="text-green-900 p-2 hover:bg-green-100 rounded-full transition">
                    <Pencil size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="h-64 w-full relative">
                     <img src={field.image} alt={field.name} className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>

                <div className="relative -mt-20 px-4 space-y-4 pb-20">
                    <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 relative z-10">
                        <h3 className="font-bold text-gray-900 mb-6 text-sm">Live Sensor Data</h3>
                        <div className="flex justify-between px-2">
                             <SensorGauge value="75%" color="border-blue-500" label="Water" icon={Droplets} />
                             <SensorGauge value="28°C" color="border-orange-500" label="Temp" icon={Thermometer} />
                             <SensorGauge value="Normal" color="border-green-500" label="NPK" icon={Leaf} />
                        </div>
                    </div>

                    <div 
                        onClick={() => setCurrentView('photo-advisory')}
                        className="bg-[#E6F4EA] rounded-3xl p-5 flex items-center justify-between shadow-sm border border-green-100 cursor-pointer active:scale-98 transition"
                    >
                        <div className="flex-1 pr-4">
                            <h3 className="font-bold text-gray-900 text-sm mb-1">AI Health Scan</h3>
                            <p className="text-xs text-green-800/70 leading-relaxed font-medium">Present your cam to scan crop and check health status.</p>
                        </div>
                        <button className="w-12 h-12 bg-[#2D5A27] rounded-xl flex items-center justify-center text-white shadow-md">
                             <Scan size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between h-36">
                             <h3 className="font-bold text-gray-900 text-sm">Yield Forecast</h3>
                             <div className="flex-1 flex items-end relative overflow-hidden">
                                 <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                                     <defs>
                                        <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#2D5A27" stopOpacity="0.2"/>
                                            <stop offset="100%" stopColor="#2D5A27" stopOpacity="0"/>
                                        </linearGradient>
                                     </defs>
                                     <path d="M0,40 C20,40 30,20 50,30 S80,10 100,5" fill="none" stroke="#2D5A27" strokeWidth="3" strokeLinecap="round" />
                                     <path d="M0,40 C20,40 30,20 50,30 S80,10 100,5 V50 H0 Z" fill="url(#yieldGradient)" stroke="none" />
                                 </svg>
                             </div>
                        </div>

                        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center h-36 text-center gap-3 relative overflow-hidden">
                             <h3 className="font-bold text-gray-900 text-sm w-full text-left absolute top-4 left-4">Today's Task</h3>
                             <div className="mt-6 relative w-16 h-16 flex items-center justify-center">
                                 <Star size={64} className="text-[#EAB308] fill-[#EAB308] drop-shadow-md rotate-12" />
                                 <span className="font-black text-xs text-[#FFF8E7] absolute z-10">XP</span>
                             </div>
                             <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Earn +50 XP</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 pt-4 bg-gradient-to-t from-[#FDFBF7] to-transparent z-20 pb-8">
                 <button 
                    onClick={handlePlayVoiceAdvice}
                    className="w-full font-bold text-lg py-4 rounded-2xl shadow-lg border active:scale-95 transition transform flex items-center justify-center gap-3 bg-[#FFC107] text-[#422006] border-yellow-400 hover:bg-[#FFB300]"
                 >
                    Play Voice Advice
                 </button>
            </div>

            {showVoiceUI && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white w-full max-w-sm rounded-[30px] p-8 relative flex flex-col items-center shadow-2xl">
                        <button onClick={() => setShowVoiceUI(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full transition"><X size={20}/></button>
                        
                        <div className="w-20 h-20 bg-[#FFF8E1] rounded-full flex items-center justify-center mb-6 text-[#EAB308] border-2 border-[#FEF08A] shadow-sm">
                            <Volume2 size={36} />
                        </div>
                        
                        <h3 className="text-xl font-black text-[#1B4D3E] mb-2 tracking-tight">VACA Advisor</h3>
                        
                        <div className="flex items-center justify-center gap-1.5 h-10 mb-6">
                             {[...Array(5)].map((_, i) => (
                                 <div key={i} className="w-2 bg-[#2D5A27] rounded-full animate-pulse" 
                                      style={{
                                          height: '100%', 
                                          animationDuration: `${0.6 + i * 0.1}s`,
                                          animationName: 'wave'
                                      }}
                                 ></div>
                             ))}
                        </div>

                        <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-gray-100 w-full text-center mb-6">
                            <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                "Here is the status for <span className="font-bold text-[#1B4D3E]">{field.name}</span>. Live sensors show Water level at 75%, Temperature is 28 degrees, and nutrients are normal. Yield forecast is trending up. Please complete today's task to earn 50 XP."
                            </p>
                        </div>

                        <button onClick={() => setShowVoiceUI(false)} className="w-full bg-[#1B4D3E] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition hover:bg-[#14392b]">
                            Close
                        </button>
                    </div>
                </div>
            )}
            
             <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40">
                <button 
                    onClick={() => setCurrentView('voice-advisory')}
                    className="w-16 h-16 bg-[#2D5A27] rounded-full shadow-xl flex items-center justify-center text-white border-4 border-[#FDFBF7] active:scale-95 transition-transform hover:bg-[#1e3f1b]"
                >
                    <Mic size={28} />
                </button>
            </div>

            <BottomNavigation />
        </div>
      );
  };

  const StartPlantingScreen = () => {
    return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col animate-fadeIn pb-24 relative">
            <div className="bg-[#FDFBF7] px-6 pt-10 pb-4 flex items-center justify-between sticky top-0 z-30 shadow-sm border-b border-gray-100">
                <button onClick={() => navigateTab('field')} className="flex items-center text-gray-800 font-bold text-sm hover:text-green-700 transition">
                    <ChevronLeft size={20}/> Back
                </button>
                <h1 className="text-xl font-black text-green-900 tracking-wide">Start Planting</h1>
                <div className="w-16"></div> 
            </div>

            <div className="p-5 space-y-8">
                <div className="relative shadow-sm rounded-full">
                    <input 
                        type="text" 
                        placeholder="Say what you are planting..." 
                        className="w-full bg-white rounded-full py-4 pl-12 pr-6 text-sm text-gray-600 border border-gray-200 focus:outline-none focus:border-green-500 shadow-sm"
                    />
                    <Mic className="absolute left-4 top-4 text-green-600" size={20} />
                </div>

                <div>
                    <h2 className="font-bold text-gray-900 text-lg mb-4">Recommended for Season</h2>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        <div className="min-w-[160px] h-48 rounded-2xl overflow-hidden relative shadow-md group">
                            <img src="https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80" alt="Corn" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                            <div className="absolute top-3 left-3 bg-[#EAB308] text-[#422006] text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                                High Market Price
                            </div>
                            <span className="absolute bottom-3 left-3 text-white font-bold text-lg">Corn</span>
                        </div>

                        <div className="min-w-[160px] h-48 rounded-2xl overflow-hidden relative shadow-md group">
                            <img src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80" alt="Tomato" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                            <div className="absolute top-3 left-3 bg-[#EAB308] text-[#422006] text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                                High Market Price
                            </div>
                            <span className="absolute bottom-3 left-3 text-white font-bold text-lg">Tomato</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="font-bold text-gray-900 text-lg mb-4">All Crops</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { name: 'Corn', img: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=200&q=80' },
                            { name: 'Radish', img: 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f8c?w=200&q=80' }, 
                            { name: 'Tomato', img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&q=80' },
                            { name: 'Spinach', img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&q=80' }, 
                            { name: 'Cabbage', img: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=200&q=80' },
                            { name: 'Potato', img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&q=80' }, 
                            { name: 'Cucumber', img: 'https://images.unsplash.com/photo-1604977042946-1eecc6a310c9?w=200&q=80' },
                            { name: 'Chili', img: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=200&q=80' },
                            { name: 'Wheat', img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&q=80' },
                        ].map((crop, index) => (
                            <div key={index} className="flex flex-col items-center gap-2">
                                <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-sm bg-gray-100">
                                    <img src={crop.img} alt={crop.name} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-xs font-bold text-gray-700">{crop.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40">
                <button className="w-16 h-16 bg-[#2D5A27] rounded-full shadow-xl flex items-center justify-center text-white border-4 border-[#FDFBF7] active:scale-95 transition-transform">
                    <Mic size={28} />
                </button>
            </div>

            <BottomNavigation />
        </div>
    );
  };

  const ProfileScreen = () => (
    <div className="min-h-screen bg-[#FFF8E7] flex flex-col animate-fadeIn pb-24 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pt-8">
             <button onClick={() => navigateTab('home')} className="bg-white/50 p-2 rounded-full hover:bg-white transition">
                <ArrowLeft size={24} className="text-[#422006]" />
            </button>
            <h1 className="text-xl font-bold text-[#422006]">Profile</h1>
             <button className="bg-white/50 p-2 rounded-full hover:bg-white transition">
                <Settings size={24} className="text-[#422006]" />
            </button>
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-center px-6 mb-8">
            <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <button className="absolute bottom-0 right-0 bg-[#EAB308] p-2 rounded-full text-white border-2 border-white shadow-sm">
                    <Pencil size={16} />
                </button>
            </div>
            <h2 className="text-2xl font-bold text-[#422006] mt-4">MOHAMAD</h2>
            <p className="text-sm text-gray-600">Farmer • Subang Jaya</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 px-6 mb-8">
            <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 flex flex-col items-center">
                <div className="bg-[#2D5A27]/10 p-3 rounded-full text-[#2D5A27] mb-2">
                    <Wheat size={24} />
                </div>
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Harvested</p>
                <h3 className="text-xl font-black text-[#2D5A27]">1250 kg</h3>
            </div>
            <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 flex flex-col items-center">
                <div className="bg-[#EAB308]/10 p-3 rounded-full text-[#EAB308] mb-2">
                    <BarChart3 size={24} />
                </div>
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Income</p>
                <h3 className="text-xl font-black text-[#EAB308]">RM 4500</h3>
            </div>
        </div>

        {/* Activity Chart Placeholder */}
        <div className="px-6 mb-8">
            <h3 className="text-lg font-bold text-[#422006] mb-4">Activity</h3>
            <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 h-48 relative overflow-hidden">
                 <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                    <TrendingUp size={64} strokeWidth={1} />
                 </div>
                 <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#2D5A27]/20 to-transparent"></div>
            </div>
        </div>

        {/* Settings Menu */}
        <div className="px-6 space-y-3 mb-8">
             <button className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between transition hover:bg-gray-50 active:scale-98">
                <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full text-gray-600"><User size={20} /></div>
                    <span className="font-bold text-gray-800">Edit Profile</span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
            </button>
            <button className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between transition hover:bg-gray-50 active:scale-98">
                <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full text-gray-600"><Bell size={20} /></div>
                    <span className="font-bold text-gray-800">Notification</span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
            </button>
             <button className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between transition hover:bg-gray-50 active:scale-98">
                <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full text-gray-600"><Globe size={20} /></div>
                    <span className="font-bold text-gray-800">Language</span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
            </button>
             <button className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between transition hover:bg-gray-50 active:scale-98">
                <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full text-gray-600"><HelpCircle size={20} /></div>
                    <span className="font-bold text-gray-800">Help & Support</span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
            </button>
        </div>

        <div className="px-6">
             <button onClick={() => setCurrentView('landing')} className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition active:scale-95 border border-red-100">
                <LogOut size={20} />
                Log Out
            </button>
        </div>

        <BottomNavigation />
    </div>
  );

  const AiAdvisoryScreen = () => {
    const [activeModal, setActiveModal] = useState(null); // 'quick-prompts', 'quick-chips', 'past-data'

    // Exact colors from your screenshot analysis:
    const theme = {
        bg: '#FFFBF0', // Warm cream background
        banner: '#DD6E55', // Terracotta warning banner
        cardBg: '#F9F4E8', // Light beige for grid cards
        darkGreen: '#1A4331', // Deep Forest Green for text/buttons
    };

    const prompts = [
      { id: 1, title: 'Quick Prompts', icon: Zap, color: 'text-yellow-600', iconBg: 'bg-yellow-100', action: () => setActiveModal('quick-prompts') },
      { id: 2, title: 'Your Photo', icon: ImageIcon, color: 'text-green-600', iconBg: 'bg-green-100', action: () => setCurrentView('photo-advisory') },
      { id: 3, title: 'Quick Chips', icon: Clock, color: 'text-orange-600', iconBg: 'bg-orange-100', action: () => setActiveModal('quick-chips') },
      { id: 4, title: 'Past Data', icon: Store, color: 'text-blue-600', iconBg: 'bg-blue-100', action: () => setActiveModal('past-data') },
    ];

    return (
      <div className="min-h-screen flex flex-col pb-24 animate-fadeIn" style={{ backgroundColor: theme.bg }}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 pt-8">
            <div className="w-8"></div> {/* Spacer to center title */}
            <h1 className="text-xl font-bold" style={{ color: theme.darkGreen }}>AI-Advisory Main</h1>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-green-900/20 text-green-900">
                <HelpCircle size={18} />
            </button>
        </div>

        <div className="flex-1 px-6 space-y-8 flex flex-col">
            
            {/* Warning Banner - Terracotta Color */}
            <div 
                className="rounded-3xl p-5 relative overflow-hidden shrink-0 flex items-start gap-4 shadow-sm"
                style={{ backgroundColor: theme.banner }}
            >
                <div className="bg-black/10 p-2 rounded-xl shrink-0 mt-1">
                    <AlertTriangle className="text-black/60" size={24} />
                </div>
                <div>
                    <h3 className="text-black/80 font-bold mb-1 text-base">Warning banner</h3>
                    <p className="text-black/60 text-xs leading-relaxed font-medium pr-2">
                        Vaca AI are-well-as preventail to your anvision-review wl enemiesny or chrome effects.
                    </p>
                </div>
            </div>

            {/* Quick Prompts Section */}
            <div>
                <h3 className="font-bold text-lg mb-4" style={{ color: theme.darkGreen }}>Quick Prompts</h3>
                <div className="grid grid-cols-2 gap-4">
                    {prompts.map((prompt) => (
                        <div 
                            key={prompt.id} 
                            onClick={prompt.action}
                            className="rounded-[24px] flex flex-col items-center justify-center p-6 gap-3 shadow-sm hover:opacity-90 transition active:scale-95 h-36 cursor-pointer"
                            style={{ backgroundColor: theme.cardBg }}
                        >
                            <div className={`w-12 h-12 ${prompt.iconBg} rounded-full flex items-center justify-center border border-black/5`}>
                                <prompt.icon size={22} className={prompt.color} strokeWidth={2.5} />
                            </div>
                            <span className="font-bold text-sm" style={{ color: theme.darkGreen }}>{prompt.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Large Action Buttons - Deep Green */}
            <div className="grid grid-cols-2 gap-4 mt-auto">
                <button 
                    onClick={() => setCurrentView('voice-advisory')}
                    className="h-40 rounded-[32px] flex flex-col items-center justify-center gap-4 text-white shadow-lg active:scale-95 transition hover:opacity-90"
                    style={{ backgroundColor: theme.darkGreen }}
                >
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                        <Mic size={32} strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-lg tracking-wide">Voice</span>
                </button>

                <button 
                    onClick={() => setCurrentView('photo-advisory')}
                    className="h-40 rounded-[32px] flex flex-col items-center justify-center gap-4 text-white shadow-lg active:scale-95 transition hover:opacity-90"
                    style={{ backgroundColor: theme.darkGreen }}
                >
                     <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                        <Camera size={32} strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-lg tracking-wide">Photo</span>
                </button>
            </div>
        </div>

        {/* --- Interactive Popups (Modals) --- */}
        {activeModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn" onClick={() => setActiveModal(null)}>
                <div className="bg-[#FFF8E7] w-full max-w-sm rounded-[30px] p-6 relative shadow-2xl" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 bg-black/5 rounded-full hover:bg-black/10 transition">
                        <X size={20} className="text-[#422006]" />
                    </button>

                    {/* 1. Quick Prompts Popup */}
                    {activeModal === 'quick-prompts' && (
                        <>
                           <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-yellow-600">
                                <Zap size={32} />
                           </div>
                           <h3 className="text-xl font-bold text-[#1B4D3E] mb-2">Try Asking...</h3>
                           <p className="text-sm text-gray-500 mb-6">Tap any question to ask VACA AI instantly.</p>
                           <div className="space-y-3">
                                {["Why are my tomato leaves curling?", "What is the fertilizer schedule for corn?", "Current market price for Red Chili?", "Is it going to rain this afternoon?"].map((q, i) => (
                                    <button key={i} className="w-full text-left p-4 bg-white rounded-2xl border border-yellow-200 text-[#422006] font-bold text-sm hover:bg-yellow-50 active:scale-98 transition flex items-center gap-3">
                                        <MessageCircle size={18} className="text-yellow-500 shrink-0" />
                                        {q}
                                    </button>
                                ))}
                           </div>
                        </>
                    )}

                    {/* 2. Quick Chips Popup */}
                    {activeModal === 'quick-chips' && (
                        <>
                           <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-orange-600">
                                <Clock size={32} />
                           </div>
                           <h3 className="text-xl font-bold text-[#1B4D3E] mb-2">Quick Topics</h3>
                           <p className="text-sm text-gray-500 mb-6">Select a topic to start a conversation.</p>
                           <div className="flex flex-wrap gap-2">
                                {["Weather", "Pests", "Diseases", "Market Price", "Soil Health", "Irrigation", "Harvest", "Fertilizer", "Tools", "Seeds"].map((tag, i) => (
                                    <button key={i} className="px-4 py-2 bg-white border border-orange-200 rounded-full text-[#422006] text-sm font-bold hover:bg-orange-50 active:scale-95 transition">
                                        {tag}
                                    </button>
                                ))}
                           </div>
                        </>
                    )}

                    {/* 3. Past Data Popup */}
                    {activeModal === 'past-data' && (
                        <>
                           <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                                <Store size={32} />
                           </div>
                           <h3 className="text-xl font-bold text-[#1B4D3E] mb-2">History</h3>
                           <p className="text-sm text-gray-500 mb-6">Your past consultations.</p>
                           <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                {/* Item 1: Voice + Text Response */}
                                <div className="bg-white p-3 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Voice Query</span>
                                        <span className="text-[10px] text-gray-400 ml-auto">2 hrs ago</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl mb-2">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white"><Play size={12} fill="currentColor"/></div>
                                        <div className="h-1 bg-gray-300 w-24 rounded-full"></div>
                                        <span className="text-xs font-bold text-gray-500">0:15</span>
                                    </div>
                                    <p className="text-xs text-gray-600 border-l-2 border-green-500 pl-2">AI: "Based on your description, it sounds like Nitrogen deficiency. Apply urea..."</p>
                                </div>

                                {/* Item 2: Image + Text Response */}
                                <div className="bg-white p-3 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Image Scan</span>
                                        <span className="text-[10px] text-gray-400 ml-auto">Yesterday</span>
                                    </div>
                                    <div className="flex gap-3 mb-2">
                                        <img src="https://images.unsplash.com/photo-1591857177580-dc82b9e4e119?w=100&q=80" className="w-12 h-12 rounded-lg object-cover" />
                                        <div className="flex-1">
                                             <p className="text-xs font-bold text-gray-800">Tomato Leaf Scan</p>
                                             <p className="text-[10px] text-red-500 font-bold">Detected: Late Blight</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-600 border-l-2 border-green-500 pl-2">AI: "Immediate action required. Remove infected leaves and apply fungicide..."</p>
                                </div>
                           </div>
                        </>
                    )}

                </div>
            </div>
        )}

        <BottomNavigation />
      </div>
    );
  };

  const PhotoAdvisory = () => {
    // State for tabs in the result card
    const [activeTab, setActiveTab] = useState('diagnosis'); // 'diagnosis', 'treatment'
    const [isScanning, setIsScanning] = useState(true); // New state to control the flow

    // Use effect to simulate the AI scanning delay
    useEffect(() => {
        // Start a timer when component mounts
        const timer = setTimeout(() => {
            setIsScanning(false); // Stop scanning and show result
        }, 3500); // 3.5 seconds delay

        return () => clearTimeout(timer);
    }, []);

    return (
      <div className="min-h-screen bg-black flex flex-col animate-fadeIn relative overflow-hidden">
        {/* Background Image (The Plant) */}
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1591857177580-dc82b9e4e119?w=800&q=80" 
                alt="Analyzed Crop" 
                className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
            
            {/* Scanning Overlay Visuals - Only show active animation if scanning */}
            <div className="absolute top-1/4 left-8 right-8 bottom-1/3 border-2 border-white/50 rounded-3xl overflow-hidden transition-all duration-500" style={{ opacity: isScanning ? 1 : 0.3 }}>
                {isScanning && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-green-400 shadow-[0_0_20px_rgba(74,222,128,0.8)] animate-[scan_3s_infinite_linear]"></div>
                )}
                {/* Corner Markers */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl"></div>
                
                {/* Simulated AI Text inside the scanner */}
                {isScanning && (
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                        <span className="bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md animate-pulse">
                            Analyzing leaves...
                        </span>
                    </div>
                )}
            </div>

            {/* AI Tags floating on leaf - Show only AFTER scanning is complete */}
            <div 
                className={`absolute top-[35%] right-[25%] bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-lg transition-all duration-500 ease-out transform ${!isScanning ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-10'}`}
                style={{ transitionDelay: '0.2s' }} // Slight delay after scanning stops
            >
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-red-900">Infection Detected</span>
            </div>
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-6 pt-10">
            <button onClick={() => setCurrentView('ai-advisory')} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition">
                <ArrowLeft size={24} />
            </button>
            <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <span className="text-white font-bold text-sm tracking-wide">AI Diagnosis</span>
            </div>
            <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition">
                <Share2 size={20} />
            </button>
        </div>

        <div className="flex-1"></div> {/* Spacer */}

        {/* Bottom Sheet Results - Slides up only when !isScanning */}
        <div 
            className={`relative z-20 bg-[#FDFBF7] rounded-t-[32px] p-6 pb-8 shadow-[0_-10px_60px_rgba(0,0,0,0.5)] max-h-[60vh] overflow-y-auto transition-transform duration-700 cubic-bezier(0.19, 1, 0.22, 1) ${!isScanning ? 'translate-y-0' : 'translate-y-full'}`}
        >
            {/* Drag Handle */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>

            {/* Disease Title Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border border-red-200">High Confidence 98%</span>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 leading-tight">Early Blight</h2>
                    <p className="text-sm text-gray-500 font-medium">Fungal Infection • Alternaria solani</p>
                </div>
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100">
                    <AlertTriangle size={28} className="text-red-500" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                <button 
                    onClick={() => setActiveTab('diagnosis')}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'diagnosis' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Diagnosis
                </button>
                <button 
                    onClick={() => setActiveTab('treatment')}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'treatment' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Treatment
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'diagnosis' && (
                <div className="space-y-4 animate-fadeIn">
                    <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                        <h4 className="font-bold text-orange-900 text-sm mb-2 flex items-center gap-2">
                            <Eye size={16}/> Symptoms
                        </h4>
                        <p className="text-xs text-orange-800/80 leading-relaxed font-medium">
                            Concentric rings on lower leaves, yellowing tissue around spots, and eventual leaf drop. 
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 text-sm mb-3">Affected Areas</h4>
                        <div className="flex gap-3">
                            {['Leaves', 'Stems', 'Fruit'].map((part, i) => (
                                <div key={i} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 shadow-sm">
                                    {part}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="pt-2">
                        <h4 className="font-bold text-gray-900 text-sm mb-3">Impact Analysis</h4>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 w-[70%]"></div>
                            </div>
                            <span className="text-xs font-bold text-red-600">High Risk</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Estimated Yield Loss: 20-30% if untreated.</p>
                    </div>
                </div>
            )}

            {activeTab === 'treatment' && (
                <div className="space-y-4 animate-fadeIn">
                     <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                        <h4 className="font-bold text-green-900 text-sm mb-2 flex items-center gap-2">
                            <Sprout size={16}/> Organic Solution
                        </h4>
                        <p className="text-xs text-green-800/80 leading-relaxed font-medium mb-2">
                            Remove infected leaves immediately. Apply copper-based fungicide or Neem oil spray every 7 days.
                        </p>
                         <button className="text-[10px] bg-white text-green-700 font-bold px-3 py-1.5 rounded-lg shadow-sm border border-green-200">View Recipe</button>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <h4 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2">
                            <Zap size={16}/> Chemical Control
                        </h4>
                         <p className="text-xs text-blue-800/80 leading-relaxed font-medium">
                            Apply fungicides containing Chlorothalonil or Mancozeb. Follow label instructions strictly.
                        </p>
                    </div>
                </div>
            )}
            
            {/* Sticky Action Button inside sheet for scroll context, or fixed outside */}
             <button className="w-full mt-6 bg-[#2D5A27] text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition flex items-center justify-center gap-2">
                <Sparkles size={20} className="text-yellow-300" />
                Ask AI Assistant for Plan
            </button>
        </div>
      </div>
    );
  };

  const VoiceAdvisory = () => {
    // State to simulate Listening, Processing, and Chat History
    const [status, setStatus] = useState('idle'); // 'listening', 'processing', 'idle'
    const [inputMode, setInputMode] = useState('voice'); // 'voice' or 'text'
    const [textInput, setTextInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [playingMessageId, setPlayingMessageId] = useState(null);
    const [isTtsEnabled, setIsTtsEnabled] = useState(true);

    // Auto-scroll reference
    const chatEndRef = useRef(null);
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [chatHistory, status]);

    // --- TEXT TO SPEECH HANDLER ---
    const speakText = (text, id) => {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        if (!isTtsEnabled) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onstart = () => setPlayingMessageId(id);
        utterance.onend = () => setPlayingMessageId(null);
        
        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setPlayingMessageId(null);
    };

    // Handle Mic Toggle logic
    const toggleListening = () => {
        if (status === 'listening') {
            // User stopped speaking -> Simulate processing
            // In a real app, this would use SpeechRecognition results
            setStatus('processing');
            // Simulate voice input for now
            processInput("How's the weather for tomorrow?"); 
        } else {
            // User taps to speak again
            setStatus('listening');
        }
    };

    // Process Input (Text or Voice) -> Call Gemini
    const processInput = async (userText) => {
        setStatus('processing');
        
        const newUserMsg = { type: 'user', text: userText, id: Date.now() };
        setChatHistory(prev => [...prev, newUserMsg]);
        
        // Call Real Gemini API
        const aiResponseText = await callGeminiAPI(userText, chatHistory);
        
        const newAiMsg = { 
            type: 'ai', 
            text: aiResponseText,
            id: Date.now() + 1
        };

        setChatHistory(prev => [...prev, newAiMsg]);
        setStatus('idle');

        // Auto-play TTS if enabled
        if (isTtsEnabled) {
            speakText(aiResponseText, newAiMsg.id);
        }
    };

    // Keyboard handlers
    const handleKeyPress = (key) => {
        setTextInput(prev => prev + key);
    };

    const handleDelete = () => {
        setTextInput(prev => prev.slice(0, -1));
    };

    const handleGo = () => {
        if (textInput.trim()) {
            setInputMode('voice'); 
            processInput(textInput);
            setTextInput('');
        }
    };

    // Manual Play/Stop Message
    const handlePlayMessage = (msgId, text) => {
        if (playingMessageId === msgId) {
            stopSpeaking();
        } else {
            speakText(text, msgId);
        }
    };

    return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col animate-fadeIn relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pt-8 gap-4 z-10">
            <div className="flex items-center gap-4">
                <button onClick={() => setCurrentView('ai-advisory')} className="text-green-900 bg-white/50 p-2 rounded-full hover:bg-white transition"><ArrowLeft size={24} /></button>
                <h1 className="text-xl font-bold text-green-900">AI Assistant</h1>
            </div>
            
            {/* TTS Toggle Switch */}
            <button 
                onClick={() => {
                    const newState = !isTtsEnabled;
                    setIsTtsEnabled(newState);
                    if (!newState) stopSpeaking();
                }} 
                className={`p-2 rounded-full transition ${isTtsEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}
            >
                {isTtsEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 px-4 overflow-y-auto space-y-4 pt-2 transition-all duration-300 ${inputMode === 'text' ? 'pb-[400px]' : 'pb-60'}`}>
             {/* Initial Greeting Card - Always visible at top */}
             <div className="bg-white border border-green-100 p-5 rounded-2xl rounded-tl-none max-w-[90%] text-gray-800 text-sm leading-relaxed shadow-sm">
                <p className="font-bold text-green-800 mb-1 flex items-center gap-2 text-xs uppercase tracking-wide"><Bot size={14}/> VACA AI</p>
                Hello! I'm connected to the satellite brain. Ask me anything about your crops, weather, or market prices.
            </div>

            {/* Chat History */}
            {chatHistory.map((msg, index) => (
                <div key={index} className={`flex w-full ${msg.type === 'user' ? 'justify-end' : 'justify-start items-end gap-2'}`}>
                    
                    {/* Render Chat Bubble */}
                    <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${msg.type === 'user' ? 'bg-[#2D5A27] text-white rounded-tr-none' : 'bg-white border border-green-100 rounded-tl-none text-gray-800'}`}>
                        {msg.type === 'ai' && (
                             <p className="font-bold text-green-800 mb-1 flex items-center gap-2 text-xs uppercase tracking-wide"><Bot size={14}/> VACA AI</p>
                        )}
                        {msg.text}
                    </div>

                    {/* AI Play Button (Only for AI messages) */}
                    {msg.type === 'ai' && (
                        <button 
                            onClick={() => handlePlayMessage(msg.id, msg.text)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all active:scale-95 shrink-0 ${playingMessageId === msg.id ? 'bg-[#EAB308] text-[#422006]' : 'bg-white border border-gray-200 text-green-700'}`}
                        >
                            {playingMessageId === msg.id ? (
                                <div className="flex items-center gap-0.5 h-3">
                                     <div className="w-1 bg-[#422006] rounded-full animate-[wave_0.5s_infinite_ease-in-out]"></div>
                                     <div className="w-1 bg-[#422006] rounded-full animate-[wave_0.5s_infinite_ease-in-out_0.1s]"></div>
                                     <div className="w-1 bg-[#422006] rounded-full animate-[wave_0.5s_infinite_ease-in-out_0.2s]"></div>
                                </div>
                            ) : (
                                <Volume2 size={20} />
                            )}
                        </button>
                    )}

                </div>
            ))}
            
            {/* Loading Indicator for AI Reply */}
            {status === 'processing' && (
                <div className="flex justify-start w-full">
                     <div className="bg-white border border-green-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                     </div>
                </div>
            )}
            <div ref={chatEndRef} />
        </div>

        {/* Bottom Sheet - Input UI */}
        <div className={`fixed left-0 right-0 bg-white rounded-t-[40px] shadow-[0_-10px_60px_rgba(0,0,0,0.15)] transition-all duration-500 z-30 flex flex-col items-center justify-center ${inputMode === 'text' ? 'bottom-[280px] h-[100px] rounded-t-none border-b border-gray-200' : (status === 'listening' ? 'bottom-0 h-[45vh]' : 'bottom-0 h-[28vh]')}`}>
            
            {/* 1. VOICE MODE UI */}
            {inputMode === 'voice' && (
                <>
                    {/* Visualizer & Text Area */}
                    <div className="flex-1 flex flex-col items-center justify-center w-full relative">
                        
                        {/* Visualizer Bars (Only visible when listening) */}
                        <div className={`flex items-center justify-center gap-1.5 mb-6 h-12 transition-opacity duration-300 ${status === 'listening' ? 'opacity-100' : 'opacity-0'}`}>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-3 bg-[#4ADE80] rounded-full animate-pulse" 
                                     style={{
                                         height: '100%', 
                                         animationDuration: `${0.6 + i * 0.1}s`,
                                         animationName: 'wave'
                                     }}
                                ></div>
                            ))}
                        </div>

                        {/* Status Text */}
                        <h3 className="text-2xl font-black text-[#1B4D3E] mb-2 tracking-tight transition-all">
                            {status === 'listening' ? "Listening..." : "Tap to Speak"}
                        </h3>
                        <p className="text-gray-400 text-sm text-center max-w-xs px-6">
                            {status === 'listening' 
                                ? "Go ahead, I'm analyzing your voice pattern." 
                                : "I'm ready to help you with your farm."}
                        </p>
                    </div>

                    {/* Main Action Button Area */}
                    <div className="pb-10 pt-2 w-full flex flex-col items-center relative">
                        {/* Main Mic Button */}
                        <button 
                            onClick={toggleListening}
                            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 z-20 ${status === 'listening' ? 'bg-[#EF8989] text-white animate-pulse shadow-red-200' : 'bg-[#EF8989] text-white hover:opacity-90'}`}
                        >
                            {status === 'listening' ? <Mic size={36} /> : <Mic size={36} />}
                        </button>

                        {/* Side Option Buttons (Text / Camera) - Positioned relative to Mic button */}
                        <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 flex justify-between px-12 pointer-events-none">
                            <button 
                                onClick={() => setInputMode('text')}
                                className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center pointer-events-auto hover:bg-gray-200 transition active:scale-95"
                            >
                                <Keyboard size={20} />
                            </button>
                            <button 
                                onClick={() => setCurrentView('photo-advisory')}
                                className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center pointer-events-auto hover:bg-gray-200 transition active:scale-95"
                            >
                                <Camera size={20} />
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* 2. TEXT MODE UI (Simulated Input Field) */}
            {/* CHANGED: Styling to make text clearly visible */}
            {inputMode === 'text' && (
                <div className="w-full h-full flex items-center px-4 bg-gray-50">
                    <button 
                        onClick={() => setInputMode('voice')}
                        className="p-2 mr-2 text-gray-500 hover:text-green-700 bg-gray-200 rounded-full transition"
                    >
                        <X size={20} />
                    </button>
                    {/* The Input Box - High contrast */}
                    <div className="flex-1 bg-white border-2 border-green-600 rounded-xl px-4 py-3 text-lg font-bold text-gray-900 shadow-sm flex items-center h-14">
                        {textInput}
                        <span className="w-0.5 h-6 bg-green-600 ml-1 animate-pulse"></span>
                    </div>
                    <button 
                        onClick={handleGo}
                        className="ml-3 w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-md active:scale-95 transition"
                    >
                        <Send size={20} />
                    </button>
                </div>
            )}

        </div>
        
        {/* Simulated Mobile Keyboard (Only visible in text mode) */}
        {inputMode === 'text' && (
            <MobileKeyboard 
                onHide={() => setInputMode('voice')} 
                onKeyPress={handleKeyPress}
                onDelete={handleDelete}
                onGo={handleGo}
            />
        )}
        
    </div>
    );
  };

  const KnowledgeCenter = () => (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col animate-fadeIn">
        <div className="flex items-center p-6 pt-8 gap-4">
            <button onClick={() => setCurrentView('ai-advisory')} className="text-green-900"><ArrowLeft size={24} /></button>
            <h1 className="text-xl font-bold text-green-900">Knowledge Center</h1>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400">Knowledge Center Content</div>
        <BottomNavigation />
      </div>
  );

  // --- View Controller ---
  return (
    <div className="font-sans text-gray-900 max-w-md mx-auto shadow-2xl relative min-h-screen bg-white overflow-hidden">
      {currentView === 'landing' && <LandingPage />}
      {currentView === 'signup' && <SignUpScreen />}
      {currentView === 'login' && <LoginScreen />}
      {currentView === 'forgot-password' && <ForgotPasswordScreen />}
      
      {/* Main Tab Views */}
      {currentView === 'home' && <HomeScreen />}
      {currentView === 'calendar' && <CalendarScreen />}
      {currentView === 'ai-advisory' && <AiAdvisoryScreen />}
      {currentView === 'field' && <FieldScreen />}
      {currentView === 'profile' && <ProfileScreen />}
      {currentView === 'community' && <CommunityScreen />}
      {currentView === 'market-prices' && <MarketPriceScreen />}

      {/* Sub Views */}
      {currentView === 'start-planting' && <StartPlantingScreen />}
      {currentView === 'field-detail' && <FieldDetailScreen />}
      {currentView === 'photo-advisory' && <PhotoAdvisory />}
      {currentView === 'voice-advisory' && <VoiceAdvisory />}
      {currentView === 'knowledge-center' && <KnowledgeCenter />}
      {currentView === 'tasks-management' && <TaskManagementScreen />}
      
      {/* Global Styles */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
        @keyframes wave {
            0%, 100% { height: 30%; }
            50% { height: 100%; }
        }
        @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default VACA_App;