import React, { useState, useEffect } from 'react';
import {
	Layout,
	Menu,
	Button,
	Row,
	Col,
	Card,
	Typography,
	Tag,
	Table,
	Modal,
	Form,
	Input,
	Select,
	DatePicker,
	Statistic,
	Space,
	Popconfirm,
	message,
} from 'antd';
import {
	AppstoreOutlined,
	UnorderedListOutlined,
	DashboardOutlined,
	PlusOutlined,
	EditOutlined,
	DeleteOutlined,
} from '@ant-design/icons';
import { BrowserRouter as Router, Route, Link, useLocation } from 'react-router-dom';
// @ts-ignore
import { Switch } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult } from 'react-beautiful-dnd';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

type TaskStatus = 'todo' | 'doing' | 'done';
type TaskPriority = 'high' | 'medium' | 'low';

interface Task {
	id: string;
	title: string;
	description: string;
	deadline: string;
	priority: TaskPriority;
	tags: string[];
	status: TaskStatus;
}

const STATUS_COLUMNS: { id: TaskStatus; title: string }[] = [
	{ id: 'todo', title: 'Cần làm' },
	{ id: 'doing', title: 'Đang làm' },
	{ id: 'done', title: 'Hoàn thành' },
];

const getPriorityColor = (priority: TaskPriority) => {
	if (priority === 'high') return 'red';
	if (priority === 'medium') return 'orange';
	return 'green';
};

const getStatusText = (status: TaskStatus) => {
	if (status === 'todo') return 'Cần làm';
	if (status === 'doing') return 'Đang làm';
	return 'Hoàn thành';
};

const MainLayout: React.FC = () => {
	const location = useLocation();
	const [form] = Form.useForm();

	const [tasks, setTasks] = useState<Task[]>(() => {
		const saved = localStorage.getItem('my_tasks');
		return saved ? JSON.parse(saved) : [];
	});

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingTask, setEditingTask] = useState<Task | null>(null);
	const [searchText, setSearchText] = useState('');

	useEffect(() => {
		localStorage.setItem('my_tasks', JSON.stringify(tasks));
	}, [tasks]);

	const handleSaveTask = (values: any) => {
		const newTask: Task = {
			id: editingTask ? editingTask.id : uuidv4(),
			title: values.title,
			description: values.description,
			deadline: values.deadline.toISOString(),
			priority: values.priority,
			tags: values.tags || [],
			status: editingTask ? editingTask.status : 'todo',
		};

		if (editingTask) {
			setTasks(tasks.map((t) => (t.id === editingTask.id ? newTask : t)));
			message.success('Cập nhật thành công!');
		} else {
			setTasks([...tasks, newTask]);
			message.success('Thêm công việc thành công!');
		}

		setIsModalOpen(false);
		form.resetFields();
	};

	const handleDeleteTask = (id: string) => {
		setTasks(tasks.filter((t) => t.id !== id));
		message.success('Đã xóa công việc!');
	};

	const updateTaskStatus = (id: string, newStatus: TaskStatus) => {
		setTasks(tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
	};

	const openAddModal = () => {
		setEditingTask(null);
		form.resetFields();
		setIsModalOpen(true);
	};

	const openEditModal = (task: Task) => {
		setEditingTask(task);
		form.setFieldsValue({
			...task,
			deadline: dayjs(task.deadline),
		});
		setIsModalOpen(true);
	};

	const renderDashboard = () => {
		const total = tasks.length;
		const completed = tasks.filter((t) => t.status === 'done').length;
		const overdue = tasks.filter((t) => t.status !== 'done' && dayjs(t.deadline).isBefore(dayjs(), 'day')).length;

		return (
			<Row gutter={16}>
				<Col span={8}>
					<Card>
						<Statistic title='Tổng số Task' value={total} />
					</Card>
				</Col>
				<Col span={8}>
					<Card>
						<Statistic title='Đã hoàn thành' value={completed} valueStyle={{ color: '#3f8600' }} />
					</Card>
				</Col>
				<Col span={8}>
					<Card>
						<Statistic title='Quá hạn' value={overdue} valueStyle={{ color: '#cf1322' }} />
					</Card>
				</Col>
			</Row>
		);
	};

	const renderKanban = () => {
		const onDragEnd = (result: DropResult) => {
			const { destination, source, draggableId } = result;
			if (!destination || destination.droppableId === source.droppableId) return;
			updateTaskStatus(draggableId, destination.droppableId as TaskStatus);
		};

		return (
			<DragDropContext onDragEnd={onDragEnd}>
				<Row gutter={16}>
					{STATUS_COLUMNS.map((col) => (
						<Col span={8} key={col.id}>
							<Card
								title={
									<Title level={5} style={{ margin: 0 }}>
										{col.title}
									</Title>
								}
								style={{ background: '#f0f2f5', height: '100%' }}
								bodyStyle={{ padding: '12px' }}
							>
								<Droppable droppableId={col.id}>
									{(provided: any) => (
										<div {...provided.droppableProps} ref={provided.innerRef} style={{ minHeight: '400px' }}>
											{tasks
												.filter((t) => t.status === col.id)
												.map((task, index) => (
													<Draggable key={task.id} draggableId={task.id} index={index}>
														{(dragProvided: any) => (
															<div
																ref={dragProvided.innerRef}
																{...dragProvided.draggableProps}
																{...dragProvided.dragHandleProps}
																style={{ marginBottom: '10px', ...dragProvided.draggableProps.style }}
															>
																<Card
																	size='small'
																	hoverable
																	actions={[
																		<EditOutlined key='edit' onClick={() => openEditModal(task)} />,
																		<Popconfirm
																			key='delete-confirm'
																			title='Xóa task này?'
																			onConfirm={() => handleDeleteTask(task.id)}
																		>
																			<DeleteOutlined key='delete' style={{ color: 'red' }} />
																		</Popconfirm>,
																	]}
																>
																	<div style={{ fontWeight: 'bold', marginBottom: 4 }}>{task.title}</div>
																	<div style={{ fontSize: '12px', color: '#888', marginBottom: 8 }}>
																		Hạn: {dayjs(task.deadline).format('DD/MM/YYYY')}
																	</div>
																	<Space>
																		<Tag color={getPriorityColor(task.priority)}>{task.priority.toUpperCase()}</Tag>
																		{task.tags.map((tag) => (
																			<Tag key={tag}>{tag}</Tag>
																		))}
																	</Space>
																</Card>
															</div>
														)}
													</Draggable>
												))}
											{provided.placeholder}
										</div>
									)}
								</Droppable>
							</Card>
						</Col>
					))}
				</Row>
			</DragDropContext>
		);
	};

	const renderList = () => {
		const columns = [
			{
				title: 'Tên công việc',
				dataIndex: 'title',
				key: 'title',
				filteredValue: [searchText],
				onFilter: (value: any, record: Task) =>
					String(record.title).toLowerCase().includes(String(value).toLowerCase()),
			},
			{
				title: 'Độ ưu tiên',
				dataIndex: 'priority',
				key: 'priority',
				render: (p: TaskPriority) => <Tag color={getPriorityColor(p)}>{p.toUpperCase()}</Tag>,
			},
			{
				title: 'Trạng thái',
				dataIndex: 'status',
				key: 'status',
				filters: STATUS_COLUMNS.map((c) => ({ text: c.title, value: c.id })),
				onFilter: (value: any, record: Task) => record.status === value,
				render: (s: TaskStatus) => <Tag>{getStatusText(s)}</Tag>,
			},
			{
				title: 'Deadline',
				dataIndex: 'deadline',
				key: 'deadline',
				sorter: (a: Task, b: Task) => dayjs(a.deadline).valueOf() - dayjs(b.deadline).valueOf(),
				render: (d: string) => dayjs(d).format('DD/MM/YYYY HH:mm'),
			},
			{
				title: 'Hành động',
				key: 'actions',
				render: (_: any, record: Task) => (
					<Space>
						<Button type='link' icon={<EditOutlined />} onClick={() => openEditModal(record)} />
						<Popconfirm title='Xóa task này?' onConfirm={() => handleDeleteTask(record.id)}>
							<Button type='link' danger icon={<DeleteOutlined />} />
						</Popconfirm>
					</Space>
				),
			},
		];

		return (
			<Space direction='vertical' style={{ width: '100%' }}>
				<Input.Search
					placeholder='Tìm kiếm theo tên...'
					onChange={(e) => setSearchText(e.target.value)}
					style={{ width: 300 }}
				/>
				<Table dataSource={tasks} columns={columns} rowKey='id' />
			</Space>
		);
	};

	return (
		<Layout style={{ minHeight: '100vh' }}>
			<Sider theme='light'>
				<div
					style={{
						height: 32,
						margin: 16,
						background: 'rgba(0, 0, 0, 0.05)',
						textAlign: 'center',
						lineHeight: '32px',
						fontWeight: 'bold',
					}}
				>
					TASK MANAGER
				</div>
				<Menu mode='inline' selectedKeys={[location.pathname]}>
					<Menu.Item key='/dashboard' icon={<DashboardOutlined />}>
						<Link to='/dashboard'>Dashboard</Link>
					</Menu.Item>
					<Menu.Item key='/' icon={<AppstoreOutlined />}>
						<Link to='/'>Kanban Board</Link>
					</Menu.Item>
					<Menu.Item key='/list' icon={<UnorderedListOutlined />}>
						<Link to='/list'>Danh sách Task</Link>
					</Menu.Item>
				</Menu>
			</Sider>

			<Layout>
				<Header
					style={{
						background: '#fff',
						padding: '0 24px',
						display: 'flex',
						justifyContent: 'flex-end',
						alignItems: 'center',
					}}
				>
					<Button type='primary' icon={<PlusOutlined />} onClick={openAddModal}>
						Thêm Task
					</Button>
				</Header>
				<Content style={{ margin: '24px', padding: 24, background: '#fff', borderRadius: 8 }}>
					<Switch>
						{/* @ts-ignore */}
						<Route path='/dashboard' render={() => renderDashboard()} />
						{/* @ts-ignore */}
						<Route path='/list' render={() => renderList()} />
						{/* @ts-ignore */}
						<Route exact path='/' render={() => renderKanban()} />
					</Switch>
				</Content>
			</Layout>

			<Modal
				title={editingTask ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}
				open={isModalOpen}
				onCancel={() => setIsModalOpen(false)}
				footer={null}
				destroyOnClose
			>
				<Form form={form} layout='vertical' onFinish={handleSaveTask}>
					<Form.Item name='title' label='Tên công việc' rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
						<Input />
					</Form.Item>
					<Form.Item name='description' label='Mô tả'>
						<Input.TextArea rows={3} />
					</Form.Item>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item name='deadline' label='Deadline' rules={[{ required: true, message: 'Chọn deadline!' }]}>
								<DatePicker style={{ width: '100%' }} showTime format='DD/MM/YYYY HH:mm' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='priority' label='Mức độ ưu tiên' rules={[{ required: true, message: 'Chọn mức độ!' }]}>
								<Select>
									<Select.Option value='high'>Cao</Select.Option>
									<Select.Option value='medium'>Trung bình</Select.Option>
									<Select.Option value='low'>Thấp</Select.Option>
								</Select>
							</Form.Item>
						</Col>
					</Row>
					<Form.Item name='tags' label='Tags (Nhấn Enter để thêm)'>
						<Select mode='tags' placeholder='VD: frontend, bug...' />
					</Form.Item>
					<Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
						<Button onClick={() => setIsModalOpen(false)} style={{ marginRight: 8 }}>
							Hủy
						</Button>
						<Button type='primary' htmlType='submit'>
							Lưu lại
						</Button>
					</Form.Item>
				</Form>
			</Modal>
		</Layout>
	);
};

const App: React.FC = () => {
	return (
		<Router>
			<MainLayout />
		</Router>
	);
};

export default App;
