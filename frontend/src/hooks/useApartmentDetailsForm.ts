import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup"

import * as Yup from 'yup'

export interface FormData {
    latitude: number,
    longitude: number,
    size: number,
    yearBuild?: number | null,
    roomCount?: number | null,
    floor?: number | null
}

interface Props {
    submitHandler: SubmitHandler<FormData>,
    defaultValues?: FormData,
}

const schema = Yup.object({
    latitude: Yup.number()
        .required('Szerokość geograficzna jest wymagana')
        .min(52, 'Szerokość geograficzna musi wynosić przynajmniej 52°')
        .max(52.4, 'Szerokość geograficzna może wynosić maksymalnie 52.4°'),
    longitude: Yup.number()
        .required('Długość geograficzna jest wymagana')
        .min(20.7, 'Długość geograficzna musi wynosić przynajmniej 20.7°')
        .max(21.4, 'Długość geograficzna może wynosić maksymalnie 21.4°'),
    size: Yup.number()
        .typeError('Podana wartość musi być liczbą')
        .required('Rozmiar jest wymagany')
        .min(1, 'Rozmiar musi wynosić przynajmniej 1m²')
        .max(1000, 'Rozmiar może wynosić maksymalnie 1000m²'),
    yearBuild: Yup.number()
        .typeError('Podana wartość musi być liczbą')
        .transform(toNullIfEmptyString)
        .nullable()
        .min(1600, 'Wycena mieszkań wybodowanych przed rokiem 1600 nie jest dostępna')
        .max(2030, 'Wycena mieszkań z planowaną datą oddania po roku 2030 nie jest dostępna'),
    roomCount: Yup.number()
        .typeError('Podana wartość musi być liczbą')
        .transform(toNullIfEmptyString)
        .nullable()
        .min(1, 'Liczba pokoi musi wynosić minimum 1')
        .max(30, 'Wycena mieszkań z liczbą pokoi powyżej 30 nie jest dostępna'),
    floor: Yup.number()
        .typeError('Podana wartość musi być liczbą')
        .transform(toNullIfEmptyString)
        .nullable()
        .min(-2, 'Piętro nie może być mniejsze niż -2')
        .max(100, 'Wycena mieszkań na piętrach powyżej 100 nie jest dostępna'),
  }).required()

export const useApartmentDetailsForm = ({ submitHandler, defaultValues }: Props) => {
    const { control, register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: yupResolver<FormData>(schema),
        defaultValues: defaultValues ?? {
            latitude: undefined,
            longitude: undefined,
            size: undefined,
            yearBuild: undefined,
            roomCount: undefined,
            floor: undefined
        }

    });
    return { register, errors, onSubmit: handleSubmit(submitHandler), control }
}

function toNullIfEmptyString(castedValue: number, originalValue: string) {
    return originalValue === '' ? null : castedValue;
}