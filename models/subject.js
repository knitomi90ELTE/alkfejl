module.exports = {
    identity: 'subject',
    connection: 'default',
    attributes: {
        subjectName: {
            type: 'string',
            required: true,
        },
        status: {
            type: 'boolean',
            required: true,
            defaultsTo: true,
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
        }
    }
};