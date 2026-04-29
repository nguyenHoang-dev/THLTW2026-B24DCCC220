import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Popconfirm, DatePicker, InputNumber, Space } from 'antd';
import type { TableProps } from 'antd';

interface WorkoutRecord {
	id: string;
	date: string;
	type: string;
	duration: number;
	calories: number;
	notes: string;
	quantity: string;
}

const WorkoutDiary: React.FC = () => {
	const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [form] = Form.useForm();

	const handleAddSubmit = (values: any) => {
		const newWorkout: WorkoutRecord = {
			id: Date.now().toString(),
			date: values.date.format('YYYY-MM-DD'),
			type: values.type,
			duration: values.duration,
			calories: values.calories,
			notes: values.notes || '',
			quantity: values.status,
		};

		setWorkouts([newWorkout, ...workouts]);
		setIsModalVisible(false);
		form.resetFields();
	};

	const handleDelete = (id: string) => {
		setWorkouts(workouts.filter((item) => item.id !== id));
	};

	const columns: TableProps<WorkoutRecord>['columns'] = [
		{ title: 'Ngày', dataIndex: 'date', key: 'date' },
		{ title: 'Loại bài tập', dataIndex: 'type', key: 'type' },
		{ title: 'Thời lượng (phút)', dataIndex: 'duration', key: 'duration' },
		{ title: 'Calo đốt', dataIndex: 'calories', key: 'calories' },
		{ title: 'Ghi chú', dataIndex: 'notes', key: 'notes' },
		{ title: 'Trạng thái', dataIndex: 'quantity' },
		{
			title: 'Hành động',
			key: 'action',
			render: (_, record) => (
				<Space size='middle'>
					<a>Sửa</a>
					<Popconfirm title='Xóa buổi tập' okText='Đồng ý' cancelText='Hủy' onConfirm={() => handleDelete(record.id)}>
						<a style={{ color: 'red' }}>Xóa</a>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div>
			<div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
				<h2>Nhật ký tập luyện</h2>
				<Button type='primary' onClick={() => setIsModalVisible(true)}>
					Thêm buổi tập mới
				</Button>
			</div>

			<Table columns={columns} dataSource={workouts} rowKey='id' />

			<Modal title='Thêm buổi tập mới' open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null}>
				<Form form={form} layout='vertical' onFinish={handleAddSubmit}>
					<Form.Item name='date' label='Ngày tập' rules={[{ required: true }]}>
						<DatePicker style={{ width: '100%' }} />
					</Form.Item>

					<Form.Item name='type' label='Loại bài tập' rules={[{ required: true }]}>
						<Select>
							<Select.Option value='Cardio'>Cardio</Select.Option>
							<Select.Option value='Strength'>Strength</Select.Option>
							<Select.Option value='Yoga'>Yoga</Select.Option>
							<Select.Option value='HIIT'>HIIT</Select.Option>
							<Select.Option value='Other'>Khác</Select.Option>
						</Select>
					</Form.Item>

					<Form.Item name='duration' label='Thời lượng (phút)' rules={[{ required: true }]}>
						<InputNumber min={1} style={{ width: '100%' }} />
					</Form.Item>

					<Form.Item name='calories' label='Calo đốt' rules={[{ required: true }]}>
						<InputNumber min={0} style={{ width: '100%' }} />
					</Form.Item>

					<Form.Item name='notes' label='Ghi chú'>
						<Input.TextArea rows={3} />
					</Form.Item>

					<Form.Item name='status' label='Trạng thái' rules={[{ required: true }]}>
						<Select>
							<Select.Option value='Hoàn thành'>Hoàn thành</Select.Option>
							<Select.Option value='Bỏ lỡ'>Bỏ lỡ</Select.Option>
						</Select>
					</Form.Item>

					<Form.Item>
						<Button type='primary' htmlType='submit' style={{ width: '100%' }}>
							Lưu buổi tập
						</Button>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default WorkoutDiary;
