import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import type { api } from "~backend/api/devices";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type DevicesResponse = Awaited<ReturnType<typeof api.listDevices>>;

export function DevicesTable() {
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["devices"],
    queryFn: async (): Promise<DevicesResponse> => {
      try {
        return await backend.api.listDevices();
      } catch (err) {
        console.error("Failed to fetch devices:", err);
        throw err;
      }
    },
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  if (error) {
    toast({
      title: "Error",
      description: "Failed to fetch devices",
      variant: "destructive",
    });
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const getStatusBadge = (status: "online" | "offline") => {
    return status === "online" ? (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
        Online
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-500 hover:bg-red-600 text-white">
        Offline
      </Badge>
    );
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Device list has been refreshed",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {data?.devices.length || 0} device(s) registered
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serial Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : !data?.devices.length ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No devices found
                  </TableCell>
                </TableRow>
              ) : (
                data.devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">{device.sn}</TableCell>
                    <TableCell>{getStatusBadge(device.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(device.last_seen)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
