import { useState } from "react";
import { toast } from "sonner";

const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    setLoading(true);
    setError(null);

    try {
      console.log('useFetch calling with args:', args);
      const response = await cb(...args);
      console.log('useFetch response:', response);
      
      if (!response) {
        throw new Error('No response received from server');
      }
      
      setData(response);
      setError(null);
      return response;
    } catch (error) {
      console.error('useFetch error:', error);
      setError(error);
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;