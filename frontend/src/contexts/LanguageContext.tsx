import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'am';

type Translations = {
    [key in Language]: {
        nav: {
            home: string;
            about: string;
            features: string;
            partners: string;
            contact: string;
        };
        hero: {
            title: string;
            subtitle: string;
            getStarted: string;
            learnMore: string;
        };
        about: {
            badge: string;
            title: string;
            desc1: string;
            desc2: string;
            list: string[];
        };
        features: {
            title: string;
            subtitle: string;
            cards: {
                title: string;
                desc: string;
            }[];
        };
        partners: {
            title: string;
            subtitle: string;
        };
        footer: {
            platform: string;
            legal: string;
            contact: string;
            copyright: string;
            links: {
                login: string;
                register: string;
                track: string;
                privacy: string;
                terms: string;
                access: string;
            };
        };
        modals: {
            registerTitle: string;
            registerDesc: string;
            trackTitle: string;
            trackDesc: string;
            submit: string;
            check: string;
            fullName: string;
            empId: string;
        };
    };
};

const translations: Translations = {
    en: {
        nav: {
            home: "Home",
            about: "About",
            features: "Features",
            partners: "Partners",
            contact: "Contact"
        },
        hero: {
            title: "Document and Letter Management System",
            subtitle: "Streamline your organization's document workflow with A-Mesob's secure, efficient, and user-friendly management platform.",
            getStarted: "Get Started",
            learnMore: "Learn More"
        },
        about: {
            badge: "Vision 2030",
            title: "Digitalizing Ethiopia's Future",
            desc1: "A-Mesob is a new initiative established as part of the Ethiopian government's comprehensive digitalization policy for the next five years.",
            desc2: "Our main focus is bringing different government service-giving entities into one unified place, creating a true \"One-Stop Service Center\" for all citizens.",
            list: ["5-Year Strategic Plan", "Unified Service Gateway", "Transparency Checking", "Digital Archiving"]
        },
        features: {
            title: "Why Choose A-Mesob?",
            subtitle: "An integrated platform built to modernize how government documents and letters are handled across the nation.",
            cards: [
                { title: "Centralized Management", desc: "Access all government services and documents in one unified platform." },
                { title: "Secure Digital Archives", desc: "State-of-the-art encryption ensures your sensitive documents remain confidential." },
                { title: "Efficient Workflow", desc: "Streamlined letter processing and inter-office communication for speed." },
                { title: "Citizen-Centric", desc: "Designed heavily around the needs of Ethiopian citizens and businesses." }
            ]
        },
        partners: {
            title: "Participating Institutions",
            subtitle: "Connecting you to major government offices and ministries."
        },
        footer: {
            platform: "Platform",
            legal: "Legal",
            contact: "Contact",
            copyright: "A-Mesob Digital Services. All rights reserved.",
            links: {
                login: "Login",
                register: "Register",
                track: "Track Status",
                privacy: "Privacy Policy",
                terms: "Terms of Service",
                access: "Accessibility"
            }
        },
        modals: {
            registerTitle: "Register Account",
            registerDesc: "Enter your details to request system access.",
            trackTitle: "Track Registration Status",
            trackDesc: "Check the status of your registration request.",
            submit: "Submit Request",
            check: "Check Status",
            fullName: "Full Name",
            empId: "Employee ID"
        }
    },
    am: {
        nav: {
            home: "መነሻ",
            about: "ስለ እኛ",
            features: "ባህሪያት",
            partners: "አጋሮች",
            contact: "ያግኙን"
        },
        hero: {
            title: "የሰነድ እና ደብዳቤ አስተዳደር ስርዓት",
            subtitle: "የድርጅትዎን የሰነድ ፍሰት በ A-Mesob ደህንነቱ የተጠበቀ እና ቀልጣፋ የአስተዳደር መድረክ ያቀላጥፉ።",
            getStarted: "ጀምር",
            learnMore: "ተጨማሪ ያንብቡ"
        },
        about: {
            badge: "ራዕይ 2030",
            title: "የኢትዮጵያን የወደፊት ጊዜ ዲጂታል ማድረግ",
            desc1: "A-Mesob እንደ የኢትዮጵያ መንግስት አጠቃላይ የዲጂታላይዜሽን ፖሊሲ አካል ሆኖ የተቋቋመ አዲስ ተነሳሽነት ነው።",
            desc2: "ዋናው ትኩረታችን የተለያዩ የመንግስት አገልግሎት ሰጪ አካላትን ወደ አንድ ቦታ በማምጣት ለዜጎች እውነተኛ \"አንድ ማዕከል አገልግሎት\" መፍጠር ነው።",
            list: ["የ5-ዓመት ስትራቴጂክ ዕቅድ", "የተዋሃደ የአገልግሎት መግቢያ", "ግልጽነት ማረጋገጫ", "ዲጂታል መዝገብ ቤት"]
        },
        features: {
            title: "ለምን A-Mesobን ይምረጡ?",
            subtitle: "የመንግስት ሰነዶች እና ደብዳቤዎች በሀገር አቀፍ ደረጃ እንዴት እንደሚያዙ ለማዘመን የተገነባ መድረክ።",
            cards: [
                { title: "ማዕከላዊ አስተዳደር", desc: "ሁሉንም የመንግስት አገልግሎቶች እና ሰነዶች በአንድ መድረክ ያግኙ።" },
                { title: "ደህንነቱ የተጠበቀ ዲጂታል መዝገብ", desc: "ዘመናዊ የኢንክሪፕሽን ቴክኖሎጂ ሚስጥራዊ ሰነዶችዎ ደህንነታቸው እንደተጠበቀ ያረጋግጣል።" },
                { title: "ቀልጣፋ የስራ ፍሰት", desc: "ለፍጥነት የተሳለጠ የደብዳቤ ሂደት እና የቢሮ ውስጥ ግንኙነት።" },
                { title: "ዜጋ-ተኮር", desc: "በዋናነት በኢትዮጵያ ዜጎች እና ንግዶች ፍላጎት ዙሪያ የተነደፈ።" }
            ]
        },
        partners: {
            title: "ተሳታፊ ተቋማት",
            subtitle: "ከዋና ዋና የመንግስት መስሪያ ቤቶች እና ሚኒስቴሮች ጋር ያገናኘዎታል።"
        },
        footer: {
            platform: "መድረክ",
            legal: "ህጋዊ",
            contact: "ያግኙን",
            copyright: "A-Mesob ዲጂታል አገልግሎቶች። መብቱ በህግ የተጠበቀ ነው።",
            links: {
                login: "ግባ",
                register: "ተመዝገብ",
                track: "ሁኔታ ተከታተል",
                privacy: "የግላዊነት ፖሊሲ",
                terms: "የአግልግሎት ውል",
                access: "ተደራሽነት"
            }
        },
        modals: {
            registerTitle: "መለያ ይመዝገቡ",
            registerDesc: "የስርዓት መዳረሻ ለመጠየቅ ዝርዝሮችዎን ያስገቡ።",
            trackTitle: "የምዝገባ ሁኔታን ይከታተሉ",
            trackDesc: "የምዝገባ ጥያቄዎን ሁኔታ ያረጋግጡ።",
            submit: "ጥያቄ አቅርብ",
            check: "ሁኔታ አረጋግጥ",
            fullName: "ሙሉ ስም",
            empId: "የሰራተኛ መታወቂያ"
        }
    }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations['en'];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
