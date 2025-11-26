export const getMarkerColor = (tipo: string) => {
  switch (tipo) {
    case 'Homicidio':
      return 'bg-red-500';
    case 'Robo':
      return 'bg-yellow-500';
    case 'Asalto':
      return 'bg-orange-500';
    default:
      return 'bg-gray-500';
  }
};
