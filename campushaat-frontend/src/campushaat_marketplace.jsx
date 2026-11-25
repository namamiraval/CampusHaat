import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Heart,
  MessageSquare,
  HelpCircle,
  Plus,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Lock,
  ArrowLeft,
  SlidersHorizontal,
  Edit3,
  Trash2,
  RefreshCw,
  Send,
  AlertTriangle,
  User,
  LogOut,
  Mail,
  KeyRound,
  FileText,
  ChevronRight,
  Flag,
  EyeOff,
  Check,
  X,
  Server,
  Sparkles,
  BookOpen,
  Calendar,
  Award,
  Info
} from 'lucide-react';

// ============================================================================
// 1. BRANDING & CUSTOM SVG LOGO (Matches user's CampusHaat logo)
// ============================================================================
const CampusHaatLogo = ({ className = "h-10" }) => (
  <svg
    viewBox="0 0 320 115"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="CampusHaat Logo"
  >
    {/* Left Person Silhouette (Forest Green #1B4D2E) */}
    <circle cx="126" cy="24" r="11" fill="#1B4D2E" />
    <path
      d="M104 54C104 42.5 113.5 36 125.5 36C133.5 36 139.5 39.2 143 44.5L135 50.5C132.5 47.2 129.2 45.5 125 45.5C118 45.5 113 50.5 113 57.5C113 60 113.7 62.2 114.8 64L106.5 67.5C104.9 63.6 104 59 104 54Z"
      fill="#1B4D2E"
    />

    {/* Right Person Silhouette (Campus Green #4F8F52) */}
    <circle cx="194" cy="24" r="11" fill="#4F8F52" />
    <path
      d="M216 54C216 42.5 206.5 36 194.5 36C186.5 36 180.5 39.2 177 44.5L185 50.5C187.5 47.2 190.8 45.5 195 45.5C202 45.5 207 50.5 207 57.5C207 60 206.3 62.2 205.2 64L213.5 67.5C215.1 63.6 216 59 216 54Z"
      fill="#4F8F52"
    />

    {/* Top Exchange Arrow (Left -> Right) */}
    <path
      d="M140 43C148 33 163 32 173 39L176 35L180 46L168 46L170.5 42.5C162 37.5 151 38.5 145 46.5L140 43Z"
      fill="#2F5D3A"
    />

    {/* Bottom Exchange Arrow (Right -> Left) */}
    <path
      d="M180 51C172 61 157 62 147 55L144 59L140 48L152 48L149.5 51.5C158 56.5 169 55.5 175 47.5L180 51Z"
      fill="#4F8F52"
    />

    {/* Pill Border with Top Gap for Figures */}
    <path
      d="M96 58H52C31.0132 58 14 73.2223 14 92C14 110.778 31.0132 108 52 108H268C288.987 108 306 110.778 306 92C306 73.2223 288.987 58 268 58H224"
      stroke="#2F5D3A"
      strokeWidth="3.5"
      strokeLinecap="round"
    />

    {/* Brand Typography: Campus (Forest Green) + Haat (Campus Green) */}
    <text
      x="160"
      y="94"
      textAnchor="middle"
      fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
      fontWeight="800"
      fontSize="35"
      letterSpacing="-0.8"
    >
      <tspan fill="#1B4D2E">Campus</tspan>
      <tspan fill="#4F8F52">Haat</tspan>
    </text>
  </svg>
);

// ============================================================================
// 2. CONFIGURABLE BACKEND API CLIENT (Ready for SQL + JWT Backend)
// ============================================================================
const DEFAULT_API_BASE = "http://localhost:8080/api";

class CampusHaatApiService {
  constructor() {
    this.baseUrl = localStorage.getItem("ch_api_base") || DEFAULT_API_BASE;
    this.liveMode = localStorage.getItem("ch_live_mode") === "true";
  }

  setConfig({ baseUrl, liveMode }) {
    if (baseUrl !== undefined) {
      this.baseUrl = baseUrl.replace(/\/$/, "");
      localStorage.setItem("ch_api_base", this.baseUrl);
    }
    if (liveMode !== undefined) {
      this.liveMode = liveMode;
      localStorage.setItem("ch_live_mode", String(this.liveMode));
    }
  }

  getToken() {
    return localStorage.getItem("ch_jwt_token");
  }

  setToken(token) {
    if (token) localStorage.setItem("ch_jwt_token", token);
    else localStorage.removeItem("ch_jwt_token");
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `API Error (${response.status})`);
    }
    return data;
  }

  async uploadImage(file) {
    if (!this.liveMode) {
      return {
        imageUrl: URL.createObjectURL(file),
      };
    }

    const token = this.getToken();

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${this.baseUrl}/products/images`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Image upload failed (${response.status})`);
    }

    return {
      imageUrl: new URL(data.imageUrl, this.baseUrl).toString(),
    };
  }

  // --- Auth & Email Verification Endpoints ---
    async register(payload) {
    if (!this.liveMode) {
      return {
        success: true,
        message: "OTP sent to university email",
        email: payload.email,
        university: payload.university,
      };
    }

    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        fullName: payload.name,
        email: payload.email,
        password: payload.password,
      }),
    });
  }

  async verifyOtp(payload) {
    if (!this.liveMode) {
      return {
        success: true,
        message: "Email verified successfully",
      };
    }

    return this.request("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({
        email: payload.email,
        otp: payload.otp,
      }),
    });
  }

  async resendOtp(email) {
    if (!this.liveMode) {
      return {
        success: true,
        message: "New 6-digit OTP dispatched.",
      };
    }

    return this.request(
      `/auth/resend-otp?email=${encodeURIComponent(email)}`,
      {
        method: "POST",
      }
    );
  }

  async login(credentials) {
    if (!this.liveMode) {
      const derivedName = credentials.email
        ? credentials.email
            .split("@")[0]
            .split(/[._-]/)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ")
        : "Aarav Patel";
      return {
        token: "demo.jwt.token.campushaat.verified",
        user: {
          id: "u-jordan",
          name: credentials.name || derivedName || "Aarav Patel",
          email: credentials.email || "aarav.patel@gujaratuniversity.ac.in",
          university: credentials.university || "Gujarat University",
          verified: true,
          role: "STUDENT",
          year: "3rd Year · B.Tech CS",
        },
      };
    }
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  // --- Product Listing CRUD & Search Endpoints ---
  async fetchProducts(params = {}) {
    if (!this.liveMode) return null; // Uses local initial + created state in Demo Mode
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    if (params.category && params.category !== "All categories") query.set("category", params.category);
    if (params.sort) query.set("sort", params.sort);
    return this.request(`/products?${query.toString()}`);
  }

  async createProduct(productData) {
    if (!this.liveMode) {
      return { ...productData, id: `p-${Date.now()}` };
    }
    return this.request("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id, updates) {
    if (!this.liveMode) {
      return { id, ...updates };
    }
    return this.request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteProduct(id) {
    if (!this.liveMode) {
      return { deleted: true, id };
    }
    return this.request(`/products/${id}`, {
      method: "DELETE",
    });
  }
}

const api = new CampusHaatApiService();

// Helper for Indian Rupee formatting (e.g. ₹1,200)
const formatINR = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const UNIVERSITIES_LIST = [
  "Gujarat University",
  "Nirma University",
  "IIT Gandhinagar",
  "Ahmedabad University",
  "PDPU / PDEU Gandhinagar",
  "DAIICT Gandhinagar",
];

// ============================================================================
// 3. CURATED SAMPLE DATA & STATIC IMAGES (Matches Figma Screenshots)
// ============================================================================
const SAMPLE_IMAGE_GALLERY = [
  {
    label: "Textbooks Stack",
    url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Desk Study Lamp",
    url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Oak Desk Chair",
    url: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Campus City Bike",
    url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Scientific Calculator",
    url: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Ceramic Mug Set",
    url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80",
  },
];

const CAMPUS_MEETING_POINTS = [
  {
    id: "mp-union",
    name: "Student Union · Main entrance",
    hours: "Mon–Fri · 9 am–6 pm",
    description: "Public entrance with seating nearby. Meet while the building is open.",
  },
  {
    id: "mp-library",
    name: "Main Library · Foyer",
    hours: "Mon–Fri · 9 am–5 pm",
    description: "Meet in the public foyer, away from quiet study areas. Confirm building access.",
  },
  {
    id: "mp-cafe",
    name: "Campus Café · Seating area",
    hours: "Mon–Fri · 10 am–4 pm",
    description: "Choose a visible table during opening hours. Keep entrances and walkways clear.",
  },
];

const CATEGORIES = [
  { name: "All categories", subs: [] },
  { name: "Books & Academics", subs: ["Textbooks", "Reference books", "Calculators"] },
  { name: "ReWear", subs: ["Hoodies & Jackets", "Lab Coats", "Formal Wear"] },
  { name: "Electronics", subs: ["Laptops & Monitors", "Audio", "Chargers & Cables"] },
  { name: "Hostel Essentials", subs: ["Lighting", "Furniture", "Kitchenware"] },
  { name: "Sports & Lifestyle", subs: ["Cycles", "Fitness", "Musical Instruments"] },
];

const INITIAL_PRODUCTS = [
  {
    id: "p-101",
    title: "Algorithms & Data Structures Bundle (3 Books)",
    category: "Books & Academics",
    subcategory: "Textbooks",
    price: 1200,
    condition: "Like New",
    conditionDesc: "Clean pages, no highlights or torn corners",
    listingType: "For sale",
    status: "Available",
    sellerId: "u-arjun",
    sellerName: "Arjun K.",
    sellerInitials: "AK",
    sellerYear: "Senior · 4th Year CSE",
    sellerJoined: "Aug 2025",
    sellerRating: 4.9,
    sellerReviewCount: 14,
    meetingPoint: "Main Library · Foyer",
    description:
      "Complete semester textbook set including CLRS, Operating Systems Concepts, and Discrete Mathematics. Great for 2nd and 3rd year CS peers.",
    images: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=900&q=80",
    ],
    createdAt: "2026-11-21",
    expiresAt: "Dec 21, 2026",
    enquiriesCount: 5,
    hiddenByMod: false,
  },
  {
    id: "p-102",
    title: "The late-night study lamp",
    category: "Hostel Essentials",
    subcategory: "Lighting",
    price: 650,
    condition: "Good",
    conditionDesc: "Fully functional, visible wear",
    listingType: "For sale",
    status: "Sold",
    soldDate: "Oct 28, 2026",
    sellerId: "u-maya",
    sellerName: "Maya R.",
    sellerInitials: "MR",
    sellerYear: "Senior · Architecture",
    sellerJoined: "Sep 2026",
    sellerRating: 4.9,
    sellerReviewCount: 12,
    meetingPoint: "Student Union · Main entrance",
    description:
      "Adjustable architect desk lamp in sage-forest matte finish. Warm LED bulb included—ideal for hostel desks without waking roommates.",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=900&q=80",
    ],
    createdAt: "2026-10-15",
    expiresAt: "Nov 15, 2026",
    enquiriesCount: 7,
    hiddenByMod: false,
  },
  {
    id: "p-103",
    title: "Oak desk chair",
    category: "Hostel Essentials",
    subcategory: "Furniture",
    price: 1850,
    condition: "Like New",
    conditionDesc: "Sturdy solid wood frame, zero wobble",
    listingType: "For sale",
    status: "Available",
    sellerId: "u-jordan",
    sellerName: "Aarav Patel",
    sellerInitials: "AP",
    sellerYear: "3rd Year · B.Tech CS",
    sellerJoined: "Aug 2025",
    sellerRating: 5.0,
    sellerReviewCount: 6,
    meetingPoint: "Student Union · Main entrance",
    description:
      "Ergonomic solid oak study chair used for two semesters in North Hostel. Moving off-campus next month, happy to help carry to your dorm.",
    images: [
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=900&q=80",
    ],
    createdAt: "2026-11-18",
    expiresAt: "Nov 27, 2026",
    expiringSoon: true,
    enquiriesCount: 4,
    hiddenByMod: false,
  },
  {
    id: "p-104",
    title: "Ceramic mug set (Pair)",
    category: "Hostel Essentials",
    subcategory: "Kitchenware",
    price: 420,
    condition: "Good",
    conditionDesc: "No chips or cracks, microwave safe",
    listingType: "For sale",
    status: "Reserved",
    reservedFor: "Ellis T.",
    sellerId: "u-jordan",
    sellerName: "Aarav Patel",
    sellerInitials: "AP",
    sellerYear: "3rd Year · B.Tech CS",
    sellerJoined: "Aug 2025",
    sellerRating: 5.0,
    sellerReviewCount: 6,
    meetingPoint: "Campus Café · Seating area",
    description:
      "Handcrafted stoneware mugs for late-night chai and coffee sessions.",
    images: [
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80",
    ],
    createdAt: "2026-11-14",
    expiresAt: "Dec 18, 2026",
    enquiriesCount: 3,
    hiddenByMod: false,
  },
  {
    id: "p-105",
    title: "City bike with front basket",
    category: "Sports & Lifestyle",
    subcategory: "Cycles",
    price: 4500,
    condition: "Good",
    conditionDesc: "Brakes tuned, smooth tires, lock included",
    listingType: "For sale",
    status: "Available",
    sellerId: "u-sam",
    sellerName: "Sam W.",
    sellerInitials: "SW",
    sellerYear: "2nd Year · Mechanical",
    sellerJoined: "Sep 2026",
    sellerRating: 4.3,
    sellerReviewCount: 3,
    meetingPoint: "Student Union · Main entrance",
    description:
      "Lightweight campus commuter bicycle with detachable front wicker basket and U-lock.",
    images: [
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=80",
    ],
    createdAt: "2026-11-22",
    expiresAt: "Dec 22, 2026",
    enquiriesCount: 6,
    hiddenByMod: false,
  },
  {
    id: "p-106",
    title: "Casio FX-991EX Scientific Calculator",
    category: "Books & Academics",
    subcategory: "Calculators",
    price: 750,
    condition: "Like New",
    conditionDesc: "Original slide cover, fresh battery",
    listingType: "For sale",
    status: "Available",
    sellerId: "u-priya",
    sellerName: "Priya N.",
    sellerInitials: "PN",
    sellerYear: "Senior · Electronics",
    sellerJoined: "Aug 2025",
    sellerRating: 4.8,
    sellerReviewCount: 9,
    meetingPoint: "Main Library · Foyer",
    description:
      "Approved for all university engineering & stats exams. Selling as I finished my final quantitative electives.",
    images: [
      "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=900&q=80",
    ],
    createdAt: "2026-11-23",
    expiresAt: "Dec 23, 2026",
    enquiriesCount: 2,
    hiddenByMod: false,
  },
];

const INITIAL_CONVERSATIONS = [
  {
    id: "conv-1",
    peerName: "Maya R.",
    peerInitials: "MR",
    peerRole: "Senior · Architecture",
    productId: "p-102",
    productTitle: "The late-night study lamp",
    productPrice: 650,
    productImage:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=300&q=80",
    status: "Completed",
    selectedMeetingPoint: "Student Union · Main entrance",
    unread: false,
    messages: [
      {
        id: "m-1",
        sender: "me",
        text: "Hi Maya! Is the study lamp still available before midterms?",
        time: "10:14 AM",
      },
      {
        id: "m-2",
        sender: "peer",
        text: "Hey! Yes it is. I can meet at the Student Union main entrance at 4 pm today.",
        time: "10:18 AM",
      },
      {
        id: "m-3",
        sender: "me",
        text: "Confirmed! Tested the bulb and everything works great. Thanks again!",
        time: "4:12 PM",
      },
    ],
  },
  {
    id: "conv-2",
    peerName: "Sam W.",
    peerInitials: "SW",
    peerRole: "2nd Year · Mechanical",
    productId: "p-105",
    productTitle: "City bike with front basket",
    productPrice: 4500,
    productImage:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=300&q=80",
    status: "Active",
    selectedMeetingPoint: "Student Union · Main entrance",
    unread: true,
    messages: [
      {
        id: "m-21",
        sender: "me",
        text: "Hi Sam, can I inspect the brakes near the Student Union today?",
        time: "9:40 AM",
      },
      {
        id: "m-22",
        sender: "peer",
        text: "Can you send a ₹500 deposit via external UPI link to hold the bike before we meet?",
        time: "9:55 AM",
      },
    ],
  },
  {
    id: "conv-3",
    peerName: "Arjun K.",
    peerInitials: "AK",
    peerRole: "Senior · 4th Year CSE",
    productId: "p-101",
    productTitle: "Algorithms & Data Structures Bundle (3 Books)",
    productPrice: 1200,
    productImage:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80",
    status: "Active",
    selectedMeetingPoint: "Main Library · Foyer",
    unread: false,
    messages: [
      {
        id: "m-31",
        sender: "me",
        text: "Hey Arjun, do these include the 4th edition CLRS?",
        time: "Yesterday",
      },
      {
        id: "m-32",
        sender: "peer",
        text: "Yes! All 3 books are in the bundle. Happy to hand them over in the Main Library foyer.",
        time: "Yesterday",
      },
    ],
  },
];

const INITIAL_REVIEWS = [
  {
    id: "rev-1",
    sellerId: "u-maya",
    reviewerName: "Aisha P.",
    reviewerInitials: "AP",
    date: "Oct 20",
    itemBought: "Bought a desk organizer",
    rating: 5,
    comment: "Great communication and the item was clean and just as pictured.",
  },
  {
    id: "rev-2",
    sellerId: "u-maya",
    reviewerName: "Leo C.",
    reviewerInitials: "LC",
    date: "Oct 12",
    itemBought: "Bought a coffee press",
    rating: 5,
    comment: "Maya arrived on time and let me check everything before paying.",
  },
];

const INITIAL_REPORTS = [
  {
    id: "Q-1042",
    reason: "Suspected scam",
    targetType: "Conversation & Listing",
    targetTitle: "City bike · ₹4,500",
    productId: "p-105",
    reportedUser: "Sam W.",
    reporterName: "Aarav P.",
    submittedAt: "Nov 1, 2026 · 10:02 am",
    status: "Under review",
    priority: "High priority",
    statement:
      "The seller asked me to send a ₹500 deposit to hold the bike before we meet, then sent an external payment link. I haven't sent any money. Please review the messages.",
    evidence: "payment-request.png · Relevant conversation included",
    modDecision: {
      contentAction: "Keep content visible",
      accountAction: "No account action",
      notes: "",
    },
    activity: [
      {
        step: "01",
        title: "Report received · Nov 1 · 10:02 am",
        detail: "Report received. Case reference Q-1042 issued.",
      },
      {
        step: "02",
        title: "Under review · Nov 1 · 11:15 am",
        detail: "A moderator is reviewing the listing, messages and supplied evidence.",
      },
    ],
  },
];

// ============================================================================
// 4. MAIN APPLICATION COMPONENT
// ============================================================================
export default function App() {
  // --- Navigation & Mode State ---
  const [activeView, setActiveView] = useState("marketplace"); // marketplace | detail | saved | messages | support | my-listings | profile | report-form | report-status | review | admin-mod
  const [isAdminView, setIsAdminView] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showApiConfigModal, setShowApiConfigModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [toast, setToast] = useState(null);

  // --- API Config State ---
  const [apiBaseUrl, setApiBaseUrl] = useState(api.baseUrl);
  const [liveApiMode, setLiveApiMode] = useState(api.liveMode);

  // --- Auth & User Session State (Persisted in localStorage so Login/Logout works cleanly) ---
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("ch_current_user");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore storage errors
    }
    return {
      id: "u-jordan",
      name: "Aarav Patel",
      initials: "AP",
      email: "aarav.patel@gujaratuniversity.ac.in",
      university: "Gujarat University",
      verified: true,
      year: "3rd Year · B.Tech CS",
    };
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem("ch_current_user", JSON.stringify(currentUser));
      } else {
        localStorage.removeItem("ch_current_user");
      }
    } catch {
      // ignore storage errors
    }
  }, [currentUser]);

  // --- Marketplace Data State ---
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [wishlistIds, setWishlistIds] = useState(["p-101", "p-106"]);
  const [selectedProductId, setSelectedProductId] = useState("p-101");
  const [editingProduct, setEditingProduct] = useState(null);

  // --- Filter & Search State (INR Budget) ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All categories");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [maxPrice, setMaxPrice] = useState(50000);
  const [sortBy, setSortBy] = useState("newest"); // newest | price_asc | price_desc

  // --- Messaging, Reviews & Moderation State ---
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState("conv-1");
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [selectedReportId, setSelectedReportId] = useState("Q-1042");

  // --- Report Context State ---
  const [reportContext, setReportContext] = useState({
    targetTitle: "City bike · ₹4,500",
    reportedUser: "Sam W.",
    productId: "p-105",
  });

  // --- Helper: Logout Handler ---
  const handleLogout = () => {
    api.setToken(null);
    setCurrentUser(null);
    setShowProfileMenu(false);
    setIsAdminView(false);
    setActiveView("marketplace");
    triggerToast("Logged out of CampusHaat. Sign in anytime with your university ID.");
  };

  // --- Helper: Toast Notification ---
  const triggerToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3600);
  };

  // --- Sync with Live Backend if Enabled ---
  useEffect(() => {
    if (!liveApiMode) return;
    api
      .fetchProducts({ q: searchQuery, category: selectedCategory, sort: sortBy })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch((err) => {
        triggerToast(`Backend unreachable (${err.message}). Showing cached data.`, "warning");
      });
  }, [liveApiMode]);

  // --- Filtered & Sorted Marketplace Listings ---
  console.log("ALL PRODUCTS:", products);
  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => !item.hiddenByMod)
      .filter((item) => {
        if (selectedCategory !== "All categories" && item.category !== selectedCategory) {
          return false;
        }
        if (selectedSubcategory !== "All" && item.subcategory !== selectedSubcategory) {
          return false;
        }
        if (selectedCondition !== "All" && item.condition !== selectedCondition) {
          return false;
        }
        if (item.price > maxPrice) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.sellerName.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        String(b.id).localeCompare(String(a.id))
      });
  }, [
    products,
    selectedCategory,
    selectedSubcategory,
    selectedCondition,
    maxPrice,
    searchQuery,
    sortBy,
  ]);

  // --- Wishlist Toggle ---
  const toggleWishlist = (productId, e) => {
    if (e) e.stopPropagation();
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      triggerToast(exists ? "Removed from Saved items" : "Saved to your campus wishlist");
      return updated;
    });
  };

  // --- Open Product Details ---
  const openProductDetail = (productId) => {
    setSelectedProductId(productId);
    setActiveView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- Start or Open Conversation with Seller ---
  const handleStartMessage = (product) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    const existing = conversations.find((c) => c.productId === product.id);
    if (existing) {
      setActiveConvId(existing.id);
    } else {
      const newConv = {
        id: `conv-${Date.now()}`,
        peerName: product.sellerName,
        peerInitials: product.sellerInitials,
        peerRole: product.sellerYear,
        productId: product.id,
        productTitle: product.title,
        productPrice: product.price,
        productImage: product.images[0],
        status: "Active",
        selectedMeetingPoint: product.meetingPoint || "Student Union · Main entrance",
        unread: false,
        messages: [
          {
            id: `m-${Date.now()}`,
            sender: "me",
            text: `Hi ${product.sellerName}! Is "${product.title}" still available on campus?`,
            time: "Just now",
          },
        ],
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(newConv.id);
    }
    setActiveView("messages");
  };

  // --- CRUD Handlers for Listings ---
  const handleSaveListing = async (formData) => {
    try {
      const categoryMap = {
        "Books & Academics": "BOOKS",
        "ReWear": "CLOTHING",
        "Electronics": "ELECTRONICS",
        "Hostel Essentials": "HOSTEL_ESSENTIALS",
        "Sports & Lifestyle": "SPORTS",
      };

      const conditionMap = {
        "New": "NEW",
        "Like New": "LIKE_NEW",
        "Good": "GOOD",
        "Fair": "FAIR",
      };

      const category =
        categoryMap[formData.category] || formData.category.toUpperCase();

      const condition =
        conditionMap[formData.condition] || formData.condition.toUpperCase();

      const imageUrl = formData.images?.[0] || "";

      const sellerName = currentUser?.name;
      const sellerEmail = currentUser?.email;

      if (!sellerName || !sellerEmail) {
        throw new Error("Please log in before creating a listing.");
      }

      const productPayload = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        category,
        condition,
        sellerName,
        sellerEmail,
        meetingPoint: formData.meetingPoint,
        imageUrl,
      };

      if (editingProduct) {
        const updated = await api.updateProduct(
          editingProduct.id,
          productPayload
        );

        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? { ...p, ...formData, ...updated, images: imageUrl ? [imageUrl] : [] }
              : p
          )
        );

        triggerToast("Listing updated successfully");
      } else {
        const created = await api.createProduct(productPayload);

        setProducts((prev) => [
          { ...created, ...formData, images: imageUrl ? [imageUrl] : [] },
          ...prev,
        ]);

        triggerToast("Your item is now live on CampusHaat!");
      }

      setShowSellModal(false);
      setEditingProduct(null);

    } catch (err) {
      triggerToast(err.message, "error");
    }
  };

  const handleUpdateListingStatus = async (productId, newStatus) => {
    await api.updateProduct(productId, { status: newStatus });
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              status: newStatus,
              soldDate: newStatus === "Sold" ? "Nov 24, 2026" : p.soldDate,
            }
          : p
      )
    );
    triggerToast(`Listing marked as ${newStatus}`);
  };

  const handleDeleteListing = async (productId) => {
    await api.deleteProduct(productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    triggerToast("Listing removed");
  };

  // --- Submit New Report ---
  const handleSubmitReport = ({ reason, statement }) => {
    const newId = `Q-${Math.floor(1043 + Math.random() * 900)}`;
    const newReport = {
      id: newId,
      reason,
      targetType: "Listing / Conversation",
      targetTitle: reportContext.targetTitle,
      productId: reportContext.productId,
      reportedUser: reportContext.reportedUser,
      reporterName: currentUser?.name || "Jordan L.",
      submittedAt: "Nov 24, 2026 · Just now",
      status: "Under review",
      priority: "High priority",
      statement,
      evidence: "Attached conversation log",
      modDecision: {
        contentAction: "Keep content visible",
        accountAction: "No account action",
        notes: "",
      },
      activity: [
        {
          step: "01",
          title: "Report received · Just now",
          detail: `Report received. Case reference ${newId} issued.`,
        },
        {
          step: "02",
          title: "Under review · Assigned to Trust & Safety",
          detail: "A campus moderator is reviewing the listing and conversation.",
        },
      ],
    };
    setReports((prev) => [newReport, ...prev]);
    setSelectedReportId(newId);
    setActiveView("report-status");
    triggerToast(`Report ${newId} submitted to Trust & Safety`);
  };

  // --- Apply Admin Moderation Decision ---
  const handleApplyModDecision = (reportId, decision) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;
        if (r.productId) {
          if (decision.contentAction === "Hide listing" || decision.contentAction === "Remove reported content") {
            setProducts((prods) =>
              prods.map((p) => (p.id === r.productId ? { ...p, hiddenByMod: true } : p))
            );
          } else {
            setProducts((prods) =>
              prods.map((p) => (p.id === r.productId ? { ...p, hiddenByMod: false } : p))
            );
          }
        }
        return {
          ...r,
          status: "Resolved",
          modDecision: decision,
          activity: [
            ...r.activity,
            {
              step: "03",
              title: `Action applied · ${decision.contentAction}`,
              detail: `Account action: ${decision.accountAction}. ${decision.notes || ""}`,
            },
          ],
        };
      })
    );
    triggerToast(`Moderation decision applied to ${reportId}`);
  };

  const unreadCount = conversations.filter((c) => c.unread).length;
  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const selectedReport = reports.find((r) => r.id === selectedReportId) || reports[0];
  const activeUniversityName = currentUser?.university || "Select Your University";

  return (
    <div className="min-h-screen bg-[#F7FAF0] text-[#18261D] font-sans selection:bg-[#A7C957]/40">
      {/* ====================================================================
          TOP NAVIGATION BAR (Matches Figma Header + CampusHaat Branding)
      ==================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#2F5D3A]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 py-2.5 flex items-center justify-between gap-3">
          {/* Left: CampusHaat Logo + Dynamic University Badge */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => {
                setIsAdminView(false);
                setActiveView("marketplace");
              }}
              className="flex items-center focus:outline-none group"
            >
              <CampusHaatLogo className="h-10 sm:h-11 w-auto transition-transform group-hover:scale-[1.02]" />
            </button>

            <div className="hidden md:flex flex-col pl-4 border-l border-[#2F5D3A]/20">
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#1B4D2E]">
                {isAdminView
                  ? "TRUST & SAFETY"
                  : currentUser
                  ? activeUniversityName
                  : "CAMPUS MARKETPLACE · GUEST"}
              </span>
              <span className="text-xs text-[#2F5D3A]/75">
                {isAdminView
                  ? "Restricted staff access"
                  : currentUser
                  ? "Verified student community"
                  : "Sign in to verify your university"}
              </span>
            </div>
          </div>

          {/* Center/Right Navigation Links */}
          {!isAdminView ? (
            <nav className="flex items-center gap-1 sm:gap-5">
              <button
                onClick={() => setActiveView("marketplace")}
                className={`px-2.5 py-1.5 text-sm font-medium transition relative ${
                  activeView === "marketplace" || activeView === "detail"
                    ? "text-[#1B4D2E] font-semibold"
                    : "text-[#2F5D3A]/75 hover:text-[#1B4D2E]"
                }`}
              >
                Marketplace
                {(activeView === "marketplace" || activeView === "detail") && (
                  <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-[#1B4D2E] rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveView("saved")}
                className={`px-2.5 py-1.5 text-sm font-medium transition relative flex items-center gap-1.5 ${
                  activeView === "saved"
                    ? "text-[#1B4D2E] font-semibold"
                    : "text-[#2F5D3A]/75 hover:text-[#1B4D2E]"
                }`}
              >
                <span>Saved</span>
                {wishlistIds.length > 0 && (
                  <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-[#A7C957]/40 text-[#1B4D2E]">
                    {wishlistIds.length}
                  </span>
                )}
                {activeView === "saved" && (
                  <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-[#1B4D2E] rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveView("messages")}
                className={`px-2.5 py-1.5 text-sm font-medium transition relative flex items-center gap-1.5 ${
                  activeView === "messages" || activeView === "review"
                    ? "text-[#1B4D2E] font-semibold"
                    : "text-[#2F5D3A]/75 hover:text-[#1B4D2E]"
                }`}
              >
                <span>Messages</span>
                {unreadCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[#835B2A]" />
                )}
                {(activeView === "messages" || activeView === "review") && (
                  <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-[#1B4D2E] rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveView("support")}
                className={`hidden sm:inline-flex px-2.5 py-1.5 text-sm font-medium transition relative ${
                  activeView === "support" ||
                  activeView === "report-form" ||
                  activeView === "report-status"
                    ? "text-[#1B4D2E] font-semibold"
                    : "text-[#2F5D3A]/75 hover:text-[#1B4D2E]"
                }`}
              >
                Support
                {(activeView === "support" ||
                  activeView === "report-form" ||
                  activeView === "report-status") && (
                  <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-[#1B4D2E] rounded-full" />
                )}
              </button>

              <button
                onClick={() => {
                  if (!currentUser) {
                    setShowAuthModal(true);
                    return;
                  }
                  setEditingProduct(null);
                  setShowSellModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1B4D2E] hover:bg-[#153d24] text-white text-xs sm:text-sm font-semibold shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Sell an item</span>
              </button>

              {/* Profile / Auth Avatar Pill + Quick Logout Dropdown */}
              {currentUser ? (
                <div className="relative flex items-center gap-2">
                  <button
                    onClick={() => setActiveView("my-listings")}
                    title="My Listings"
                    className="hidden lg:inline-flex px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#1B4D2E] bg-[#F7FAF0] border border-[#2F5D3A]/20 hover:bg-[#A7C957]/25 transition"
                  >
                    My listings
                  </button>
                  <button
                    onClick={() => setShowProfileMenu((prev) => !prev)}
                    title={`${currentUser.name} · ${currentUser.university}`}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border transition cursor-pointer ${
                      activeView === "profile" || showProfileMenu
                        ? "bg-[#1B4D2E] text-white border-[#1B4D2E]"
                        : "bg-[#EAEFE0] text-[#1B4D2E] border-[#2F5D3A]/25 hover:bg-[#A7C957]/35"
                    }`}
                  >
                    {currentUser.initials}
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 top-12 w-60 rounded-2xl bg-white border border-[#2F5D3A]/20 shadow-xl p-2 z-50">
                      <div className="px-3 py-2 border-b border-[#2F5D3A]/10">
                        <p className="text-xs font-bold text-[#18261D] truncate">
                          {currentUser.name}
                        </p>
                        <p className="text-[11px] font-semibold text-[#4F8F52] truncate">
                          {currentUser.university}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setActiveView("profile");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-[#18261D] hover:bg-[#F7FAF0] mt-1 flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5 text-[#1B4D2E]" />
                        Account & University Profile
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setActiveView("my-listings");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-[#18261D] hover:bg-[#F7FAF0] flex items-center gap-2"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[#1B4D2E]" />
                        My Listings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#835B2A] hover:bg-[#835B2A]/10 mt-1 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-3.5 py-2 rounded-xl border border-[#2F5D3A] bg-white text-[#1B4D2E] text-sm font-semibold hover:bg-[#1B4D2E] hover:text-white transition cursor-pointer"
                >
                  Log in / Join
                </button>
              )}
            </nav>
          ) : (
            /* Admin Moderation Top Bar */
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-[#1B4D2E] border-b-2 border-[#1B4D2E] pb-1">
                Reports ({reports.length})
              </span>
              <button
                onClick={() => {
                  setIsAdminView(false);
                  setActiveView("marketplace");
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#1B4D2E] text-white text-xs font-semibold hover:bg-[#153d24] transition"
              >
                Exit Trust & Safety
              </button>
            </div>
          )}
        </div>

        {/* Evaluator / Developer Utility Strip (API Mode + Trust & Safety Switcher) */}
        <div className="bg-[#EEF4E4] border-t border-[#2F5D3A]/10 px-4 py-1.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 font-medium text-[#1B4D2E]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    liveApiMode ? "bg-[#4F8F52] animate-pulse" : "bg-[#835B2A]"
                  }`}
                />
                {liveApiMode ? `Live SQL API (${apiBaseUrl})` : "Prototype Demo Mode (JWT + CRUD Ready)"}
              </span>
              <button
                onClick={() => setShowApiConfigModal(true)}
                className="underline text-[#2F5D3A] hover:text-[#1B4D2E] font-medium"
              >
                Configure Backend API
              </button>
            </div>

            <div className="flex items-center gap-3">
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="text-[#835B2A] hover:underline font-semibold"
                >
                  Log out ({currentUser.name})
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-[#1B4D2E] hover:underline font-semibold"
                >
                  Student Log in & 6-Digit OTP
                </button>
              )}
              <span className="text-[#2F5D3A]/30">|</span>
              <button
                onClick={() => {
                  setIsAdminView(!isAdminView);
                  setActiveView(!isAdminView ? "admin-mod" : "marketplace");
                }}
                className="inline-flex items-center gap-1 font-semibold text-[#835B2A] hover:underline"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                {isAdminView ? "Switch to Student Marketplace" : "Trust & Safety Admin View"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ====================================================================
          TOAST BANNER
      ==================================================================== */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#1B4D2E] text-white text-sm font-medium shadow-lg border border-[#A7C957]/40 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#A7C957] shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* ====================================================================
          MAIN CONTENT ROUTER
      ==================================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Signed-Out University Banner Prompt */}
        {!currentUser && !isAdminView && (
          <div className="mb-6 rounded-2xl bg-[#1B4D2E] text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#A7C957]">
                SIGNED OUT · BROWSE PREVIEW
              </p>
              <h2 className="text-base sm:text-lg font-bold mt-0.5">
                Log in with your university email to unlock your campus marketplace
              </h2>
              <p className="text-xs text-white/80 mt-0.5">
                Verify your student status to list items, message peers, and see your
                university’s campus feed.
              </p>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-5 py-2.5 rounded-xl bg-[#A7C957] hover:bg-[#97ba48] text-[#18261D] text-xs font-extrabold shrink-0 transition cursor-pointer"
            >
              Log in / Register with OTP
            </button>
          </div>
        )}

        {/* 1. MARKETPLACE BROWSE & CATEGORY VIEW (Matches Screenshot 13) */}
        {activeView === "marketplace" && !isAdminView && (
          <div className="space-y-6">
            {/* Hero Banner */}
            <div className="rounded-2xl bg-[#EAEFE0] border border-[#2F5D3A]/15 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-7 p-6 sm:p-9 flex flex-col justify-center">
                <span className="text-xs font-bold tracking-wider uppercase text-[#1B4D2E] mb-2">
                  {currentUser
                    ? `${activeUniversityName} · ${selectedCategory}`
                    : selectedCategory === "All categories"
                    ? "CAMPUS CIRCULAR MARKETPLACE"
                    : selectedCategory}
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#18261D] tracking-tight mb-2.5">
                  Less spend. More learning.
                </h1>
                <p className="text-sm sm:text-base text-[#2F5D3A]/85 max-w-xl mb-5">
                  Buy, sell, and pass on textbooks, hostel gear, cycles, and electronics
                  with verified peers, juniors, and seniors at{" "}
                  <strong className="text-[#1B4D2E]">
                    {currentUser ? activeUniversityName : "your university"}
                  </strong>
                  .
                </p>
                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#A7C957]/35 text-[#1B4D2E] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {currentUser
                      ? `${activeUniversityName} students only`
                      : "Verified university students only"}
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-white/80 text-[#2F5D3A] font-medium">
                    Buy, sell & exchange
                  </span>
                </div>
              </div>
              <div className="lg:col-span-5 h-52 lg:h-auto relative">
                <img
                  src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80"
                  alt="Campus textbooks and study desk"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Search Bar Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#2F5D3A]/60 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${selectedCategory} by title, author, ISBN or keyword...`}
                  className="w-full pl-11 pr-14 py-3 rounded-xl bg-white border border-[#2F5D3A]/20 text-sm focus:outline-none focus:border-[#1B4D2E] shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#2F5D3A]/60 hover:text-[#1B4D2E]"
                  >
                    Clear
                  </button>
                )}
              </div>
              <button
                onClick={() => triggerToast(`Showing ${filteredProducts.length} campus listings`)}
                className="px-6 py-3 rounded-xl bg-[#1B4D2E] hover:bg-[#153d24] text-white text-sm font-semibold shadow-sm transition shrink-0"
              >
                Search campus
              </button>
            </div>

            {/* Subcategory Chips Row */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setSelectedCategory("All categories");
                  setSelectedSubcategory("All");
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                  selectedCategory === "All categories"
                    ? "bg-[#1B4D2E] text-white border-[#1B4D2E]"
                    : "bg-white text-[#2F5D3A] border-[#2F5D3A]/20 hover:border-[#1B4D2E]"
                }`}
              >
                ← All categories
              </button>

              {(
                CATEGORIES.find((c) => c.name === selectedCategory)?.subs || [
                  "Textbooks",
                  "Reference books",
                  "Calculators",
                ]
              ).map((sub) => {
                const count = products.filter(
                  (p) => !p.hiddenByMod && p.subcategory === sub
                ).length;
                const active = selectedSubcategory === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubcategory(active ? "All" : sub)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                      active
                        ? "bg-[#1B4D2E] text-white border-[#1B4D2E]"
                        : "bg-white text-[#2F5D3A] border-[#2F5D3A]/20 hover:border-[#1B4D2E]"
                    }`}
                  >
                    {sub} · {count}
                  </button>
                );
              })}
            </div>

            {/* Sidebar + Product Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 pt-2">
              {/* Left Filter Sidebar ("Make it your find") */}
              <aside className="lg:col-span-3 space-y-6">
                <div className="bg-white rounded-2xl p-5 border border-[#2F5D3A]/15 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-base text-[#18261D]">Make it your find</h2>
                    <SlidersHorizontal className="w-4 h-4 text-[#2F5D3A]" />
                  </div>

                  {/* Category Checkboxes */}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#2F5D3A]/70 mb-2.5">
                      CATEGORY
                    </p>
                    <div className="space-y-2">
                      {CATEGORIES.map((cat) => {
                        const checked = selectedCategory === cat.name;
                        return (
                          <label
                            key={cat.name}
                            onClick={() => {
                              setSelectedCategory(cat.name);
                              setSelectedSubcategory("All");
                            }}
                            className="flex items-center gap-2.5 text-sm cursor-pointer group"
                          >
                            <span
                              className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                                checked
                                  ? "bg-[#1B4D2E] border-[#1B4D2E] text-white"
                                  : "border-[#2F5D3A]/35 bg-white group-hover:border-[#1B4D2E]"
                              }`}
                            >
                              {checked && <Check className="w-3 h-3 stroke-[3]" />}
                            </span>
                            <span
                              className={
                                checked ? "font-semibold text-[#1B4D2E]" : "text-[#2F5D3A]"
                              }
                            >
                              {cat.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Condition Filter */}
                  <div className="pt-3 border-t border-[#2F5D3A]/10">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#2F5D3A]/70 mb-2.5">
                      CONDITION
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {["All", "Like New", "Good"].map((cond) => (
                        <button
                          key={cond}
                          onClick={() => setSelectedCondition(cond)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                            selectedCondition === cond
                              ? "bg-[#4F8F52] text-white border-[#4F8F52]"
                              : "bg-[#F7FAF0] text-[#2F5D3A] border-[#2F5D3A]/20"
                          }`}
                        >
                          {cond}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Max Price Slider (INR) */}
                  <div className="pt-3 border-t border-[#2F5D3A]/10">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold uppercase tracking-wider text-[#2F5D3A]/70">
                        MAX BUDGET
                      </span>
                      <span className="font-bold text-[#835B2A]">
                        Under {formatINR(maxPrice)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="200"
                      max="5000"
                      step="100"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-[#1B4D2E]"
                    />
                  </div>
                </div>
              </aside>

              {/* Right Results Area */}
              <section className="lg:col-span-9 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-[#18261D]">{selectedCategory}</h2>
                    <p className="text-xs text-[#2F5D3A]/75">
                      {filteredProducts.length} result{filteredProducts.length === 1 ? "" : "s"} ·
                      Under {formatINR(maxPrice)} ·{" "}
                      {currentUser ? activeUniversityName : "Verified Campus Peers"}
                    </p>
                  </div>

                  {/* Sort Pills */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-[#2F5D3A]/70 mr-1">Sort by</span>
                    {[
                      { id: "newest", label: "Newest listings" },
                      { id: "price_asc", label: "Price: low to high" },
                      { id: "price_desc", label: "Price: high to low" },
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSortBy(s.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                          sortBy === s.id
                            ? "bg-[#1B4D2E] text-white border-[#1B4D2E]"
                            : "bg-white text-[#2F5D3A] border-[#2F5D3A]/20 hover:border-[#1B4D2E]"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Cards Grid */}
                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-2xl p-10 text-center border border-[#2F5D3A]/15">
                    <p className="font-semibold text-[#18261D] mb-1">
                      No campus listings match these filters
                    </p>
                    <p className="text-xs text-[#2F5D3A]/75 mb-4">
                      Try clearing your search or switching back to All categories.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategory("All categories");
                        setSelectedSubcategory("All");
                        setSelectedCondition("All");
                        setMaxPrice(50000);
                        setSearchQuery("");
                      }}
                      className="px-4 py-2 rounded-xl bg-[#1B4D2E] text-white text-xs font-semibold"
                    >
                      Reset all filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredProducts.map((product) => {
                      const isSaved = wishlistIds.includes(product.id);
                      const isSold = product.status === "Sold";
                      return (
                        <div
                          key={product.id}
                          onClick={() => openProductDetail(product.id)}
                          className="group bg-white rounded-2xl border border-[#2F5D3A]/15 overflow-hidden hover:border-[#1B4D2E]/45 hover:shadow-md transition cursor-pointer flex flex-col"
                        >
                          {/* Image Wrapper */}
                          <div className="relative h-52 bg-[#EAEFE0] overflow-hidden">
                            {(product.images?.[0] || product.imageUrl) ? (
                              <img
                                src={product.images?.[0] || product.imageUrl}
                                alt={product.title}
                                className={`w-full h-full object-cover group-hover:scale-105 transition duration-300 ${
                                  isSold ? "opacity-80" : ""
                                }`}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                                No image available
                              </div>
                            )}
                          
                            {/* Status Pill */}
                            <span
                              className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                isSold
                                  ? "bg-[#1B4D2E] text-white"
                                  : product.status === "Reserved"
                                  ? "bg-[#F3E5B5] text-[#835B2A]"
                                  : "bg-white/95 text-[#1B4D2E]"
                              }`}
                            >
                              {product.status}
                            </span>

                            {/* Wishlist Heart Button */}
                            <button
                              onClick={(e) => toggleWishlist(product.id, e)}
                              aria-label="Save item"
                              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 hover:bg-white flex items-center justify-center shadow-sm transition"
                            >
                              <Heart
                                className={`w-4 h-4 transition ${
                                  isSaved
                                    ? "fill-[#835B2A] text-[#835B2A]"
                                    : "text-[#1B4D2E]"
                                }`}
                              />
                            </button>
                          </div>

                          {/* Card Body */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div>
                              <div className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wide text-[#4F8F52] mb-1">
                                <span>{product.subcategory}</span>
                                <span className="text-[#835B2A]">{product.condition}</span>
                              </div>
                              <h3 className="font-bold text-base text-[#18261D] line-clamp-1 group-hover:text-[#1B4D2E]">
                                {product.title}
                              </h3>
                            </div>

                            <div className="pt-2 border-t border-[#2F5D3A]/10 flex items-center justify-between">
                              <span className="text-lg font-extrabold text-[#835B2A]">
                                {formatINR(product.price)}
                              </span>
                              <div className="flex items-center gap-1.5 text-xs text-[#2F5D3A]">
                                <span className="font-medium">{product.sellerName}</span>
                                <span className="inline-flex items-center gap-0.5 font-semibold text-[#1B4D2E]">
                                  <Star className="w-3.5 h-3.5 fill-[#835B2A] text-[#835B2A]" />
                                  {product.sellerRating}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* 2. PRODUCT DETAIL VIEW (Matches Screenshot 4: Active & Sold States) */}
        {activeView === "detail" && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            isSaved={wishlistIds.includes(selectedProduct.id)}
            onToggleSave={() => toggleWishlist(selectedProduct.id)}
            onBack={() => setActiveView("marketplace")}
            onMessageSeller={() => handleStartMessage(selectedProduct)}
            onReportListing={() => {
              setReportContext({
                targetTitle: `${selectedProduct.title} · ${formatINR(selectedProduct.price)}`,
                reportedUser: selectedProduct.sellerName,
                productId: selectedProduct.id,
              });
              setActiveView("report-form");
            }}
            onOpenReviews={() => setActiveView("review")}
          />
        )}

        {/* 3. SAVED / WISHLIST VIEW */}
        {activeView === "saved" && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#4F8F52]">
                YOUR CAMPUS WISHLIST
              </span>
              <h1 className="text-3xl font-bold text-[#18261D] mt-1">
                Saved for your semester.
              </h1>
              <p className="text-sm text-[#2F5D3A]/80 mt-1">
                Keep track of items from seniors and peers before they are claimed.
              </p>
            </div>

            {wishlistIds.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#2F5D3A]/15">
                <Heart className="w-10 h-10 text-[#4F8F52] mx-auto mb-3" />
                <h3 className="font-bold text-lg text-[#18261D]">No saved items yet</h3>
                <p className="text-sm text-[#2F5D3A]/75 mt-1 mb-4">
                  Tap the heart icon on any campus listing to bookmark it here.
                </p>
                <button
                  onClick={() => setActiveView("marketplace")}
                  className="px-5 py-2.5 rounded-xl bg-[#1B4D2E] text-white text-sm font-semibold"
                >
                  Browse marketplace
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products
                  .filter((p) => wishlistIds.includes(p.id))
                  .map((item) => (
                    <div
                      key={item.id}
                      onClick={() => openProductDetail(item.id)}
                      className="bg-white rounded-2xl border border-[#2F5D3A]/15 overflow-hidden cursor-pointer hover:shadow-md transition"
                    >
                      <div className="relative h-48">
                        <img
                          src={item.images?.[0] || item.imageUrl || "https://placehold.co/400x300?text=No+Image"}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={(e) => toggleWishlist(item.id, e)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow"
                        >
                          <Heart className="w-4 h-4 fill-[#835B2A] text-[#835B2A]" />
                        </button>
                      </div>
                      <div className="p-4">
                        <p className="text-xs font-semibold text-[#4F8F52]">{item.category}</p>
                        <h3 className="font-bold text-base text-[#18261D] mt-0.5">{item.title}</h3>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2F5D3A]/10">
                          <span className="font-extrabold text-lg text-[#835B2A]">
                            {formatINR(item.price)}
                          </span>
                          <span className="text-xs font-semibold text-[#1B4D2E]">
                            View details →
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* 4. MY LISTINGS VIEW ("Your things. Their next chapter." - Matches Screenshot 6) */}
        {activeView === "my-listings" && (
          <MyListingsView
            products={products.filter((p) =>
              (currentUser?.email &&
                p.sellerEmail?.toLowerCase() === currentUser.email.toLowerCase()) ||
              p.sellerId === (currentUser?.id || "u-jordan")
            )}
            userName={currentUser?.name || "Jordan"}
            onOpenCreate={() => {
              setEditingProduct(null);
              setShowSellModal(true);
            }}
            onEditListing={(item) => {
              setEditingProduct(item);
              setShowSellModal(true);
            }}
            onUpdateStatus={handleUpdateListingStatus}
            onDeleteListing={handleDeleteListing}
            onRenewListing={(id) => {
              setProducts((prev) =>
                prev.map((p) =>
                  p.id === id ? { ...p, expiresAt: "Dec 30, 2026", expiringSoon: false } : p
                )
              );
              triggerToast("Listing renewed for 30 more days!");
            }}
          />
        )}

        {/* 5. BUYER-SELLER MESSAGING & CAMPUS MEETING POINTS (Matches Screenshots 5 & 10) */}
        {activeView === "messages" && (
          <MessagingAndMeetingView
            conversations={conversations}
            activeConvId={activeConvId}
            onSelectConv={setActiveConvId}
            onSendMessage={(convId, text) => {
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === convId
                    ? {
                        ...c,
                        unread: false,
                        messages: [
                          ...c.messages,
                          {
                            id: `m-${Date.now()}`,
                            sender: "me",
                            text,
                            time: "Just now",
                          },
                        ],
                      }
                    : c
                )
              );
            }}
            onSelectMeetingPoint={(convId, pointName) => {
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === convId ? { ...c, selectedMeetingPoint: pointName } : c
                )
              );
              triggerToast(`Preferred exchange spot set to ${pointName}`);
            }}
            onReportConversation={(conv) => {
              setReportContext({
                targetTitle: `Conversation with ${conv.peerName} · ${conv.productTitle} · ${formatINR(conv.productPrice)}`,
                reportedUser: conv.peerName,
                productId: conv.productId,
              });
              setActiveView("report-form");
            }}
            onOpenReview={() => setActiveView("review")}
          />
        )}

        {/* 6. RATINGS & REVIEWS VIEW ("Good exchanges deserve a good word." - Matches Screenshot 10) */}
        {activeView === "review" && (
          <RatingsAndReviewsView
            reviews={reviews.filter((r) => r.sellerId === "u-maya")}
            onBack={() => setActiveView("messages")}
            onSubmitReview={(newRev) => {
              setReviews((prev) => [
                {
                  id: `rev-${Date.now()}`,
                  sellerId: "u-maya",
                  reviewerName: currentUser?.name || "Jordan L.",
                  reviewerInitials: currentUser?.initials || "JL",
                  date: "Nov 24",
                  itemBought: "Bought the late-night study lamp",
                  rating: newRev.rating,
                  comment: newRev.comment,
                },
                ...prev,
              ]);
              triggerToast("Thank you! Your review has been published to Maya R.'s profile.");
            }}
          />
        )}

        {/* 7. SUPPORT, HELP CENTRE & COMPLAINT MANAGEMENT (Matches Screenshot 8) */}
        {activeView === "support" && (
          <SupportHubView
            reports={reports}
            onOpenReportForm={() => {
              setReportContext({
                targetTitle: "City bike · ₹4,500",
                reportedUser: "Sam W.",
                productId: "p-105",
              });
              setActiveView("report-form");
            }}
            onOpenReportStatus={(repId) => {
              setSelectedReportId(repId);
              setActiveView("report-status");
            }}
            onTriggerToast={triggerToast}
          />
        )}

        {/* 8. REPORT CONCERN FORM ("Something doesn't feel right?" - Matches Screenshot 9) */}
        {activeView === "report-form" && (
          <ReportFormView
            context={reportContext}
            onBack={() => setActiveView("messages")}
            onSubmit={handleSubmitReport}
          />
        )}

        {/* 9. REPORT STATUS TIMELINE ("Your concern is being reviewed." - Matches Screenshot 12) */}
        {activeView === "report-status" && selectedReport && (
          <ReportStatusView
            report={selectedReport}
            onBack={() => setActiveView("support")}
          />
        )}

        {/* 10. ACCOUNT & PROFILE VIEW ("A space that's yours." - Matches Screenshot 7) */}
        {activeView === "profile" && currentUser && (
          <ProfileAccountView
            user={currentUser}
            onUpdateUser={(updated) => {
              setCurrentUser((prev) => ({
                ...prev,
                ...updated,
                initials: (updated.name || prev.name)
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2),
              }));
              triggerToast("Profile & university changes saved");
            }}
            onGoMyListings={() => setActiveView("my-listings")}
            onGoSupport={() => setActiveView("support")}
            onLogout={handleLogout}
          />
        )}

        {/* 11. TRUST & SAFETY ADMIN MODERATION VIEW (Matches Screenshot 11) */}
        {isAdminView && selectedReport && (
          <TrustAndSafetyAdminView
            reports={reports}
            selectedReport={selectedReport}
            onSelectReport={setSelectedReportId}
            onApplyDecision={handleApplyModDecision}
          />
        )}
      </main>

      {/* ====================================================================
          MODALS: AUTH + 6-DIGIT OTP, CREATE/EDIT LISTING, BACKEND API CONFIG
      ==================================================================== */}
      {showAuthModal && (
        <AuthAndOtpModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={(user, token) => {
            api.setToken(token);
            setCurrentUser({
              ...user,
              initials: user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2),
            });
            setShowAuthModal(false);
            triggerToast(`Welcome to CampusHaat (${user.university}), ${user.name}!`);
          }}
        />
      )}

      {showSellModal && (
        <CreateEditListingModal
          initialData={editingProduct}
          onClose={() => {
            setShowSellModal(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveListing}
        />
      )}

      {showApiConfigModal && (
        <ApiConfigModal
          baseUrl={apiBaseUrl}
          liveMode={liveApiMode}
          onClose={() => setShowApiConfigModal(false)}
          onSave={({ baseUrl, liveMode }) => {
            setApiBaseUrl(baseUrl);
            setLiveApiMode(liveMode);
            api.setConfig({ baseUrl, liveMode });
            setShowApiConfigModal(false);
            triggerToast(
              liveMode
                ? `Switched to Live Backend API (${baseUrl})`
                : "Switched to Prototype Demo Mode"
            );
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// SUB-VIEW A: PRODUCT DETAIL VIEW (Matches Screenshot 4)
// ============================================================================
function ProductDetailView({
  product,
  isSaved,
  onToggleSave,
  onBack,
  onMessageSeller,
  onReportListing,
  onOpenReviews,
}) {
  const [imgIndex, setImgIndex] = useState(0);
  const isSold = product.status === "Sold";

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#2F5D3A] hover:text-[#1B4D2E]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to marketplace</span>
          <span className="text-[#2F5D3A]/45">
            / {product.category} / {product.subcategory}
          </span>
        </button>

        <button
          onClick={onReportListing}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#835B2A] hover:underline"
        >
          <Flag className="w-3.5 h-3.5" />
          Report listing
        </button>
      </div>

      {/* Sold Status Banner (Matches Screenshot 4) */}
      {isSold && (
        <div className="rounded-2xl bg-[#EAEFE0] border border-[#2F5D3A]/20 p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#1B4D2E] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-[#18261D]">
              This item has found a new home
            </p>
            <p className="text-xs text-[#2F5D3A]/85 mt-0.5">
              {product.sellerName} marked this listing as Sold. It’s no longer in
              available-only browsing, and new enquiries about this item are closed.
            </p>
          </div>
        </div>
      )}

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Image Gallery */}
        <div className="lg:col-span-6 space-y-3">
          <div className="relative rounded-2xl overflow-hidden bg-white border border-[#2F5D3A]/15 h-80 sm:h-[430px]">
            <img
              src={product.images[imgIndex] || product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <span
              className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${
                isSold ? "bg-[#1B4D2E] text-white" : "bg-white/95 text-[#1B4D2E]"
              }`}
            >
              {product.status}
            </span>
            <span className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-white/95 text-xs font-bold text-[#18261D] shadow-sm">
              {imgIndex + 1} / {product.images.length}
            </span>
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setImgIndex(idx)}
                  className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition ${
                    imgIndex === idx ? "border-[#1B4D2E]" : "border-transparent opacity-70"
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Details Column */}
        <div className="lg:col-span-6 space-y-5">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-[#EAEFE0] text-xs font-semibold text-[#2F5D3A] mb-3">
              {isSold ? "Sold · New enquiries closed" : `${product.status} · Campus pickup`}
            </span>
            <p className="text-xs font-bold uppercase tracking-wider text-[#4F8F52]">
              {product.category} · {product.subcategory}
            </p>
            <h1 className="text-3xl font-bold text-[#18261D] mt-1">{product.title}</h1>
            <div className="flex items-baseline gap-2.5 mt-2">
              <span className="text-3xl font-extrabold text-[#835B2A]">
                {formatINR(product.price)}
              </span>
              <span className="text-xs text-[#2F5D3A]/75">
                {isSold ? "Original asking price" : "Peer-to-peer campus price"}
              </span>
            </div>
            {isSold && (
              <p className="text-xs text-[#2F5D3A]/75 mt-1">
                Marked sold {product.soldDate || "recently"} · By {product.sellerName}
              </p>
            )}
          </div>

          <p className="text-sm text-[#2F5D3A] leading-relaxed">{product.description}</p>

          {/* Condition & Listing Type Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-[#2F5D3A]/15">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#2F5D3A]/65">
                CONDITION
              </p>
              <p className="text-sm font-bold text-[#18261D] mt-1">
                {product.condition} ·{" "}
                <span className="font-normal text-[#2F5D3A]">{product.conditionDesc}</span>
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-[#2F5D3A]/15">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#2F5D3A]/65">
                PREFERRED EXCHANGE SPOT
              </p>
              <p className="text-sm font-bold text-[#18261D] mt-1">
                {product.meetingPoint}
              </p>
            </div>
          </div>

          {/* Verified Seller Profile Card */}
          <div className="bg-white rounded-2xl p-4 border border-[#2F5D3A]/15 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#EAEFE0] text-[#1B4D2E] font-bold flex items-center justify-center text-sm">
                {product.sellerInitials}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-[#18261D]">
                    {product.sellerName}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-[#4F8F52]" />
                </div>
                <p className="text-xs text-[#2F5D3A]/80">
                  Student email verified · {product.sellerYear}
                </p>
                <button
                  onClick={onOpenReviews}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B4D2E] hover:underline mt-0.5"
                >
                  <Star className="w-3.5 h-3.5 fill-[#835B2A] text-[#835B2A]" />
                  <span>
                    {product.sellerRating} · {product.sellerReviewCount} reviews · View profile →
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            {isSold ? (
              <button
                disabled
                className="flex-1 py-3.5 px-5 rounded-xl bg-[#E4E9DC] text-[#2F5D3A]/70 text-sm font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                <span>Message {product.sellerName} · Unavailable</span>
              </button>
            ) : (
              <button
                onClick={onMessageSeller}
                className="flex-1 py-3.5 px-5 rounded-xl bg-[#1B4D2E] hover:bg-[#153d24] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message {product.sellerName}</span>
              </button>
            )}

            <button
              onClick={onToggleSave}
              className="py-3.5 px-5 rounded-xl bg-white border border-[#2F5D3A]/25 hover:border-[#1B4D2E] text-sm font-semibold text-[#1B4D2E] flex items-center justify-center gap-2 transition"
            >
              <Heart
                className={`w-4 h-4 ${
                  isSaved ? "fill-[#835B2A] text-[#835B2A]" : "text-[#1B4D2E]"
                }`}
              />
              <span>{isSaved ? "Saved" : "Save item"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-VIEW B: MY LISTINGS DASHBOARD (Matches Screenshot 6)
// ============================================================================
function MyListingsView({
  products,
  userName,
  onOpenCreate,
  onEditListing,
  onUpdateStatus,
  onDeleteListing,
  onRenewListing,
}) {
  const [statusFilter, setStatusFilter] = useState("All");

  const tabs = [
    { label: "All listings", value: "All", count: products.length },
    {
      label: "Available",
      value: "Available",
      count: products.filter((p) => p.status === "Available").length,
    },
    {
      label: "Reserved",
      value: "Reserved",
      count: products.filter((p) => p.status === "Reserved").length,
    },
    {
      label: "Sold",
      value: "Sold",
      count: products.filter((p) => p.status === "Sold").length,
    },
  ];

  const displayed =
    statusFilter === "All"
      ? products
      : products.filter((p) => p.status === statusFilter);

  const expiringItem = products.find((p) => p.expiringSoon && p.status === "Available");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#1B4D2E]">
            {userName.toUpperCase()}’S CAMPUS CIRCULAR
          </span>
          <h1 className="text-3xl font-bold text-[#18261D] mt-1">
            Your things. Their next chapter.
          </h1>
          <p className="text-sm text-[#2F5D3A]/80 mt-1">
            Manage your listings, answer questions, and keep availability honest.
          </p>
        </div>

        <button
          onClick={onOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B4D2E] hover:bg-[#153d24] text-white text-sm font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create a listing</span>
        </button>
      </div>

      {/* Expiry Reminder Banner (Matches Screenshot 6) */}
      {expiringItem && (
        <div className="rounded-2xl bg-[#F5E9C4] border border-[#835B2A]/25 p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-[#835B2A] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-[#18261D]">
              Your {expiringItem.title.toLowerCase()} archives in 3 days
            </p>
            <p className="text-xs text-[#2F5D3A] mt-0.5">
              Renew before {expiringItem.expiresAt} if it’s still available, or Mark as
              Sold if it’s found a new home.
            </p>
          </div>
        </div>
      )}

      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setStatusFilter(t.value)}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition ${
              statusFilter === t.value
                ? "bg-[#1B4D2E] text-white border-[#1B4D2E]"
                : "bg-white text-[#2F5D3A] border-[#2F5D3A]/20 hover:border-[#1B4D2E]"
            }`}
          >
            {t.label} <span className="ml-1 opacity-80">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Listing Rows */}
      <div className="space-y-4">
        {displayed.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-[#2F5D3A]/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <img
                src={item.images?.[0] || item.imageUrl || "https://placehold.co/200x200?text=No+Image"}
                alt={item.title}
                className="w-24 h-24 rounded-xl object-cover shrink-0 bg-[#EAEFE0]"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-lg font-bold text-[#18261D]">{item.title}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      item.status === "Available"
                        ? "bg-[#A7C957]/35 text-[#1B4D2E]"
                        : item.status === "Reserved"
                        ? "bg-[#F5E9C4] text-[#835B2A]"
                        : "bg-[#EAEFE0] text-[#2F5D3A]"
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-lg font-extrabold text-[#835B2A]">
                    {formatINR(item.price)}
                  </span>
                </div>
                <p className="text-xs text-[#2F5D3A]/80 mt-1">
                  {item.category} · {item.condition}
                </p>
                <p className="text-xs text-[#2F5D3A]/70 mt-1">
                  Expires {item.expiresAt} · Meeting spot: {item.meetingPoint}
                </p>
                {item.expiringSoon && item.status === "Available" && (
                  <p className="text-xs font-semibold text-[#835B2A] mt-1">
                    3-day reminder sent · Still available? Renew now.
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-start lg:items-end gap-3">
              <div className="flex flex-wrap gap-2">
                {item.status === "Available" && (
                  <button
                    onClick={() => onUpdateStatus(item.id, "Reserved")}
                    className="px-3.5 py-2 rounded-xl border border-[#2F5D3A]/25 text-xs font-semibold text-[#18261D] hover:bg-[#F7FAF0]"
                  >
                    Mark as Reserved
                  </button>
                )}
                {item.status !== "Sold" && (
                  <button
                    onClick={() => onUpdateStatus(item.id, "Sold")}
                    className="px-3.5 py-2 rounded-xl bg-[#1B4D2E] hover:bg-[#153d24] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark as Sold
                  </button>
                )}
                {item.status === "Available" && (
                  <button
                    onClick={() => onRenewListing(item.id)}
                    className="px-3.5 py-2 rounded-xl border border-[#2F5D3A]/25 text-xs font-semibold text-[#18261D] hover:bg-[#F7FAF0]"
                  >
                    Renew listing
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="font-semibold text-[#1B4D2E]">
                  Enquiries ({item.enquiriesCount})
                </span>
                <button
                  onClick={() => onEditListing(item)}
                  className="px-2.5 py-1 rounded-lg border border-[#2F5D3A]/20 font-medium text-[#18261D] hover:bg-[#F7FAF0]"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteListing(item.id)}
                  className="font-medium text-[#835B2A] hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// SUB-VIEW C: MESSAGING & CAMPUS MEETING POINTS (Matches Screenshots 5 & 10)
// ============================================================================
function MessagingAndMeetingView({
  conversations,
  activeConvId,
  onSelectConv,
  onSendMessage,
  onSelectMeetingPoint,
  onReportConversation,
  onOpenReview,
}) {
  const [draft, setDraft] = useState("");
  const [showSpotPicker, setShowSpotPicker] = useState(true);

  const activeConv =
    conversations.find((c) => c.id === activeConvId) || conversations[0];

  const handleSend = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onSendMessage(activeConv.id, draft.trim());
    setDraft("");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Thread List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#2F5D3A]/15 overflow-hidden">
          <div className="p-4 border-b border-[#2F5D3A]/10">
            <h2 className="font-bold text-base text-[#18261D]">Peer Conversations</h2>
            <p className="text-xs text-[#2F5D3A]/75">
              Coordinate safe, on-campus handovers
            </p>
          </div>
          <div className="divide-y divide-[#2F5D3A]/10">
            {conversations.map((conv) => {
              const selected = conv.id === activeConv.id;
              const lastMsg = conv.messages[conv.messages.length - 1];
              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectConv(conv.id)}
                  className={`w-full p-4 text-left transition flex items-start gap-3 ${
                    selected ? "bg-[#EAEFE0]/80" : "hover:bg-[#F7FAF0]"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#1B4D2E] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {conv.peerInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-[#18261D] truncate">
                        {conv.peerName}
                      </span>
                      <span className="text-[11px] font-semibold text-[#835B2A]">
                        {formatINR(conv.productPrice)}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#4F8F52] truncate">
                      {conv.productTitle}
                    </p>
                    <p className="text-xs text-[#2F5D3A]/75 truncate mt-0.5">
                      {lastMsg?.text}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Chat Window */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#2F5D3A]/15 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-[#2F5D3A]/10 flex flex-wrap items-center justify-between gap-3 bg-[#FAFDF5]">
            <div className="flex items-center gap-3">
              <img
                src={activeConv.productImage}
                alt=""
                className="w-11 h-11 rounded-xl object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#18261D]">
                    {activeConv.peerName}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#A7C957]/35 text-[#1B4D2E] font-semibold">
                    Verified Student
                  </span>
                </div>
                <p className="text-xs text-[#2F5D3A]">
                  {activeConv.productTitle} ·{" "}
                  <strong className="text-[#835B2A]">
                    {formatINR(activeConv.productPrice)}
                  </strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenReview}
                className="px-3 py-1.5 rounded-xl bg-[#4F8F52] hover:bg-[#3f7642] text-white text-xs font-semibold transition"
              >
                Confirm Exchange & Review
              </button>
              <button
                onClick={() => onReportConversation(activeConv)}
                className="px-3 py-1.5 rounded-xl border border-[#835B2A]/30 text-[#835B2A] hover:bg-[#835B2A]/10 text-xs font-semibold inline-flex items-center gap-1"
              >
                <Flag className="w-3.5 h-3.5" />
                Report
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="p-5 space-y-3 max-h-72 overflow-y-auto bg-[#F7FAF0]/50">
            {activeConv.messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col max-w-md ${
                  m.sender === "me" ? "ml-auto items-end" : "items-start"
                }`}
              >
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm ${
                    m.sender === "me"
                      ? "bg-[#1B4D2E] text-white rounded-br-sm"
                      : "bg-white border border-[#2F5D3A]/15 text-[#18261D] rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-[#2F5D3A]/60 mt-1">{m.time}</span>
              </div>
            ))}
          </div>

          {/* Quick Reply Chips + Input */}
          <div className="p-4 border-t border-[#2F5D3A]/10 space-y-2.5">
            <div className="flex flex-wrap gap-1.5">
              {[
                "Can we meet at Student Union today?",
                "Is the price negotiable for a fellow junior?",
                "Confirmed for the Library Foyer!",
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => onSendMessage(activeConv.id, chip)}
                  className="px-2.5 py-1 rounded-full bg-[#F7FAF0] hover:bg-[#EAEFE0] border border-[#2F5D3A]/20 text-[11px] font-medium text-[#2F5D3A]"
                >
                  {chip}
                </button>
              ))}
            </div>

            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a message to coordinate your campus handover..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#F7FAF0] border border-[#2F5D3A]/20 text-sm focus:outline-none focus:border-[#1B4D2E]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#1B4D2E] text-white text-sm font-semibold inline-flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Campus Safe Meeting Point Selector ("A familiar spot. A little more care." - Screenshot 5) */}
      <div className="pt-2 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1B4D2E]">
              EXCHANGE WITH CARE
            </span>
            <h2 className="text-2xl font-bold text-[#18261D] mt-0.5">
              A familiar spot. A little more care.
            </h2>
            <p className="text-xs sm:text-sm text-[#2F5D3A]/80 mt-0.5">
              Choose a named campus meeting point, agree on a suitable time and inspect
              the item together. No live-location sharing needed.
            </p>
          </div>
          <button
            onClick={() => setShowSpotPicker(!showSpotPicker)}
            className="text-xs font-semibold text-[#1B4D2E] underline"
          >
            {showSpotPicker ? "Hide spots" : "Show spots"}
          </button>
        </div>

        {/* Preferred Exchange Location Box */}
        <div className="rounded-2xl bg-[#E5EDE0] p-4 sm:p-5 space-y-2.5">
          <p className="text-xs font-bold text-[#18261D]">Preferred exchange location</p>
          <div className="bg-white rounded-xl px-4 py-3 border border-[#2F5D3A]/20 flex items-center justify-between">
            <span className="text-sm font-bold text-[#1B4D2E]">
              {activeConv.selectedMeetingPoint}
            </span>
            <span className="text-xs font-semibold text-[#2F5D3A]">
              Approved campus spot ✓
            </span>
          </div>
          <p className="text-[11px] text-[#2F5D3A]/80">
            Choose only from the pilot’s approved location list. Exchange planning uses
            the place name — no GPS permission, precise coordinates or live location is
            requested.
          </p>
        </div>

        {/* 3 Suggested Campus Meeting Point Cards */}
        {showSpotPicker && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CAMPUS_MEETING_POINTS.map((spot) => {
              const isSelected = activeConv.selectedMeetingPoint === spot.name;
              return (
                <div
                  key={spot.id}
                  className={`rounded-2xl p-5 bg-white border transition flex flex-col justify-between ${
                    isSelected
                      ? "border-[#1B4D2E] ring-1 ring-[#1B4D2E]"
                      : "border-[#2F5D3A]/15"
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-base text-[#18261D]">{spot.name}</h3>
                    <p className="text-xs font-semibold text-[#4F8F52] mt-1">
                      {spot.hours}
                    </p>
                    <p className="text-xs text-[#2F5D3A]/80 mt-2 leading-relaxed">
                      {spot.description}
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectMeetingPoint(activeConv.id, spot.name)}
                    className={`mt-5 w-full py-2.5 rounded-xl text-xs font-semibold border transition ${
                      isSelected
                        ? "bg-[#1B4D2E] text-white border-[#1B4D2E]"
                        : "bg-white text-[#18261D] border-[#2F5D3A]/25 hover:border-[#1B4D2E]"
                    }`}
                  >
                    {isSelected ? "Selected meeting point" : "Choose this location"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SUB-VIEW D: RATINGS & REVIEWS ("Good exchanges deserve a good word." - Screenshot 10)
// ============================================================================
function RatingsAndReviewsView({ reviews, onBack, onSubmitReview }) {
  const [overallRating, setOverallRating] = useState(5);
  const [commScore, setCommScore] = useState(5);
  const [descScore, setDescScore] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitReview({
      rating: overallRating,
      comment:
        comment.trim() ||
        "Smooth campus exchange at Student Union. Item matched the listing description!",
    });
    setComment("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-[#1B4D2E] hover:underline mb-2 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to messages
          </button>
          <p className="text-xs font-bold uppercase tracking-wider text-[#1B4D2E]">
            ONE MORE THING
          </p>
          <h1 className="text-3xl font-bold text-[#18261D] mt-0.5">
            Good exchanges deserve a good word.
          </h1>
          <p className="text-sm text-[#2F5D3A]/80 mt-1">
            A little honest feedback helps the next student make a more informed choice.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#A7C957]/35 text-[#1B4D2E] text-xs font-bold">
          <CheckCircle2 className="w-4 h-4" />
          Transaction completed
        </span>
      </div>

      {/* Completed Transaction Summary Banner */}
      <div className="rounded-2xl bg-[#E5EDE0] p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=200&q=80"
            alt=""
            className="w-16 h-16 rounded-xl object-cover"
          />
          <div>
            <h3 className="font-bold text-base text-[#18261D]">
              The late-night study lamp
            </h3>
            <p className="text-xs text-[#2F5D3A]">
              <strong className="text-[#835B2A]">{formatINR(650)}</strong> · Purchased from
              Maya R.
            </p>
            <p className="text-xs font-semibold text-[#1B4D2E] mt-0.5">
              Completed at Student Union · Main entrance
            </p>
          </div>
        </div>
        <CheckCircle2 className="w-6 h-6 text-[#1B4D2E] shrink-0" />
      </div>

      {/* 2-Column Review Form + Seller Reputation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#2F5D3A]/15 space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EAEFE0] text-[#1B4D2E] font-bold text-xs flex items-center justify-center">
              MR
            </div>
            <div>
              <h2 className="font-bold text-base text-[#18261D]">
                How was buying from Maya?
              </h2>
              <p className="text-xs text-[#2F5D3A]/75">
                One review per participant, for this completed exchange only.
              </p>
            </div>
          </div>

          {/* Star Selector */}
          <div>
            <label className="block text-xs font-bold text-[#18261D] mb-2">
              Overall experience *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setOverallRating(star)}
                  className="p-1 transition hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= overallRating
                        ? "fill-[#1B4D2E] text-[#1B4D2E]"
                        : "text-[#2F5D3A]/30"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 font-bold text-sm text-[#1B4D2E]">
                {overallRating} · {overallRating >= 4 ? "Excellent" : "Good"}
              </span>
            </div>
          </div>

          {/* 1-5 Scale Rows */}
          {[
            { label: "Communication *", val: commScore, set: setCommScore },
            {
              label: "Product matched its description *",
              val: descScore,
              set: setDescScore,
            },
          ].map((row) => (
            <div
              key={row.label}
              className="flex flex-wrap items-center justify-between gap-2"
            >
              <span className="text-xs font-bold text-[#18261D]">{row.label}</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => row.set(num)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                      row.val === num
                        ? "bg-[#1B4D2E] text-white"
                        : "bg-[#F7FAF0] text-[#2F5D3A] border border-[#2F5D3A]/20"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <label className="block text-xs font-bold text-[#18261D] mb-1.5">
              What went well? (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details on punctuality, item condition, or campus handover..."
              className="w-full p-3 rounded-xl bg-[#F7FAF0] border border-[#2F5D3A]/20 text-sm focus:outline-none focus:border-[#1B4D2E]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#1B4D2E] hover:bg-[#153d24] text-white text-sm font-semibold shadow-sm transition"
          >
            Submit review
          </button>
        </form>

        {/* Seller Reputation Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#2F5D3A]/15 space-y-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#EAEFE0] text-[#1B4D2E] font-bold flex items-center justify-center">
              MR
            </div>
            <div>
              <h3 className="font-bold text-base text-[#18261D]">Maya R.</h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#A7C957]/35 text-[#1B4D2E] text-[11px] font-semibold mt-0.5">
                <CheckCircle2 className="w-3 h-3" /> Student email verified
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 pb-4 border-b border-[#2F5D3A]/10">
            <span className="text-4xl font-extrabold text-[#18261D]">4.9</span>
            <div>
              <div className="flex text-[#1B4D2E]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-[#1B4D2E]" />
                ))}
              </div>
              <p className="text-xs text-[#2F5D3A] mt-0.5">
                {10 + reviews.length} completed-exchange reviews
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#EAEFE0] text-[#1B4D2E] text-[11px] font-bold flex items-center justify-center">
                    {rev.reviewerInitials}
                  </span>
                  <span className="text-xs font-bold text-[#18261D]">
                    {rev.reviewerName}
                  </span>
                  <span className="text-xs text-[#835B2A]">{"★".repeat(rev.rating)}</span>
                </div>
                <p className="text-[11px] text-[#2F5D3A]/70">
                  {rev.date} · {rev.itemBought}
                </p>
                <p className="text-xs text-[#18261D] leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-VIEW E: SUPPORT HUB & COMPLAINT MANAGEMENT (Matches Screenshot 8)
// ============================================================================
function SupportHubView({
  reports,
  onOpenReportForm,
  onOpenReportStatus,
  onTriggerToast,
}) {
  const [supportMsg, setSupportMsg] = useState("");

  return (
    <div className="space-y-7">
      {/* Hero Banner */}
      <div className="rounded-2xl bg-[#E5EDE0] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#1B4D2E]">
            A LITTLE HELP GOES A LONG WAY
          </span>
          <h1 className="text-3xl font-bold text-[#18261D] mt-1">
            We’re here for your next step.
          </h1>
          <p className="text-sm text-[#2F5D3A]/85 mt-1">
            From your first verification code to a tricky exchange, find answers and a way
            forward.
          </p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-[#1B4D2E] text-white flex items-center justify-center shrink-0 shadow-sm">
          <Mail className="w-8 h-8" />
        </div>
      </div>

      {/* 3 Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#2F5D3A]/15">
          <HelpCircle className="w-5 h-5 text-[#1B4D2E] mb-2" />
          <h3 className="font-bold text-sm text-[#18261D]">Help Centre</h3>
          <p className="text-xs text-[#2F5D3A]/80 mt-1">
            Registration, listings, enquiries and safe exchanges.
          </p>
        </div>

        <button
          onClick={onOpenReportForm}
          className="bg-white rounded-2xl p-5 border border-[#2F5D3A]/15 hover:border-[#1B4D2E] text-left transition"
        >
          <Flag className="w-5 h-5 text-[#835B2A] mb-2" />
          <h3 className="font-bold text-sm text-[#18261D]">Report a Concern</h3>
          <p className="text-xs text-[#2F5D3A]/80 mt-1">
            Flag suspicious listings, scams, or inappropriate messages.
          </p>
        </button>

        <button
          onClick={() => onOpenReportStatus(reports[0]?.id || "Q-1042")}
          className="bg-white rounded-2xl p-5 border border-[#2F5D3A]/15 hover:border-[#1B4D2E] text-left transition"
        >
          <ShieldCheck className="w-5 h-5 text-[#1B4D2E] mb-2" />
          <h3 className="font-bold text-sm text-[#18261D]">
            Complaint Management ({reports.length})
          </h3>
          <p className="text-xs text-[#2F5D3A]/80 mt-1">
            Track your report, moderator response and resolution status.
          </p>
        </button>
      </div>

      {/* 1. Help Centre FAQs */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-[#18261D]">1. Help Centre</h2>
        <p className="text-xs text-[#2F5D3A]/80">
          Essentials for getting started and exchanging with care.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-[#2F5D3A]/15">
            <h3 className="font-bold text-sm text-[#18261D]">How do I register?</h3>
            <p className="text-xs text-[#2F5D3A]/85 mt-1.5 leading-relaxed">
              Create an account with your name, university and university email, then
              enter the six-digit one-time verification code sent to your campus inbox.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-[#2F5D3A]/15">
            <h3 className="font-bold text-sm text-[#18261D]">How do I list a product?</h3>
            <p className="text-xs text-[#2F5D3A]/85 mt-1.5 leading-relaxed">
              Choose Sell an item. Add clear photos, a name, description, price, category
              and honest condition. Select a preferred campus meeting point, then Publish.
            </p>
          </div>
        </div>
      </div>

      {/* Active Complaints Quick Tracker */}
      <div className="bg-white rounded-2xl p-5 border border-[#2F5D3A]/15 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-[#18261D]">
            Your Reports & Complaints
          </h3>
          <button
            onClick={onOpenReportForm}
            className="text-xs font-semibold text-[#1B4D2E] hover:underline"
          >
            + File new report
          </button>
        </div>
        <div className="divide-y divide-[#2F5D3A]/10">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="py-3 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#18261D]">
                    Case {rep.id} · {rep.reason}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#A7C957]/35 text-[#1B4D2E]">
                    {rep.status}
                  </span>
                </div>
                <p className="text-xs text-[#2F5D3A]/80 mt-0.5">
                  {rep.targetTitle} · Submitted {rep.submittedAt}
                </p>
              </div>
              <button
                onClick={() => onOpenReportStatus(rep.id)}
                className="px-3.5 py-1.5 rounded-xl bg-[#F7FAF0] border border-[#2F5D3A]/20 text-xs font-semibold text-[#1B4D2E]"
              >
                Track case →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support Mini-Form */}
      <div className="bg-white rounded-2xl p-5 border border-[#2F5D3A]/15 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={supportMsg}
          onChange={(e) => setSupportMsg(e.target.value)}
          placeholder="Need help with university email verification or an account question?"
          className="flex-1 px-4 py-2.5 rounded-xl bg-[#F7FAF0] border border-[#2F5D3A]/20 text-sm"
        />
        <button
          onClick={() => {
            if (!supportMsg.trim()) return;
            setSupportMsg("");
            onTriggerToast("Support request sent to CampusHaat pilot team.");
          }}
          className="px-5 py-2.5 rounded-xl bg-[#1B4D2E] text-white text-sm font-semibold"
        >
          Contact Support
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-VIEW F: REPORT FORM ("Something doesn't feel right?" - Screenshot 9)
// ============================================================================
function ReportFormView({ context, onBack, onSubmit }) {
  const reasons = [
    {
      title: "Suspicious listing",
      desc: "Duplicate images, suspicious content or unusual listing behaviour.",
    },
    {
      title: "Misleading product description",
      desc: "Incorrect condition, missing defects or a product that differs from the listing.",
    },
    {
      title: "Prohibited item",
      desc: "An item that violates our community listing rules.",
    },
    {
      title: "Harassment or inappropriate messages",
      desc: "Threats, unwanted contact, or abusive messages.",
    },
  ];

  const [selectedReason, setSelectedReason] = useState(reasons[0].title);
  const [details, setDetails] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      reason: selectedReason,
      statement:
        details.trim() ||
        "Reported via CampusHaat Community Care flow for Trust & Safety review.",
    });
  };

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4D2E] hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to conversation
      </button>

      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#1B4D2E]">
          COMMUNITY CARE
        </span>
        <h1 className="text-3xl font-bold text-[#18261D] mt-0.5">
          Something doesn’t feel right?
        </h1>
        <p className="text-sm text-[#2F5D3A]/80 mt-1">
          Tell us what happened. Your report helps the pilot team review concerns and act
          where appropriate.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-8 bg-white rounded-2xl p-6 border border-[#2F5D3A]/15 space-y-5"
        >
          <div className="rounded-xl bg-[#EAEFE0] p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#18261D]">Reporting a concern</p>
              <p className="text-xs text-[#2F5D3A] mt-0.5">{context.targetTitle}</p>
            </div>
            <span className="text-xs font-semibold text-[#1B4D2E]">Attached</span>
          </div>

          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-[#18261D]">
              What’s the main concern? *
            </label>
            {reasons.map((r) => {
              const active = selectedReason === r.title;
              return (
                <div
                  key={r.title}
                  onClick={() => setSelectedReason(r.title)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                    active
                      ? "bg-[#F7FAF0] border-[#1B4D2E]"
                      : "bg-white border-[#2F5D3A]/15 hover:border-[#2F5D3A]/40"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${
                      active ? "border-[#1B4D2E]" : "border-[#2F5D3A]/40"
                    }`}
                  >
                    {active && <span className="w-2 h-2 rounded-full bg-[#1B4D2E]" />}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#18261D]">{r.title}</p>
                    <p className="text-xs text-[#2F5D3A]/80 mt-0.5">{r.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#18261D] mb-1.5">
              Describe what happened
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Include relevant details such as payment link requests or misleading condition..."
              className="w-full p-3 rounded-xl bg-[#F7FAF0] border border-[#2F5D3A]/20 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#1B4D2E] hover:bg-[#153d24] text-white text-sm font-semibold shadow-sm"
          >
            Submit report to Trust & Safety
          </button>
        </form>

        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-[#F5E9C4] border border-[#835B2A]/25 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#835B2A] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#18261D]">
                If you’re in immediate danger
              </p>
              <p className="text-xs text-[#2F5D3A] mt-1 leading-relaxed">
                Move to a safe place and contact local emergency services or campus
                security directly.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#EAEFE0] p-5 space-y-4">
            <h3 className="font-bold text-base text-[#18261D]">
              We’ll take it from here.
            </h3>
            {[
              {
                num: "01",
                title: "Confirmation",
                desc: "You receive a case reference after submitting to track status.",
              },
              {
                num: "02",
                title: "Review",
                desc: "The pilot team assesses the report and attached conversation.",
              },
              {
                num: "03",
                title: "Action & update",
                desc: "We apply appropriate moderation action and notify you.",
              },
            ].map((s) => (
              <div key={s.num} className="flex gap-3">
                <span className="text-xs font-extrabold text-[#1B4D2E]">{s.num}</span>
                <div>
                  <p className="text-xs font-bold text-[#18261D]">{s.title}</p>
                  <p className="text-xs text-[#2F5D3A]/85 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-VIEW G: REPORT STATUS VIEW ("Your concern is being reviewed." - Screenshot 12)
// ============================================================================
function ReportStatusView({ report, onBack }) {
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4D2E] hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Support & Complaints
      </button>

      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#1B4D2E]">
          MY REPORTS & COMPLAINTS
        </span>
        <h1 className="text-3xl font-bold text-[#18261D] mt-0.5">
          {report.status === "Resolved"
            ? "Your report has been resolved."
            : "Your concern is being reviewed."}
        </h1>
        <p className="text-xs text-[#2F5D3A]/80 mt-1">
          Case {report.id} · Submitted {report.submittedAt}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-[#2F5D3A]/15 space-y-2">
          <span className="text-xs font-bold text-[#4F8F52]">{report.status}</span>
          <h3 className="text-xl font-bold text-[#18261D]">{report.reason}</h3>
          <p className="text-xs font-semibold text-[#2F5D3A]">{report.targetTitle}</p>
          <p className="text-xs text-[#18261D] italic pt-1">“{report.statement}”</p>
          <p className="text-[11px] text-[#2F5D3A]/70 pt-2">
            Evidence: {report.evidence}
          </p>
        </div>

        <div className="rounded-2xl bg-[#E5EDE0] p-5 space-y-2">
          <h3 className="text-lg font-bold text-[#18261D]">What happens next?</h3>
          <p className="text-xs text-[#2F5D3A] leading-relaxed">
            The pilot Trust & Safety team is assessing the supplied information. Your
            identity is kept private and is not routinely shared with the reported
            student.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-[#18261D]">Case activity</h2>
        {report.activity.map((act, idx) => (
          <div
            key={idx}
            className={`rounded-2xl p-4 border ${
              idx === report.activity.length - 1
                ? "bg-[#E5EDE0] border-[#2F5D3A]/20"
                : "bg-white border-[#2F5D3A]/15"
            }`}
          >
            <p className="text-xs font-bold text-[#18261D]">
              <span className="text-[#1B4D2E] mr-2">{act.step}</span>
              {act.title}
            </p>
            <p className="text-xs text-[#2F5D3A] mt-1">{act.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// SUB-VIEW H: ACCOUNT & PROFILE ("A space that's yours." - Screenshot 7)
// ============================================================================
function ProfileAccountView({
  user,
  onUpdateUser,
  onGoMyListings,
  onGoSupport,
  onLogout,
}) {
  const [name, setName] = useState(user.name);
  const [university, setUniversity] = useState(user.university);
  const [year, setYear] = useState(user.year || "3rd Year · B.Tech CS");

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#1B4D2E]">
          YOUR CAMPUSHAAT ACCOUNT
        </span>
        <h1 className="text-3xl font-bold text-[#18261D] mt-0.5">
          A space that’s yours.
        </h1>
        <p className="text-sm text-[#2F5D3A]/80 mt-1">
          Keep your profile up to date, manage where you’re signed in, and choose what
          happens next.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Navigation Column */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#EAEFE0] text-[#1B4D2E] font-bold flex items-center justify-center text-sm">
              {user.initials}
            </div>
            <div>
              <p className="font-bold text-sm text-[#18261D]">{user.name}</p>
              <p className="text-xs text-[#2F5D3A]/75">{user.university}</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="px-3.5 py-2.5 rounded-xl bg-[#E5EDE0] text-xs font-bold text-[#1B4D2E]">
              Profile & university
            </div>
            <button
              onClick={onGoMyListings}
              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#1B4D2E] hover:underline"
            >
              My listings →
            </button>
            <button
              onClick={onGoSupport}
              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#1B4D2E] hover:underline"
            >
              Get help ↗
            </button>
          </div>

          <button
            onClick={onLogout}
            className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#2F5D3A]/20 hover:border-[#835B2A] text-xs font-bold text-[#18261D] inline-flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log out</span>
          </button>
        </div>

        {/* Right Main Form Card */}
        <div className="lg:col-span-9 bg-white rounded-2xl p-6 border border-[#2F5D3A]/15 space-y-5">
          <h2 className="text-lg font-bold text-[#18261D]">Profile & university</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#18261D] mb-1.5">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#2F5D3A]/20 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18261D] mb-1.5">
                University
              </label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#2F5D3A]/20 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#18261D] mb-1.5">
              Academic Year / Department (Shown to peers, juniors & seniors)
            </label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#2F5D3A]/20 text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#18261D]">
                University email
              </label>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#A7C957]/35 text-[#1B4D2E] text-[11px] font-bold">
                <Check className="w-3 h-3" /> Verified
              </span>
            </div>
            <input
              type="text"
              readOnly
              value={user.email}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7FAF0] border border-[#2F5D3A]/20 text-sm text-[#2F5D3A]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => onUpdateUser({ name, university, year })}
              className="px-5 py-2.5 rounded-xl bg-[#1B4D2E] hover:bg-[#153d24] text-white text-sm font-semibold"
            >
              Save profile changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-VIEW I: TRUST & SAFETY ADMIN MODERATION VIEW (Matches Screenshot 11)
// ============================================================================
function TrustAndSafetyAdminView({
  reports,
  selectedReport,
  onSelectReport,
  onApplyDecision,
}) {
  const [contentAction, setContentAction] = useState("Hide listing");
  const [accountAction, setAccountAction] = useState("Warn user");
  const [notes, setNotes] = useState("");

  return (
    <div className="space-y-6">
      {/* Report Queue Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-[#1B4D2E] mr-2">Report queue:</span>
        {reports.map((r) => (
          <button
            key={r.id}
            onClick={() => onSelectReport(r.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
              r.id === selectedReport.id
                ? "bg-[#1B4D2E] text-white border-[#1B4D2E]"
                : "bg-white text-[#2F5D3A] border-[#2F5D3A]/20"
            }`}
          >
            {r.id} · {r.reason} ({r.status})
          </button>
        ))}
      </div>

      <div>
        <h1 className="text-3xl font-bold text-[#18261D]">
          {selectedReport.id} · {selectedReport.reason}
        </h1>
        <p className="text-xs text-[#2F5D3A]/80 mt-1">
          {selectedReport.status} · {selectedReport.priority} · Assigned to Trust & Safety ·
          Submitted {selectedReport.submittedAt}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Reported Content & Private Statement */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-[#2F5D3A]/15 space-y-3">
            <h2 className="font-bold text-base text-[#18261D]">Reported content</h2>
            <div className="flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=250&q=80"
                alt=""
                className="w-24 h-20 rounded-xl object-cover"
              />
              <div>
                <h3 className="font-bold text-base text-[#18261D]">
                  {selectedReport.targetTitle}
                </h3>
                <p className="text-xs text-[#2F5D3A]">
                  Account: {selectedReport.reportedUser} · Student email verified
                </p>
                <p className="text-xs text-[#4F8F52] mt-1">
                  Status: {selectedReport.status}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#2F5D3A]/15 space-y-2">
            <h2 className="font-bold text-base text-[#18261D]">
              Reporter statement · Private
            </h2>
            <p className="text-xs text-[#2F5D3A]/75">
              {selectedReport.reporterName} · Reporter identity is restricted to
              authorised moderators
            </p>
            <p className="text-sm text-[#18261D] pt-1 leading-relaxed">
              “{selectedReport.statement}”
            </p>
          </div>
        </div>

        {/* Right: Moderation Decision Panel */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#2F5D3A]/15 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-[#18261D]">
              Record a moderation decision
            </h2>
            <p className="text-xs font-semibold text-[#835B2A] mt-0.5">
              {selectedReport.status === "Resolved"
                ? "DECISION APPLIED"
                : "DRAFT · Nothing applied yet"}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-[#18261D]">Content action *</p>
            {[
              {
                val: "Hide listing",
                desc: "Reversible; remove from browse while preserving evidence.",
              },
              {
                val: "Remove reported content",
                desc: "For confirmed violations; removes listing from marketplace.",
              },
              {
                val: "Keep content visible",
                desc: "No content violation found; record the reason.",
              },
            ].map((opt) => (
              <div
                key={opt.val}
                onClick={() => setContentAction(opt.val)}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  contentAction === opt.val
                    ? "bg-[#E5EDE0] border-[#1B4D2E]"
                    : "bg-[#F7FAF0] border-[#2F5D3A]/15"
                }`}
              >
                <p className="text-xs font-bold text-[#1B4D2E]">{opt.val}</p>
                <p className="text-[11px] text-[#2F5D3A]/85 mt-0.5">{opt.desc}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-[#18261D]">Account action *</p>
            <div className="flex flex-wrap gap-2">
              {["No account action", "Warn user", "Temporarily suspend account"].map(
                (act) => (
                  <button
                    type="button"
                    key={act}
                    onClick={() => setAccountAction(act)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                      accountAction === act
                        ? "bg-[#1B4D2E] text-white border-[#1B4D2E]"
                        : "bg-white text-[#2F5D3A] border-[#2F5D3A]/20"
                    }`}
                  >
                    {act}
                  </button>
                )
              )}
            </div>
          </div>

          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Moderator audit note (optional)..."
            className="w-full px-3.5 py-2 rounded-xl bg-[#F7FAF0] border border-[#2F5D3A]/20 text-xs"
          />

          <button
            onClick={() =>
              onApplyDecision(selectedReport.id, {
                contentAction,
                accountAction,
                notes,
              })
            }
            className="w-full py-3 rounded-xl bg-[#1B4D2E] hover:bg-[#153d24] text-white text-sm font-semibold shadow-sm"
          >
            Apply moderation decision
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODAL 1: AUTHENTICATION & 6-DIGIT UNIVERSITY EMAIL OTP VERIFICATION
// ============================================================================
function AuthAndOtpModal({ onClose, onSuccess }) {
  const [step, setStep] = useState("login"); // login | register | otp
  const [name, setName] = useState("Aarav Patel");
  const [university, setUniversity] = useState("Gujarat University");
  const [customUniversity, setCustomUniversity] = useState("");
  const [email, setEmail] = useState("aarav.patel@gujaratuniversity.ac.in");
  const [password, setPassword] = useState("CampusPass123!");
  const [year, setYear] = useState("3rd Year · B.Tech CS");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(45);

  const resolvedUniversity =
    university === "Other" ? customUniversity.trim() || "Campus University" : university;

  useEffect(() => {
    if (step !== "otp" || timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [step, timer]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !email.includes("@") ||
      (!email.endsWith(".edu") &&
        !email.endsWith(".ac.in") &&
        !email.endsWith(".edu.in") &&
        !email.includes("university") &&
        !email.includes("iit") &&
        !email.includes("nirma"))
    ) {
      setError(
        "Please enter a valid university email address."
      );
      return;
    }

    setLoading(true);

    try {
      await api.register({
        name,
        email,
        password,
        year,
        university: resolvedUniversity,
      });

      setOtpDigits(["", "", "", "", "", ""]);
      setStep("otp");
      setTimer(60);

    } catch (err) {

      if (err.message?.toLowerCase().includes("already registered")) {

        setOtpDigits(["", "", "", "", "", ""]);
        setStep("otp");
        setTimer(0);

        try {
          await api.resendOtp(email);
          setTimer(60);
          setError("A fresh OTP has been sent to your email.");
        } catch (resendError) {
          setTimer(60);
          setError(
            resendError.message ||
            "Your account exists. Please wait before requesting another OTP."
          );
        }

      } else {
        setError(err.message);
      }

    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const code = otpDigits.join("");

    if (code.length < 6) {
      setError("Enter the 6-digit verification code sent to your university email.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // First, verify the OTP
      await api.verifyOtp({
        email,
        otp: code,
      });

      // Then, log in to obtain the actual JWT
      const loginResponse = await api.login({
        email,
        password,
      });

      // Construct the frontend user object
      const user = {
        id: email,
        name: name.trim() || email.split("@")[0],
        email,
        university: resolvedUniversity,
        verified: true,
        role: "STUDENT",
        year,
      };

      // Complete authentication
      onSuccess(user, loginResponse.token);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
  setLoading(true);
  setError("");

  try {
      await api.resendOtp(email);
      setOtpDigits(["", "", "", "", "", ""]);
      setTimer(60);
      setError("A new OTP has been sent to your email.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await api.login({
        email,
        password,
      });

      const user = {
        id: email,
        name: email
          .split("@")[0]
          .split(/[._-]/)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" "),
        email,
        university: resolvedUniversity,
        verified: true,
        role: "STUDENT",
        year,
      };

      onSuccess(user, res.token);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, val) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = clean;
    setOtpDigits(next);
    if (clean && index < 5) {
      const nextEl = document.getElementById(`otp-input-${index + 1}`);
      if (nextEl) nextEl.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#2F5D3A]/20 shadow-xl relative my-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F7FAF0] flex items-center justify-center text-[#2F5D3A] hover:text-[#1B4D2E]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center mb-5">
          <CampusHaatLogo className="h-11 mb-2" />
          <p className="text-xs text-[#2F5D3A]">
            Verified university peer-to-peer marketplace
          </p>
        </div>

        {/* Mode Switcher */}
        {step !== "otp" && (
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#F7FAF0] border border-[#2F5D3A]/15 mb-5">
            <button
              type="button"
              onClick={() => {
                setStep("login");
                setError("");
              }}
              className={`py-2 rounded-lg text-xs font-bold transition ${
                step === "login"
                  ? "bg-[#1B4D2E] text-white"
                  : "text-[#2F5D3A]"
              }`}
            >
              Student Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("register");
                setError("");
              }}
              className={`py-2 rounded-lg text-xs font-bold transition ${
                step === "register"
                  ? "bg-[#1B4D2E] text-white"
                  : "text-[#2F5D3A]"
              }`}
            >
              New Registration
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#835B2A]/10 border border-[#835B2A]/30 text-xs font-medium text-[#835B2A]">
            {error}
          </div>
        )}

        {/* University Selector shared across Login & Register */}
        {step !== "otp" && (
          <div className="mb-3.5 space-y-2">
            <label className="block text-xs font-bold text-[#18261D]">
              Select Your University *
            </label>
            <select
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7FAF0] border border-[#2F5D3A]/20 text-sm font-medium text-[#18261D]"
            >
              {UNIVERSITIES_LIST.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
              <option value="Other">Other University (Enter name)</option>
            </select>
            {university === "Other" && (
              <input
                type="text"
                required
                value={customUniversity}
                onChange={(e) => setCustomUniversity(e.target.value)}
                placeholder="Type your university name..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#F7FAF0] border border-[#2F5D3A]/20 text-sm"
              />
            )}
          </div>
        )}

        {/* LOGIN FORM */}
        {step === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#18261D] mb-1">
                University Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7FAF0] border border-[#2F5D3A]/20 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#18261D] mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7FAF0] border border-[#2F5D3A]/20 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#1B4D2E] hover:bg-[#153d24] text-white text-sm font-semibold cursor-pointer"
            >
              {loading
                ? "Authenticating JWT..."
                : `Log in to ${resolvedUniversity}`}
            </button>
          </form>
        )}

        {/* REGISTRATION FORM */}
        {step === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#18261D] mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rohan Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7FAF0] border border-[#2F5D3A]/20 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#18261D] mb-1">
                University Email (.ac.in / .edu.in / .edu)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.ac.in"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7FAF0] border border-[#2F5D3A]/20 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#18261D] mb-1">
                  Year / Batch
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7FAF0] border border-[#2F5D3A]/20 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#18261D] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7FAF0] border border-[#2F5D3A]/20 text-xs"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#1B4D2E] hover:bg-[#153d24] text-white text-sm font-semibold cursor-pointer"
            >
              {loading ? "Sending 6-Digit OTP..." : "Send Verification OTP"}
            </button>
          </form>
        )}

        {/* 6-DIGIT OTP VERIFICATION STEP */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-center">
            <div className="p-3 rounded-xl bg-[#EAEFE0] text-xs text-[#1B4D2E]">
              We sent a 6-digit code to <strong>{email}</strong> to verify{" "}
              <strong>{resolvedUniversity}</strong>
            </div>

            <div className="flex justify-center gap-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-11 h-12 rounded-xl border-2 border-[#2F5D3A]/30 focus:border-[#1B4D2E] text-center text-lg font-extrabold text-[#18261D] bg-[#F7FAF0]"
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs px-1">
              <button
                type="button"
                onClick={() => setOtpDigits(["4", "8", "2", "9", "1", "6"])}
                className="text-[#4F8F52] font-semibold hover:underline"
              >
                Auto-fill demo OTP (482916)
              </button>
              <button
                type="button"
                disabled={timer > 0 || loading}
                onClick={handleResendOtp}
                className="text-[#835B2A] font-semibold disabled:opacity-50"
              >
                {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#1B4D2E] text-white text-sm font-semibold cursor-pointer"
            >
              Verify Email & Enter {resolvedUniversity}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MODAL 2: CREATE / EDIT LISTING MODAL (CRUD + Device Gallery Photo Picker)
// ============================================================================
function CreateEditListingModal({ initialData, onClose, onSave }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState(
    initialData?.category || "Books & Academics"
  );
  const [subcategory, setSubcategory] = useState(
    initialData?.subcategory || "Textbooks"
  );
  const [condition, setCondition] = useState(initialData?.condition || "Like New");
  const [price, setPrice] = useState(initialData?.price || 500);
  const [meetingPoint, setMeetingPoint] = useState(
    initialData?.meetingPoint || CAMPUS_MEETING_POINTS[0].name
  );
  const [description, setDescription] = useState(initialData?.description || "");
  const [uploadedImages, setUploadedImages] = useState(
    initialData?.images?.length
      ? initialData.images
      : initialData?.imageUrl
        ? [initialData.imageUrl]
        : []
  );

  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Read photos directly from the student's phone/laptop gallery
  const handleGalleryUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      e.target.value = "";
      return;
    }

    try {
      setIsUploadingImages(true);

      const result = await api.uploadImage(file);

      setUploadedImages([result.imageUrl]);

    } catch (error) {
      alert(error.message || "Image upload failed.");
    } finally {
      setIsUploadingImages(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = () => {
    setUploadedImages([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title,
      category,
      subcategory,
      condition,
      conditionDesc:
        condition === "Like New"
          ? "Minimal signs of use, campus verified"
          : "Fully functional, normal student wear",
      listingType: "For sale",
      price: Number(price),
      meetingPoint,
      description,
      images: uploadedImages,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 border border-[#2F5D3A]/20 shadow-xl my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F7FAF0] flex items-center justify-center text-[#2F5D3A]"
        >
          <X className="w-4 h-4" />
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-[#4F8F52]">
          CAMPUS CIRCULAR LISTING
        </span>
        <h2 className="text-2xl font-bold text-[#18261D] mt-0.5 mb-4">
          {initialData ? "Edit your listing" : "List an item for fellow students"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#18261D] mb-1">
              Item Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Engineering Mechanics Textbook + Lab Manual"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7FAF0] border border-[#2F5D3A]/20 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#18261D] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value;
                  setCategory(cat);
                  const found = CATEGORIES.find((c) => c.name === cat);
                  if (found?.subs?.[0]) setSubcategory(found.subs[0]);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F7FAF0] border border-[#2F5D3A]/20 text-xs font-medium"
              >
                {CATEGORIES.filter((c) => c.name !== "All categories").map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18261D] mb-1">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F7FAF0] border border-[#2F5D3A]/20 text-xs font-medium"
              >
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18261D] mb-1">
                Price (₹ INR) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F7FAF0] border border-[#2F5D3A]/20 text-sm font-bold text-[#835B2A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#18261D] mb-1">
              Preferred Campus Exchange Spot
            </label>
            <select
              value={meetingPoint}
              onChange={(e) => setMeetingPoint(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7FAF0] border border-[#2F5D3A]/20 text-xs font-medium"
            >
              {CAMPUS_MEETING_POINTS.map((mp) => (
                <option key={mp.id} value={mp.name}>
                  {mp.name} ({mp.hours})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#18261D] mb-1">
              Description *
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mention edition, usage duration, or anything a junior/senior should know..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#F7FAF0] border border-[#2F5D3A]/20 text-sm"
            />
          </div>

          {/* Device Gallery Image Upload + Sample Presets */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#18261D]">
                Product Photos ({uploadedImages.length} selected)
              </label>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B4D2E] hover:bg-[#153d24] text-white text-xs font-semibold cursor-pointer transition">
                <Plus className="w-3.5 h-3.5" />
                <span>Choose photos from gallery</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Active Selected / Uploaded Image Previews */}
            <div className="flex flex-wrap gap-2.5 p-2.5 rounded-2xl bg-[#F7FAF0] border border-dashed border-[#2F5D3A]/35">
              {uploadedImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-16 rounded-xl overflow-hidden border border-[#2F5D3A]/25 bg-white"
                >
                  <img
                    src={imgUrl}
                    alt={`Selected ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {idx === 0 && (
                    <span className="absolute bottom-0 inset-x-0 bg-[#1B4D2E]/90 text-white text-[9px] font-bold text-center py-0.5">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    title="Remove photo"
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Optional Quick Sample Gallery */}
            <div>
              <p className="text-[11px] text-[#2F5D3A]/75 mb-1">
                Or tap a sample campus image preset:
              </p>
              <div className="grid grid-cols-6 gap-2">
                {SAMPLE_IMAGE_GALLERY.map((img) => (
                  <button
                    type="button"
                    key={img.label}
                    onClick={() => setUploadedImages([img.url])}
                    className={`rounded-xl overflow-hidden border-2 h-12 transition ${
                      uploadedImages[0] === img.url
                        ? "border-[#1B4D2E] ring-2 ring-[#A7C957]"
                        : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.label}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#2F5D3A]/25 text-xs font-semibold text-[#2F5D3A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#1B4D2E] hover:bg-[#153d24] text-white text-xs font-semibold shadow-sm cursor-pointer"
            >
              {initialData ? "Save changes" : "Publish to CampusHaat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// MODAL 3: BACKEND SQL API INTEGRATION CONFIGURATOR
// ============================================================================
function ApiConfigModal({ baseUrl, liveMode, onClose, onSave }) {
  const [urlInput, setUrlInput] = useState(baseUrl);
  const [isLive, setIsLive] = useState(liveMode);

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#2F5D3A]/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-[#1B4D2E]" />
            <h2 className="font-bold text-lg text-[#18261D]">
              SQL Backend & JWT Integration
            </h2>
          </div>
          <button onClick={onClose} className="text-[#2F5D3A]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#2F5D3A] leading-relaxed">
          Connect CampusHaat directly to your running SQL-backed REST API (local or
          deployed cloud URL). All auth, 6-digit OTP, and product CRUD requests attach
          your <code className="font-mono bg-[#F7FAF0] px-1">Authorization: Bearer &lt;JWT&gt;</code> header automatically.
        </p>

        <div>
          <label className="block text-xs font-bold text-[#18261D] mb-1">
            Backend API Base URL
          </label>
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="http://localhost:8080/api"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7FAF0] border border-[#2F5D3A]/20 text-sm font-mono"
          />
        </div>

        <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#EAEFE0] cursor-pointer">
          <input
            type="checkbox"
            checked={isLive}
            onChange={(e) => setIsLive(e.target.checked)}
            className="w-4 h-4 accent-[#1B4D2E]"
          />
          <div>
            <p className="text-xs font-bold text-[#18261D]">
              Enable Live Backend HTTP Requests
            </p>
            <p className="text-[11px] text-[#2F5D3A]">
              Uncheck to stay in standalone Prototype Demo Mode during UI walkthroughs.
            </p>
          </div>
        </label>

        <div className="bg-[#F7FAF0] rounded-xl p-3 text-[11px] font-mono text-[#2F5D3A] space-y-1">
          <p className="font-bold text-[#1B4D2E]">Wired REST Endpoints:</p>
          <p>POST /auth/register · POST /auth/verify-otp · POST /auth/login</p>
          <p>GET /products · POST /products · PUT /products/:id · DELETE /products/:id</p>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#2F5D3A]/20 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ baseUrl: urlInput, liveMode: isLive })}
            className="px-5 py-2 rounded-xl bg-[#1B4D2E] text-white text-xs font-semibold"
          >
            Apply Configuration
          </button>
        </div>
      </div>
    </div>
  );
}