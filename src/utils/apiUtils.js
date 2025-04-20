import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE_URL = 'https://oneheart.team/api';

/**
 * Create a safe API wrapper to ensure data is always in the expected format
 * @param {Function} setState - React setState function to update state with result
 * @param {Function} setLoading - React setState function to update loading state
 * @param {string} errorMessage - Message to show on error
 * @returns {Object} - Object with functions to safely fetch data
 */
export const useSafeApi = (setState, setLoading, errorMessage = "حدث خطأ في جلب البيانات") => {
  const safeGet = async (endpoint) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/${endpoint}`);
      
      // Ensure response.data is an array
      if (response.data && Array.isArray(response.data)) {
        setState(response.data);
      } else {
        console.error(`API did not return array for ${endpoint}:`, response.data);
        setState([]);
        Swal.fire({
          icon: 'warning',
          title: 'تنبيه',
          text: 'تم استلام بيانات غير صالحة من الخادم',
        });
      }
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      setState([]);
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const safePost = async (endpoint, data, config = {}) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/${endpoint}`, data, config);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error posting to ${endpoint}:`, error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'حدث خطأ أثناء إرسال البيانات' 
      };
    }
  };

  const safePut = async (endpoint, id, data, config = {}) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${endpoint}/${id}`, data, config);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error updating ${endpoint}/${id}:`, error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'حدث خطأ أثناء تحديث البيانات' 
      };
    }
  };

  const safeDelete = async (endpoint, id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${endpoint}/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error deleting ${endpoint}/${id}:`, error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'حدث خطأ أثناء حذف البيانات' 
      };
    }
  };

  return { safeGet, safePost, safePut, safeDelete };
};

/**
 * Safely map over an array with a fallback if the data is not an array
 * @param {Array} data - The data to map over
 * @param {Function} mapFn - The mapping function
 * @param {JSX.Element} fallback - The fallback UI to render if data is not an array
 * @returns {Array|JSX.Element} - The mapped array or fallback UI
 */
export const safeMap = (data, mapFn, fallback) => {
  if (Array.isArray(data)) {
    return data.map(mapFn);
  }
  return fallback;
};

/**
 * Ensure a variable is an array
 * @param {any} data - The data to check
 * @returns {Array} - The original array or an empty array
 */
export const ensureArray = (data) => {
  if (Array.isArray(data)) {
    return data;
  }
  return [];
};

export default {
  useSafeApi,
  safeMap,
  ensureArray
}; 