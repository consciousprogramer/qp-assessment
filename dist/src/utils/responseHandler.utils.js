export const sendSuccessResponse = (res, message, data = {}, status = 200 // will update as required
) => {
    res.status(status).json({
        message,
        data,
    });
};
