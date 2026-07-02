import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, LogOut, PlaneTakeoff } from "lucide-react";
import { useNotifications } from "../store/notifications";

import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";

import { DashboardIcon } from "@/components/ui/icons/Dashboard";
import { MegaphoneIcon } from "@/components/ui/icons/MegaphoneIcon";
import { BookOpenIcon } from "@/components/ui/icons/BookOpen";
import { MailIcon } from "@/components/ui/icons/Mail";
import { ShieldIcon } from "@/components/ui/icons/ShieldIcon";
import { UsersIcon } from "@/components/ui/icons/UsersIcon";
import { Separator } from "./ui/separator";

type IconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

type AnimatedIcon = React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLDivElement> &
    React.RefAttributes<IconHandle> & { size?: number }
>;

type NavItemDef = {
  id: string;
  title: string;
  icon: AnimatedIcon;
};

const primaryNavItems: NavItemDef[] = [
  { id: "dashboard", title: "My Journey", icon: DashboardIcon },
  { id: "notifications", title: "Notifications", icon: MegaphoneIcon },
  { id: "history", title: "Recovery History", icon: BookOpenIcon },
];

const secondaryNavItems: NavItemDef[] = [
  { id: "demo", title: "Scenario Control", icon: ShieldIcon },
  { id: "passengers", title: "Switch Passenger", icon: UsersIcon },
];

function SidebarCollapseButton() {
  const { toggleSidebar, state } = useSidebar();
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
      className="absolute top-1/2 -right-1 z-20 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm transition-colors hover:bg-sidebar-accent hover:text-primary dark:border-zinc-700"
    >
      <ChevronLeft
        className={cn(
          "size-3.5 transition-transform duration-200",
          state === "collapsed" && "rotate-180",
        )}
      />
    </button>
  );
}

function NavMenuItem({ 
  item, 
  active, 
  badge,
  passenger,
  onNavigate 
}: { 
  item: NavItemDef; 
  active: boolean; 
  badge?: number;
  passenger: { id: string; firstName: string; lastName: string; loyaltyStatus: string } | null;
  onNavigate: (id: string) => void;
}) {
  const iconRef = useRef<IconHandle>(null);
  const Icon = item.icon;
  
  return (
    <SidebarMenuItem
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onMouseLeave={() => iconRef.current?.stopAnimation()}
    >
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={item.title}
        className={`tour-nav-${item.id} font-light cursor-pointer data-[active=true]:bg-primary/10 data-[active=true]:font-medium data-[active=true]:hover:bg-primary/20 data-[active=true]:text-primary`}
      >
        <Link 
          to={item.id === 'dashboard' ? (passenger ? `/u/${passenger.id}` : '/') : item.id === 'passengers' ? '/passengers' : (passenger ? `/u/${passenger.id}/${item.id}` : `/${item.id}`)} 
          className="w-full flex items-center justify-between" 
          onClick={(e) => { e.preventDefault(); onNavigate(item.id); }}
        >
          <div className="flex items-center gap-2">
            <Icon ref={iconRef} />
            <span>{item.title}</span>
          </div>
          {badge !== undefined && badge > 0 && (
            <span className="w-4 h-4 flex items-center justify-center rounded-full bg-violet-600 text-white text-[9px] font-bold">
              {badge}
            </span>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function ProfileButton({
  active,
  passenger,
  onSignOut
}: {
  active: boolean;
  passenger: { firstName: string; lastName: string; loyaltyStatus: string };
  onSignOut: () => void;
}) {
  const userName = `${passenger.firstName} ${passenger.lastName}`;
  
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        size="lg"
        isActive={active}
        tooltip={userName}
        className="h-12 rounded-full border border-sidebar-border bg-sidebar-accent/40 px-1.5 font-light shadow-sm transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:rounded-full! group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:shadow-none data-[active=true]:border-primary/30 data-[active=true]:bg-primary/10 data-[active=true]:font-medium data-[active=true]:text-primary data-[active=true]:hover:bg-primary/15 data-[active=true]:hover:text-primary dark:border-zinc-700 dark:bg-zinc-800/60 dark:hover:bg-zinc-800"
      >
        <div className="flex items-center px-3 gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!">
          <UserAvatar name={userName} size="sm" />

          <div className="flex-1 min-w-0 flex items-center justify-between group-data-[collapsible=icon]:hidden">
            <span className="truncate font-medium">
              {userName}
            </span>
            <button onClick={(e) => { e.stopPropagation(); onSignOut(); }} title="Sign out" className="text-muted-foreground hover:text-foreground">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export type SidebarProps = {
  activePage: string;
  onNavigate: (page: string) => void;
  passenger: { id: string; firstName: string; lastName: string; loyaltyStatus: string } | null;
  onSignOut: () => void;
};

const Sidebar = ({
  activePage,
  onNavigate,
  passenger,
  onSignOut
}: SidebarProps) => {
  const { unreadCount } = useNotifications();

  return (
    <SidebarRoot collapsible="icon" variant="floating" className="border-r-0!">
      <SidebarCollapseButton />
      <SidebarHeader className="h-14 px-3 group-data-[collapsible=icon]:px-2">
        <div className="flex items-center gap-2.5 p-2 group-data-[collapsible=icon]:p-0.5 group-data-[collapsible=icon]:justify-center">
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-sm border border-border bg-white">
            <img src="/skyrecover-logo.png" alt="SkyRecover Logo" className="w-full h-full object-cover scale-[1.35]" />
          </div>
          <span className="font-bold text-[15px] tracking-tight text-foreground whitespace-nowrap overflow-hidden group-data-[collapsible=icon]:hidden">
            SkyRecover
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="mt-1">
        <SidebarGroup className="px-3 group-data-[collapsible=icon]:px-2">
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {primaryNavItems.map((item) => (
                <NavMenuItem
                  key={item.id}
                  item={item}
                  active={activePage === item.id}
                  badge={item.id === "notifications" ? unreadCount : 0}
                  passenger={passenger}
                  onNavigate={onNavigate}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="px-3 group-data-[collapsible=icon]:px-2">
          <SidebarGroupLabel className="font-light">
            Demo Controls
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {secondaryNavItems.map((item) => (
                <NavMenuItem
                  key={item.id}
                  item={item}
                  active={activePage === item.id}
                  passenger={passenger}
                  onNavigate={onNavigate}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 group-data-[collapsible=icon]:px-2">
        <SidebarMenu className="gap-5">
          {passenger && (
            <>
              <Separator />
              <ProfileButton
                active={false}
                passenger={passenger}
                onSignOut={onSignOut}
              />
            </>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </SidebarRoot>
  );
};

export default Sidebar;
