/**
 * Test for Weather Data Processing Module
 */

const { processWeatherData } = require('../src/weatherProcessor');

// Sample raw weather data
const sampleData = {
  location: {
    name: "London",
    country: "UK",
    lat: 51.5074,
    lon: -0.1278
  },
  current: {
    temp: 285.15, // Kelvin
    feels_like: 283.15, // Kelvin
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
      temp: { min: 282.15, max: 286.15 }, // Kelvin
      humidity: 65,
      pressure: 1015,
      wind_speed: 2.8,
      wind_deg: 160,
      pop: 0.2,
      weather: [{ description: "light rain" }]
    }
  ]
};

console.log("Testing weather data processing...");

try {
  // Test with default options
  console.log("\n1. Testing with default options:");
  const result1 = processWeatherData(sampleData);
  console.log("Success:", {
    location: result1.location.name,
    temperature: result1.current.temperature.value + "°" + result1.current.temperature.unit,
    forecasts: result1.forecasts.length
  });

  // Test with Celsius
  console.log("\n2. Testing with Celsius:");
  const result2 = processWeatherData(sampleData, { unit: 'celsius' });
  console.log("Success:", {
    temperature: result2.current.temperature.value + "°C",
    feelsLike: result2.current.temperature.feelsLike + "°C"
  });

  // Test with Fahrenheit
  console.log("\n3. Testing with Fahrenheit:");
  const result3 = processWeatherData(sampleData, { unit: 'fahrenheit' });
  console.log("Success:", {
    temperature: result3.current.temperature.value + "°F",
    feelsLike: result3.current.temperature.feelsLike + "°F"
  });

  // Test with forecasts
  console.log("\n4. Testing with forecasts:");
  const result4 = processWeatherData(sampleData, { 
    unit: 'celsius', 
    includeForecasts: true, 
    forecastDays: 1 
  });
  console.log("Success:", {
    forecasts: result4.forecasts.length,
    forecastTempMin: result4.forecasts[0].temperature.min + "°C",
    forecastTempMax: result4.forecasts[0].temperature.max + "°C"
  });

  console.log("\n✅ All tests passed!");
} catch (error) {
  console.error("❌ Test failed:", error.message);
}

// Test error cases
console.log("\n5. Testing error handling:");

try {
  processWeatherData(null);
  console.log("❌ Should have thrown an error for null input");
} catch (error) {
  console.log("✅ Correctly threw error for null input:", error.message);
}

try {
  processWeatherData({}, { unit: 'invalid' });
  console.log("❌ Should have thrown an error for invalid unit");
} catch (error) {
  console.log("✅ Correctly threw error for invalid unit:", error.message);
}