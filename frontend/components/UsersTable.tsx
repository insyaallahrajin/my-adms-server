import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import type { api } from "~backend/api/users";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type UsersResponse = Awaited<ReturnType<typeof api.listUsers>>;

export function UsersTable() {
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<UsersResponse> => {
      try {
        return await backend.api.listUsers();
      } catch (err) {
        console.error("Failed to fetch users:", err);
        throw err;
      }
    },
  });

  if (error) {
    toast({
      title: "Error",
      description: "Failed to fetch users",
      variant: "destructive",
    });
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "User list has been refreshed",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {data?.users.length || 0} user(s) registered
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
                <TableHead>PIN</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : !data?.users.length ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                data.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.pin}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(user.created_at)}
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
