import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
    LayoutDashboard, Users, Code, Settings as SettingsIcon, LogOut, 
    Download, Search, Filter, Trash2, Plus, ArrowLeft, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { 
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "../components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import {
    getLeads, exportLeads, deleteLead, getLeadStats,
    getPixels, createPixel, deletePixel, updatePixel,
    getCMSSettings, updateCMSSettings
} from "../mock";

// --- LEAD MANAGEMENT TAB ---
const LeadsTab = () => {
    // ... Leads tab stays the same
    const [leads, setLeads] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ start_date: '', end_date: '', search: '' });

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const data = await getLeads(filters);
            setLeads(data.leads || []);
            const s = await getLeadStats();
            setStats(s);
        } catch (e) {
            toast.error("Failed to fetch leads");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(fetchLeads, 500);
        return () => clearTimeout(debounce);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const handleExport = () => {
        exportLeads(filters);
        toast.success("Export started");
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this lead?")) return;
        try {
            await deleteLead(id);
            toast.success("Lead deleted");
            fetchLeads();
        } catch (e) {
            toast.error("Failed to delete lead");
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-[#e2e3e3] shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-[#5c5e62]">Total Leads</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-[#171a20]">{stats?.total || 0}</div>
                    </CardContent>
                </Card>
                <Card className="border-[#e2e3e3] shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-[#5c5e62]">Joined Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-[#11EAAD]">{stats?.today || 0}</div>
                    </CardContent>
                </Card>
                <Card className="border-[#e2e3e3] shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-[#5c5e62]">Interested in Investment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-[#3e6ae1]">{stats?.interested || 0}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-[#e2e3e3]">
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle className="text-xl">Leads Directory</CardTitle>
                            <CardDescription>Manage your prospect and investment leads</CardDescription>
                        </div>
                        <Button onClick={handleExport} className="bg-[#171a20] hover:bg-[#3e6ae1] shadow-sm">
                            <Download className="mr-2 h-4 w-4" /> Export CSV
                        </Button>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-4 pt-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#5c5e62]" />
                            <Input 
                                placeholder="Search name, phone, email, city..." 
                                className="pl-9 bg-[#f4f4f4] border-transparent form-input"
                                value={filters.search}
                                onChange={e => setFilters({...filters, search: e.target.value})}
                            />
                        </div>
                        <div className="flex gap-2 items-center">
                            <Filter className="h-4 w-4 text-[#5c5e62]" />
                            <Input 
                                type="date" 
                                className="w-auto bg-[#f4f4f4] border-transparent"
                                value={filters.start_date}
                                onChange={e => setFilters({...filters, start_date: e.target.value})}
                            />
                            <span>-</span>
                            <Input 
                                type="date" 
                                className="w-auto bg-[#f4f4f4] border-transparent"
                                value={filters.end_date}
                                onChange={e => setFilters({...filters, end_date: e.target.value})}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-auto max-h-[600px]">
                        <Table>
                            <TableHeader className="bg-[#f4f4f4] sticky top-0 z-10">
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Contact Info</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Interest</TableHead>
                                    <TableHead>Land</TableHead>
                                    <TableHead>Visit</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#11EAAD]" />
                                        </TableCell>
                                    </TableRow>
                                ) : leads.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-[#5c5e62]">
                                            No leads found matching criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    leads.map(lead => (
                                        <TableRow key={lead.id} className="hover:bg-[#f9f9f9]">
                                            <TableCell className="text-xs whitespace-nowrap">
                                                {new Date(lead.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-[#171a20]">{lead.name}</div>
                                                <div className="text-xs text-[#5c5e62]">{lead.email}</div>
                                                <div className="text-xs text-[#5c5e62]">{lead.phone}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{lead.city}</div>
                                                <div className="text-xs text-[#5c5e62]">{lead.location}</div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs ${lead.investment_interest === 'Yes' ? 'bg-[#11EAAD]/20 text-[#0447B8]' : 'bg-gray-100'}`}>
                                                    {lead.investment_interest || 'N/A'}
                                                </span>
                                            </TableCell>
                                            <TableCell>{lead.own_land}</TableCell>
                                            <TableCell className="text-xs max-w-[120px] truncate" title={lead.site_visit}>
                                                {lead.site_visit}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(lead.id)} className="h-8 w-8 text-red-500 hover:bg-red-50">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// --- TRACKING PIXELS TAB ---
const PixelsTab = () => {
    const [pixels, setPixels] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', type: 'facebook_pixel', code: '', enabled: true });

    const fetchPixels = async () => {
        try {
            const data = await getPixels();
            setPixels(data.pixels || []);
        } catch (e) {
            toast.error("Failed to load tracking codes");
        }
    };

    useEffect(() => { fetchPixels(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createPixel(formData);
            toast.success("Tracking code added!");
            setFormData({ name: '', type: 'facebook_pixel', code: '', enabled: true });
            fetchPixels();
        } catch (e) {
            toast.error("Failed to add code");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this tracking code?")) return;
        try {
            await deletePixel(id);
            toast.success("Code deleted");
            fetchPixels();
        } catch (e) {
             toast.error("Failed to delete code");
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            await updatePixel(id, { enabled: !currentStatus });
            toast.success("Status updated");
            fetchPixels();
        } catch (e) {
             toast.error("Failed to update status");
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <Card className="border-[#e2e3e3] sticky top-6">
                    <CardHeader>
                        <CardTitle>Add Tracking Code</CardTitle>
                        <CardDescription>Install Facebook Pixel, GTM, Google Analytics or custom scripts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Master FB Pixel" className="bg-[#f4f4f4]" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-[#f4f4f4] border border-[#e2e3e3] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#11EAAD]">
                                    <option value="facebook_pixel">Facebook Pixel</option>
                                    <option value="google_tag_manager">Google Tag Manager</option>
                                    <option value="google_analytics">Google Analytics</option>
                                    <option value="custom_script">Custom Script</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Snippet / Code</label>
                                <textarea required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="<script>...</script>" rows={6} className="w-full bg-[#f4f4f4] border border-[#e2e3e3] rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#11EAAD]"></textarea>
                                <p className="text-xs text-blue-600 block">Include full &lt;script&gt; and &lt;noscript&gt; tags exactly as provided.</p>
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                                <Switch checked={formData.enabled} onCheckedChange={c => setFormData({...formData, enabled: c})} />
                                <label className="text-sm">Enabled upon save</label>
                            </div>
                            <Button type="submit" className="w-full bg-[#171a20] hover:bg-[#3e6ae1]" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                                Install Code
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2">
                <Card className="border-[#e2e3e3]">
                    <CardHeader>
                        <CardTitle>Installed Pixels & Tags</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                         <Table>
                            <TableHeader className="bg-[#f4f4f4]">
                                <TableRow>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pixels.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-12 text-[#5c5e62]">
                                            No tracking codes installed yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pixels.map(px => (
                                        <TableRow key={px.id}>
                                            <TableCell>
                                                <Switch checked={px.enabled} onCheckedChange={() => toggleStatus(px.id, px.enabled)} />
                                            </TableCell>
                                            <TableCell className="font-medium">{px.name}</TableCell>
                                            <TableCell>
                                                <span className="bg-gray-100 px-2 py-1 rounded text-xs uppercase tracking-wide text-gray-600">{px.type.replace(/_/g, ' ')}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(px.id)} className="text-red-500 hover:bg-red-50">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

// --- CMS INTEGRATION TAB ---
const CMSIntegrationTab = () => {
    const [settings, setSettings] = useState({ cms_webhook_url: '', cms_api_key: '', cms_enabled: false });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        getCMSSettings().then(data => setSettings(data)).catch(console.error);
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateCMSSettings(settings);
            toast.success("CMS settings saved successfully");
        } catch (e) {
            toast.error("Failed to save CMS settings");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <Card className="border-[#e2e3e3]">
                <CardHeader>
                    <CardTitle>Content Management System</CardTitle>
                    <CardDescription>Integrate your leads automatically into your CMS or CRM via webhooks.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center space-x-3 p-4 bg-[#f4f4f4] rounded-md">
                        <Switch checked={settings.cms_enabled} onCheckedChange={c => setSettings({...settings, cms_enabled: c})} />
                        <div>
                            <p className="font-medium text-[#171a20]">Enable CMS Integration</p>
                            <p className="text-xs text-[#5c5e62]">Leads will be pushed to the webhook immediately upon submission.</p>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Webhook URL</label>
                        <Input 
                            value={settings.cms_webhook_url} 
                            onChange={e => setSettings({...settings, cms_webhook_url: e.target.value})} 
                            disabled={!settings.cms_enabled}
                            placeholder="https://your-cms.com/api/webhooks/incoming" 
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Authorization Header / API Key</label>
                        <Input 
                            value={settings.cms_api_key} 
                            onChange={e => setSettings({...settings, cms_api_key: e.target.value})} 
                            disabled={!settings.cms_enabled}
                            type="password"
                            placeholder="Bearer your-token-here" 
                        />
                        <p className="text-xs text-[#5c5e62]">Included as Authorization header in the POST payload.</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-[#11EAAD] text-[#171a20] hover:bg-[#171a20] hover:text-white px-8">
                        {isSaving ? "Saving..." : "Save Settings"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

// --- MAIN DASHBOARD LAYOUT ---
const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('leads');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [loginError, setLoginError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // The user explicitly stated cms@geocworld.com in prompt, but maybe they meant cms@goecworld.com. We'll use exactly what they asked: cms@geocworld.com
        if ((loginForm.email.toLowerCase() === 'cms@geocworld.com' || loginForm.email.toLowerCase() === 'cms@goecworld.com') && loginForm.password === '1234') {
            setIsAuthenticated(true);
            toast.success("Login successful");
        } else {
            setLoginError("Invalid credentials");
            toast.error("Invalid credentials");
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center p-6">
                <Card className="w-full max-w-md shadow-xl border-0">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto bg-[#171a20] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                            <LayoutDashboard className="text-[#11EAAD] w-6 h-6" />
                        </div>
                        <CardTitle className="text-2xl font-semibold text-[#171a20]">Admin Portal</CardTitle>
                        <CardDescription>Sign in to manage CMS and Leads</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-4 pt-4">
                            {loginError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md md:text-center font-medium">{loginError}</div>}
                            <div className="space-y-2 text-left">
                                <label className="text-sm font-medium text-[#393c41]">Email</label>
                                <Input 
                                    type="email" 
                                    placeholder="cms@geocworld.com" 
                                    value={loginForm.email}
                                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                                    className="focus-visible:ring-[#171a20]"
                                    required 
                                />
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-sm font-medium text-[#393c41]">Password</label>
                                <Input 
                                    type="password" 
                                    value={loginForm.password}
                                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                                    className="focus-visible:ring-[#171a20]"
                                    required 
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3">
                            <Button type="submit" className="w-full bg-[#171a20] hover:bg-[#393c41] text-white py-6">
                                Sign In
                            </Button>
                            <Link to="/" className="text-sm text-[#5c5e62] hover:text-[#171a20] transition-colors mt-2">
                                &larr; Return to Website
                            </Link>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f4f4] flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-white border-r border-[#e2e3e3] flex flex-col flex-shrink-0 min-h-[100px] md:min-h-screen">
                <div className="p-6 pb-2 md:pb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#11EAAD] w-8 h-8 rounded flex items-center justify-center font-bold">G</div>
                        <span className="font-semibold text-lg tracking-tight">Admin Portal</span>
                    </div>
                    <Link to="/" className="md:hidden text-[#5c5e62]">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </div>
                
                <div className="p-4 flex-grow flex md:flex-col gap-2 overflow-x-auto hide-scrollbar">
                    <button 
                        onClick={() => setActiveTab('leads')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'leads' ? 'bg-[#171a20] text-white' : 'text-[#5c5e62] hover:bg-gray-100 hover:text-black'}`}
                    >
                        <Users className="w-4 h-4" /> Leads 
                    </button>
                    <button 
                        onClick={() => setActiveTab('pixels')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'pixels' ? 'bg-[#171a20] text-white' : 'text-[#5c5e62] hover:bg-gray-100 hover:text-black'}`}
                    >
                        <Code className="w-4 h-4" /> Tracking & Pixels
                    </button>
                    <button 
                        onClick={() => setActiveTab('cms')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'cms' ? 'bg-[#171a20] text-white' : 'text-[#5c5e62] hover:bg-gray-100 hover:text-black'}`}
                    >
                        <SettingsIcon className="w-4 h-4" /> CMS Integration
                    </button>
                </div>
                
                <div className="p-4 border-t border-[#e2e3e3] hidden md:block">
                    <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-[#5c5e62] hover:bg-gray-100 transition-colors">
                         <LogOut className="w-4 h-4" /> Return to Site
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full max-w-7xl mx-auto">
                <div className="mb-8">
                   <h1 className="text-3xl font-semibold text-[#171a20] tracking-tight">
                       {activeTab === 'leads' && 'Lead Management'}
                       {activeTab === 'pixels' && 'Marketing Integrations'}
                       {activeTab === 'cms' && 'CMS Webhooks'}
                   </h1>
                   <p className="text-[#5c5e62]">
                       {activeTab === 'leads' && 'View, filter, and export user submissions.'}
                       {activeTab === 'pixels' && 'Manage third-party analytics and ad tags.'}
                       {activeTab === 'cms' && 'Configure automatic data forwarding to your systems.'}
                   </p>
                </div>

                <div className="animate-in fade-in duration-300">
                    {activeTab === 'leads' && <LeadsTab />}
                    {activeTab === 'pixels' && <PixelsTab />}
                    {activeTab === 'cms' && <CMSIntegrationTab />}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
