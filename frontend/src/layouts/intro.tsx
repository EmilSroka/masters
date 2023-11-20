import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import BackgroundImage from '../resources/background.jpg';

interface Props {
    onNext?: () => void
}

const Intro = ({ onNext }: Props) => {
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
              <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Darmowa Wycena Mieszkań w Warszawie - Szybko i Precyzyjnie
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Poznaj wartość swojego mieszkania w Warszawie w kilka chwil! Korzystając z najnowszych osiągnięć w dziedzinie uczenia maszynowego, nasz system wyceny mieszkań zapewnia błyskawiczną i dokładną wycenę mieszkań w Warszawie. 
                </p>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Wypełnij krótki formularz poniżej, aby otrzymać wycenę swojego mieszkania.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <button
                    type="button"
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    onClick={() => onNext?.()}
                  >
                    Wyceń teraz
                  </button>
                </div>
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
  )
}

export default Intro;
