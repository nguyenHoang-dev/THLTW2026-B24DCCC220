import { useState, useEffect } from 'react';
import {
	Table,
	Button,
	Modal,
	Form,
	Input,
	Select,
	DatePicker,
	Space,
	Tag,
	Card,
	Typography,
	Tabs,
	message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface ProgressRecord {
	id: number;
	subject: string;
	date: string;
	duration: number;
	content: string;
}

const QuanlitienDoHocTap = () => {
	const { Title } = Typography;
	const { Option } = Select;

	const [categories, setCategories] = useState<string[]>([]);
	const [progress, setProgress] = useState<ProgressRecord[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingRecord, setEditingRecord] = useState<ProgressRecord | null>(null);
	const [form] = Form.useForm();

	useEffect(() => {
		const savedCats = JSON.parse(localStorage.getItem('categories') || '["Toán", "Văn", "Anh", "Khoa học"]');
		const savedProgress = JSON.parse(localStorage.getItem('progress') || '[]');
		setCategories(savedCats);
		setProgress(savedProgress);
	}, []);

	const handleSave = (values: any) => {
		const newData: ProgressRecord = {
			...values,
			id: editingRecord ? editingRecord.id : Date.now(),
			date: values.date.format('YYYY-MM-DD'),
		};

		if (editingRecord) {
			setProgress(progress.map((item) => (item.id === editingRecord.id ? newData : item)));
			message.success('Cập nhật thành công!');
		} else {
			setProgress([...progress, newData]);
			message.success('Thêm mới thành công!');
		}
		setIsModalOpen(false);
		form.resetFields();
	};

	const deleteRecord = (id: number) => {
		setProgress(progress.filter((item) => item.id !== id));
		message.success('Đã xóa bản ghi');
	};

	const columns = [
		{ title: 'STT', render: (_: any, __: any, index: number) => index + 1, width: 60 },
		{ title: 'Tên môn', dataIndex: 'subject', key: 'subject' },
		{ title: 'Thời gian', dataIndex: 'date', key: 'date' },
		{ title: 'Thời lượng (phút)', dataIndex: 'duration', key: 'duration' },
		{ title: 'Nội dung', dataIndex: 'content', key: 'content' },
		{
			title: 'Trạng thái',
			key: 'status',
			render: (_: any, record: ProgressRecord) =>
				record.duration >= 60 ? <Tag color='green'>HOÀN THÀNH</Tag> : <Tag color='orange'>CHƯA ĐẠT MỤC TIÊU</Tag>,
		},
		{
			title: 'Thao tác',
			render: (_: any, record: ProgressRecord) => (
				<Space>
					<Button
						type='primary'
						icon={<EditOutlined />}
						onClick={() => {
							setEditingRecord(record);

							setIsModalOpen(true);
						}}
						style={{ backgroundColor: '#c00', borderColor: '#c00' }}
					>
						Sửa
					</Button>
					<Button danger icon={<DeleteOutlined />} onClick={() => deleteRecord(record.id)}>
						Xóa
					</Button>
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
			<Title level={2} style={{ color: '#c00' }}>
				Quản lý học tập
			</Title>

			<Tabs defaultActiveKey='1'>
				<Tabs.TabPane key='1' tab='Quản lý Tiến độ'>
					<Card>
						<div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
							<Input.Search placeholder='Tìm tên môn học...' style={{ width: 300 }} />
							<Button
								type='primary'
								icon={<PlusOutlined />}
								onClick={() => {
									setEditingRecord(null);
									form.resetFields();
									setIsModalOpen(true);
								}}
								style={{ backgroundColor: '#c00', borderColor: '#c00' }}
							>
								Thêm buổi học
							</Button>
						</div>

						<Table dataSource={progress} columns={columns} rowKey='id' bordered pagination={{ pageSize: 5 }} />
					</Card>
				</Tabs.TabPane>
				<Tabs.TabPane key='2' tab='Danh mục môn học'>
					<Card title='Danh sách môn học'>
						{categories.map((cat) => (
							<Tag
								key={cat}
								color='red'
								style={{ marginBottom: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
							>
								{cat}
							</Tag>
						))}
					</Card>
				</Tabs.TabPane>
			</Tabs>

			<Modal
				title={editingRecord ? 'Sửa tiến độ' : 'Thêm tiến độ mới'}
				visible={isModalOpen}
				onCancel={() => setIsModalOpen(false)}
				onOk={() => form.submit()}
				okText='Lưu lại'
				cancelText='Hủy'
				destroyOnClose
			>
				<Form form={form} layout='vertical' onFinish={handleSave}>
					<Form.Item name='subject' label='Môn học' rules={[{ required: true }]}>
						<Select placeholder='Chọn môn học'>
							{categories.map((cat) => (
								<Option key={cat} value={cat}>
									{cat}
								</Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item name='date' label='Thời gian học' rules={[{ required: true }]}>
						<DatePicker showTime style={{ width: '100%' }} format='YYYY-MM-DD' />
					</Form.Item>
					<Form.Item name='duration' label='Thời lượng (phút)' rules={[{ required: true }]}>
						<Input type='number' />
					</Form.Item>
					<Form.Item name='content' label='Nội dung đã học'>
						<Input.TextArea rows={3} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default QuanlitienDoHocTap;
