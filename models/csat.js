module.exports = {
    identity: 'csat',
    connection: 'default',
    attributes: {
        student_id:{
            model: 'user',
        },
        subject_id:{
            model: 'subject',
        }
    }
};