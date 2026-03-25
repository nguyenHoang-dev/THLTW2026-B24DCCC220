import React, { useState } from 'react';
import { Tabs, Form, Input, Select, DatePicker, Button, Table, message, InputNumber, Card, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { Option } = Select;

interface IDynamicField {
	id: string;
	label: string;
	name: string;
	type: 'String' | 'Number' | 'Date';
}

interface IDiploma {
	id: string;
	regNumber: number;
	diplomaNumber: string;
	fullName: string;
	dob: dayjs.Dayjs;
	decisionId: string;
	[key: string]: any;
}

const MOCK_DECISIONS = [{ id: 'QD01', number: '123/QĐ-ĐH', name: 'Quyết định Tốt nghiệp Đợt 1 - 2024' }];

const INITIAL_DYNAMIC_FIELDS: IDynamicField[] = [
	{ id: '1', label: 'Dân tộc', name: 'ethnicity', type: 'String' },
	{ id: '2', label: 'Điểm trung bình', name: 'gpa', type: 'Number' },
];

export default function DiplomaManagement() {
	const [dynamicFields, setDynamicFields] = useState<IDynamicField[]>(INITIAL_DYNAMIC_FIELDS);
	const [diplomas, setDiplomas] = useState<IDiploma[]>([]);
	const [currentRegNumber, setCurrentRegNumber] = useState<number>(1);

	return (
		<div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
			<h2>Hệ Thống Quản Lý Sổ Văn Bằng</h2>
			<Tabs defaultActiveKey='1' type='card'>
				<TabPane tab='1. Cấu hình biểu mẫu' key='1'>
					<ConfigForm fields={dynamicFields} setFields={setDynamicFields} />
				</TabPane>
				<TabPane tab='2. Thêm mới văn bằng' key='2'>
					<DiplomaEntry
						dynamicFields={dynamicFields}
						currentRegNumber={currentRegNumber}
						onAdd={(diploma) => {
							setDiplomas([...diplomas, diploma]);
							setCurrentRegNumber((prev) => prev + 1);
							message.success('Thêm văn bằng thành công!');
						}}
					/>
				</TabPane>
				<TabPane tab='3. Tra cứu văn bằng' key='3'>
					<DiplomaSearch diplomas={diplomas} />
				</TabPane>
			</Tabs>
		</div>
	);
}

function DiplomaEntry({
	dynamicFields,
	currentRegNumber,
	onAdd,
}: {
	dynamicFields: IDynamicField[];
	currentRegNumber: number;
	onAdd: (d: IDiploma) => void;
}) {
	const [form] = Form.useForm();

	const onFinish = (values: any) => {
		const newDiploma: IDiploma = {
			id: Date.now().toString(),
			regNumber: currentRegNumber,
			diplomaNumber: values.diplomaNumber,
			studentId: values.studentId,
			fullName: values.fullName,
			dob: values.dob,
			decisionId: values.decisionId,
		};

		dynamicFields.forEach((field) => {
			newDiploma[field.name] = values[field.name];
		});

		onAdd(newDiploma);
		form.resetFields();
	};

	return (
		<Card title='Cấp mới văn bằng'>
			<Form form={form} layout='vertical' onFinish={onFinish}>
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
					<Form.Item label='Số vào sổ (Tự động tăng)'>
						<InputNumber value={currentRegNumber} disabled style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item name='decisionId' label='Quyết định Tốt nghiệp' rules={[{ required: true }]}>
						<Select placeholder='Chọn quyết định'>
							{MOCK_DECISIONS.map((dec) => (
								<Option key={dec.id} value={dec.id}>
									{dec.number} - {dec.name}
								</Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item name='diplomaNumber' label='Số hiệu văn bằng' rules={[{ required: true }]}>
						<Input />
					</Form.Item>
					<Form.Item name='studentId' label='Mã sinh viên' rules={[{ required: true }]}>
						<Input />
					</Form.Item>
					<Form.Item name='fullName' label='Họ và tên' rules={[{ required: true }]}>
						<Input />
					</Form.Item>
					<Form.Item name='dob' label='Ngày sinh' rules={[{ required: true }]}>
						<DatePicker style={{ width: '100%' }} format='DD/MM/YYYY' />
					</Form.Item>

					{dynamicFields.map((field) => (
						<Form.Item key={field.id} name={field.name} label={field.label} rules={[{ required: true }]}>
							{field.type === 'String' && <Input />}
							{field.type === 'Number' && <InputNumber style={{ width: '100%' }} />}
							{field.type === 'Date' && <DatePicker style={{ width: '100%' }} format='DD/MM/YYYY' />}
						</Form.Item>
					))}
				</div>
				<Button type='primary' htmlType='submit' size='large'>
					Lưu Văn Bằng
				</Button>
			</Form>
		</Card>
	);
}

function DiplomaSearch({ diplomas }: { diplomas: IDiploma[] }) {
	const [keyword, setKeyword] = useState('');
	const [results, setResults] = useState<IDiploma[]>(diplomas);

	React.useEffect(() => {
		const lowered = keyword.trim().toLowerCase();
		if (!lowered) {
			setResults(diplomas);
			return;
		}
		setResults(
			diplomas.filter(
				(d) =>
					d.fullName.toLowerCase().includes(lowered) ||
					d.studentId.toLowerCase().includes(lowered) ||
					d.diplomaNumber.toLowerCase().includes(lowered) ||
					d.decisionId.toLowerCase().includes(lowered),
			),
		);
	}, [keyword, diplomas]);

	const columns: ColumnsType<IDiploma> = [
		{ title: 'Số vào sổ', dataIndex: 'regNumber', key: 'regNumber' },
		{ title: 'Số hiệu văn bằng', dataIndex: 'diplomaNumber', key: 'diplomaNumber' },
		{ title: 'Mã sinh viên', dataIndex: 'studentId', key: 'studentId' },
		{ title: 'Họ và tên', dataIndex: 'fullName', key: 'fullName' },
		{ title: 'Ngày sinh', dataIndex: 'dob', key: 'dob', render: (val: dayjs.Dayjs) => val.format('DD/MM/YYYY') },
		{ title: 'Quyết định', dataIndex: 'decisionId', key: 'decisionId' },
	];

	return (
		<Card title='Tra cứu văn bằng'>
			<Space style={{ marginBottom: 16 }}>
				<Input.Search
					placeholder='Tìm theo tên, mã SV, số văn bằng...'
					allowClear
					value={keyword}
					onChange={(e) => setKeyword(e.target.value)}
					onSearch={(v) => setKeyword(v)}
					style={{ width: 380 }}
				/>
			</Space>
			<Table dataSource={results} columns={columns} rowKey='id' pagination={{ pageSize: 8 }} />
		</Card>
	);
}

function ConfigForm({ fields, setFields }: { fields: IDynamicField[]; setFields: any }) {
	const [form] = Form.useForm();

	const [editingId, setEditingId] = useState<string | null>(null);

	const onFinish = (values: any) => {
		if (editingId) {
			const updatedFields = fields.map((field) => {
				if (field.id === editingId) {
					return {
						...field,
						label: values.label,
						name: values.label.toLowerCase().replace(/ /g, '_'),
						type: values.type,
					};
				}
				return field;
			});
			setFields(updatedFields);
			message.success('Cập nhật trường thông tin thành công!');
		} else {
			const newField: IDynamicField = {
				id: Date.now().toString(),
				label: values.label,
				name: values.label.toLowerCase().replace(/ /g, '_'),
				type: values.type,
			};
			setFields([...fields, newField]);
			message.success('Thêm trường thông tin thành công!');
		}

		form.resetFields();
		setEditingId(null);
	};

	const handleEdit = (record: IDynamicField) => {
		setEditingId(record.id);

		form.setFieldsValue({
			label: record.label,
			type: record.type,
		});
	};

	const handleCancelEdit = () => {
		setEditingId(null);
		form.resetFields();
	};

	const columns: ColumnsType<IDynamicField> = [
		{ title: 'Tên trường', dataIndex: 'label', key: 'label' },
		{ title: 'Kiểu dữ liệu', dataIndex: 'type', key: 'type', render: (type) => <Tag color='blue'>{type}</Tag> },
		{
			title: 'Hành động',
			key: 'action',
			render: (_, record) => (
				<Space>
					<Button type='primary' ghost onClick={() => handleEdit(record)}>
						Sửa
					</Button>
					<Button danger onClick={() => setFields(fields.filter((f) => f.id !== record.id))}>
						Xóa
					</Button>
				</Space>
			),
		},
	];

	return (
		<div style={{ display: 'flex', gap: '24px' }}>
			<Card title={editingId ? 'Sửa trường thông tin' : 'Thêm trường động'} style={{ flex: 1 }}>
				<Form form={form} layout='vertical' onFinish={onFinish} initialValues={{ type: 'String' }}>
					<Form.Item
						name='label'
						label='Tên trường (VD: Nơi sinh)'
						rules={[{ required: true, message: 'Vui lòng nhập tên trường' }]}
					>
						<Input />
					</Form.Item>
					<Form.Item name='type' label='Kiểu dữ liệu' rules={[{ required: true }]}>
						<Select>
							<Option value='String'>String (Chữ)</Option>
							<Option value='Number'>Number (Số)</Option>
							<Option value='Date'>Date (Ngày tháng)</Option>
						</Select>
					</Form.Item>

					<Space>
						<Button type='primary' htmlType='submit'>
							{editingId ? 'Cập nhật' : 'Thêm trường'}
						</Button>
						{editingId && <Button onClick={handleCancelEdit}>Hủy</Button>}
					</Space>
				</Form>
			</Card>
			<Card title='Danh sách cấu hình hiện tại' style={{ flex: 2 }}>
				<Table dataSource={fields} columns={columns} rowKey='id' pagination={false} />
			</Card>
		</div>
	);
}
