const express = require("express");
const router = express.Router();

const {
    getConfigurationStatus,
    listQueues,
    createQueue,
    publishMsg,
    receiveMsg,
    deleteMsg,
    purgeQueue,
} = require("./sqs/requests");

// get sqs config status
// endpoint - http://localhost:6001/status
router.get("/status", getConfigurationStatus);

// list sqs queues
// endpoint - http://localhost:6001/list
router.get("/list", listQueues);

// create a sqs queue
// endpoint - http://localhost:6001/create
router.post("/create", createQueue);

// purge a sqs queue
// endpoint - http://localhost:6001/purge
router.delete("/purge", purgeQueue);

// send message to sqs queue
// endpoint - http://localhost:6001/send
router.post("/send", publishMsg);

// receive message from sqs queue
// endpoint - http://localhost:6001/receive
router.get("/receive", receiveMsg);

// delete message from sqs queue
// endpoint - http://localhost:6001/delete
router.delete("/delete", deleteMsg);

module.exports = {
    appRoutes: router,
};
