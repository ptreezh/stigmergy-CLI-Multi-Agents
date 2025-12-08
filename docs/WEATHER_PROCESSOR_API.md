# Weather Data Processing API

## Overview

This module provides functions for processing weather data from various sources and converting it into standardized formats for analysis and display. It handles data from different weather APIs and sensors, normalizing the output for consistent consumption.

## Installation

The weather processor is part of the Stigmergy CLI utility functions. No additional installation is required.

## Usage

```javascript
const { processWeatherData } = require('./src/weatherProcessor');

// Process raw weather data
const processedData = processWeatherData(rawWeatherData, {
  unit: 'celsius',
  includeForecasts: true,
  forecastDays: 5
});
```

## API Reference

### `processWeatherData(rawData, options)`

Processes raw weather data and generates standardized output.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `rawData` | Object | Raw weather data from API or sensor |
| `options` | Object | Processing options |

##### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `unit` | string | `'celsius'` | Temperature unit (`'celsius'`, `'fahrenheit'`, `'kelvin'`) |
| `includeForecasts` | boolean | `false` | Whether to include forecast data |
| `forecastDays` | number | `5` | Number of forecast days to include (1-7) |

#### Returns

| Type | Description |
|------|-------------|
| Object | Processed weather data with standardized format |

#### Throws

- `Error`: If input data is invalid or missing required fields
- `Error`: If unit option is invalid
- `Error`: If forecastDays is outside the valid range (1-7)

#### Example

```javascript
const rawData = {
  location: {
    name: "London",
    country: "UK",
    lat: 51.5074,
    lon: -0.1278
  },
  current: {
    temp: 285.15,
    feels_like: 283.15,
    humidity: 72,
    pressure: 1013,
    wind_speed: 3.5,
    wind_deg: 180,
    visibility: 10000,
    clouds: 40,
    weather: [{
      description: "scattered clouds",
      icon: "03d"
    }]
  },
  forecast: [
    {
      dt: 1640995200,
      temp: { min: 282.15, max: 286.15 },
      humidity: 65,
      pressure: 1015,
      wind_speed: 2.8,
      wind_deg: 160,
      pop: 0.2,
      weather: [{ description: "light rain" }]
    }
  ]
};

const processedData = processWeatherData(rawData, {
  unit: 'celsius',
  includeForecasts: true,
  forecastDays: 3
});

// Returns:
// {
//   timestamp: "2025-12-08T10:30:00.000Z",
//   location: {
//     name: "London",
//     country: "UK",
//     coordinates: { lat: 51.5074, lon: -0.1278 }
//   },
//   current: {
//     temperature: { value: 12, unit: "celsius", feelsLike: 10 },
//     humidity: 72,
//     pressure: 1013,
//     wind: { speed: 3.5, direction: 180 },
//     visibility: 10000,
//     cloudiness: 40,
//     description: "scattered clouds",
//     icon: "03d"
//   },
//   forecasts: [
//     {
//       date: "2022-01-01",
//       temperature: { min: 9, max: 13, unit: "celsius" },
//       humidity: 65,
//       pressure: 1015,
//       wind: { speed: 2.8, direction: 160 },
//       precipitation: { probability: 0.2, amount: 0 },
//       description: "light rain"
//     }
//   ]
// }
```

## Data Structures

### Processed Weather Data

The returned object has the following structure:

```javascript
{
  timestamp: string,        // ISO timestamp of processing
  location: {
    name: string,           // Location name
    country: string,        // Country code
    coordinates: {
      lat: number,          // Latitude
      lon: number           // Longitude
    }
  },
  current: {
    temperature: {
      value: number,        // Temperature value
      unit: string,         // Temperature unit
      feelsLike: number     // "Feels like" temperature
    },
    humidity: number,       // Humidity percentage (0-100)
    pressure: number,       // Atmospheric pressure in hPa
    wind: {
      speed: number,        // Wind speed
      direction: number     // Wind direction in degrees
    },
    visibility: number,     // Visibility in meters
    cloudiness: number,     // Cloud cover percentage (0-100)
    description: string,    // Weather description
    icon: string            // Weather icon code
  },
  forecasts: [              // Array of forecast objects (if enabled)
    {
      date: string,         // Forecast date (YYYY-MM-DD)
      temperature: {
        min: number,        // Minimum temperature
        max: number,        // Maximum temperature
        unit: string        // Temperature unit
      },
      humidity: number,     // Humidity percentage
      pressure: number,     // Atmospheric pressure in hPa
      wind: {
        speed: number,      // Wind speed
        direction: number   // Wind direction in degrees
      },
      precipitation: {
        probability: number, // Precipitation probability (0-1)
        amount: number       // Precipitation amount
      },
      description: string   // Weather description
    }
  ]
}
```

## Supported Data Sources

The processor can handle data from various weather services including:
- OpenWeatherMap
- WeatherAPI
- AccuWeather
- National Weather Service
- Custom sensor data

## Error Handling

The function validates input data and throws descriptive errors for:
- Invalid input data types
- Missing required fields
- Invalid configuration options

Always wrap calls in try-catch blocks for production code:

```javascript
try {
  const weatherData = processWeatherData(rawData, options);
  // Process weather data
} catch (error) {
  console.error('Failed to process weather data:', error.message);
  // Handle error appropriately
}
```

## Testing

Unit tests are available in `test/weather-processor.test.js` and can be run with:

```bash
npm test -- test/weather-processor.test.js
```

## Related Modules

- `src/utils.js`: Contains utility functions used by the weather processor
- `src/adapters/`: Contains API-specific adapters for different weather services