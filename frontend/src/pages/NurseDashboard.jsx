import React from 'react';
import { Card, Row, Col, Statistic, Table, Button, Tag } from 'antd';
import { UserOutlined, ClockCircleOutlined, MedicineBoxOutlined, AlertOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';

const NurseDashboard = () => {
    const { user } = useAuth();

    // Sample data for patient vitals
    const patientVitals = [
        { id: 1, name: 'John Doe', temp: '98.6°F', bp: '120/80', pulse: '72', status: 'Stable' },
        { id: 2, name: 'Jane Smith', temp: '99.1°F', bp: '118/78', pulse: '68', status: 'Stable' },
        { id: 3, name: 'Robert Johnson', temp: '100.2°F', bp: '130/85', pulse: '82', status: 'Monitor' },
    ];

    const columns = [
        {
            title: 'Patient',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Temperature',
            dataIndex: 'temp',
            key: 'temp',
        },
        {
            title: 'Blood Pressure',
            dataIndex: 'bp',
            key: 'bp',
        },
        {
            title: 'Pulse',
            dataIndex: 'pulse',
            key: 'pulse',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'green';
                if (status === 'Monitor') color = 'orange';
                if (status === 'Critical') color = 'red';
                return <Tag color={color}>{status}</Tag>;
            },
        },
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Nurse Dashboard</h1>
            
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Welcome, Nurse {user?.lastName}</h2>
                <p>Monitor patient vitals and manage nursing tasks efficiently.</p>
            </div>

            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic 
                            title="Patients to Monitor" 
                            value={12} 
                            prefix={<UserOutlined />} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic 
                            title="Pending Tasks" 
                            value={5} 
                            prefix={<ClockCircleOutlined />} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic 
                            title="Medication Due" 
                            value={3} 
                            prefix={<MedicineBoxOutlined />} 
                        />
                    </Card>
                </Col>
            </Row>

            <Card 
                title="Patient Vitals" 
                className="mb-6"
                extra={
                    <Button type="primary" size="small">
                        Record Vitals
                    </Button>
                }
            >
                <Table 
                    columns={columns} 
                    dataSource={patientVitals} 
                    rowKey="id"
                    pagination={false}
                />
            </Card>

            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Card 
                        title="Quick Actions"
                        className="h-full"
                    >
                        <div className="flex flex-col space-y-3">
                            <Button type="primary" block>Record Patient Vitals</Button>
                            <Button block>View Patient List</Button>
                            <Button block>Medication Schedule</Button>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card 
                        title="Alerts"
                        className="h-full"
                    >
                        <div className="flex items-center text-yellow-500 mb-2">
                            <AlertOutlined className="mr-2" />
                            <span>Robert Johnson's temperature is elevated</span>
                        </div>
                        <div className="flex items-center text-red-500">
                            <AlertOutlined className="mr-2" />
                            <span>Medication low: Paracetamol</span>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default NurseDashboard;
