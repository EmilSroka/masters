import { useForm, SubmitHandler } from 'react-hook-form';

interface FormData {
    latitude: number,
    longitude: number,
    size: number,
    yearBuild: number,
    roomCount: number,
    floor: number
}

interface Props {
    submitHandler: SubmitHandler<FormData>
}

export const useApartmentDetailsForm = ({ submitHandler }: Props) => {
    const { register, handleSubmit } = useForm<FormData>();
    return { register, onSubmit: handleSubmit(submitHandler) }
}