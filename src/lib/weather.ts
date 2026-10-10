export interface SocietyWeather {
  city: string;
  locationLabel: string;
  temp: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  wind: number;
  aqi: number;
  aqiLabel: string;
  uvIndex: string;
  forecast: Array<{ time: string; temp: number; condition: string }>;
}

function hashCity(city: string): number {
  let hash = 0;
  for (let i = 0; i < city.length; i++) {
    hash = (hash << 5) - hash + city.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const CITY_PROFILES: Record<string, Partial<SocietyWeather>> = {
  jamshedpur: { temp: 28, condition: "Mostly Sunny", humidity: 55, wind: 11, aqi: 48, aqiLabel: "Clean Air" },
  bengaluru: { temp: 24, condition: "Partly Cloudy", humidity: 62, wind: 14, aqi: 38, aqiLabel: "Clean Air" },
  bangalore: { temp: 24, condition: "Partly Cloudy", humidity: 62, wind: 14, aqi: 38, aqiLabel: "Clean Air" },
  mumbai: { temp: 31, condition: "Humid & Sunny", humidity: 76, wind: 18, aqi: 68, aqiLabel: "Moderate" },
  delhi: { temp: 32, condition: "Sunny & Warm", humidity: 45, wind: 9, aqi: 92, aqiLabel: "Moderate" },
  noida: { temp: 32, condition: "Sunny & Warm", humidity: 44, wind: 10, aqi: 90, aqiLabel: "Moderate" },
  gurugram: { temp: 33, condition: "Clear Sky", humidity: 42, wind: 11, aqi: 88, aqiLabel: "Moderate" },
  hyderabad: { temp: 29, condition: "Clear Sky", humidity: 50, wind: 13, aqi: 45, aqiLabel: "Clean Air" },
  pune: { temp: 27, condition: "Pleasant Breeze", humidity: 54, wind: 15, aqi: 41, aqiLabel: "Clean Air" },
  chennai: { temp: 33, condition: "Warm & Breezy", humidity: 72, wind: 16, aqi: 52, aqiLabel: "Moderate" },
  kolkata: { temp: 30, condition: "Passing Clouds", humidity: 68, wind: 12, aqi: 64, aqiLabel: "Moderate" },
  jaipur: { temp: 33, condition: "Sunny & Dry", humidity: 35, wind: 10, aqi: 75, aqiLabel: "Moderate" },
  ahmedabad: { temp: 34, condition: "Sunny", humidity: 40, wind: 12, aqi: 70, aqiLabel: "Moderate" },
  chandigarh: { temp: 28, condition: "Clear Sky", humidity: 48, wind: 8, aqi: 42, aqiLabel: "Clean Air" },
  kochi: { temp: 29, condition: "Tropical Breeze", humidity: 78, wind: 14, aqi: 32, aqiLabel: "Good" },
};

export function getSocietyWeather(city?: string | null, address?: string | null): SocietyWeather {
  const cleanCity = (city || "").trim();
  const normalized = cleanCity.toLowerCase();
  const baseProfile = CITY_PROFILES[normalized];

  const citySeed = cleanCity ? hashCity(cleanCity) : 42;
  const temp = baseProfile?.temp ?? (25 + (citySeed % 8));
  const humidity = baseProfile?.humidity ?? (45 + (citySeed % 30));
  const wind = baseProfile?.wind ?? (8 + (citySeed % 10));
  const aqi = baseProfile?.aqi ?? (35 + (citySeed % 40));
  const aqiLabel = baseProfile?.aqiLabel ?? (aqi < 50 ? "Clean Air" : aqi < 100 ? "Moderate" : "Sensitive");
  const condition = baseProfile?.condition ?? (citySeed % 2 === 0 ? "Mostly Sunny" : "Clear Sky");

  const displayCity = cleanCity || "Local Community";
  const locationLabel = address ? `${address}, ${displayCity}` : displayCity;

  return {
    city: displayCity,
    locationLabel,
    temp,
    feelsLike: temp + 2,
    condition,
    humidity,
    wind,
    aqi,
    aqiLabel,
    uvIndex: "Moderate (4)",
    forecast: [
      { time: "Now", temp, condition },
      { time: "+2h", temp: temp + 1, condition },
      { time: "+4h", temp: temp - 1, condition: "Pleasant" },
      { time: "Evening", temp: temp - 4, condition: "Clear Night" },
    ],
  };
}
