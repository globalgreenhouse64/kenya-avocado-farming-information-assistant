import { User, Activity, LayoutDashboard, Settings, ShieldCheck, LogOut, Plus, Search, MoreVertical, CheckCircle, XCircle, ExternalLink, Menu, Bell, ChevronRight, Users, Eye, EyeOff, X, Leaf, Clock, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, 
  DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Types ---

type Role = 'ADMIN' | 'USER';
type UserStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'DISABLED';

interface AppConfig {
  id: string;
  name: string;
  url: string;
  icon: React.ElementType;
  description: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
  allowedApps: string[]; // App IDs
  avatar?: string;
  createdAt: string;
}

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  app?: string;
}

// --- Mock Data ---

const AVAILABLE_APPS: AppConfig[] = [
  { id: 'app1', name: 'Farming Tool', url: 'https://app.aiwhitelabels.io/share?userId=3965&id=15527', icon: Leaf, description: 'The primary AI-driven avocado farming tool.' },
  { id: 'app2', name: 'Yield Predictor', url: '#', icon: Activity, description: 'AI-driven avocado yield trends and forecasting.' },
  { id: 'app3', name: 'Pest Vision', url: '#', icon: Eye, description: 'Computer vision for pest and disease identification.' },
];

const INITIAL_USERS: UserProfile[] = [
  { 
    id: '1', 
    email: 'admin@avocadoassistant.ke', 
    name: 'Admin User', 
    role: 'ADMIN', 
    status: 'APPROVED', 
    allowedApps: ['app1', 'app2', 'app3'], 
    avatar: 'https://storage.googleapis.com/dala-prod-public-storage/generated-images/c1960862-6e2e-4578-9dfe-afc0168f2152/avatar-1-5430fd75-1778063566896.webp',
    createdAt: '2023-10-01'
  },
  { 
    id: '2', 
    email: 'farmer@example.com', 
    name: 'John Farmer', 
    role: 'USER', 
    status: 'APPROVED', 
    allowedApps: ['app1'], 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Farmer',
    createdAt: '2023-10-25'
  },
  { 
    id: '3', 
    email: 'jane@example.com', 
    name: 'Jane Smith', 
    role: 'USER', 
    status: 'PENDING', 
    allowedApps: [], 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    createdAt: '2023-10-26'
  },
];

const INITIAL_LOGS: ActivityLog[] = [
  { id: 'l1', userId: '2', userName: 'John Farmer', action: 'Accessed Farming Tool', app: 'Farming Tool', timestamp: '2023-10-25 14:30' },
  { id: 'l2', userId: '1', userName: 'Admin User', action: 'Approved John Farmer', timestamp: '2023-10-25 12:15' },
  { id: 'l3', userId: '3', userName: 'Jane Smith', action: 'Signed up', timestamp: '2023-10-26 10:05' },
];

// --- Components ---

const NavigationItems = ({ activeTab, setActiveTab, role, closeSidebar }: { activeTab: string, setActiveTab: (t: string) => void, role: Role, closeSidebar?: () => void }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'USER'] },
    { id: 'apps', label: 'Farming Tool', icon: Activity, roles: ['ADMIN', 'USER'] },
    { id: 'admin', label: 'Admin Panel', icon: ShieldCheck, roles: ['ADMIN'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['ADMIN', 'USER'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <nav className="p-4 space-y-2">
      {filteredItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            setActiveTab(item.id);
            if (closeSidebar) closeSidebar();
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            activeTab === item.id 
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          <item.icon size={20} />
          <span className="font-medium text-left">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

const Sidebar = ({ activeTab, setActiveTab, role, logout }: { activeTab: string, setActiveTab: (t: string) => void, role: Role, logout: () => void }) => {
  return (
    <aside className="hidden lg:flex w-64 bg-card border-r flex-col h-screen fixed left-0 top-0 z-40">
      <div className="p-6 flex items-start gap-3 border-b">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
          <Leaf size={16} />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight leading-tight">Kenya Avocado</span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Information Assistant</span>
        </div>
      </div>
      <div className="flex-1 mt-4">
        <NavigationItems activeTab={activeTab} setActiveTab={setActiveTab} role={role} />
      </div>
      <div className="p-4 border-t space-y-2">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

const MobileNav = ({ activeTab, setActiveTab, role, logout }: { activeTab: string, setActiveTab: (t: string) => void, role: Role, logout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon"><Menu size={24} /></Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <div className="p-6 flex items-center gap-3 border-b">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
               <Leaf size={16} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight leading-tight">Kenya Avocado</span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Assistant</span>
            </div>
          </div>
          <div className="mt-4">
            <NavigationItems activeTab={activeTab} setActiveTab={setActiveTab} role={role} closeSidebar={() => setIsOpen(false)} />
          </div>
          <div className="absolute bottom-0 w-full p-4 border-t">
            <button 
              onClick={() => { logout(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

const Header = ({ user, activeTab, setActiveTab, logout }: { user: UserProfile, activeTab: string, setActiveTab: (t: string) => void, logout: () => void }) => {
  return (
    <header className="h-16 border-b bg-background/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 lg:ml-64">
      <div className="flex items-center gap-4">
        <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} role={user.role} logout={logout} />
        <h2 className="text-sm lg:text-lg font-semibold">Welcome, {user.name.split(' ')[0]}</h2>
      </div>
      <div className="flex items-center gap-3 lg:gap-6">
        <button className="p-2 text-muted-foreground hover:bg-accent rounded-full relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

// --- Page Components ---

const EmbeddedApp = () => {
  return (
    <div className="w-full overflow-hidden rounded-2xl border shadow-lg bg-card">
      <div className="bg-accent/30 p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Leaf size={18} />
          </div>
          <h3 className="font-bold text-sm lg:text-base">Farming Tool</h3>
        </div>
        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">Live Assistant</Badge>
      </div>
      <div className="w-full overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <iframe 
          src="https://app.aiwhitelabels.io/share?userId=3965&id=15527"
          width="100%" 
          height="800"
          style={{ borderRadius: '0.5rem', border: 'none' }}
          referrerPolicy="unsafe-url" 
          allow="clipboard-read; clipboard-write" 
          id="prev-frame-id"
          title="Kenya Avocado Farming Information Assistant"
          loading="lazy"
        />
      </div>
    </div>
  );
};

const DashboardHome = ({ logs }: { logs: ActivityLog[] }) => {
  const stats = [
    { label: 'Active Farmers', value: '1,284', trend: '+12%', icon: Users, color: 'text-emerald-600' },
    { label: 'Crop Analysis', value: '89%', trend: '+5%', icon: Activity, color: 'text-green-600' },
    { label: 'System Health', value: '99.9%', trend: 'Stable', icon: ShieldCheck, color: 'text-teal-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="overflow-hidden border-none shadow-sm bg-white/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  <p className={`text-xs mt-1 ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-blue-500'}`}>
                    {stat.trend} <span className="text-muted-foreground ml-1">vs last month</span>
                  </p>
                </div>
                <div className={`p-3 rounded-2xl bg-accent ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest interactions within the farming platform.</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {logs.slice(0, 4).map((log) => (
                <div key={log.id} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0 text-primary">
                    <Activity size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{log.userName} <span className="text-muted-foreground font-normal">{log.action}</span> {log.app && <span className="text-primary">{log.app}</span>}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{log.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AppGallery = ({ user }: { user: UserProfile }) => {
  const [selectedApp, setSelectedApp] = useState<AppConfig | null>(null);
  
  const userApps = AVAILABLE_APPS.filter(app => user.allowedApps.includes(app.id));

  // Auto-select the first app (Farming Tool) when the gallery is opened
  useEffect(() => {
    if (!selectedApp && userApps.length > 0) {
      setSelectedApp(userApps[0]);
    }
  }, [userApps, selectedApp]);

  if (selectedApp) {
    return (
      <div className="h-[calc(100vh-140px)] flex flex-col gap-4 animate-in slide-in-from-right duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setSelectedApp(null)}>Back to Tools</Button>
            <h2 className="text-xl font-bold">{selectedApp.name}</h2>
            <Badge variant="outline" className="hidden sm:inline-flex">Live</Badge>
          </div>
          <Button size="sm" variant="secondary"><ExternalLink size={16} className="mr-2" /> Open Full Screen</Button>
        </div>
        <div className="flex-1 bg-card rounded-2xl border overflow-hidden shadow-2xl relative">
          <iframe 
            src={selectedApp.url}
            className="w-full h-full border-none"
            title={selectedApp.name}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in zoom-in-95 duration-300">
      {userApps.map((app) => (
        <Card key={app.id} className="hover:shadow-lg transition-all border-none hover:ring-2 hover:ring-primary/20 group">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
              <app.icon size={24} />
            </div>
            <CardTitle>{app.name}</CardTitle>
            <CardDescription>{app.description}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full group-hover:shadow-md" onClick={() => setSelectedApp(app)}>Open Tool</Button>
          </CardFooter>
        </Card>
      ))}
      {userApps.length === 0 && (
        <div className="col-span-full py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto text-muted-foreground">
            <LayoutDashboard size={40} />
          </div>
          <h3 className="text-xl font-bold">No Tools Available</h3>
          <p className="text-muted-foreground">You don't have access to any farming tools yet. Please contact your administrator.</p>
        </div>
      )}
    </div>
  );
};

const AdminPanel = ({ users, setUsers, logs, setLogs }: { users: UserProfile[], setUsers: (u: UserProfile[]) => void, logs: ActivityLog[], setLogs: (l: ActivityLog[]) => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingUsers = filteredUsers.filter(u => u.status === 'PENDING');
  const activeUsers = filteredUsers.filter(u => u.status === 'APPROVED');
  const otherUsers = filteredUsers.filter(u => u.status === 'DENIED' || u.status === 'DISABLED');

  const handleUserAction = (userId: string, status: UserStatus, action: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setUsers(users.map(u => u.id === userId ? { ...u, status, allowedApps: status === 'APPROVED' ? ['app1'] : u.allowedApps } : u));
    
    const newLog: ActivityLog = {
      id: `l${Date.now()}`,
      userId: '1', // Admin ID
      userName: 'Admin User',
      action: `${action} ${user.name}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setLogs([newLog, ...logs]);
    
    toast.success(`${user.name} has been ${status.toLowerCase()}`);
  };

  const toggleAppAccess = (userId: string, appId: string) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        const allowedApps = u.allowedApps.includes(appId)
          ? u.allowedApps.filter(id => id !== appId)
          : [...u.allowedApps, appId];
        return { ...u, allowedApps };
      }
      return u;
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">User Access Control</h2>
          <p className="text-muted-foreground">Authorize and manage farmer access to the tools.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search users..." 
            className="pl-10 h-11 border-none shadow-sm" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="pending" className="relative">
            Pending Approvals
            {pendingUsers.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold animate-pulse">
                {pendingUsers.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">Authorized Users</TabsTrigger>
          <TabsTrigger value="all">All Users</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingUsers.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-card rounded-2xl border border-dashed">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No pending requests</h3>
                <p className="text-muted-foreground">All user access requests have been processed.</p>
              </div>
            ) : (
              pendingUsers.map(user => (
                <Card key={user.id} className="overflow-hidden border-none shadow-sm">
                  <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <CardTitle className="text-base">{user.name}</CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                      <Clock size={12} /> Joined {user.createdAt}
                    </div>
                  </CardContent>
                  <CardFooter className="bg-accent/30 gap-3">
                    <Button 
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={() => handleUserAction(user.id, 'APPROVED', 'Authorized')}
                    >
                      <CheckCircle size={16} className="mr-2" /> Authorize
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleUserAction(user.id, 'DENIED', 'Denied')}
                    >
                      <XCircle size={16} className="mr-2" /> Deny
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="rounded-2xl border-none shadow-sm bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-accent/50">
                  <TableHead>User</TableHead>
                  <TableHead>Tool Access</TableHead>
                  <TableHead>Authorized On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-accent/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex gap-1 flex-wrap">
                          {AVAILABLE_APPS.map(app => (
                            <button 
                              key={app.id}
                              onClick={() => toggleAppAccess(user.id, app.id)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${user.allowedApps.includes(app.id) ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-accent text-muted-foreground'}`}
                              title={app.name}
                            >
                               <app.icon size={14} />
                            </button>
                          ))}
                       </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.createdAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleUserAction(user.id, 'DISABLED', 'Revoked access for')}
                      >
                        Revoke Access
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="all">
           <div className="rounded-2xl border-none shadow-sm bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-accent/50">
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-accent/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <Badge variant={user.status === 'APPROVED' ? 'default' : user.status === 'PENDING' ? 'secondary' : 'destructive'}>
                         {user.status}
                       </Badge>
                    </TableCell>
                    <TableCell>
                       <span className="text-sm">{user.role}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical size={18} /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleUserAction(user.id, 'APPROVED', 'Re-authorized')}>
                            Authorize Access
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUserAction(user.id, 'DISABLED', 'Disabled account for')}>
                            Disable Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>System Activity Audit</CardTitle>
          <CardDescription>Full log of administrative and user actions.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-4 rounded-xl border bg-accent/30 group hover:bg-accent/50 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="text-primary bg-white p-2 rounded-lg shadow-sm"><ShieldCheck size={18} /></div>
                      <div>
                        <span className="font-semibold text-sm">{log.userName}</span>
                        <span className="mx-2 text-muted-foreground text-xs">\\u2022</span>
                        <span className="text-sm text-muted-foreground">{log.action}</span>
                        {log.app && <Badge variant="secondary" className="ml-2 text-[10px] h-4">{log.app}</Badge>}
                      </div>
                   </div>
                   <div className="text-[10px] lg:text-xs text-muted-foreground font-mono">{log.timestamp}</div>
                </div>
              ))}
           </div>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Auth Components ---

const AuthPage = ({ onLogin, users, setUsers }: { onLogin: (u: UserProfile) => void, users: UserProfile[], setUsers: (u: UserProfile[]) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (isLogin) {
        const user = users.find(u => u.email === email);
        if (user) {
          onLogin(user);
          toast.success(`Welcome back, ${user.name}!`);
        } else {
          toast.error('User not found. Please create an account.');
        }
      } else {
        const newUser: UserProfile = {
          id: Math.random().toString(),
          email,
          name: name || email.split('@')[0],
          role: 'USER',
          status: 'PENDING',
          allowedApps: [],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          createdAt: new Date().toISOString().split('T')[0]
        };
        setUsers([...users, newUser]);
        onLogin(newUser);
        toast.success('Account created! Awaiting admin approval.');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC] relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-accent/10 rounded-full blur-[80px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl text-primary-foreground font-bold text-2xl shadow-xl shadow-primary/30 mb-4">
            <Leaf size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight px-4">Kenya Avocado Farming Information Assistant</h1>
          <p className="text-muted-foreground mt-2">Digital Farming Management Suite</p>
        </div>

        <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-xl rounded-[2rem]">
          <CardHeader className="pt-8">
            <CardTitle className="text-2xl">{isLogin ? 'Welcome Back' : 'Get Started'}</CardTitle>
            <CardDescription>
              {isLogin ? 'Secure login for farming dashboard access.' : 'Register to access your avocado farming tools.'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="John Farmer" 
                    className="h-11 border-none bg-accent/50"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@avocadoassistant.ke" 
                  className="h-11 border-none bg-accent/50 focus-visible:ring-primary/30"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {isLogin && <Button variant="link" className="px-0 h-auto text-xs text-primary">Forgot password?</Button>}
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="\\u2022\\u2022\\u2022\\u2022\\u2022\\u2022\\u2022\\u2022" 
                  className="h-11 border-none bg-accent/50 focus-visible:ring-primary/30"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-6 pb-8">
              <Button className="w-full h-12 text-base font-bold shadow-lg shadow-primary/25 rounded-xl transition-all hover:translate-y-[-1px]" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                {isLogin ? "New to the platform?" : 'Already a member?'}
                <button 
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-1 text-primary font-bold hover:underline transition-all"
                >
                  {isLogin ? 'Create Account' : 'Login Now'}
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

const PendingApproval = ({ user, logout }: { user: UserProfile, logout: () => void }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 text-center">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Account Pending Approval</h2>
          <p className="text-muted-foreground mb-8">
            Welcome, <span className="font-semibold text-foreground">{user.name}</span>! Your account has been created. 
            An administrator needs to authorize your access to the farming tools before you can proceed.
          </p>
          
          <div className="p-4 bg-accent/50 rounded-2xl mb-8 flex items-start gap-3 text-left">
            <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Our team typically reviews new farmer applications within 24 hours. You will be able to access the tools once authorized.
            </p>
          </div>

          <div className="space-y-4">
            <Button variant="outline" className="w-full h-12 rounded-xl border-none bg-accent/50 hover:bg-accent" onClick={logout}>
              <LogOut size={18} className="mr-2" /> Sign Out
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

const DeniedAccess = ({ user, logout }: { user: UserProfile, logout: () => void }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 text-center">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-8">
            We're sorry, but your request for access to the farming tools has been denied or revoked by an administrator.
          </p>
          
          <div className="space-y-4">
            <Button variant="outline" className="w-full h-12 rounded-xl border-none bg-accent/50 hover:bg-accent" onClick={logout}>
              <LogOut size={18} className="mr-2" /> Sign Out
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_LOGS);

  const handleLogout = () => {
    setUser(null);
    toast.info('Logged out successfully');
  };

  if (!user) {
    return (
      <div className="font-sans">
        <AuthPage onLogin={setUser} users={users} setUsers={setUsers} />
        <Toaster position="top-center" expand={false} richColors />
      </div>
    );
  }

  // Handle restricted access states
  if (user.role !== 'ADMIN') {
    if (user.status === 'PENDING') {
      return <PendingApproval user={user} logout={handleLogout} />;
    }
    if (user.status === 'DENIED' || user.status === 'DISABLED') {
      return <DeniedAccess user={user} logout={handleLogout} />;
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-foreground font-sans selection:bg-primary/20">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role={user.role} logout={handleLogout} />
      <Header user={user} activeTab={activeTab} setActiveTab={setActiveTab} logout={handleLogout} />
      
      <main className="lg:ml-64 p-4 lg:p-8 min-h-[calc(100vh-64px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto"
          >
            {activeTab === 'dashboard' && <DashboardHome logs={logs} />}
            {activeTab === 'apps' && <AppGallery user={user} />}
            {activeTab === 'admin' && user.role === 'ADMIN' && (
              <AdminPanel users={users} setUsers={setUsers} logs={logs} setLogs={setLogs} />
            )}
            {activeTab === 'settings' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex flex-col gap-1">
                   <h2 className="text-2xl font-bold">Account Settings</h2>
                   <p className="text-muted-foreground">Manage your personal information and preferences.</p>
                </div>
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details and avatar visible to other members.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6 py-4">
                      <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" className="rounded-xl shadow-sm">Change Avatar</Button>
                        <p className="text-xs text-muted-foreground text-center sm:text-left">JPG, PNG or GIF. Max size 2MB.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input defaultValue={user.name} className="border-none bg-accent/50" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input defaultValue={user.email} disabled className="border-none bg-accent/30" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-6 flex justify-end">
                    <Button className="rounded-xl shadow-md">Save Changes</Button>
                  </CardFooter>
                </Card>

                <Card className="border-none shadow-sm bg-destructive/5">
                  <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Actions that cannot be undone.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Once you delete your account, there is no going back. Please be certain.</p>
                  </CardContent>
                  <CardFooter className="border-t border-destructive/10 pt-6">
                    <Button variant="destructive" className="rounded-xl">Delete Account</Button>
                  </CardFooter>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}