import React, { useState } from 'react';
import {
	Button,
	Modal,
	Table,
	Tabs,
	Form,
	Input,
	Select,
	InputNumber,
	Space,
	Tag,
	message,
	Card,
	Row,
	Col,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const KNOWLEDGE_BLOCKS = ['Tổng quan', 'Chuyên sâu', 'Thực hành'];
const DIFFICULTIES = ['Dễ', 'Trung bình', 'Khó', 'Rất khó'];

const initialSubjects: { id: string; code: string; name: string; credits: number }[] = [];

const initialQuestions: {
	id: string;
	code: string;
	subject: string;
	content: string;
	difficulty: string;
	block: string;
}[] = [];

const App: React.FC = () => {
	const [subjects, setSubjects] = useState(initialSubjects);
	const [questions, setQuestions] = useState(initialQuestions);
	const [exams, setExams] = useState<any[]>([]);

	const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
	const [subjectForm] = Form.useForm();
	const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
	const [questionForm] = Form.useForm();
	const [isExamModalOpen, setIsExamModalOpen] = useState(false);
	const [examForm] = Form.useForm();

	const subjectColumns: ColumnsType<any> = [
		{ title: 'Mã môn', dataIndex: 'code', key: 'code' },
		{ title: 'Tên môn', dataIndex: 'name', key: 'name' },
		{ title: 'Số tín chỉ', dataIndex: 'credits', key: 'credits' },
		{
			title: 'Hành động',
			key: 'action',
			render: (_, record) => (
				<Button type='link' danger onClick={() => handleDeleteSubject(record.id)}>
					Xóa
				</Button>
			),
		},
	];

	function handleDeleteSubject(id: string) {
		setSubjects((prev) => prev.filter((sub) => sub.id !== id));
		setQuestions((prev) => prev.filter((q) => q.subject !== id));
		message.success('Xóa môn học thành công.');
	}

	const questionColumns: ColumnsType<any> = [
		{ title: 'Mã CH', dataIndex: 'code', key: 'code' },
		{ title: 'Môn học', dataIndex: 'subject', key: 'subject' },
		{ title: 'Nội dung', dataIndex: 'content', key: 'content' },
		{
			title: 'Mức độ',
			dataIndex: 'difficulty',
			key: 'difficulty',
			render: (level) => {
				const color = level === 'Dễ' ? 'green' : level === 'Trung bình' ? 'blue' : level === 'Khó' ? 'orange' : 'red';
				return <Tag color={color}>{level}</Tag>;
			},
		},
		{ title: 'Khối kiến thức', dataIndex: 'block', key: 'block' },
		{
			title: 'Hành động',
			key: 'action',
			render: (_, record) => (
				<Button type='link' danger onClick={() => handleDeleteQuestion(record.id)}>
					Xóa
				</Button>
			),
		},
	];

	const examColumns: ColumnsType<any> = [
		{ title: 'Mã đề thi', dataIndex: 'id', key: 'id' },
		{ title: 'Môn học', dataIndex: 'subject', key: 'subject' },
		{ title: 'Số lượng câu hỏi', dataIndex: 'totalQuestions', key: 'totalQuestions' },
		{
			title: 'Hành động',
			key: 'action',
			render: (_, record) => <Button type='link'>Xem chi tiết</Button>,
		},
	];

	const handleGenerateExam = (values: any) => {
		const { subject, block, qtyEasy, qtyMedium, qtyHard, qtyVeryHard } = values;

		// Lọc câu hỏi trong ngân hàng theo môn học và khối kiến thức
		const availableQuestions = questions.filter((q) => q.subject === subject && q.block === block);

		const countByDiff = (diff: string) => availableQuestions.filter((q) => q.difficulty === diff).length;

		const reqEasy = qtyEasy || 0;
		const reqMedium = qtyMedium || 0;
		const reqHard = qtyHard || 0;
		const reqVeryHard = qtyVeryHard || 0;

		if (countByDiff('Dễ') < reqEasy)
			return message.error(`Không đủ câu hỏi mức Dễ (Cần ${reqEasy}, Hiện có ${countByDiff('Dễ')})`);
		if (countByDiff('Trung bình') < reqMedium)
			return message.error(`Không đủ câu hỏi mức Trung bình (Cần ${reqMedium}, Hiện có ${countByDiff('Trung bình')})`);
		if (countByDiff('Khó') < reqHard)
			return message.error(`Không đủ câu hỏi mức Khó (Cần ${reqHard}, Hiện có ${countByDiff('Khó')})`);
		if (countByDiff('Rất khó') < reqVeryHard)
			return message.error(`Không đủ câu hỏi mức Rất khó (Cần ${reqVeryHard}, Hiện có ${countByDiff('Rất khó')})`);

		const newExam = {
			id: `EXAM-${Math.floor(Math.random() * 10000)}`,
			subject,
			block,
			totalQuestions: reqEasy + reqMedium + reqHard + reqVeryHard,
			structure: { reqEasy, reqMedium, reqHard, reqVeryHard },
			createdAt: new Date().toLocaleDateString(),
		};

		setExams([...exams, newExam]);
		message.success('Tạo đề thi thành công và đã được lưu trữ!');
		setIsExamModalOpen(false);
		examForm.resetFields();
	};

	const handleAddSubject = (values: any) => {
		const newSubject = {
			id: values.code,
			code: values.code,
			name: values.name,
			credits: values.credits,
		};
		setSubjects((prev) => [...prev, newSubject]);
		message.success('Thêm môn học thành công!');
		setIsSubjectModalOpen(false);
		subjectForm.resetFields();
	};

	const handleAddQuestion = (values: any) => {
		const newQuestion = {
			id: `${Date.now()}`,
			code: values.code,
			subject: values.subject,
			content: values.content,
			difficulty: values.difficulty,
			block: values.block,
		};
		setQuestions((prev) => [...prev, newQuestion]);
		message.success('Thêm câu hỏi thành công!');
		setIsQuestionModalOpen(false);
		questionForm.resetFields();
	};

	function handleDeleteQuestion(id: string) {
		setQuestions((prev) => prev.filter((q) => q.id !== id));
		message.success('Xóa câu hỏi thành công.');
	}

	return (
		<div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
			<h1 style={{ textAlign: 'center', marginBottom: '24px' }}>HỆ THỐNG QUẢN LÝ NGÂN HÀNG CÂU HỎI</h1>

			<Tabs defaultActiveKey='4' type='card'>
				{/* Yêu cầu 1: Khối kiến thức */}
				<TabPane tab='1. Khối kiến thức' key='1'>
					<Card title='Danh mục khối kiến thức'>
						<Space size={[0, 8]} wrap>
							{KNOWLEDGE_BLOCKS.map((block) => (
								<Tag color='cyan' key={block} style={{ padding: '8px 16px', fontSize: '14px' }}>
									{block}
								</Tag>
							))}
						</Space>
					</Card>
				</TabPane>

				<TabPane tab='2. Danh mục môn học' key='2'>
					<Card
						title='Quản lý môn học'
						extra={
							<Button type='primary' onClick={() => setIsSubjectModalOpen(true)}>
								Thêm môn học
							</Button>
						}
					>
						<Table dataSource={subjects} columns={subjectColumns} rowKey='id' pagination={false} />
					</Card>
				</TabPane>

				<TabPane tab='3. Ngân hàng câu hỏi' key='3'>
					<Card
						title='Quản lý câu hỏi'
						extra={
							<Button type='primary' onClick={() => setIsQuestionModalOpen(true)}>
								Thêm câu hỏi mới
							</Button>
						}
					>
						{/* Thanh tìm kiếm */}
						<Space style={{ marginBottom: 16 }}>
							<Select placeholder='Chọn môn học' style={{ width: 150 }} allowClear>
								{subjects.map((s) => (
									<Option key={s.code} value={s.code}>
										{s.name}
									</Option>
								))}
							</Select>
							<Select placeholder='Mức độ khó' style={{ width: 150 }} allowClear>
								{DIFFICULTIES.map((d) => (
									<Option key={d} value={d}>
										{d}
									</Option>
								))}
							</Select>
							<Select placeholder='Khối kiến thức' style={{ width: 150 }} allowClear>
								{KNOWLEDGE_BLOCKS.map((b) => (
									<Option key={b} value={b}>
										{b}
									</Option>
								))}
							</Select>
							<Button type='default'>Tìm kiếm</Button>
						</Space>

						<Table dataSource={questions} columns={questionColumns} rowKey='id' />
					</Card>
				</TabPane>

				<TabPane tab='4. Quản lý đề thi' key='4'>
					<Card
						title='Danh sách đề thi đã tạo'
						extra={
							<Button type='primary' onClick={() => setIsExamModalOpen(true)}>
								+ Tạo đề thi theo cấu trúc
							</Button>
						}
					>
						<Table
							dataSource={exams}
							columns={examColumns}
							rowKey='id'
							locale={{ emptyText: 'Chưa có đề thi nào được tạo' }}
						/>
					</Card>
				</TabPane>
			</Tabs>

			<Modal
				title='Tạo đề thi theo cấu trúc'
				visible={isExamModalOpen}
				onCancel={() => setIsExamModalOpen(false)}
				footer={null}
				width={600}
			>
				<Form form={examForm} layout='vertical' onFinish={handleGenerateExam}>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item name='subject' label='Môn học' rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}>
								<Select placeholder='Chọn môn học'>
									{subjects.map((s) => (
										<Option key={s.code} value={s.code}>
											{s.name}
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								name='block'
								label='Khối kiến thức'
								rules={[{ required: true, message: 'Vui lòng chọn khối kiến thức!' }]}
							>
								<Select placeholder='Chọn khối kiến thức'>
									{KNOWLEDGE_BLOCKS.map((b) => (
										<Option key={b} value={b}>
											{b}
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
					</Row>

					<fieldset style={{ padding: '16px', border: '1px solid #d9d9d9', borderRadius: '8px', marginBottom: '24px' }}>
						<legend style={{ padding: '0 8px', fontSize: '14px', fontWeight: 500 }}>Cấu trúc số lượng câu hỏi</legend>
						<Row gutter={16}>
							<Col span={6}>
								<Form.Item name='qtyEasy' label={<Tag color='green'>Dễ</Tag>}>
									<InputNumber min={0} defaultValue={0} style={{ width: '100%' }} />
								</Form.Item>
							</Col>
							<Col span={6}>
								<Form.Item name='qtyMedium' label={<Tag color='blue'>Trung bình</Tag>}>
									<InputNumber min={0} defaultValue={0} style={{ width: '100%' }} />
								</Form.Item>
							</Col>
							<Col span={6}>
								<Form.Item name='qtyHard' label={<Tag color='orange'>Khó</Tag>}>
									<InputNumber min={0} defaultValue={0} style={{ width: '100%' }} />
								</Form.Item>
							</Col>
							<Col span={6}>
								<Form.Item name='qtyVeryHard' label={<Tag color='red'>Rất khó</Tag>}>
									<InputNumber min={0} defaultValue={0} style={{ width: '100%' }} />
								</Form.Item>
							</Col>
						</Row>
					</fieldset>

					<Form.Item>
						<Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
							<Button onClick={() => setIsExamModalOpen(false)}>Hủy</Button>
							<Button type='primary' htmlType='submit'>
								Tiến hành tạo đề thi
							</Button>
						</Space>
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title='Thêm môn học'
				visible={isSubjectModalOpen}
				onCancel={() => setIsSubjectModalOpen(false)}
				footer={null}
				width={480}
			>
				<Form form={subjectForm} layout='vertical' onFinish={handleAddSubject}>
					<Form.Item name='code' label='Mã môn' rules={[{ required: true, message: 'Vui lòng nhập mã môn!' }]}>
						<Input placeholder='VD: IT003' />
					</Form.Item>
					<Form.Item name='name' label='Tên môn' rules={[{ required: true, message: 'Vui lòng nhập tên môn!' }]}>
						<Input placeholder='VD: Lập trình web' />
					</Form.Item>
					<Form.Item
						name='credits'
						label='Số tín chỉ'
						rules={[{ required: true, message: 'Vui lòng nhập số tín chỉ!' }]}
					>
						<InputNumber min={1} style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item>
						<Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
							<Button onClick={() => setIsSubjectModalOpen(false)}>Hủy</Button>
							<Button type='primary' htmlType='submit'>
								Thêm
							</Button>
						</Space>
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title='Thêm câu hỏi'
				visible={isQuestionModalOpen}
				onCancel={() => setIsQuestionModalOpen(false)}
				footer={null}
				width={600}
			>
				<Form form={questionForm} layout='vertical' onFinish={handleAddQuestion}>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item
								name='code'
								label='Mã câu hỏi'
								rules={[{ required: true, message: 'Vui lòng nhập mã câu hỏi!' }]}
							>
								<Input placeholder='VD: Q005' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='subject' label='Môn học' rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}>
								<Select placeholder='Chọn môn học'>
									{subjects.map((s) => (
										<Option key={s.code} value={s.code}>
											{s.name}
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
					</Row>

					<Form.Item
						name='content'
						label='Nội dung'
						rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi!' }]}
					>
						<TextArea rows={3} />
					</Form.Item>

					<Row gutter={16}>
						<Col span={12}>
							<Form.Item
								name='difficulty'
								label='Mức độ'
								rules={[{ required: true, message: 'Vui lòng chọn mức độ!' }]}
							>
								<Select placeholder='Chọn mức độ'>
									{DIFFICULTIES.map((d) => (
										<Option key={d} value={d}>
											{d}
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								name='block'
								label='Khối kiến thức'
								rules={[{ required: true, message: 'Vui lòng chọn khối kiến thức!' }]}
							>
								<Select placeholder='Chọn khối kiến thức'>
									{KNOWLEDGE_BLOCKS.map((b) => (
										<Option key={b} value={b}>
											{b}
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
					</Row>

					<Form.Item>
						<Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
							<Button onClick={() => setIsQuestionModalOpen(false)}>Hủy</Button>
							<Button type='primary' htmlType='submit'>
								Thêm
							</Button>
						</Space>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default App;
