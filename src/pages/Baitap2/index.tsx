import { useState } from 'react';
import {
	Table,
	Button,
	Popconfirm,
	Modal,
	Form,
	Input,
	InputNumber,
	message,
	Space,
	Tabs,
	Row,
	Col,
	Select,
	AutoComplete,
} from 'antd';
import { DeleteOutlined, EditOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import { Tag } from 'antd';

const Baitap2 = () => {
	const { danhSach2, setTuKhoaTimKiem, xoaSanPham, themSanPham } = useModel('sanpham2');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [form] = Form.useForm();

	const existingCategories = [...new Set(danhSach2.map((item) => item.category))];
	const options = existingCategories.map((cat) => ({ value: cat }));

	const handleAddProduct = async (values: any) => {
		try {
			await themSanPham(values);
			message.success('Thêm sản phẩm thành công!');
			setIsModalOpen(false);
			form.resetFields();
		} catch (error) {
			message.error('Có lỗi xảy ra, vui lòng thử lại!');
			console.error('Lỗi thêm sản phẩm:', error);
		}
	};

	const [orderModalOpen, setOrderModalOpen] = useState(false);
	const [gioHang, setGioHang] = useState<any[]>([]);
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [formOrder] = Form.useForm();
	const [danhSachDonHang, setDanhSachDonHang] = useState<any[]>([]);

	const handleAddToCart = () => {
		const sp = danhSach2.find((s) => s.id === selectedId);
		if (sp && !gioHang.find((i) => i.id === sp.id)) {
			setGioHang([...gioHang, { ...sp, soLuongDat: 1 }]);
		}
	};

	const handleSubmitOrder = (values: any) => {
		const checkKho = gioHang.every((item) => {
			const spKho = danhSach2.find((s) => s.id === item.id);
			return spKho && spKho.quantity >= item.soLuongDat;
		});

		if (!checkKho) {
			message.error('Không đủ hàng trong kho!');
			return;
		}
		if (gioHang.length === 0) {
			message.error('Chưa chọn sản phẩm!');
			return;
		}

		const newOrder = {
			...values,
			id: Date.now(),
			items: gioHang,
			tongTien: gioHang.reduce((a, b) => a + b.price * b.soLuongDat, 0),
		};

		setDanhSachDonHang([...danhSachDonHang, newOrder]);

		console.log('Order created:', newOrder);
		setOrderModalOpen(false);
		setGioHang([]);
		formOrder.resetFields();
		message.success('Tạo đơn thành công');
	};

	const handleEdit = (record: any) => {
		setIsModalOpen(true);
		form.setFieldsValue(record);
	};

	const columnsDonHang = [
		{
			title: 'STT',
			key: 'stt',
			width: 60,
			render: (_: any, record: any, index: number) => index + 1,
		},
		{ title: 'Tên Khách', dataIndex: 'tenKhach', key: 'tenKhach' },
		{ title: 'SĐT', dataIndex: 'sdt', key: 'sdt' },
		{ title: 'Địa chỉ', dataIndex: 'diaChi', key: 'diaChi' },
		{
			title: 'Tổng Tiền',
			dataIndex: 'tongTien',
			key: 'tongTien',
			render: (tongTien: number) => tongTien?.toLocaleString() + ' đ',
		},
	];

	const cot = [
		{ title: 'STT', dataIndex: 'id', key: 'id' },
		{ title: 'Tên Sản Phẩm', dataIndex: 'name', key: 'name' },
		{ title: 'Giá', dataIndex: 'price', key: 'price' },
		{ title: 'Số Lượng', dataIndex: 'quantity', key: 'quantity' },
		{ title: 'Danh mục', dataIndex: 'category', key: 'category' },
		{
			title: 'Trạng thái',
			dataIndex: 'quantity',
			key: 'status',
			render: (quantity: number) => {
				let color = '';
				let text = '';
				if (quantity > 10) {
					color = 'green';
					text = 'Còn hàng';
				} else if (quantity > 0) {
					color = 'orange';
					text = 'Sắp hết hàng';
				} else {
					color = 'red';
					text = 'Hết hàng';
				}
				return (
					<Tag color={color} key={text}>
						{text.toUpperCase()}
					</Tag>
				);
			},
		},
		{
			title: 'Thao Tác',
			key: 'action',
			render: (_: any, record: any) => (
				<Space size='middle'>
					<Button type='primary' icon={<EditOutlined />} onClick={() => handleEdit(record)}>
						Sửa
					</Button>

					<Popconfirm
						title='Bạn có chắc chắn muốn xóa?'
						onConfirm={() => xoaSanPham(record.id)}
						okText='Xóa'
						cancelText='Hủy'
					>
						<Button danger icon={<DeleteOutlined />}>
							Xóa
						</Button>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: 20 }}>
			<Tabs defaultActiveKey='1'>
				<Tabs.TabPane tab='Quản lý Sản phẩm' key='1'>
					<div style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
						<Input.Search
							placeholder='Tìm tên sản phẩm...'
							onChange={(e) => setTuKhoaTimKiem(e.target.value)}
							style={{ width: 300 }}
						/>
						<Button type='primary' onClick={() => setIsModalOpen(true)}>
							Thêm sản phẩm
						</Button>
					</div>

					<Table dataSource={danhSach2} columns={cot} rowKey='id' />
				</Tabs.TabPane>

				<Tabs.TabPane tab='Quản lý Đơn hàng' key='2'>
					<Button
						type='primary'
						icon={<ShoppingCartOutlined />}
						onClick={() => setOrderModalOpen(true)}
						style={{ marginBottom: 16 }}
					>
						Tạo đơn hàng mới
					</Button>
					<Table dataSource={danhSachDonHang} columns={columnsDonHang} rowKey='id' />
				</Tabs.TabPane>
			</Tabs>

			<Modal title='Thêm mới SP' visible={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
				<Form form={form} onFinish={handleAddProduct} layout='vertical'>
					<Form.Item label='Tên' name='name' rules={[{ required: true }]}>
						<Input />
					</Form.Item>
					<Form.Item label='Giá' name='price' rules={[{ required: true }]}>
						<InputNumber style={{ width: '100%' }} min={0} />
					</Form.Item>
					<Form.Item label='Số lượng' name='quantity' rules={[{ required: true }]}>
						<InputNumber style={{ width: '100%' }} min={0} />
					</Form.Item>
					<Form.Item name='category' label='Danh mục'>
						<AutoComplete
							options={options}
							placeholder='Nhập hoặc chọn danh mục'
							filterOption={(inputValue, option) =>
								option && option.value ? option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1 : false
							}
						/>
					</Form.Item>
					<Button type='primary' htmlType='submit' block>
						Lưu
					</Button>
				</Form>
			</Modal>

			<Modal
				title='Tạo Đơn Hàng'
				visible={orderModalOpen}
				onCancel={() => setOrderModalOpen(false)}
				footer={null}
				width={800}
			>
				<Row gutter={16}>
					<Col span={12}>
						<div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
							<Select style={{ flex: 1 }} placeholder='Chọn sản phẩm' onChange={setSelectedId}>
								{danhSach2.map((sp) => (
									<Select.Option key={sp.id} value={sp.id} disabled={sp.quantity <= 0}>
										{sp.name} (Tồn: {sp.quantity})
									</Select.Option>
								))}
							</Select>
							<Button type='primary' onClick={handleAddToCart}>
								Chọn
							</Button>
						</div>

						{gioHang.map((item) => (
							<div key={item.id} style={{ marginBottom: 8, borderBottom: '1px dashed #ccc', padding: 4 }}>
								<b>{item.name}</b> -
								<InputNumber
									min={1}
									max={danhSach2.find((s) => s.id === item.id)?.quantity}
									value={item.soLuongDat}
									onChange={(val) => {
										setGioHang(gioHang.map((i) => (i.id === item.id ? { ...i, soLuongDat: val } : i)));
									}}
									style={{ width: 60, marginLeft: 10 }}
								/>
							</div>
						))}
						<div style={{ textAlign: 'right', fontWeight: 'bold' }}>
							Tổng: {gioHang.reduce((a, b) => a + b.price * b.soLuongDat, 0).toLocaleString()}
						</div>
					</Col>
					<Col span={12}>
						<Form form={formOrder} onFinish={handleSubmitOrder} layout='vertical'>
							<Form.Item name='tenKhach' label='Tên khách' rules={[{ required: true }]}>
								<Input />
							</Form.Item>
							<Form.Item
								name='sdt'
								label='SĐT'
								rules={[{ required: true }, { pattern: /^\d{10,11}$/, message: 'SĐT sai' }]}
							>
								<Input />
							</Form.Item>
							<Form.Item name='diaChi' label='Địa chỉ' rules={[{ required: true }]}>
								<Input />
							</Form.Item>
							<Button type='primary' htmlType='submit' block>
								Hoàn tất
							</Button>
						</Form>
					</Col>
				</Row>
			</Modal>
		</div>
	);
};

export default Baitap2;
