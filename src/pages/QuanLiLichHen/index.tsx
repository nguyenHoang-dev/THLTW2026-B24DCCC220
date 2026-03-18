import React, { useState, useEffect } from 'react';
import {
	Layout,
	Tabs,
	Table,
	Button,
	Form,
	Input,
	Select,
	DatePicker,
	Tag,
	Space,
	Card,
	Statistic,
	message,
	Row,
	Col,
} from 'antd';
import { UserOutlined, FormOutlined, UnorderedListOutlined, BarChartOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;

const { TabPane } = Tabs;

const SERVICES = [
	{ label: 'Cắt tóc (100k)', value: 'Cắt tóc', price: 100000 },
	{ label: 'Spa (500k)', value: 'Spa', price: 500000 },
	{ label: 'Sửa chữa (200k)', value: 'Sửa chữa', price: 200000 },
];

const App: React.FC = () => {
	const [staffs, setStaffs] = useState<any[]>(() => JSON.parse(localStorage.getItem('staffs_tabs') || '[]'));
	const [appointments, setAppointments] = useState<any[]>(() => JSON.parse(localStorage.getItem('apps_tabs') || '[]'));

	useEffect(() => {
		localStorage.setItem('staffs_tabs', JSON.stringify(staffs));
		localStorage.setItem('apps_tabs', JSON.stringify(appointments));
	}, [staffs, appointments]);

	const handleAddStaff = (values: any) => {
		setStaffs([...staffs, { id: Date.now().toString(), ...values }]);
		message.success('Đã thêm nhân viên!');
	};

	const handleBooking = (values: any) => {
		const timeStr = values.time.format('YYYY-MM-DD HH:mm');
		const isBusy = appointments.some((a) => a.staffId === values.staffId && a.time === timeStr && a.status !== 'Hủy');

		if (isBusy) return message.error('Nhân viên đã có lịch vào giờ này!');

		const serviceInfo = SERVICES.find((s) => s.value === values.service);
		const newApp = {
			id: Date.now().toString(),
			...values,
			time: timeStr,
			price: serviceInfo?.price || 0,
			status: 'Chờ duyệt',
		};
		setAppointments([newApp, ...appointments]);
		message.success('Đã đăng ký lịch hẹn!');
	};

	const updateStatus = (id: string, status: string) => {
		setAppointments(appointments.map((a) => (a.id === id ? { ...a, status } : a)));
	};

	const items = [
		{
			key: '1',
			label: (
				<span>
					<UserOutlined /> Nhân viên
				</span>
			),
			children: (
				<Card title='Quản lý đội ngũ'>
					<Form onFinish={handleAddStaff} layout='inline' style={{ marginBottom: 20 }}>
						<Form.Item name='name' rules={[{ required: true }]}>
							<Input placeholder='Tên NV' />
						</Form.Item>
						<Form.Item name='schedule' rules={[{ required: true }]}>
							<Input placeholder='Lịch trực' />
						</Form.Item>
						<Button type='primary' htmlType='submit'>
							Thêm
						</Button>
					</Form>
					<Table
						dataSource={staffs}
						columns={[
							{ title: 'Tên', dataIndex: 'name' },
							{ title: 'Lịch làm việc', dataIndex: 'schedule' },
							{
								title: 'Hành động',
								render: (_, r) => (
									<Button danger size='small' onClick={() => setStaffs(staffs.filter((s) => s.id !== r.id))}>
										Xóa
									</Button>
								),
							},
						]}
						rowKey='id'
					/>
				</Card>
			),
		},
		{
			key: '2',
			label: (
				<span>
					<FormOutlined /> Đặt lịch
				</span>
			),
			children: (
				<Card title='Tạo lịch hẹn mới' style={{ maxWidth: 600, margin: '0 auto' }}>
					<Form onFinish={handleBooking} layout='vertical'>
						<Form.Item name='service' label='Dịch vụ' rules={[{ required: true }]}>
							<Select options={SERVICES} />
						</Form.Item>
						<Form.Item name='staffId' label='Nhân viên' rules={[{ required: true }]}>
							<Select options={staffs.map((s) => ({ label: s.name, value: s.id }))} />
						</Form.Item>
						<Form.Item name='time' label='Thời gian' rules={[{ required: true }]}>
							<DatePicker showTime style={{ width: '100%' }} />
						</Form.Item>
						<Button type='primary' danger block htmlType='submit'>
							Xác nhận
						</Button>
					</Form>
				</Card>
			),
		},
		{
			key: '3',
			label: (
				<span>
					<UnorderedListOutlined /> Danh sách
				</span>
			),
			children: (
				<Table
					dataSource={appointments}
					rowKey='id'
					columns={[
						{ title: 'Dịch vụ', dataIndex: 'service' },
						{ title: 'NV', render: (_, r) => staffs.find((s) => s.id === r.staffId)?.name || 'N/A' },
						{ title: 'Giờ', dataIndex: 'time' },
						{
							title: 'Trạng thái',
							render: (st) => <Tag color={st === 'Hoàn thành' ? 'green' : 'blue'}>{st}</Tag>,
							dataIndex: 'status',
						},
						{
							title: 'Xử lý',
							render: (_, r) => (
								<Space>
									{r.status === 'Chờ duyệt' && (
										<Button size='small' onClick={() => updateStatus(r.id, 'Xác nhận')}>
											Duyệt
										</Button>
									)}
									{r.status === 'Xác nhận' && (
										<Button size='small' type='primary' onClick={() => updateStatus(r.id, 'Hoàn thành')}>
											Xong
										</Button>
									)}
								</Space>
							),
						},
					]}
				/>
			),
		},
		{
			key: '4',
			label: (
				<span>
					<BarChartOutlined /> Thống kê
				</span>
			),
			children: (
				<Row gutter={16}>
					<Col span={12}>
						<Card>
							<Statistic
								title='Doanh thu'
								value={appointments.filter((a) => a.status === 'Hoàn thành').reduce((s, a) => s + a.price, 0)}
								suffix='VNĐ'
							/>
						</Card>
					</Col>
					<Col span={12}>
						<Card>
							<Statistic title='Tổng lịch hẹn' value={appointments.length} />
						</Card>
					</Col>
				</Row>
			),
		},
	];

	return (
		<Layout style={{ minHeight: '100vh' }}>
			<Header style={{ color: '#fff', fontSize: '20px' }}> Quản Lý Dịch Vụ </Header>
			<Content style={{ padding: '20px' }}>
				<Tabs defaultActiveKey='1' type='card'>
					{items.map((item) => (
						<TabPane tab={item.label} key={item.key}>
							{item.children}
						</TabPane>
					))}
				</Tabs>
			</Content>
		</Layout>
	);
};

export default App;
