import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogsTable } from "./LogsTable";
import { DevicesTable } from "./DevicesTable";
import { UsersTable } from "./UsersTable";
import { CreateUserForm } from "./CreateUserForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, Server, UserPlus } from "lucide-react";

export function AppInner() {
  const [activeTab, setActiveTab] = useState("logs");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Activity className="h-8 w-8 text-blue-600" />
            ZKTeco ADMS Server
          </h1>
          <p className="text-muted-foreground mt-2">
            Attendance Data Management System for ZKTeco Fingerprint Devices
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Attendance Logs
            </TabsTrigger>
            <TabsTrigger value="devices" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Devices
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="add-user" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add User
            </TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Attendance Logs
                </CardTitle>
                <CardDescription>
                  Real-time attendance data from connected fingerprint devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LogsTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Connected Devices
                </CardTitle>
                <CardDescription>
                  Status of ZKTeco fingerprint devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DevicesTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Registered Users
                </CardTitle>
                <CardDescription>
                  Users registered in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsersTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-user" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Add New User
                </CardTitle>
                <CardDescription>
                  Register a new user and optionally sync to a device
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreateUserForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
