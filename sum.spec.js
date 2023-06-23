const sum = require('./sum');

describe('sum', () => {
    // Applies only to tests in this describe block
    test('adds 1 + 2 to equal 3', () => {
        expect(sum(1, 2)).toBe(3);
    });

    test('adds 1 + 3 to equal 4', () => {
        expect(sum(1, 3)).toBe(4);
    });
})