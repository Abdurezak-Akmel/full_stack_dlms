import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Building2, FileText, Shield, Users, Globe, LayoutGrid, ArrowRight, CheckCircle2, Menu, Play } from "lucide-react";
import { ModeToggle } from '@/components/mode-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { RegisterModal, TrackStatusModal } from '@/components/landing/LandingModals';

export default function Landing() {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isTrackOpen, setIsTrackOpen] = useState(false);
    const [expandedFeature, setExpandedFeature] = useState<number | null>(null);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const features = [
        {
            title: t.features.cards[0].title,
            description: t.features.cards[0].desc,
            icon: <LayoutGrid className="w-10 h-10 text-primary" />,
            detail: "Our centralized dashboard allows you to manage incoming and outgoing letters, internal memos, and archival requests from a single interface. Support for multi-department routing ensures nothing gets lost."
        },
        {
            title: t.features.cards[1].title,
            description: t.features.cards[1].desc,
            icon: <Shield className="w-10 h-10 text-primary" />,
            detail: "We utilize AES-256 encryption for all stored documents and TLS 1.3 for data in transit. Role-based access control (RBAC) implies that only authorized personnel can view sensitive government data."
        },
        {
            title: t.features.cards[2].title,
            description: t.features.cards[2].desc,
            icon: <FileText className="w-10 h-10 text-primary" />,
            detail: "Automated workflows reduce manual handoffs. Approvals can be done digitally with e-signatures, reducing the average turnaround time for document processing by up to 70%."
        },
        {
            title: t.features.cards[3].title,
            description: t.features.cards[3].desc,
            icon: <Users className="w-10 h-10 text-primary" />,
            detail: "Built with accessibility in mind. The interface supports multiple languages and is optimized for use on various devices, ensuring every citizen and public servant can use it effectively."
        }
    ];

    const partners = [
        { name: "Ministry of Innovation & Technology", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Seal_of_Ethiopia.svg", url: "#" },
        { name: "Ministry of Revenue", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Seal_of_Ethiopia.svg", url: "#" },
        { name: "Immigration and Citizenship Service", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Seal_of_Ethiopia.svg", url: "#" },
        { name: "Civil Service Commission", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Seal_of_Ethiopia.svg", url: "#" },
        { name: "Investment Commission", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Seal_of_Ethiopia.svg", url: "#" },
        { name: "Ministry of Trade", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Seal_of_Ethiopia.svg", url: "#" },
        { name: "Ethio Telecom", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Seal_of_Ethiopia.svg", url: "#" },
        { name: "National ID Program", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Seal_of_Ethiopia.svg", url: "#" }
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans relative overflow-x-hidden">
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('hero')}>
                        {/* A-Mesob Logo */}
                        <img src="/images/logo.png" alt="A-Mesob Logo" className="w-8 h-8 object-contain" />
                        <span className="text-xl font-bold tracking-tight">A-Mesob</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <button onClick={() => scrollToSection('hero')} className="hover:text-primary transition-colors">{t.nav.home}</button>
                        <button onClick={() => scrollToSection('about')} className="hover:text-primary transition-colors">{t.nav.about}</button>
                        <button onClick={() => scrollToSection('features')} className="hover:text-primary transition-colors">{t.nav.features}</button>
                        <button onClick={() => scrollToSection('partners')} className="hover:text-primary transition-colors">{t.nav.partners}</button>
                        <button onClick={() => scrollToSection('footer')} className="hover:text-primary transition-colors">{t.nav.contact}</button>
                    </div>

                    <div className="flex items-center gap-2">
                        <LanguageToggle />
                        <ModeToggle />
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section id="hero" className="flex flex-col lg:flex-row min-h-screen">
                {/* Left Side - Hero Content */}
                <div className="lg:w-1/2 flex flex-col justify-center p-8 lg:p-16 xl:p-24 relative z-10 bg-background pt-24">
                    <div className="max-w-xl mx-auto lg:mx-0 animate-in fade-in slide-in-from-left-10 duration-1000">
                        <div className="flex items-center gap-3 mb-8">
                            {/* Logo handling */}
                            <img src="/images/logo.png" alt="A-Mesob Logo" className="w-12 h-12 object-contain" />
                            <span className="text-2xl font-bold tracking-tight">A-Mesob</span>
                        </div>

                        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
                            {t.hero.title.split('Document').map((part, i) => i === 0 ? 'Document' + part : <span key={i} className="text-primary">{part}</span>)}
                        </h1>

                        <p className="text-lg text-muted-foreground mb-8 text-pretty">
                            {t.hero.subtitle}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" onClick={() => navigate('/login')} className="text-base px-8 h-12 shadow-lg hover:shadow-xl transition-all">
                                Login <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="lg" onClick={() => navigate('/signup')} className="text-base px-8 h-12">
                                Sign Up
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Side - Video (PM / Tourism placeholder) */}
                <div className="lg:w-1/2 min-h-[50vh] lg:h-auto bg-muted relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent z-10 w-24 pointer-events-none" />
                    <div className="h-full w-full">
                        <iframe
                            width="100%"
                            height="100%"
                            // src="https://www.youtube.com/embed/jQwJzdexyQo?autoplay=1&mute=1&controls=0&loop=1&playlist=jQwJzdexyQo"
                            title="Ethiopian Tourism / PM Project"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                        />
                    </div>
                </div>
            </section>

            {/* ABOUT A-MESOB */}
            <section id="about" className="py-24 bg-muted/30 scroll-mt-16">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-primary text-primary-foreground hover:bg-primary/80 mb-6">
                                {t.about.badge}
                            </div>
                            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-6">
                                {t.about.title}
                            </h2>
                            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                                {t.about.desc1}
                            </p>
                            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                                {t.about.desc2}
                            </p>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {t.about.list.map((item, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        <span className="font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="lg:w-1/2 relative rounded-3xl overflow-hidden shadow-2xl border border-border/50">
                            {/* Replaced Right Image with Video Embed (A-Mesob promo placeholder) */}
                            <div className="aspect-video w-full bg-black">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src="https://www.youtube.com/embed/d86ws7mQYIg?si=7RsNak-E40qb7VRT"
                                    title="A-Mesob Introduction"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* KEY FEATURES */}
            <section id="features" className="py-24 bg-background scroll-mt-16">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">{t.features.title}</h2>
                        <p className="text-muted-foreground text-lg">
                            {t.features.subtitle}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <Dialog key={index}>
                                <DialogTrigger asChild>
                                    <Card className="border-border/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group h-full">
                                        <CardHeader>
                                            <div className="mb-4 bg-primary/10 w-fit p-3 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                {React.cloneElement(feature.icon as React.ReactElement, { className: "w-10 h-10 group-hover:text-white transition-colors" })}
                                            </div>
                                            <CardTitle className="text-xl">{feature.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="text-base group-hover:text-foreground/80 transition-colors">
                                                {feature.description}
                                            </CardDescription>
                                            <div className="mt-4 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                                Read More <ArrowRight className="ml-1 w-3 h-3" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px] bg-card/[0.98] backdrop-blur-xl border-primary/20">
                                    <div className="absolute top-4 right-4">
                                        <LanguageToggle />
                                    </div>
                                    <DialogHeader>
                                        <div className="mb-6 flex justify-center">
                                            <div className="p-6 bg-primary/10 rounded-full">
                                                {React.cloneElement(feature.icon as React.ReactElement, { className: "w-16 h-16 text-primary" })}
                                            </div>
                                        </div>
                                        <DialogTitle className="text-3xl text-center mb-2">{feature.title}</DialogTitle>
                                        <DialogDescription className="text-center text-lg">
                                            {feature.detail}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="mt-4 p-4 bg-muted rounded-lg border border-border/50">
                                        <h4 className="font-semibold mb-2">Key Benefits:</h4>
                                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                            <li>Improved accessibility for all users</li>
                                            <li>Real-time data processing</li>
                                            <li>High standards of security compliance</li>
                                        </ul>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        ))}
                    </div>
                </div>
            </section>

            {/* PARTNERS & MINISTRIES */}
            <section id="partners" className="py-24 bg-slate-50 dark:bg-slate-900/50 scroll-mt-16">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">{t.partners.title}</h2>
                        <p className="text-muted-foreground text-lg">
                            {t.partners.subtitle}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {partners.map((partner, i) => (
                            <a
                                key={i}
                                href={partner.url}
                                className="group flex flex-col items-center justify-center p-8 bg-background rounded-2xl border border-border/50 shadow-sm hover:shadow-lg hover:scale-105 transition-all text-center"
                            >
                                <img src={partner.logo} alt={partner.name} className="h-16 w-16 mb-4 opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                                <span className="font-semibold text-sm md:text-base group-hover:text-primary transition-colors">{partner.name}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer id="footer" className="bg-slate-950 text-slate-200 py-16">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <img src="/images/logo.png" alt="A-Mesob Logo" className="w-8 h-8 object-contain" />
                                <span className="text-xl font-bold text-white">A-Mesob</span>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {t.footer.copyright}
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-6 text-white">{t.footer.platform}</h3>
                            <ul className="space-y-3 text-sm text-slate-400">
                                <li><button onClick={() => navigate('/login')} className="hover:text-primary transition-colors text-left w-full">{t.footer.links.login}</button></li>
                                <li><button onClick={() => navigate('/signup')} className="hover:text-primary transition-colors text-left w-full">Sign Up</button></li>
                                <li><button onClick={() => setIsTrackOpen(true)} className="hover:text-primary transition-colors text-left w-full">{t.footer.links.track}</button></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-6 text-white">{t.footer.legal}</h3>
                            <ul className="space-y-3 text-sm text-slate-400">
                                <li><a href="#" className="hover:text-primary transition-colors">{t.footer.links.privacy}</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">{t.footer.links.terms}</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">{t.footer.links.access}</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-6 text-white">{t.footer.contact}</h3>
                            <ul className="space-y-3 text-sm text-slate-400">
                                <li>support@amesob.gov.et</li>
                                <li>+251 11 551 2222</li>
                                <li>Addis Ababa, Ethiopia</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 mt-16 pt-8 text-center text-sm text-slate-500">
                        <p>© {new Date().getFullYear()} {t.footer.copyright}</p>
                    </div>
                </div>
            </footer>

            <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
            <TrackStatusModal isOpen={isTrackOpen} onClose={() => setIsTrackOpen(false)} />
        </div>
    );
}
