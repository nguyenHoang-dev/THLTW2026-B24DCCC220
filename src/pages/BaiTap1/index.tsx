import { useState } from 'react';
import { Table, Button, Popconfirm, Modal, Form, Input, InputNumber, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useModel } from 'umi';

const BaiTap1 = () => {
	const { danhSachHienThi, setTuKhoaTimKiem, xoaSanPham, themSanPham } = useModel('sanpham');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [form] = Form.useForm();

	const handleAddProduct = (values: any) => {
		themSanPham(values);
		message.success('Thêm thành công!');
		setIsModalOpen(false);
		form.resetFields();
	};

	const cot = [
		{ title: 'STT', key: 'stt' },

		{ title: 'Tên Sản Phẩm', dataIndex: 'name', key: 'name' },

		{ title: 'Giá', dataIndex: 'price', key: 'price' },

		{ title: 'Số Lượng', dataIndex: 'quantity', key: 'quantity' },

		{
			title: 'Thao Tác',
			key: 'action',
			render: (_: any, record: any) => (
				<Popconfirm title='Xóa?' onConfirm={() => xoaSanPham(record.id)}>
					<Button danger icon={<DeleteOutlined />}>
						Xóa
					</Button>
				</Popconfirm>
			),
		},
	];

	return (
		<div style={{ padding: 20 }}>
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

			<Table dataSource={danhSachHienThi} columns={cot} rowKey='id' />

			<Modal title='Thêm mới' visible={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
				<Form form={form} onFinish={handleAddProduct} layout='vertical'>
					<Form.Item label='Tên' name='name' rules={[{ required: true }]}>
						<Input />
					</Form.Item>
					<Form.Item label='Giá' name='price' rules={[{ required: true }]}>
						<InputNumber style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item label='Số lượng' name='quantity' rules={[{ required: true }]}>
						<InputNumber style={{ width: '100%' }} />
					</Form.Item>
					<Button type='primary' htmlType='submit' block>
						Lưu
					</Button>
				</Form>
			</Modal>
		</div>
	);
};

export default BaiTap1;
