import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import backend from "~backend/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { UserPlus, Loader2 } from "lucide-react";

export function CreateUserForm() {
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [deviceSn, setDeviceSn] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch devices for the select dropdown
  const { data: devicesData } = useQuery({
    queryKey: ["devices"],
    queryFn: () => backend.api.listDevices(),
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: { pin: string; name: string; device_sn?: string }) => {
      return await backend.api.createUser(userData);
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `User ${data.user.name} created successfully${
          data.command_sent ? " and command sent to device" : ""
        }`,
      });
      
      // Reset form
      setPin("");
      setName("");
      setDeviceSn("");
      
      // Refresh users list
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error("Failed to create user:", error);
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pin.trim() || !name.trim()) {
      toast({
        title: "Validation Error",
        description: "PIN and Name are required fields",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate({
      pin: pin.trim(),
      name: name.trim(),
      device_sn: deviceSn || undefined,
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pin">PIN *</Label>
              <Input
                id="pin"
                type="text"
                placeholder="Enter user PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter user name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="device">Device (Optional)</Label>
            <Select value={deviceSn} onValueChange={setDeviceSn}>
              <SelectTrigger>
                <SelectValue placeholder="Select a device to sync user data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No device selected</SelectItem>
                {devicesData?.devices.map((device) => (
                  <SelectItem key={device.id} value={device.sn}>
                    {device.sn} ({device.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button
            type="submit"
            className="w-full gap-2"
            disabled={createUserMutation.isPending}
          >
            {createUserMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {createUserMutation.isPending ? "Creating User..." : "Create User"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
