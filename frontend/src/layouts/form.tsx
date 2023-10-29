import { useApartmentDetailsForm } from "../hooks/useApartmentDetailsForm"

interface Props {
    submitHandler?: () => {}
}

const ApartmentDetailsForm = ({ submitHandler }: Props) => {
    const { register, onSubmit } = useApartmentDetailsForm({
        submitHandler: submitHandler ?? (() => {})
    })

    return <form onSubmit={onSubmit}>
        <div className="space-y-12">
            <div>
                <h2 className="text-base font-semibold leading-7 text-gray-900">Informacje o mieszkaniu</h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                    Prosimy o wypełnienie poniższego formularza, wprowadzając informacje dotyczące mieszkania. Żadne z pól nie jest obowiązkowe do wypełnienia, jednakże im więcej informacji podasz, tym szacowana cena mieszkania będzie dokładniejsza.
                </p>
            </div>
        </div>
    </form>
}

export default ApartmentDetailsForm