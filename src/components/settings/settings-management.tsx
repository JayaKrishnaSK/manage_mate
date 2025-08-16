'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, Shield, Mail, Database, Bell } from 'lucide-react';

type SettingsSection = 'general' | 'users' | 'security' | 'notifications' | 'integrations' | 'backup';

export function SettingsManagement() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');

  const sections = [
    { id: 'general' as SettingsSection, label: 'General', icon: Settings },
    { id: 'users' as SettingsSection, label: 'Users & Roles', icon: Users },
    { id: 'security' as SettingsSection, label: 'Security', icon: Shield },
    { id: 'notifications' as SettingsSection, label: 'Notifications', icon: Bell },
    { id: 'integrations' as SettingsSection, label: 'Integrations', icon: Mail },
    { id: 'backup' as SettingsSection, label: 'Backup & Recovery', icon: Database },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general':
        return <GeneralSettings />;
      case 'users':
        return <UserSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'integrations':
        return <IntegrationSettings />;
      case 'backup':
        return <BackupSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Settings Navigation */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <nav className="space-y-1">
              {sections.map((section) => {
                const IconComponent = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>
      </div>

      {/* Settings Content */}
      <div className="lg:col-span-3">
        {renderSectionContent()}
      </div>
    </div>
  );
}

function GeneralSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Organization Name
          </label>
          <Input defaultValue="Manage Mate Inc." />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Default Timezone
          </label>
          <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Default Language
          </label>
          <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>

        <Button>Save Changes</Button>
      </CardContent>
    </Card>
  );
}

function UserSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User & Role Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">Default User Role</h3>
            <p className="text-sm text-muted-foreground">Role assigned to new users by default</p>
          </div>
          <Badge variant="secondary">team_member</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">Require Email Verification</h3>
            <p className="text-sm text-muted-foreground">Users must verify email before accessing system</p>
          </div>
          <input type="checkbox" defaultChecked className="h-4 w-4" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">Allow Self Registration</h3>
            <p className="text-sm text-muted-foreground">Allow users to create accounts without invitation</p>
          </div>
          <input type="checkbox" className="h-4 w-4" />
        </div>

        <Button>Save Changes</Button>
      </CardContent>
    </Card>
  );
}

function SecuritySettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">Two-Factor Authentication</h3>
            <p className="text-sm text-muted-foreground">Require 2FA for admin users</p>
          </div>
          <Badge variant="outline">Coming Soon</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">Session Timeout</h3>
            <p className="text-sm text-muted-foreground">Automatic logout after inactivity</p>
          </div>
          <select className="w-32 flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm">
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="480">8 hours</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">Password Policy</h3>
            <p className="text-sm text-muted-foreground">Minimum password requirements</p>
          </div>
          <Badge variant="secondary">Standard</Badge>
        </div>

        <Button>Save Changes</Button>
      </CardContent>
    </Card>
  );
}

function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">Email Notifications</h3>
            <p className="text-sm text-muted-foreground">Send email notifications for important events</p>
          </div>
          <input type="checkbox" defaultChecked className="h-4 w-4" />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">Daily Digest</h3>
            <p className="text-sm text-muted-foreground">Daily summary of activities</p>
          </div>
          <input type="checkbox" defaultChecked className="h-4 w-4" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">SLA Breach Alerts</h3>
            <p className="text-sm text-muted-foreground">Alert when issues approach SLA deadline</p>
          </div>
          <input type="checkbox" defaultChecked className="h-4 w-4" />
        </div>

        <Button>Save Changes</Button>
      </CardContent>
    </Card>
  );
}

function IntegrationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">Slack Integration</h3>
            <p className="text-sm text-muted-foreground">Send notifications to Slack channels</p>
          </div>
          <Badge variant="outline">Not Configured</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">Git Integration</h3>
            <p className="text-sm text-muted-foreground">Link commits and PRs to issues</p>
          </div>
          <Badge variant="outline">Not Configured</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">Email Provider</h3>
            <p className="text-sm text-muted-foreground">SMTP configuration for outgoing emails</p>
          </div>
          <Badge variant="outline">Not Configured</Badge>
        </div>

        <Button variant="outline">Configure Integrations</Button>
      </CardContent>
    </Card>
  );
}

function BackupSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup & Recovery</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">Automatic Backups</h3>
            <p className="text-sm text-muted-foreground">Schedule automatic database backups</p>
          </div>
          <Badge variant="secondary">Daily</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">Retention Period</h3>
            <p className="text-sm text-muted-foreground">How long to keep backup files</p>
          </div>
          <select className="w-32 flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm">
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="365">1 year</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">Last Backup</h3>
            <p className="text-sm text-muted-foreground">Most recent successful backup</p>
          </div>
          <span className="text-sm text-muted-foreground">2 hours ago</span>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline">Create Backup Now</Button>
          <Button variant="outline">Download Backup</Button>
        </div>
      </CardContent>
    </Card>
  );
}