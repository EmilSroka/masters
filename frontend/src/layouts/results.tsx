import BackgroundImage from '../resources/background2.jpg';

interface Props {
    state: 'LOADING' | 'ERROR' | 'DONE' | 'NO DATA',
    price: number,
    probability: number,
    reset: () => void
}

const Results = ({ state, price, probability, reset }: Props) => {
    const delta = (1 - probability/100) * 0.7; // 0.6 - 0.95 => 0.05 - 0.4 
    const minValuation = roundToNearestHundred(price * (1 - delta));
    const maxValuation = roundToNearestHundred(price * (1 + delta));

    return (
    <div className="bg-white">
        <div className="relative lg:min-h-screen">
            <div className="mx-auto max-w-7xl lg:min-h-screen">
            <div className="relative z-10 pt-14 lg:w-full lg:max-w-2xl lg:min-h-screen">
                <svg
                className="absolute inset-y-0 right-8 hidden h-full w-80 translate-x-1/2 transform fill-white lg:block"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
                >
                <polygon points="0,0 90,0 50,100 0,100" />
                </svg>

                <div className="relative px-6 py-32 sm:py-40 lg:px-8 lg:py-56 lg:pr-0">

                <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl flex flex-col items-center justify-center">
                    {state === 'LOADING' && <>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Wyceniamy mieszkanie
                        </h1>
                        <div className="mt-16 animate-spin rounded-full h-32 w-32 border-t-4 border-indigo-600"></div>
                    </>}
                    {state === 'DONE' && <>
                        <p className="text-xl font-bold tracking-tight text-indigo-700 sm:text-4xl">Szacowana wartość mieszkania</p>
                        <p className="mt-6 text-5xl sm:text-8xl leading-8 text-gray-900 text-center">{roundToNearestHundred(price)} zł</p>
                        <p className="mt-6 text-lg leading-8 text-gray-600 text-center">
                            Z prawdopodobieństwem <span className="font-semibold">80%</span> mieszkanie jest warte od 
                            <span className="font-semibold"> {minValuation}</span> PLN do 
                            <span className="font-semibold"> {maxValuation}</span> PLN.
                        </p>
                        <div className="mt-8 flex items-center gap-x-6">
                            <button
                                type="button"
                                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                onClick={reset}
                            >
                                Nowa wycena
                            </button>
                        </div>
                    </>}
                    {(state === 'ERROR' || state === 'NO DATA') && <>
                        <p className="text-2xl font-bold tracking-tight text-indigo-700 sm:text-4xl">Błąd!</p>
                        <p className="mt-8 text-lg leading-8 text-gray-600 text-center">
                            Przykro nam, ale nie mogliśmy dokonać wyceny Twojego mieszkania. Prosimy spróbować jeszcze raz za jakiś czas.
                        </p>
                        <div className="mt-8 flex items-center gap-x-6">
                            <button
                                type="button"
                                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                onClick={() => window.location.reload()}
                            >
                                Odśwież stronę
                            </button>
                        </div>
                    </>}
                </div>
                </div>
            </div>
            </div>
            <div className="bg-gray-50 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <img
                className="aspect-[3/2] object-cover lg:aspect-auto lg:h-full lg:w-full"
                src={BackgroundImage}
                alt="Biały blok z balkonami"
            />
            </div>
        </div>
    </div>
    );
}

function roundToNearestHundred(num: number) {
    return (Math.round(num / 100) * 100).toLocaleString('pl-PL');
}

export default Results;
