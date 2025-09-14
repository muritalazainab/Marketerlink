import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck, MessageCircle, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import newRequest from '../../../utils/newRequest';
import moment from 'moment';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => newRequest.get('/notifications').then(res => res.data),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch unread count
  const { data: unreadCount } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => newRequest.get('/notifications/unread-count').then(res => res.data.count),
    refetchInterval: 30000,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id) => newRequest.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unreadCount']);
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => newRequest.put('/notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unreadCount']);
    },
  });

  const handleNotificationClick = (notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification._id);
    }

    // Navigate based on notification type
    if (notification.conversationId) {
      navigate(`/message/${notification.conversationId}`);
    } else if (notification.type === 'new_application') {
      navigate('/seller-dashboard');
    } else if (notification.type === 'application_accepted' || notification.type === 'application_rejected') {
      navigate('/marketer-dashboard');
    }

    setIsOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_application':
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
      case 'application_accepted':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'application_rejected':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case 'new_message':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsReadMutation.mutate()}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : !notifications || notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium text-gray-900 ${
                          !notification.isRead ? 'font-semibold' : ''
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {moment(notification.createdAt).fromNow()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications && notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <Link
                to="/notifications"
                className="text-sm text-blue-600 hover:text-blue-700"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;