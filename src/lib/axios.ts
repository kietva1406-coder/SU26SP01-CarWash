/// <reference types="vite/client" />
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

// Cấu hình Base URL cho API
// Sử dụng VITE_API_URL từ biến môi trường (.env), nếu không có sẽ mặc định chạy ở http://localhost:8080/api
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // Thời gian chờ tối đa: 10 giây
});

// Interceptor cho Request: Tự động đính kèm Token xác thực vào Header
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho Response: Xử lý dữ liệu trả về và xử lý lỗi hệ thống toàn cục
axiosClient.interceptors.response.use(
  (response) => {
    // Trả về thẳng phần data của response để giảm thiểu boilerplate code khi gọi API
    return response.data;
  },
  (error: AxiosError) => {
    // Xử lý các lỗi HTTP
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      const errorMessage = data?.message || 'Đã xảy ra lỗi từ hệ thống!';

      switch (status) {
        case 401:
          // Lỗi xác thực: Token hết hạn hoặc không hợp lệ
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          // Bạn có thể kích hoạt chuyển hướng về trang login tại đây nếu cần
          // window.location.href = '/login';
          break;
        case 403:
          // Lỗi phân quyền
          toast.error('Bạn không có quyền truy cập vào chức năng này!');
          break;
        case 404:
          // Lỗi không tìm thấy tài nguyên
          toast.error('Tài nguyên yêu cầu không tồn tại!');
          break;
        case 422:
          // Lỗi validation dữ liệu từ Backend
          toast.error(errorMessage || 'Dữ liệu đầu vào không hợp lệ!');
          break;
        case 500:
          // Lỗi Server
          toast.error('Lỗi máy chủ nội bộ. Vui lòng thử lại sau!');
          break;
        default:
          toast.error(errorMessage);
          break;
      }
    } else if (error.request) {
      // Lỗi kết nối (không nhận được phản hồi từ server)
      toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng!');
    } else {
      // Các lỗi cấu hình khác
      toast.error(`Đã xảy ra lỗi: ${error.message}`);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
