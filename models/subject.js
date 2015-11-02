module.exports = {
    identity: 'subject',
    connection: 'default',
    attributes: {
        name: {
            type: 'string',
            required: true,
        },
        room: {
            type: 'string',
            required: true,
        },
        description: {
            type: 'string',
            required: true,
        },
        user: {
            model: 'user',
        },
    }
};