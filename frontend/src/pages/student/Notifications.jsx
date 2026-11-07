import { useState, useEffect } from "react";
import { getNotificationsApi, markNotificationAsReadApi } from "../../api/notification";
import { toast } from "sonner";
import { Bell, CheckCheck, Loader2 } from "lucide-react";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotificationsApi();
      setNotifications(res.data);
    } catch (error) {
      toast.error("Không thể tải danh sách thông báo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsReadApi(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      toast.success("Đã đánh dấu là đã đọc");
    } catch (error) {
      toast.error("Lỗi cập nhật trạng thái thông báo.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2 text-indigo-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Đang tải thông báo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-3 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Thông báo của bạn</h1>
            <p className="text-xs text-gray-500">Cập nhật các tin tức và kỳ thi mới nhất từ hệ thống</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">Không có thông báo nào.</div>
          ) : (
            notifications.map((item) => (
              <div 
                key={item.id} 
                className={`p-5 flex items-start justify-between transition ${item.is_read ? "bg-white" : "bg-indigo-50/40"}`}
              >
                <div className="space-y-1 pr-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{item.message}</p>
                  <span className="text-[10px] text-gray-400 block pt-1">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>

                {!item.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(item.id)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1 shrink-0 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg shadow-sm"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Đã đọc</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}