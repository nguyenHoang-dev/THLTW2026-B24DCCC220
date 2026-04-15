import React, { useState, useMemo } from 'react';
import { Table, Button, Input, Select, Space, Tag, Modal, Form, message, Popconfirm, Row, Col, Typography } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { Option } = Select;

type OrderStatus = 'Chờ xác nhận' | 'Đang giao' | 'Hoàn thành' | 'Hủy';

interface Customer {
	id: string;
	name: string;
}

interface Product {
	id: string;
	name: string;
	price: number;
}

interface Order {
	id: string;
	orderCode: string;
	customerId: string;
	orderDate: string;
	productIds: string[];
	totalAmount: number;
	status: OrderStatus;
}

const MOCK_CUSTOMERS: Customer[] = [
	{ id: 'C1', name: 'Nguyễn Văn A' },
	{ id: 'C2', name: 'Trần Thị B' },
	{ id: 'C3', name: 'Lê Văn C' },
];

const MOCK_PRODUCTS: Product[] = [
	{ id: 'P1', name: 'Laptop Dell XPS', price: 25000000 },
	{ id: 'P2', name: 'Chuột Logitech', price: 500000 },
	{ id: 'P3', name: 'Bàn phím cơ', price: 1200000 },
];

const INITIAL_ORDERS: Order[] = [
	{
		id: '1',
		orderCode: 'DH001',
		customerId: 'C1',
		orderDate: '2023-10-01',
		productIds: ['P1', 'P2'],
		totalAmount: 25500000,
		status: 'Đang giao',
	},
	{
		id: '2',
		orderCode: 'DH002',
		customerId: 'C2',
		orderDate: '2023-10-02',
		productIds: ['P3'],
		totalAmount: 1200000,
		status: 'Chờ xác nhận',
	},
];

const OrderManagement: React.FC = () => {
	const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
	const [searchText, setSearchText] = useState('');
	const [filterStatus, setFilterStatus] = useState<OrderStatus | undefined>(undefined);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingOrder, setEditingOrder] = useState<Order | null>(null);
	const [form] = Form.useForm();

	const filteredOrders = useMemo(() => {
		return orders.filter((order) => {
			const customer = MOCK_CUSTOMERS.find((c) => c.id === order.customerId);
			const matchSearch =
				order.orderCode.toLowerCase().includes(searchText.toLowerCase()) ||
				(customer?.name.toLowerCase() || '').includes(searchText.toLowerCase());
			const matchStatus = filterStatus ? order.status === filterStatus : true;
			return matchSearch && matchStatus;
		});
	}, [orders, searchText, filterStatus]);

	const handleCancelOrder = (id: string) => {
		setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status: 'Hủy' } : order)));
		message.success('Đã hủy đơn hàng thành công!');
	};

	const openModal = (order?: Order) => {
		if (order) {
			setEditingOrder(order);
			form.setFieldsValue({
				...order,
				orderDate: dayjs(order.orderDate),
			});
		} else {
			setEditingOrder(null);
			form.resetFields();
			form.setFieldsValue({
				orderDate: dayjs(),
				status: 'Chờ xác nhận',
				totalAmount: 0,
			});
		}
		setIsModalOpen(true);
	};

	const handleSave = async () => {
		try {
			const values = await form.validateFields();
			const orderDateVal = values.orderDate || form.getFieldValue('orderDate') || dayjs();
			const formattedValues = {
				...values,
				orderDate: orderDateVal.format('YYYY-MM-DD'),
			};

			if (editingOrder) {
				setOrders((prev) => prev.map((o) => (o.id === editingOrder.id ? { ...o, ...formattedValues } : o)));
				message.success('Cập nhật đơn hàng thành công!');
			} else {
				const newOrder = {
					...formattedValues,
					id: Math.random().toString(36).substring(2, 9),
				};
				setOrders((prev) => [...prev, newOrder]);
				message.success('Thêm đơn hàng thành công!');
			}
			setIsModalOpen(false);
		} catch (error) {
			console.log('Validation Failed:', error);
		}
	};

	const handleValuesChange = (changedValues: any, allValues: any) => {
		if (changedValues.productIds) {
			const total = (allValues.productIds || []).reduce((sum: number, pId: string) => {
				const product = MOCK_PRODUCTS.find((p) => p.id === pId);
				return sum + (product?.price || 0);
			}, 0);
			form.setFieldsValue({ totalAmount: total });
		}
	};

	const checkDuplicateCode = (_: any, value: string) => {
		if (!value) return Promise.resolve();
		const isDuplicate = orders.some((o) => o.orderCode === value && o.id !== editingOrder?.id);
		if (isDuplicate) {
			return Promise.reject(new Error('Mã đơn hàng đã tồn tại!'));
		}
		return Promise.resolve();
	};

	const columns: ColumnsType<Order> = [
		{
			title: 'Mã ĐH',
			dataIndex: 'orderCode',
			key: 'orderCode',
			render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
		},
		{
			title: 'Khách hàng',
			dataIndex: 'customerId',
			key: 'customerId',
			render: (id) => MOCK_CUSTOMERS.find((c) => c.id === id)?.name || 'Unknown',
		},
		{
			title: 'Ngày đặt',
			dataIndex: 'orderDate',
			key: 'orderDate',
			sorter: (a, b) => dayjs(a.orderDate).unix() - dayjs(b.orderDate).unix(),
		},
		{
			title: 'Tổng tiền',
			dataIndex: 'totalAmount',
			key: 'totalAmount',
			sorter: (a, b) => a.totalAmount - b.totalAmount,
			render: (val) => `${val.toLocaleString()} VNĐ`,
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			key: 'status',
			render: (status: OrderStatus) => {
				let color = 'default';
				if (status === 'Chờ xác nhận') color = 'warning';
				if (status === 'Đang giao') color = 'processing';
				if (status === 'Hoàn thành') color = 'success';
				if (status === 'Hủy') color = 'error';
				return <Tag color={color}>{status}</Tag>;
			},
		},
		{
			title: 'Hành động',
			key: 'action',
			render: (_, record) => (
				<Space size='middle'>
					<Button type='text' icon={<EditOutlined />} onClick={() => openModal(record)} style={{ color: '#1677ff' }} />

					<Popconfirm
						title='Bạn có chắc chắn muốn hủy đơn hàng này không?'
						onConfirm={() => handleCancelOrder(record.id)}
						okText='Đồng ý'
						cancelText='Không'
						disabled={record.status !== 'Chờ xác nhận'}
					>
						<Button type='text' danger icon={<DeleteOutlined />} disabled={record.status !== 'Chờ xác nhận'} />
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
			<Title level={3}>Quản Lý Đơn Hàng</Title>

			<Row justify='space-between' style={{ marginBottom: 16 }}>
				<Col>
					<Space>
						<Input
							placeholder='Tìm mã đơn hoặc khách hàng'
							prefix={<SearchOutlined />}
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							style={{ width: 250 }}
						/>
						<Select
							placeholder='Lọc theo trạng thái'
							allowClear
							style={{ width: 180 }}
							value={filterStatus}
							onChange={(val) => setFilterStatus(val)}
						>
							<Option value='Chờ xác nhận'>Chờ xác nhận</Option>
							<Option value='Đang giao'>Đang giao</Option>
							<Option value='Hoàn thành'>Hoàn thành</Option>
							<Option value='Hủy'>Hủy</Option>
						</Select>
					</Space>
				</Col>
				<Col>
					<Button type='primary' icon={<PlusOutlined />} onClick={() => openModal()}>
						Thêm Đơn Hàng
					</Button>
				</Col>
			</Row>

			<Table columns={columns} dataSource={filteredOrders} rowKey='id' bordered pagination={{ pageSize: 5 }} />

			<Modal
				title={editingOrder ? 'Chỉnh Sửa Đơn Hàng' : 'Thêm Đơn Hàng Mới'}
				visible={isModalOpen}
				onOk={handleSave}
				onCancel={() => setIsModalOpen(false)}
				okText='Lưu'
				cancelText='Hủy'
				width={600}
			>
				<Form form={form} layout='vertical' onValuesChange={handleValuesChange}>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item
								name='orderCode'
								label='Mã đơn hàng'
								rules={[{ required: true, message: 'Vui lòng nhập mã đơn hàng!' }, { validator: checkDuplicateCode }]}
							>
								<Input placeholder='VD: DH003' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								name='customerId'
								label='Khách hàng'
								rules={[{ required: true, message: 'Vui lòng chọn khách hàng!' }]}
							>
								<Select placeholder='Chọn khách hàng'>
									{MOCK_CUSTOMERS.map((c) => (
										<Option key={c.id} value={c.id}>
											{c.name}
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
					</Row>

					<Form.Item
						name='productIds'
						label='Sản phẩm'
						rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 sản phẩm!' }]}
					>
						<Select mode='multiple' placeholder='Chọn sản phẩm' allowClear>
							{MOCK_PRODUCTS.map((p) => (
								<Option key={p.id} value={p.id}>
									{p.name} - {p.price.toLocaleString()} VNĐ
								</Option>
							))}
						</Select>
					</Form.Item>

					<Row gutter={16}>
						<Col span={12}>
							<Form.Item
								name='status'
								label='Trạng thái'
								rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
							>
								<Select>
									<Option value='Chờ xác nhận'>Chờ xác nhận</Option>
									<Option value='Đang giao'>Đang giao</Option>
									<Option value='Hoàn thành'>Hoàn thành</Option>
									<Option value='Hủy'>Hủy</Option>
								</Select>
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='totalAmount' label='Tổng tiền (Tự động tính)'>
								<Input readOnly addonAfter='VNĐ' style={{ fontWeight: 'bold' }} />
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
		</div>
	);
};

export default OrderManagement;
