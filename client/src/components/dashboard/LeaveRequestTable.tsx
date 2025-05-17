import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeaveRequest } from "@shared/types";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface LeaveRequestTableProps {
  leaves: LeaveRequest[];
  showViewAll?: boolean;
  isLoading?: boolean;
}

export default function LeaveRequestTable({
  leaves,
  showViewAll = true,
  isLoading = false,
}: LeaveRequestTableProps) {
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>("all");

  const filteredLeaves = leaves.filter((leave) => {
    if (leaveTypeFilter === "all") return true;
    return leave.type === leaveTypeFilter;
  });

  const renderLeaveTypeIcon = (type: string) => {
    switch (type) {
      case "sick":
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <span className="material-icons text-sm text-blue-600">sick</span>
          </div>
        );
      case "vacation":
        return (
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
            <span className="material-icons text-sm text-indigo-600">
              beach_access
            </span>
          </div>
        );
      case "personal":
        return (
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
            <span className="material-icons text-sm text-purple-600">
              event
            </span>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
            <span className="material-icons text-sm text-gray-600">event</span>
          </div>
        );
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="leave-status-pending">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="leave-status-approved">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="leave-status-rejected">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.toDateString() === end.toDateString()) {
      return format(start, 'MMM d, yyyy');
    }
    
    if (start.getFullYear() === end.getFullYear()) {
      if (start.getMonth() === end.getMonth()) {
        return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
      }
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    }
    
    return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
      <div className="p-6 pb-4 border-b border-neutral-100 flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center">
          <span className="material-icons text-primary mr-2">event_note</span>
          Recent Leave Requests
        </h2>
        <div>
          <Select
            value={leaveTypeFilter}
            onValueChange={setLeaveTypeFilter}
          >
            <SelectTrigger className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white w-36">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-neutral-500">Loading leave requests...</p>
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            No leave requests found.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-neutral-50">
              <TableRow>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Type
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Date
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Duration
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-neutral-100">
              {filteredLeaves.map((leave) => (
                <TableRow key={leave.id} className="hover:bg-neutral-50">
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {renderLeaveTypeIcon(leave.type)}
                      <span className="text-sm font-medium capitalize">
                        {leave.type} Leave
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDateRange(leave.startDate, leave.endDate)}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    {leave.duration} {leave.duration === 1 ? "day" : "days"}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {renderStatusBadge(leave.status)}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link href={`/leave/${leave.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary hover:text-primary-dark"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {showViewAll && (
        <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex justify-between items-center">
          <div className="text-sm text-neutral-500">
            Showing {Math.min(filteredLeaves.length, 5)} of {leaves.length} requests
          </div>
          <div>
            <Link
              href="/my-leaves"
              className="text-primary text-sm font-medium hover:underline"
            >
              View All Requests
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
