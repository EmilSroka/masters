import MapInput from "../components/map"
import { FormData, useApartmentDetailsForm } from "../hooks/useApartmentDetailsForm"

interface Props {
    submitHandler?: (data: FormData) => void
    defaultData?: FormData,
}

const ApartmentDetailsForm = ({ submitHandler, defaultData }: Props) => {
    const { register, onSubmit, errors, control } = useApartmentDetailsForm({
        submitHandler: (data) =>  submitHandler?.(data), defaultValues: defaultData
    })

    return <form onSubmit={onSubmit}>
        <div className="space-y-8">
            <div>
                <h1 className="mt-8 text-xl sm:text-2xl font-semibold leading-7 text-gray-900">Informacje o mieszkaniu</h1>
                <p className="mt-2 text-base leading-6 text-gray-600">
                    Prosimy o wypełnienie poniższego formularza, wprowadzając informacje dotyczące mieszkania. Jedynie lokalizacja oraz powierzchnia są wymagane, jednakże im więcej informacji podasz, tym szacowana cena mieszkania będzie dokładniejsza.
                </p>
            </div>
            <div>
                <MapInput control={control} />
                {(errors.latitude || errors.longitude) && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.latitude?.message} {errors.longitude?.message}
                    </p>
                )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-1">
                    <label htmlFor="size" className="block text-sm font-medium leading-6 text-gray-900">
                        Powierzchnia (w m²)
                    </label>
                    <div className="mt-2">
                        <input
                            {...register('size')}
                            type="text"
                            className={`focus:outline-none block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${errors.size ? 'ring-red-500 focus:ring-red-600' : ''}`}/>
                    </div>
                    {errors.size && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.size.message}
                        </p>
                    )}
                </div>
                <div className="sm:col-span-1">
                    <label htmlFor="roomCount" className="block text-sm font-medium leading-6 text-gray-900">
                        Liczba pokoi
                    </label>
                    <div className="mt-2">
                        <input
                            {...register('roomCount')}
                            type="text"
                            className={`focus:outline-none block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${errors.roomCount ? 'ring-red-500 focus:ring-red-600' : ''}`}/>
                    </div>
                    {errors.roomCount && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.roomCount.message}
                        </p>
                    )}
                </div>
                <div className="sm:col-span-1">
                    <label htmlFor="yearBuild" className="block text-sm font-medium leading-6 text-gray-900">
                        Rok budowy
                    </label>
                    <div className="mt-2">
                        <input
                            {...register('yearBuild')}
                            type="text"
                            className={`focus:outline-none block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${errors.yearBuild ? 'ring-red-500 focus:ring-red-600' : ''}`}/>
                    </div>
                    {errors.yearBuild && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.yearBuild.message}
                        </p>
                    )}
                </div>
                <div className="sm:col-span-1">
                    <label htmlFor="floor" className="block text-sm font-medium leading-6 text-gray-900">
                        Piętro
                    </label>
                    <div className="mt-2">
                        <input
                            {...register('floor')}
                            type="text"
                            className={`focus:outline-none block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${errors.floor ? 'ring-red-500 focus:ring-red-600' : ''}`}/>
                    </div>
                    {errors.floor && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.floor.message}
                        </p>
                    )}
                </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-x-6">
                <button
                type="submit"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                Wyceń mieszkanie
                </button>
            </div>
        </div>
    </form>
}

export default ApartmentDetailsForm