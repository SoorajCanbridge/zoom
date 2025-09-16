class ApiResponse {
  /**
   * Creates a success response
   * @param {string} message - Success message
   * @param {*} data - Response data
   * @param {number} statusCode - HTTP status code
   */
  static success(message, data = null, statusCode = 200) {
    return {
      success: true,
      message,
      data,
      statusCode
    };
  }

  /**
   * Creates an error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {*} errors - Additional error details
   */
  static error(message, statusCode = 400, errors = null) {
    return {
      success: false,
      message,
      errors,
      statusCode
    };
  }

  /**
   * Creates a paginated response
   * @param {string} message - Success message
   * @param {*} data - Response data
   * @param {Object} pagination - Pagination details
   * @param {number} statusCode - HTTP status code
   */
  static paginated(message, data, pagination, statusCode = 200) {
    return {
      success: true,
      message,
      data,
      pagination,
      statusCode
    };
  }
}

module.exports = ApiResponse; 