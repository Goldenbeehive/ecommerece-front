export const shortenSize = (size) => {
    const sizeMap = {
      'Extra Small': 'XS',
      'Small': 'S',
      'Medium': 'M',
      'Large': 'L',
      'Extra Large': 'XL',
      'XXL': 'XXL'
    };
    return sizeMap[size] || size;
  };