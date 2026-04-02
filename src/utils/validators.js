export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  export const validatePassword = (password) => {
    return password.length >= 8 && password.length <= 72;
  };
  
  export const validateCoordinates = (lat, lon) => {
    return (
      lat >= -90 &&
      lat <= 90 &&
      lon >= -180 &&
      lon <= 180
    );
  };
  
  export const validateLocationName = (name) => {
    return name && name.length > 0 && name.length <= 100;
  };
  
  export const validateAlertThreshold = (type, value) => {
    if (type === 'temperature_high' || type === 'temperature_low') {
      return value >= -50 && value <= 60;
    }
    if (type === 'rain') {
      return value >= 0 && value <= 100;
    }
    if (type === 'high_wind') {
      return value >= 0 && value <= 200;
    }
    if (type === 'aqi_high') {
      return value >= 0 && value <= 500;
    }
    return false;
  };