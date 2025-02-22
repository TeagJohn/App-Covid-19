import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Row, Col, Input, Form, Avatar } from 'antd';
import { FixedSizeList as List } from 'react-window';

interface CountryData {
  country: string;
  countryInfo: { flag: string };
  cases: number;
  deaths: number;
  recovered: number;
}

const { Search } = Input;

const CovidStats: React.FC = () => {
  const [data, setData] = useState<CountryData[]>([]);
  const [totalCases, setTotalcases] = useState<string>('');
  const [totalDeaths, setTotalDeaths] = useState<string>('');
  const [totalRecovered, setTotalRecovered] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>(''); // lưu từ khóa tìm kiếm

  // Sử dụng useMemo để tối ưu việc lọc dữ liệu
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((item) =>
      item.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const quickSelect = (arr: CountryData[], amount: number): CountryData[] => {
    if (arr.length <= amount) return arr;

    const pivot = arr[Math.floor(Math.random() * arr.length)].cases;
    const left = arr.filter((item) => item.cases > pivot);
    const right = arr.filter((item) => item.cases < pivot);
    const equal = arr.filter((item) => item.cases === pivot);

    return left.length === amount
      ? left
      : left.length > amount
      ? quickSelect(left, amount)
      : left.length + equal.length >= amount
      ? [...left, ...equal.slice(0, amount - left.length)]
      : [...left, ...equal, ...quickSelect(right, amount - left.length - equal.length)];
  };

  const getData = useCallback(async () => {
    try {
      const response = await axios.get('https://disease.sh/v3/covid-19/countries');
      const top100 = quickSelect(response.data, 100).sort((a, b) => b.cases - a.cases);
      const vietNam = response.data.find((item: any) => item.country === 'Vietnam');

      if (vietNam) {
        const isVietNamInTop100 = top100.some((person) => person.country === 'Vietnam');
        if (!isVietNamInTop100) {
          top100.unshift(vietNam);
        } else {
          const index = top100.findIndex((person) => person.country === 'Vietnam');
          const [vietnamInTop] = top100.splice(index, 1);
          top100.unshift(vietnamInTop);
        }
      }
      
      setTotalcases(top100.reduce((total, item) => total + item.cases, 0).toLocaleString());
      setTotalDeaths(top100.reduce((total, item) => total + item.deaths, 0).toLocaleString());
      setTotalRecovered(top100.reduce((total, item) => total + item.recovered, 0).toLocaleString());
      setData(top100);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => getData(), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchByCountry = (values: { country: string }) => {
    setSearchTerm(values.country);
  };

  // Hàm render một hàng trong danh sách
  const RowRenderer = ({ index, item }: { index: number; item: CountryData }) => {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px',
          borderBottom: '1px solid #eee',
          background: index % 2 === 0 ? '#f9f9f9' : '#ffffff',
        }}
      >
        <div style={{ width: 40, marginRight: 10 }}>{index + 1}</div>
        <Avatar shape="square" size={40} src={item.countryInfo.flag} style={{ marginRight: 10 }} />
        <div style={{ flex: 1 }}>
          <strong>{item.country}</strong>
        </div>
        <div style={{ width: 100, textAlign: 'right' }}>
          {item.cases.toLocaleString()}
        </div>
      </div>
    );
  };

  return (
    <div style={{ margin: 'auto', width: "400px"}}>
      <Col
        span={24}
        style={{
          background: '#f0f2f5',
          padding: '20px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h1 style={{ color: 'red' }}>{totalCases}</h1>
        <Col span={24} style={{ display: 'flex', marginBottom: "16px" }}>
          <Col span={12}>
            <h2 style={{ marginTop: 0, marginBottom: "8px" }}>{totalDeaths}</h2>
            <b style={{ color: "#ccc" }}>DEATHS</b>
          </Col>
          <Col span={12}>
            <h2 style={{ marginTop: 0, marginBottom: "8px" }}>{totalRecovered}</h2>
            <b style={{ color: "#ccc" }}>RECOVERIES</b>
          </Col>
        </Col>
        <Col>
          <Form onFinish={handleSearchByCountry}>
            <Form.Item name={'country'}>
              <Search placeholder="Search..." style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        </Col>
        <Col style={{ maxHeight: "505px", overflow: "overlay" }}>
          <Col>
            {
              filteredData.map((item, i) => (
                <RowRenderer index={i} item={item} />
              ))
            }
            {
              !filteredData.length && (
                <p>Không có dữ liệu...</p>
              )
            }
          </Col>
        </Col>
      </Col>
    </div>
  );
};

export default React.memo(CovidStats);
