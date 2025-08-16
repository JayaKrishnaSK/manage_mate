'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>Your active projects</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">5</p>
            <Button className="mt-4">View Projects</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Your assigned tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">12</p>
            <Button className="mt-4">View Tasks</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Upcoming deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">3</p>
            <Button className="mt-4">View Calendar</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}