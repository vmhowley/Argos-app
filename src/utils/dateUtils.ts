export const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('es-DO', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
