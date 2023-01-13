const _ = require("underscore");

const env = require("../config/env");

// configuring local-stack aws
const AWS = require("aws-sdk");
AWS.config.update({
    region: env.REGION,
});

// create an sqs service object
const sqs = new AWS.SQS({
    endpoint: env.SERVICE_ENDPOINT,
    accessKeyId: env.IAM.ACCESS_KEY_ID,
    secretAccessKey: env.IAM.SECRET_ACCESS_KEY,
    region: env.REGION,
});

// handler methods

// method1 - to get sqs config status
const getConfigurationStatus = (req, res) => {
    console.log("fetching configuration status");
    res.status(200).json({
        status: "ok",
        data: sqs,
    });
};

// method2 - to list all queues
const listQueues = (req, res) => {
    console.log("fetching all queues");
    sqs.listQueues({}, (err, data) => {
        if (err) {
            res.status(500).json({
                status: "internal server error",
                error: err,
            });
        } else {
            res.status(200).json({
                status: "ok",
                urls: data.QueueUrls,
            });
        }
    });
};

// method3 - to create a new sqs queue
const createQueue = (req, res) => {
    let createParams = {
        QueueName: env.QUEUE_NAME, // in real example client should provide queue name
        Attributes: {
            DelaySeconds: "60",
            MessageRetentionPeriod: "86400",
        },
    };
    console.log(createParams);

    sqs.createQueue(createParams, (err, data) => {
        if (err) {
            res.status(500).json({
                status: "internal server error",
                error: err,
            });
        } else {
            res.status(201).json({
                status: "created",
                name: data.QueueName,
                message: "queue created successfully",
            });
        }
    });
};

// method4 - to purge the given sqs queue
const purgeQueue = (req, res) => {
    let queueName = req.query.name;
    if (_.isEmpty(queueName)) {
        res.status(400).json({
            status: "bad request",
            message: "queue name cannot be empty",
        });
    } else {
        console.log("purging queue = " + queueName);

        let purgeParams = {
            QueueUrl:
                env.SERVICE_ENDPOINT + "/" + env.ACCOUNT_ID + "/" + queueName,
        };
        console.log(purgeParams);

        sqs.purgeQueue(purgeParams, (err, data) => {
            if (err) {
                res.status(500).json({
                    status: "500",
                    err: err,
                });
            } else {
                res.status(200).json({
                    status: "ok",
                    data: "queue purged",
                });
            }
        });
    }
};

// method5 - to publish the message to the sqs queue
const publishMsg = (req, res) => {
    //todo - add empty queue name validation in the request body

    let msg = {
        id: req.body["id"],
        name: req.body["name"],
        email: req.body["email"],
        phone: req.body["phone"],
    };

    let msgParams = {
        QueueUrl:
            env.SERVICE_ENDPOINT +
            "/" +
            env.ACCOUNT_ID +
            "/" +
            req.body["queueName"], // queueName will never be empty
        MessageBody: JSON.stringify(msg),
    };
    console.log(msgParams);

    sqs.sendMessage(msgParams, (err, data) => {
        if (err) {
            res.status(500).json({
                status: "internal server error",
                error: err,
            });
        } else {
            res.status(202).json({
                status: "accepted",
                messageId: data.MessageId,
                message: "sent to queue",
            });
        }
    });
};

// method6 - to receive the message from the sqs queue
const receiveMsg = (req, res) => {
    let queueName = req.query.name;
    if (_.isEmpty(queueName)) {
        res.status(400).json({
            status: "bad request",
            message: "queue name cannot be empty",
        });
    } else {
        console.log("Fetching messages from queue = " + queueName);

        let receiveParams = {
            QueueUrl:
                env.SERVICE_ENDPOINT + "/" + env.ACCOUNT_ID + "/" + queueName,
            MessageAttributeNames: ["All"],
        };
        console.log(receiveParams);

        sqs.receiveMessage(receiveParams, (err, data) => {
            if (err) {
                res.status(500).json({
                    status: "internal server error",
                    error: err,
                });
            } else {
                if (!data.Messages) {
                    res.status(200).json({
                        status: "ok",
                        data: "no message in the queue",
                    });
                } else {
                    let items = [];
                    _.each(data.Messages, function (message) {
                        let ele = {
                            id: message.MessageId,
                            receiptHandle: message.ReceiptHandle,
                            data: JSON.parse(message.Body),
                        };
                        items.push(ele);
                    });
                    res.status(200).json({
                        status: "ok",
                        messages: items,
                    });
                }
            }
        });
    }
};

// method7 - to delete the message from the sqs queue
const deleteMsg = (req, res) => {
    let id = req.query.id;
    let queueName = req.query.name;
    if (_.isEmpty(id) || _.isEmpty(queueName)) {
        res.status(400).json({
            status: "bad request",
            message: "receipt handle id or queue name cannot be empty",
        });
    } else {
        console.log("Deleting message id = " + id + " from queue");

        let deleteParams = {
            QueueUrl:
                env.SERVICE_ENDPOINT + "/" + env.ACCOUNT_ID + "/" + queueName,
            ReceiptHandle: id,
        };
        console.log(deleteParams);

        sqs.deleteMessage(deleteParams, (err, data) => {
            if (err) {
                res.status(500).json({
                    status: "internal server error",
                    error: err,
                });
            } else {
                res.status(202).json({
                    status: "accepted",
                    message: "message deleted from queue",
                });
            }
        });
    }
};

module.exports = {
    getConfigurationStatus,
    listQueues,
    createQueue,
    purgeQueue,
    publishMsg,
    receiveMsg,
    deleteMsg,
};
