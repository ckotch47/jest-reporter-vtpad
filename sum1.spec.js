function isValidCityFoodPair(str, str1){
    return true
}

describe('matching cities to foods', () => {
    // Applies only to tests in this describe block

    test('Vienna <3 veal', () => {
        expect(isValidCityFoodPair('Vienna', 'Wiener Schnitzel')).toBe(false);
    });

    test('San Juan <3 plantains', () => {
        expect(isValidCityFoodPair('San Juan', 'Mofongo')).toBe(true);
    });
});