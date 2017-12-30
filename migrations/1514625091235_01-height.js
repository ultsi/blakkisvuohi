exports.up = (pgm) => {
    pgm.addColumns('users', {
        height: {
            type: 'int',
            notNull: true,
            default: 175
        }
    });
};

exports.down = (pgm) => {
    pgm.dropColumns('users', ['height']);
};