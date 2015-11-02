module.exports = {
    identity: 'subject',
    connection: 'default',
    attributes: {
        subjectName: {
            type: 'string',
            required: true,
        },
        status: {
            type: 'string',
            enum: ['available', 'inavailable', 'passive'],
            required: true,
            defaultsTo: 'passive',
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