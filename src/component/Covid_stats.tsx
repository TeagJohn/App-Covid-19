import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Row, Col, Input, Form, Table, Avatar, message } from 'antd';

interface CountryData {
  country: string;
  cases: number;
  deaths: number;
  recovered: number;
}

const CovidStats: React.FC = () => {
  const [data, setData] = useState<CountryData[]>([]);
  const [totalCases, setTotalcases] = useState<any>();
  const [totalDeaths, setTotalDeaths] = useState<any>();
  const [totalRecovered, setTotalRecovered] = useState<any>();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;


  const getData = useCallback(async () => {
    try {
      const response = await axios.get('https://disease.sh/v3/covid-19/countries');
      
      const sortedData = response.data
        .sort((a: CountryData, b: CountryData) => b.cases - a.cases)
        .slice(0, 100);

      setTotalcases(sortedData.reduce((total: any, item: { cases: any; }) => total + item.cases, 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
      setTotalDeaths(sortedData.reduce((total: any, item: { deaths: any; }) => total + item.deaths, 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
      setTotalRecovered(sortedData.reduce((total: any, item: { recovered: any; }) => total + item.recovered, 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
      setData(sortedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    getData();
    const interval = setInterval(getData, 30000);
    return () => clearInterval(interval);
  }, [getData]);

  const handleSearchByCountry = (values: { country: string }) => {
    if (!values.country.trim()) {
        alert('Please enter the data before pressing Enter.')
    } else {
        const country = data.filter((item) =>
            item.country.toLowerCase().includes(values.country.toLowerCase())
          );
        setData(country);
    }
  };

  const columns = [
    {
      dataIndex: 'key',
      render: (_: number, __: any, index: number) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      dataIndex: ['countryInfo', 'flag'],
      render: (flag: string) => <Avatar shape="square" size={40} src={flag} />,
    },
    {
      dataIndex: 'country',
      render: (name: string) => (
        <div>
          <div>{name}</div>
        </div>
      ),
    },
    {
      dataIndex: 'cases',
      render: (data: number) => data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','), // Hiển thị số có dấu phẩy
    },
  ];

  return (
    <Col span={24}>
        <Col 
        span={12} 
        style={{ 
            background: '#f0f2f5',
            padding: '20px', 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <h1 style={{color: 'red'}}>
                {totalCases}
            </h1>
            <Col span={24} style={{display: 'flex'}}>
                <Col span={12} style={{display: 'flex', flexDirection: 'column'}}>
                    <h2>{totalDeaths}</h2>
                    <b style={{opacity: 0.5}}>DEATHS</b>
                </Col>
                <Col span={12} style={{display: 'flex', flexDirection: 'column'}}>
                <h2>{totalRecovered}</h2>
                    <b style={{opacity: 0.5}}>RECOVERIES</b>
                </Col>
            </Col>
            <Col>
                <Form onFinish={handleSearchByCountry}>
                    <Form.Item name={"country" }>
                        <Input placeholder="Search..." style={{width: '500px'}}/>
                    </Form.Item>
                </Form>
            </Col>
            <Col>
                <Table
                    columns={columns}
                    dataSource={data}
                    pagination={{ pageSize: 10 }} // Tắt phân trang
                    showHeader={false} // Ẩn tiêu đề bảng
                    bordered
                />
            </Col>
        </Col>
    </Col>
  );
};

export default React.memo(CovidStats);