import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export function LanguageToggle() {
    const { setLanguage, language } = useLanguage()

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'am' : 'en');
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="w-9 px-0"
        >
            <span className="font-bold text-xs uppercase">{language}</span>
            <span className="sr-only">Toggle language</span>
        </Button>
    )
}
