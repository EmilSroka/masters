import { useEffect, useState } from "react"
import { useEnv } from "./useEnv";
import { FormData } from "./useApartmentDetailsForm";
import axios from 'axios';
import { Offer } from "mes-proto-ts";

const useApartmentPrice = (data: FormData | undefined) => {
    const backendUrl = useEnv('BACKEND_URL');
    const [isLoading, setIsLoading] = useState(false);
    const [isEstimated, setIsEstimated] = useState(false);
    const [error, setError] = useState<null | string>(null);
    const [price, setPrice] = useState(0);
    
    useEffect(() => {
        if (!data) {
            return;
        }
        setIsLoading(true);    
        axios.post(backendUrl, toOfferJson(data))
            .then(response => {
                setTimeout(() => {
                    setIsEstimated(true);
                    setPrice(Number(response.data));
                    setError('');
                    setIsLoading(false);
                }, 500);
            })
            .catch(error => { 
                setIsEstimated(false);
                setPrice(0);
                setError(error.message);
                setIsLoading(false);
            });
    }, [data, backendUrl]);

    const state = (isLoading ? 'LOADING' : (error !== '' ? 'ERROR' : (isEstimated ? 'DONE' : 'NO DATA'))) as 'LOADING' | 'ERROR' | 'DONE' | 'NO DATA';
    const probability = 50 + (data?.floor != null ? 25 : 0) + (data?.roomCount != null ? 5 : 0) + (data?.yearBuild != null ? 15 : 0);

    return { state, error, price, probability }
}

function toOfferJson(data: FormData) {
    const optional: {
        yearBuilt?: number,
        roomCount?: number,
        floor?: number,
    } = {};
    if (data.yearBuild != undefined) {
        optional.yearBuilt = Math.trunc(data.yearBuild);
    }
    if (data.roomCount != undefined) {
        optional.roomCount = Math.trunc(data.roomCount);
    }
    if (data.floor != undefined) {
        optional.floor = Math.trunc(data.floor);
    }
    return Offer.toJSON(Offer.create({
        apartment: {
            location: {
                latitude: data.latitude,
                longitude: data.longitude
            },
            size: {
                value: Math.trunc(data.size * 100),
                scale: 2
            },
            ...optional
        }
    }));
}

export { useApartmentPrice }