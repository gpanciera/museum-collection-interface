import { useReducer, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import regeneratorRuntime from "regenerator-runtime";

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return { ...state, isLoading: true, isError: false };
    case 'FETCH_SUCCESS':
      return { 
        ...state, 
        isLoading: false, 
        isError: false, 
        numResults: action.payload.info.total,
        results: action.payload.data,
      };
    case 'FETCH_FAILURE':
      return { ...state, isLoading: false, isError: true, };
    default:
      throw new Error();
  }
};

const useDataApi = (initialUrl, initialData) => {
  const isFirstRender = useRef(true);
  const [url, setUrl] = useState(initialUrl);
  const [state, dispatch] = useReducer(dataFetchReducer, { 
    isLoading: false, 
    isError: false, 
    numResults: 0, 
    results: initialData, 
  });
 
  useEffect(() => {
    if (isFirstRender.current)
      isFirstRender.current = false;
    else {
      const source = axios.CancelToken.source();
      let isMounted = true;
      
      const fetchData = async () => {
        dispatch({ type: 'FETCH_INIT' });
        try {
          // console.log("INITIATING FETCH to:", url);
          const result = await axios.get(url, { cancelToken: source.token }); 
          // console.log("DATA RECEIVED:", url, result.data)
          if (isMounted) {
            dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
          }
        } 
        catch (error) {
          if (isMounted) {
            dispatch({ type: 'FETCH_FAILURE' });
          }
        }
      };
      fetchData();
      return () => { 
        // console.log("RUNNING CLEANUP");
        isMounted = false;
        source.cancel();
      };
    };
  }, [url]);

  return [state, setUrl];
};

export default useDataApi;