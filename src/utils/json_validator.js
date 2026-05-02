/**
 * JSON schema validation utilities
 */

/**
 * Validate data against a schema
 * @param {*} data - Data to validate
 * @param {Object} schema - Schema to validate against
 * @throws {Error} If data doesn't match schema
 */
function validateSchema(data, schema) {
  if (typeof schema !== "object" || schema === null) {
    throw new Error("Schema must be a valid object");
  }

  if (schema.required && Array.isArray(schema.required)) {
    for (const field of schema.required) {
      if (!(field in data)) {
        throw new Error(`Required field '${field}' is missing`);
      }
    }
  }

  for (const key in schema.properties) {
    if (!(key in data) && schema.required && schema.required.includes(key)) {
      throw new Error(`Required field '${key}' is missing`);
    }

    if (key in data) {
      const propertySchema = schema.properties[key];
      const value = data[key];

      if (propertySchema.type) {
        if (value === null && propertySchema.nullable) {
          continue;
        }

        if (propertySchema.type === "array" && !Array.isArray(value)) {
          throw new Error(`Field '${key}' should be an array`);
        } else if (
          propertySchema.type === "object" &&
          (typeof value !== "object" || value === null || Array.isArray(value))
        ) {
          throw new Error(`Field '${key}' should be an object`);
        } else if (
          propertySchema.type !== "array" &&
          propertySchema.type !== "object" &&
          typeof value !== propertySchema.type
        ) {
          throw new Error(
            `Field '${key}' should be of type ${propertySchema.type}, got ${typeof value}`,
          );
        }
      }

      if (propertySchema.enum && !propertySchema.enum.includes(value)) {
        throw new Error(
          `Field '${key}' should be one of: ${propertySchema.enum.join(", ")}`,
        );
      }

      if (typeof value === "number") {
        if (
          propertySchema.minimum !== undefined &&
          value < propertySchema.minimum
        ) {
          throw new Error(
            `Field '${key}' should be greater than or equal to ${propertySchema.minimum}`,
          );
        }
        if (
          propertySchema.maximum !== undefined &&
          value > propertySchema.maximum
        ) {
          throw new Error(
            `Field '${key}' should be less than or equal to ${propertySchema.maximum}`,
          );
        }
      }

      if (typeof value === "string") {
        if (
          propertySchema.minLength !== undefined &&
          value.length < propertySchema.minLength
        ) {
          throw new Error(
            `Field '${key}' should have a minimum length of ${propertySchema.minLength}`,
          );
        }
        if (
          propertySchema.maxLength !== undefined &&
          value.length > propertySchema.maxLength
        ) {
          throw new Error(
            `Field '${key}' should have a maximum length of ${propertySchema.maxLength}`,
          );
        }
      }

      if (propertySchema.type === "object" && propertySchema.properties) {
        validateSchema(value, propertySchema);
      }

      if (
        propertySchema.type === "array" &&
        propertySchema.items &&
        Array.isArray(value)
      ) {
        if (
          propertySchema.minItems !== undefined &&
          value.length < propertySchema.minItems
        ) {
          throw new Error(
            `Array '${key}' should have at least ${propertySchema.minItems} items`,
          );
        }
        if (
          propertySchema.maxItems !== undefined &&
          value.length > propertySchema.maxItems
        ) {
          throw new Error(
            `Array '${key}' should have at most ${propertySchema.maxItems} items`,
          );
        }

        for (const [index, item] of value.entries()) {
          if (
            propertySchema.items.type &&
            typeof item !== propertySchema.items.type
          ) {
            throw new Error(
              `Item at index ${index} in array '${key}' should be of type ${propertySchema.items.type}, got ${typeof item}`,
            );
          }

          if (
            propertySchema.items.type === "object" &&
            propertySchema.items.properties
          ) {
            validateSchema(item, propertySchema.items);
          }
        }
      }
    }
  }
}

/**
 * Parse JSON data and validate its structure
 * @param {string} jsonString - The JSON string to parse
 * @param {Object} schema - Optional schema to validate against
 * @returns {Object} Parsed and validated JSON data
 * @throws {Error} If JSON is invalid or doesn't match schema
 */
function parseAndValidateJSON(jsonString, schema = null) {
  let parsedData;
  try {
    parsedData = JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Invalid JSON format: ${error.message}`);
  }

  if (!schema) {
    return parsedData;
  }

  validateSchema(parsedData, schema);

  return parsedData;
}

module.exports = {
  parseAndValidateJSON,
  validateSchema,
};