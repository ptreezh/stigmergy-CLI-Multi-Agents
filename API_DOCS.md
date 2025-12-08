# Weather Data Processing API Documentation

## Overview
The Weather Data Processing module provides functionality to process raw weather data from various sources and convert it into a standardized format for analysis and display.

## Installation
This module is part of the stigmergy-CLI-Multi-Agents project. To use it, ensure you have the project dependencies installed:

```bash
npm install
```

## Usage
Import the function in your JavaScript file:
```javascript
const { processWeatherData } = require('./src/weatherProcessor');
```

## API Reference

### `processWeatherData(rawData, options)`

Processes raw weather data and generates standardized output.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `rawData` | Object | Raw weather data from API or sensor (required) |
| `options` | Object | Processing options (optional) |

##### Options Object

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `unit` | string | `'celsius'` | Temperature unit (`'celsius'`, `'fahrenheit'`, `'kelvin'`) |
| `includeForecasts` | boolean | `false` | Whether to include forecast data |
| `forecastDays` | number | `5` | Number of forecast days to include (1-7) |

#### Returns
Returns a processed weather data object with the following structure:
```javascript
{
  timestamp: string,     // ISO timestamp of processing
  location: {
    name: string,        // Location name
    country: string,     // Country name
    coordinates: {
      lat: number,       // Latitude
      lon: number        // Longitude
    }
  },
  current: {
    temperature: {
      value: number,     // Temperature value
      unit: string,      // Temperature unit
      feelsLike: number  // Feels-like temperature
    },
    humidity: number,    // Humidity percentage
    pressure: number,    // Atmospheric pressure
    wind: {
      speed: number,     // Wind speed
      direction: number  // Wind direction in degrees
    },
    visibility: number,  // Visibility distance
    cloudiness: number,  // Cloud coverage percentage
    description: string, // Weather description
    icon: string         // Weather icon identifier
  },
  forecasts: Array<{   // Forecast data (if enabled)
    date: string,        // Forecast date
    temperature: {
      min: number,       // Minimum temperature
      max: number,       // Maximum temperature
      unit: string       // Temperature unit
    },
    humidity: number,    // Humidity percentage
    pressure: number,    // Atmospheric pressure
    wind: {
      speed: number,     // Wind speed
      direction: number  // Wind direction in degrees
    },
    precipitation: {
      probability: number, // Probability of precipitation
      amount: number       // Precipitation amount
    },
    description: string  // Weather description
  }>
}
```

#### Throws
- `Error`: If input data is invalid or missing required fields
- `Error`: If unit option is not one of `'celsius'`, `'fahrenheit'`, or `'kelvin'`
- `Error`: If forecastDays is not between 1 and 7

#### Example Usage

```javascript
// Basic usage with default options
const rawData = {
  location: {
    name: "London",
    country: "UK",
    lat: 51.5074,
    lon: -0.1278
  },
  current: {
    temp: 285.15,
    humidity: 72,
    pressure: 1013,
    // ... other properties
  }
};

const processedData = processWeatherData(rawData);

// Usage with custom options
const options = {
  unit: 'fahrenheit',
  includeForecasts: true,
  forecastDays: 3
};

const processedDataWithForecasts = processWeatherData(rawData, options);
```

## Internal Functions

These functions are used internally by the module and are not exported:

### `_extractLocation(data)`
Extracts location information from raw data, handling various formats from different APIs.

### `_processCurrentWeather(current, unit)`
Processes current weather data and converts temperatures to the requested unit.

### `_processForecastData(forecasts, options)`
Processes forecast data and limits it to the requested number of days.

### `_convertTemperature(value, fromUnit, toUnit)`
Converts temperature values between different units.

## Supported Units
- Celsius (°C)
- Fahrenheit (°F)
- Kelvin (K)

## Error Handling
The function performs validation on input data and options, throwing descriptive error messages when invalid data is provided.

## Testing
Run the test suite with:
```bash
node test/weather-processor.test.js
```

## License
This module is part of the stigmergy-CLI-Multi-Agents project.