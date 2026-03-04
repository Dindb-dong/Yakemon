const commonHeaders = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

/**
 * Build a JSON response for Netlify Functions.
 */
function json(statusCode, body) {
  return {
    statusCode,
    headers: commonHeaders,
    body: JSON.stringify(body),
  };
}

/**
 * Parse JSON body safely and return null on parse failure.
 */
function parseBody(rawBody) {
  if (!rawBody) {
    return {};
  }
  try {
    return JSON.parse(rawBody);
  } catch (error) {
    return null;
  }
}

module.exports = {
  json,
  parseBody,
};
