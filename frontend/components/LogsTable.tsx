import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import type { api } from "~backend/api/logs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Search, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type LogsResponse = Awaited<ReturnType<typeof api.listLogs>>;

export function LogsTable() {
  const [page, setPage] = useState(0);
  const [pinFilter, setPinFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const { toast } = useToast();

  const pageSize = 20;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["logs", page, pinFilter, dateFilter],
    queryFn: async (): Promise<LogsResponse> => {
      try {
        return await backend.api.listLogs({
          limit: pageSize,
          offset: page * pageSize,
          pin: pinFilter || undefined,
          date: dateFilter || undefined,
        });
      } catch (err) {
        console.error("Failed to fetch logs:", err);
        throw err;
      }
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch attendance logs",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  const formatWorkCode = (workcode: number) => {
    switch (workcode) {
      case 0:
        return <Badge variant="default">Check In</Badge>;
      case 1:
        return <Badge variant="secondary">Check Out</Badge>;
      case 2:
        return <Badge variant="outline">Break Out</Badge>;
      case 3:
        return <Badge variant="outline">Break In</Badge>;
      case 4:
        return <Badge variant="outline">Overtime In</Badge>;
      case 5:
        return <Badge variant="outline">Overtime Out</Badge>;
      default:
        return <Badge variant="outline">Other ({workcode})</Badge>;
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Attendance logs have been refreshed",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="pin-filter">Filter by PIN</Label>
          <Input
            id="pin-filter"
            placeholder="Enter PIN..."
            value={pinFilter}
            onChange={(e) => {
              setPinFilter(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="date-filter">Filter by Date</Label>
          <Input
            id="date-filter"
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PIN</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Work Code</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Recorded At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : !data?.logs.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No attendance logs found
                  </TableCell>
                </TableRow>
              ) : (
                data.logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.pin}</TableCell>
                    <TableCell>{formatDateTime(log.timestamp)}</TableCell>
                    <TableCell>{formatWorkCode(log.workcode)}</TableCell>
                    <TableCell>
                      {log.device_sn ? (
                        <Badge variant="outline">{log.device_sn}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(log.created_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, data?.total || 0)} of{" "}
            {data?.total || 0} logs
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
