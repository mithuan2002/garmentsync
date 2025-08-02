import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Bell, Mail, Reply, Send, Eye, Clock, User } from "lucide-react";

interface Notification {
  id: string;
  type: 'email' | 'system' | 'order_update';
  title: string;
  message: string;
  from: string;
  to: string;
  orderId?: string;
  isRead: boolean;
  createdAt: string;
  emailId?: string;
}

export default function Notifications() {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const response = await fetch("/api/notifications");
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const sendReplyMutation = useMutation({
    mutationFn: async (data: { notificationId: string; subject: string; message: string; to: string }) => {
      const response = await apiRequest("POST", `/api/notifications/${data.notificationId}/reply`, data);
      return response.json();
    },
    onSuccess: () => {
      setReplyMessage("");
      setReplySubject("");
      setSelectedNotification(null);
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Reply Sent",
        description: "Your reply has been sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSelectNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.type === 'email') {
      setReplySubject(`Re: ${notification.title}`);
    }
  };

  const handleSendReply = () => {
    if (!selectedNotification || !replyMessage.trim()) return;
    
    sendReplyMutation.mutate({
      notificationId: selectedNotification.id,
      subject: replySubject || `Re: ${selectedNotification.title}`,
      message: replyMessage,
      to: selectedNotification.from,
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-5 h-5 text-blue-500" />;
      case 'order_update':
        return <Bell className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email':
        return "bg-blue-100 text-blue-700";
      case 'order_update':
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-600 mt-1">Manage notifications and respond to messages</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {notifications.filter((n: Notification) => !n.isRead).length} unread
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Recent Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-slate-500">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No notifications yet</div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      !notification.isRead
                        ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    } ${
                      selectedNotification?.id === notification.id ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => handleSelectNotification(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${!notification.isRead ? "text-slate-900" : "text-slate-700"}`}>
                            {notification.title}
                          </p>
                          <Badge variant="secondary" className={`text-xs ${getTypeColor(notification.type)}`}>
                            {notification.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                          {notification.message.substring(0, 100)}...
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>From: {notification.from}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDateTime(notification.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Detail & Reply */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Notification Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedNotification ? (
              <div className="space-y-6">
                {/* Notification Content */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-slate-900">{selectedNotification.title}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
                      <span>From: {selectedNotification.from}</span>
                      <span>To: {selectedNotification.to}</span>
                      <span>{formatDateTime(selectedNotification.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-slate-700 whitespace-pre-wrap">{selectedNotification.message}</p>
                  </div>

                  {selectedNotification.orderId && (
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Order: {selectedNotification.orderId}</Badge>
                    </div>
                  )}
                </div>

                {/* Reply Form */}
                {selectedNotification.type === 'email' && (
                  <div className="border-t pt-6">
                    <h4 className="text-md font-medium text-slate-900 mb-4 flex items-center space-x-2">
                      <Reply className="w-4 h-4" />
                      <span>Send Reply</span>
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="replySubject">Subject</Label>
                        <Input
                          id="replySubject"
                          value={replySubject}
                          onChange={(e) => setReplySubject(e.target.value)}
                          placeholder="Reply subject"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="replyMessage">Message</Label>
                        <Textarea
                          id="replyMessage"
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Type your reply..."
                          rows={6}
                        />
                      </div>
                      
                      <Button
                        onClick={handleSendReply}
                        disabled={!replyMessage.trim() || sendReplyMutation.isPending}
                        className="w-full"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {sendReplyMutation.isPending ? "Sending..." : "Send Reply"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>Select a notification to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}