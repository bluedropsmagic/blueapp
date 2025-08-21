export const formatDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric' 
  };
  
  return date.toLocaleDateString('en-US', options);
};

export const formatTime = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { 
    hour: 'numeric', 
    minute: 'numeric',
    hour12: true 
  };
  
  return date.toLocaleTimeString('en-US', options);
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const getDaysBetween = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.round(diffTime / oneDay);
};