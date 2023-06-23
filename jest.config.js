const config = {
    moduleFileExtensions: [
        "js",
        "json",
        "ts"
    ],
    verbose: true,
    reporters: [
        ['./reporter/vtpad', {space: '9cc510c3-ccb0-405b-82d8-58341a2ccff9', url: 'http://192.168.1.63:5005', console: true }],
        ['./reporter/telegram', {botToken: '5856518056:AAEBDRKvwaMFruGX20OkY3bB6K-h5z68E-4', chatId: '-1001978872241', logged: ['failed', 'passed'], console: false}],
        ]
};

module.exports = config;