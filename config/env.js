const env = {
    REGION: "us-west-2", // should match the one given in the docker-compose.yml file
    ACCOUNT_ID: "000000000000",
    IAM: {
        ACCESS_KEY_ID: "na",
        SECRET_ACCESS_KEY: "na",
    },
    SERVICE_ENDPOINT: "http://localhost:4566", // represents the service point for localstack
    QUEUE_NAME: "localstack-demo",
};

module.exports = env;
