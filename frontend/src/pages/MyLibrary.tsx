import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DocumentList } from '@/components/documents/DocumentList';
import { ItemDetailModal } from '@/components/documents/ItemDetailModal';
import { Document } from '@/types/dlms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderPlus, Plus, Upload, Search, X, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

// Types
interface Category {
    id: string;
    name: string;
    // user_id and others if needed
}

export default function MyLibrary() {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Modals
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
    const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);

    // Form States
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadType, setUploadType] = useState('document');
    const [uploadCategoryId, setUploadCategoryId] = useState<string>('none');
    const [uploadTitle, setUploadTitle] = useState('');

    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [libraryDocsForCategory, setLibraryDocsForCategory] = useState<Document[]>([]);

    useEffect(() => {
        fetchCategories();
        fetchDocuments();
    }, [selectedCategory]);

    const fetchCategories = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/categories');
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            let url = 'http://localhost:5000/api/documents/library';
            if (selectedCategory) {
                url += `?categoryId=${selectedCategory}`;
            }
            const res = await fetch(url);
            const data = await res.json();
            setDocuments(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load documents');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!uploadFile) return;

        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('type', uploadType);
        formData.append('title', uploadTitle); // Can be empty, backend will use filename
        if (uploadCategoryId && uploadCategoryId !== 'none') {
            formData.append('categoryId', uploadCategoryId);
        }

        try {
            const res = await fetch('http://localhost:5000/api/documents/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                toast.success('Document uploaded successfully');
                setIsUploadOpen(false);
                setUploadFile(null);
                setUploadTitle('');
                fetchDocuments();
                fetchCategories(); // Update if needed
            } else {
                toast.error('Upload failed');
            }
        } catch (error) {
            toast.error('Upload failed');
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName) return;
        try {
            const res = await fetch('http://localhost:5000/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategoryName }),
            });
            if (res.ok) {
                toast.success('Category created');
                setIsAddCategoryOpen(false);
                setNewCategoryName('');
                fetchCategories();
            }
        } catch (error) {
            toast.error('Failed to create category');
        }
    };

    const handleUpdateCategory = async () => {
        if (!editingCategory || !editingCategory.name) return;
        try {
            const res = await fetch(`http://localhost:5000/api/categories/${editingCategory.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editingCategory.name }),
            });
            if (res.ok) {
                toast.success('Category updated');
                setIsEditCategoryOpen(false);
                setEditingCategory(null);
                fetchCategories();
            } else {
                toast.error('Failed to update category');
            }
        } catch (error) {
            toast.error('Failed to update category');
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast.success('Category deleted');
                if (selectedCategory === id) setSelectedCategory(null);
                fetchCategories();
            } else {
                toast.error('Failed to delete category');
            }
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };

    const handleDeleteDocument = async (doc: Document) => {
        if (!confirm(`Are you sure you want to delete "${doc.title}"?`)) return;
        try {
            const res = await fetch(`http://localhost:5000/api/documents/${doc.id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast.success('Document deleted');
                setDocuments(prev => prev.filter(d => d.id !== doc.id));
            } else {
                toast.error('Failed to delete document');
            }
        } catch (error) {
            toast.error('Error deleting document');
        }
    };



    return (
        <AppLayout
            title="My Library"
            subtitle="Browse and organize your stored documents and letters"
            actions={
                !!user?.privileges?.myLibrary?.upload && (
                    <Button onClick={() => setIsUploadOpen(true)}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                    </Button>
                )
            }
        >
            <div className="flex gap-6 h-[calc(100vh-180px)] animate-fade-in">
                {/* Sidebar - Categories */}
                <div className="w-60 flex-shrink-0 flex flex-col gap-4">
                    {/* Search Bar placed outside/above category or in main content? User said "Below the Header of this page, add a search bar". 
                        The AppLayout has a header. "Below the Header" might mean top of main content area.
                        Lets put it in the top of the main content column or sidebar? 
                        The user said "Below the Header of this page". This page is inside AppLayout.
                        I'll put it at the top of the flex container for now.
                     */}

                    <div className="panel-section h-full flex flex-col">
                        <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
                            <h3 className="font-semibold text-sm">Categories</h3>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsAddCategoryOpen(true)}>
                                <FolderPlus className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="p-2 space-y-1 overflow-y-auto flex-1 max-h-[calc(100vh-250px)] scrollbar-thin">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                                    !selectedCategory ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
                                )}
                            >
                                <span>All Items</span>
                            </button>

                            {categories.map((cat) => (
                                <div key={cat.id} className="group relative flex items-center gap-1">
                                    <button
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={cn(
                                            "flex-1 flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors pr-14", // Added padding right for buttons
                                            selectedCategory === cat.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className="truncate">{cat.name}</span>
                                        </div>
                                    </button>
                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded-md">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingCategory(cat);
                                                setIsEditCategoryOpen(true);
                                            }}
                                        >
                                            <Pencil className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteCategory(cat.id);
                                            }}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search documents..."
                            className="pl-9 bg-background"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <DocumentList
                        documents={documents.filter(doc => doc.title.toLowerCase().includes(searchQuery.toLowerCase()))}
                        onDocumentClick={() => { }}
                        onView={() => { }}
                        onDelete={handleDeleteDocument}
                        onDownload={(doc) => {
                            // Let the default download handler in DocumentList work unless we need custom logic.
                            // But DocumentList checks if onDownload is passed.
                            // If I pass a function here, I must handle the download.
                            // If I DONT pass a function, DocumentList uses fallback logic (window.open/a tag) which I added.
                            // BUT wait, I made DocumentList use fallback logic ONLY if onDownload is NOT passed OR inside the else block?
                            // Let's check my DocumentList update.
                            // I wrote: if (onDownload) { onDownload(doc); } else { ... fallback ... }
                            // So if I pass undefined, fallback works.
                            // But the prop is defined as `onDownload?: ...`.
                            // So I can just omit it or pass undefined.
                            // However, Typescript might require it if I put it in the bracket in JSX? No, it's optional in prop types.
                            // BUT... line 189 in original code had `onDownload={() => { }}` (empty function).
                            // An empty function IS truthy, so it will execute empty function and do nothing.
                            // I MUST REMOVE the empty function prop or implement real download here.

                            // Implementation:
                            const filename = doc.file_path ? doc.file_path.split(/[\\/]/).pop() : doc.original_name;
                            const link = document.createElement('a');
                            // Assuming static serve
                            link.href = `http://localhost:5000/uploads/${filename}`;
                            link.download = doc.original_name || filename || 'download';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                        onSaveToLibrary={() => { }}
                    />
                </div>
            </div>

            {/* Upload Modal */}
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={uploadType} onValueChange={setUploadType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="document">Document</SelectItem>
                                    <SelectItem value="letter">Letter</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Category (Optional)</Label>
                            <Select value={uploadCategoryId} onValueChange={setUploadCategoryId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {categories.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>File</Label>
                            <Input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpload} disabled={!uploadFile}>Upload</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Category Modal */}
            <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Category Name</Label>
                            <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g. Financial Reports" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateCategory} disabled={!newCategoryName}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Category Modal */}
            <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Category Name</Label>
                            <Input
                                value={editingCategory?.name || ''}
                                onChange={(e) => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
                                placeholder="Category Name"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditCategoryOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateCategory} disabled={!editingCategory?.name}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


        </AppLayout>
    );
}
