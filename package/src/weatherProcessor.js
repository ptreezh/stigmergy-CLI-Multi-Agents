/**
 * Weather Data Processing Module
 *
 * This module provides functions for processing weather data from various sources
 * and converting it into standardized formats for analysis and display.
 */

/**
 * Process raw weather data and generate standardized output
 * @param {Object} rawData - Raw weather data from API or sensor
 * @param {Object} options - Processing options
 * @param {string} options.unit - Temperature unit ('celsius', 'fahrenheit', 'kelvin')
 * @param {boolean} options.includeForecasts - Whether to include forecast data
 * @param {number} options.forecastDays - Number of forecast days to include (1-7)
 * @returns {Object} Processed weather data with standardized format
 * @throws {Error} If input data is invalid or missing required fields
 */
function processWeatherData(rawData, options = {}) {
  // Validate input
  if (!rawData || typeof rawData !== 'object') {
    throw new Error('Invalid weather data: must be an object');
  }

  // Default options
  const opts = {
    unit: 'celsius',
    includeForecasts: false,
    forecastDays: 5,
    ...options,
  };

  // Validate options
  if (!['celsius', 'fahrenheit', 'kelvin'].includes(opts.unit)) {
    throw new Error(
      'Invalid unit: must be "celsius", "fahrenheit", or "kelvin"',
    );
  }

  if (opts.forecastDays < 1 || opts.forecastDays > 7) {
    throw new Error('Invalid forecastDays: must be between 1 and 7');
  }

  // Process current weather data
  const processedData = {
    timestamp: new Date().toISOString(),
    location: _extractLocation(rawData),
    current: _processCurrentWeather(rawData.current || rawData, opts.unit),
    forecasts: opts.includeForecasts
      ? _processForecastData(rawData.forecast || [], opts)
      : [],
  };

  return processedData;
}

/**
 * Extract location information from raw data
 * @param {Object} data - Raw weather data
 * @returns {Object} Location information
 */
function _extractLocation(data) {
  // Handle various location formats from different APIs
  if (data.location) {
    return {
      name: data.location.name || data.location.city || 'Unknown',
      country: data.location.country || '',
      coordinates: {
        lat: data.location.lat || data.location.latitude || 0,
        lon: data.location.lon || data.location.longitude || 0,
      },
    };
  }

  if (data.city) {
    return {
      name: data.city.name || data.city,
      country: data.city.country || '',
      coordinates: {
        lat: data.city.coord?.lat || data.city.latitude || 0,
        lon: data.city.coord?.lon || data.city.longitude || 0,
      },
    };
  }

  return {
    name: 'Unknown',
    country: '',
    coordinates: { lat: 0, lon: 0 },
  };
}

/**
 * Process current weather data
 * @param {Object} current - Current weather data
 * @param {string} unit - Temperature unit
 * @returns {Object} Processed current weather data
 */
function _processCurrentWeather(current, unit) {
  if (!current) {
    return null;
  }

  // Convert temperature to requested unit
  const temp = _convertTemperature(
    current.temp || current.temperature || 0,
    'kelvin',
    unit,
  );
  const feelsLike = _convertTemperature(
    current.feels_like || current.feelsLike || temp,
    'kelvin',
    unit,
  );

  return {
    temperature: {
      value: temp,
      unit: unit,
      feelsLike: feelsLike,
    },
    humidity: current.humidity || current.humididy || 0,
    pressure: current.pressure || 0,
    wind: {
      speed: current.wind_speed || current.windSpeed || 0,
      direction: current.wind_deg || current.windDirection || 0,
    },
    visibility: current.visibility || 0,
    cloudiness: current.clouds || current.cloudiness || 0,
    description:
      current.description || current.weather?.[0]?.description || 'Unknown',
    icon: current.icon || current.weather?.[0]?.icon || '',
  };
}

/**
 * Process forecast data
 * @param {Array} forecasts - Array of forecast data
 * @param {Object} options - Processing options
 * @returns {Array} Processed forecast data
 */
function _processForecastData(forecasts, options) {
  if (!Array.isArray(forecasts)) {
    return [];
  }

  // Limit forecasts to requested number of days
  const limitedForecasts = forecasts.slice(0, options.forecastDays);

  return limitedForecasts.map((forecast) => {
    const date = forecast.dt
      ? new Date(forecast.dt * 1000).toISOString().split('T')[0]
      : forecast.date || new Date().toISOString().split('T')[0];

    return {
      date: date,
      temperature: {
        min: _convertTemperature(
          forecast.temp?.min || forecast.min_temp || 0,
          'kelvin',
          options.unit,
        ),
        max: _convertTemperature(
          forecast.temp?.max || forecast.max_temp || 0,
          'kelvin',
          options.unit,
        ),
        unit: options.unit,
      },
      humidity: forecast.humidity || 0,
      pressure: forecast.pressure || 0,
      wind: {
        speed: forecast.wind_speed || forecast.windSpeed || 0,
        direction: forecast.wind_deg || forecast.windDirection || 0,
      },
      precipitation: {
        probability: forecast.pop || forecast.precipitation_probability || 0,
        amount: forecast.rain || forecast.snow || 0,
      },
      description:
        forecast.weather?.[0]?.description || forecast.description || 'Unknown',
    };
  });
}

/**
 * Convert temperature between units
 * @param {number} value - Temperature value
 * @param {string} fromUnit - Source unit ('celsius', 'fahrenheit', 'kelvin')
 * @param {string} toUnit - Target unit ('celsius', 'fahrenheit', 'kelvin')
 * @returns {number} Converted temperature value
 */
function _convertTemperature(value, fromUnit, toUnit) {
  if (fromUnit === toUnit) {
    return value;
  }

  // Convert to Celsius first
  let celsius;
  switch (fromUnit) {
  case 'celsius':
    celsius = value;
    break;
  case 'fahrenheit':
    celsius = ((value - 32) * 5) / 9;
    break;
  case 'kelvin':
    celsius = value - 273.15;
    break;
  default:
    celsius = value;
  }

  // Convert from Celsius to target unit
  switch (toUnit) {
  case 'celsius':
    return celsius;
  case 'fahrenheit':
    return (celsius * 9) / 5 + 32;
  case 'kelvin':
    return celsius + 273.15;
  default:
    return celsius;
  }
}

module.exports = {
  processWeatherData,
};
