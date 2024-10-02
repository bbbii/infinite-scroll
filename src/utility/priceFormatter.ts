export const priceFormater = (price: number): string => {
  return price.toLocaleString("ko-KR") + " 원";
};
