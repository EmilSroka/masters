import { Apartment, Currency, DecimalNumber, Money, Offer, UUID } from 'mes-proto-ts'

console.log('Hello There!');

console.log('Protobuf types demo');

const test = Offer.create({
    id: UUID.create({ value: 'sdasdasdasd' }),
    description: 'Test description',
    title: 'Test title',
    timeScraped: new Date(),
    apartment: Apartment.create({
        size: DecimalNumber.create({
            value: 10000,
            scale: 2
        }),
        price: Money.create({
            value: DecimalNumber.create({
                value: 100_000_00,
                scale: 2
            }),
            currency: Currency.PLN
        })   
    })
})

console.log(test);
console.log(Offer.toJSON(test));
console.log((test.apartment?.price?.value?.value ?? 1) * 10 ** -(test.apartment?.price?.value?.scale ?? 2))