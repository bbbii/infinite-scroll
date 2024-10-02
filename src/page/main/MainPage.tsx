import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MockDataType } from "types/MockDataType";
import { getMockData } from "./api/MainPageApi";
import { priceFormater } from "utility/priceFormatter";
import "./css/MainPage.css";

/**
 * @todo 하나의 SinglePage에 Intersection Observer를 이용해 무한스크롤을 구현하세요.
 * @see https://gist.github.com/goldfrosch/034b966075059447efa1c00476849d68
 */
const MainPage: React.FC = () => {
  const [products, setProducts] = useState<MockDataType[]>([]);
  const [pageNum, setPageNum] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEnd, setIsEnd] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // products가 변경되면 재계산
  // products를 순회하며 각 원소의 price를 0부터 합산한 값을 리턴
  const totalPrice = useMemo(() => products.reduce((acc, product) => acc + product.price, 0), [products]);

  const fetchData = useCallback(() => {
    if (isLoading || isEnd) return;
    setIsLoading(true);

    getMockData(pageNum)
      .then((res: any) => {
        const { datas, isEnd } = res;
        setProducts((prevProducts) => [...prevProducts, ...datas]);
        setIsEnd(isEnd);
        setPageNum((prevPageNum) => prevPageNum + 1);
      })
      .catch((error) => {
        console.error("product 데이터 요청 중 오류 발생", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isLoading, isEnd, pageNum]);

  // 페이지를 현재 보여주는 페이지의 최하단으로 이동 시 다음 페이지 정보를 가져오게 합니다.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // 더이상 가져올 수 없는 상황이라면 더 이상 데이터를 가져오는 함수를 호출하지 않습니다.
        if (entry.isIntersecting && !isLoading && !isEnd) {
          fetchData();
        }
      },
      // 감시중인 요소가 전부 보이는 경우 호출
      { threshold: 1 }
    );

    const currentRef = scrollRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isLoading, isEnd, fetchData]);

  return (
    <div className="main-page-container">
      <h1>무한 스크롤 예제 페이지</h1>

      {/* 현재 가져온 상품 리스트들의 액수들의 합계를 화면에 보여주세요 */}
      <div className="sticky-header">
        <h2>가격: {priceFormater(totalPrice)}</h2>
      </div>
      {products.map((product) => (
        <div className="product-card" key={product.productId}>
          <div>상품명: {product.productName}</div>
          <div className="product-info">
            <span>가격: {product.price}</span>
            <span>구매 일자: {product.boughtDate}</span>
          </div>
        </div>
      ))}

      {/* 로딩 시 로딩 UI가 보여아 합니다. (UI의 형식은 자유) */}
      {isLoading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>데이터를 불러오는 중...</span>
        </div>
      )}
      <div ref={scrollRef} style={{ height: "50px" }} />
    </div>
  );
};

export default MainPage;
