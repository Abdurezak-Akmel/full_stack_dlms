import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { LanguageToggle } from '@/components/language-toggle';
import { ModeToggle } from '@/components/mode-toggle';

interface AppLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function AppLayout({
  children,
  title,
  subtitle,
  actions,
  className,
  ...props
}: AppLayoutProps) {
  // const [searchQuery, setSearchQuery] = useState('');
  // const [searchResults, setSearchResults] = useState<Document[]>([]);
  // const [showResults, setShowResults] = useState(false);
  // const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();



  return (
    <div className={`flex h-screen w-full bg-background ${className || ''}`} {...props}>
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between flex-shrink-0 z-40">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            {/* Search bar removed */}
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ModeToggle />
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full" />
            </Button>
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <User className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Header */}
        {(title || actions) && (
          <div className="px-6 py-4 border-b border-border bg-card/50 flex items-center justify-between flex-shrink-0">
            <div>
              {title && <h1 className="text-xl font-semibold text-foreground">{title}</h1>}
              {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
