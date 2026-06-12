//ApiError inherits from class Error

class ApiError extends Error {

    constructor(
        statusCode,
        message
    ) {

        super(message); //calls Error's constructor and pass the message to it

        this.statusCode = statusCode;

        this.message = message;

        this.success = false;
    }
}


export { ApiError };