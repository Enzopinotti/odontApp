export default class ApiError extends Error {
  constructor(message, status = 400, details = null, code = null) {
    super(message);
    this.status  = status;
    this.details = details;
    this.code    = code;
  }
}
