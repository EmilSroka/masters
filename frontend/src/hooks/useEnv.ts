import { useEffect, useState } from "react";

const useEnv = (name: string): string => {
    const [value, setValue] = useState('');
  
    useEffect(() => {
      const envValue = process.env[`REACT_APP_${name}`] || '';
      setValue(envValue);
    }, [name]);
  
    return value;
  };
  

export { useEnv }