import React, { useState } from 'react';
import logo from './logo.svg';
import ApartmentDetailsForm from './layouts/form';
import { useApartmentPrice } from './hooks/useApartmentPrice';
import { FormData } from './hooks/useApartmentDetailsForm';
import Intro from './layouts/intro';
import Results from './layouts/results';

function App() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<undefined | FormData>(undefined);
  const { price, state, probability } = useApartmentPrice(data);
  return (
    <>
      {page === 1 && <Intro onNext={() => setPage(2)} />}
      {page === 2 && <div className="max-w-[768px] mx-auto p-2"><ApartmentDetailsForm defaultData={data} submitHandler={(data) => { setData(data); setPage(3); }} /></div> }
      {page === 3 && <Results state={state} price={price} probability={probability} reset={() => setPage(2)} />}
    </>    
  );
}

export default App;
