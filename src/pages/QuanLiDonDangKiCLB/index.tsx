import React, { useState, useMemo } from 'react';
import {
	Layout,
	Tabs,
	Table,
	Button,
	Modal,
	Form,
	Input,
	Select,
	Space,
	Tag,
	Popover,
	List,
	message,
	Row,
	Col,
	Card,
	Statistic,
	Switch,
	DatePicker,
} from 'antd';
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Column } from '@ant-design/plots';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;

interface Club {
	id: string;
	avatar: string;
	name: string;
	foundedDate: string;
	description: string;
	president: string;
	isActive: boolean;
}

interface ActionHistory {
	action: string;
	timestamp: string;
	reason?: string;
	by: string;
}

interface Application {
	id: string;
	fullName: string;
	email: string;
	phone: string;
	gender: string;
	address: string;
	skills: string;
	clubId: string;
	reasonToJoin: string;
	status: 'Pending' | 'Approved' | 'Rejected';
	rejectReason?: string;
	history: ActionHistory[];
}

const INITIAL_CLUBS: Club[] = [
	{
		id: 'c1',
		avatar: '💻',
		name: 'CLB Tin học (IT)',
		foundedDate: '2020-01-01',
		description: '<b>Code dạo</b>',
		president: 'Nguyễn Văn Admin',
		isActive: true,
	},
	{
		id: 'c2',
		avatar: '🎸',
		name: 'CLB Âm nhạc',
		foundedDate: '2021-05-10',
		description: 'Hát hò',
		president: 'Trần Ca Sĩ',
		isActive: true,
	},
];

const INITIAL_APPS: Application[] = [
	{
		id: 'a1',
		fullName: 'Sinh Viên Một',
		email: 'sv1@ptit.edu.vn',
		phone: '0123',
		gender: 'Nam',
		address: 'Hà Nội',
		skills: 'React',
		clubId: 'c1',
		reasonToJoin: 'Thích học',
		status: 'Pending',
		history: [],
	},
	{
		id: 'a2',
		fullName: 'Sinh Viên Hai',
		email: 'sv2@ptit.edu.vn',
		phone: '0124',
		gender: 'Nữ',
		address: 'Hà Nội',
		skills: 'Guitar',
		clubId: 'c2',
		reasonToJoin: 'Thích đàn',
		status: 'Approved',
		history: [{ action: 'Approved', timestamp: '10:00 01/04/2026', by: 'Admin' }],
	},
	{
		id: 'a3',
		fullName: 'Sinh Viên Ba',
		email: 'sv3@ptit.edu.vn',
		phone: '0125',
		gender: 'Nam',
		address: 'Hà Nội',
		skills: 'Ngủ',
		clubId: 'c1',
		reasonToJoin: 'Vui',
		status: 'Rejected',
		rejectReason: 'Không đủ kỹ năng',
		history: [{ action: 'Rejected', timestamp: '11:00 01/04/2026', reason: 'Không đủ kỹ năng', by: 'Admin' }],
	},
];

const App: React.FC = () => {
	const [clubs, setClubs] = useState<Club[]>(INITIAL_CLUBS);
	const [apps, setApps] = useState<Application[]>(INITIAL_APPS);

	const [isClubModalOpen, setIsClubModalOpen] = useState(false);
	const [clubForm] = Form.useForm();
	const [searchText, setSearchText] = useState('');

	const handleSaveClub = (values: any) => {
		const newClub = {
			...values,
			id: values.id || `c${Date.now()}`,
			foundedDate: values.foundedDate.format('YYYY-MM-DD'),
		};
		if (values.id) {
			setClubs(clubs.map((c) => (c.id === values.id ? newClub : c)));
			message.success('Cập nhật CLB thành công');
		} else {
			setClubs([...clubs, newClub]);
			message.success('Thêm CLB thành công');
		}
		setIsClubModalOpen(false);
	};

	const handleDeleteClub = (id: string) => {
		setClubs(clubs.filter((c) => c.id !== id));
		message.success('Đã xóa CLB');
	};

	const filteredClubs = clubs.filter((c) => c.name.toLowerCase().includes(searchText.toLowerCase()));

	const clubColumns: ColumnsType<Club> = [
		{ title: 'Avatar', dataIndex: 'avatar', render: (text) => <span style={{ fontSize: 24 }}>{text}</span> },
		{ title: 'Tên CLB', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
		{
			title: 'Ngày thành lập',
			dataIndex: 'foundedDate',
			sorter: (a, b) => dayjs(a.foundedDate).unix() - dayjs(b.foundedDate).unix(),
		},
		{ title: 'Chủ nhiệm', dataIndex: 'president' },
		{
			title: 'Hoạt động',
			dataIndex: 'isActive',
			render: (act) => (act ? <Tag color='green'>Có</Tag> : <Tag color='red'>Không</Tag>),
		},
		{
			title: 'Thao tác',
			render: (_, record) => (
				<Space>
					<Button
						type='link'
						onClick={() => {
							clubForm.setFieldsValue({ ...record, foundedDate: dayjs(record.foundedDate) });
							setIsClubModalOpen(true);
						}}
					>
						Sửa
					</Button>
					<Button type='link' danger onClick={() => handleDeleteClub(record.id)}>
						Xóa
					</Button>
				</Space>
			),
		},
	];

	const [selectedAppKeys, setSelectedAppKeys] = useState<React.Key[]>([]);
	const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
	const [rejectReason, setRejectReason] = useState('');

	const handleApprove = (ids: string[]) => {
		const now = dayjs().format('HH:mm DD/MM/YYYY');
		setApps(
			apps.map((a) =>
				ids.includes(a.id)
					? { ...a, status: 'Approved', history: [...a.history, { action: 'Approved', timestamp: now, by: 'Admin' }] }
					: a,
			),
		);
		message.success(`Đã duyệt ${ids.length} đơn`);
		setSelectedAppKeys([]);
	};

	const handleReject = () => {
		if (!rejectReason) return message.error('Vui lòng nhập lý do!');
		const now = dayjs().format('HH:mm DD/MM/YYYY');
		setApps(
			apps.map((a) =>
				selectedAppKeys.includes(a.id)
					? {
							...a,
							status: 'Rejected',
							rejectReason,
							history: [...a.history, { action: 'Rejected', timestamp: now, reason: rejectReason, by: 'Admin' }],
					  }
					: a,
			),
		);
		message.success(`Đã từ chối ${selectedAppKeys.length} đơn`);
		setIsRejectModalOpen(false);
		setSelectedAppKeys([]);
		setRejectReason('');
	};

	const appColumns: ColumnsType<Application> = [
		{ title: 'Họ tên', dataIndex: 'fullName' },
		{ title: 'Email', dataIndex: 'email' },
		{ title: 'CLB Đăng ký', dataIndex: 'clubId', render: (id) => clubs.find((c) => c.id === id)?.name },
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			render: (status) => (
				<Tag color={status === 'Approved' ? 'green' : status === 'Rejected' ? 'red' : 'orange'}>{status}</Tag>
			),
		},
		{
			title: 'Lịch sử',
			render: (_, record) => (
				<Popover
					title='Lịch sử'
					trigger='click'
					content={
						<List
							size='small'
							dataSource={record.history}
							renderItem={(item) => (
								<List.Item>
									[{item.timestamp}] {item.by} {item.action} {item.reason && `- ${item.reason}`}
								</List.Item>
							)}
						/>
					}
				>
					<Button size='small'>Xem</Button>
				</Popover>
			),
		},
		{
			title: 'Thao tác',
			render: (_, record) => (
				<Space>
					<Button
						type='link'
						disabled={record.status !== 'Pending'}
						onClick={() => handleApprove([record.id])}
						icon={<CheckCircleOutlined />}
					/>
					<Button
						type='link'
						danger
						disabled={record.status !== 'Pending'}
						onClick={() => {
							setSelectedAppKeys([record.id]);
							setIsRejectModalOpen(true);
						}}
						icon={<CloseCircleOutlined />}
					/>
				</Space>
			),
		},
	];

	const [selectedMemberKeys, setSelectedMemberKeys] = useState<React.Key[]>([]);
	const [filterClubId, setFilterClubId] = useState<string>('all');
	const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
	const [targetClubId, setTargetClubId] = useState<string>('');

	const approvedMembers = useMemo(() => {
		let members = apps.filter((a) => a.status === 'Approved');
		if (filterClubId !== 'all') members = members.filter((m) => m.clubId === filterClubId);
		return members;
	}, [apps, filterClubId]);

	const handleMoveClub = () => {
		if (!targetClubId) return message.error('Chọn CLB đích!');
		setApps(apps.map((a) => (selectedMemberKeys.includes(a.id) ? { ...a, clubId: targetClubId } : a)));
		message.success(`Đã chuyển ${selectedMemberKeys.length} thành viên`);
		setIsMoveModalOpen(false);
		setSelectedMemberKeys([]);
	};

	const chartData = useMemo(() => {
		const data: any[] = [];
		clubs.forEach((club) => {
			['Pending', 'Approved', 'Rejected'].forEach((status) => {
				data.push({
					clubName: club.name,
					status: status,
					count: apps.filter((a) => a.clubId === club.id && a.status === status).length,
				});
			});
		});
		return data;
	}, [apps, clubs]);

	const chartConfig = {
		data: chartData,
		xField: 'clubName',
		yField: 'count',
		seriesField: 'status',
		isGroup: true,
		color: ['#faad14', '#52c41a', '#ff4d4f'],
	};

	return (
		<Layout style={{ minHeight: '100vh', padding: '24px', background: '#f0f2f5' }}>
			<Content>
				<Card title={<h2>HỆ THỐNG QUẢN LÝ CÂU LẠC BỘ - TH05</h2>} bordered={false} style={{ minHeight: '80vh' }}>
					<Tabs defaultActiveKey='1' destroyInactiveTabPane>
						<Tabs.TabPane tab='1. Danh sách CLB' key='1'>
							<Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
								<Button
									type='primary'
									onClick={() => {
										clubForm.resetFields();
										setIsClubModalOpen(true);
									}}
								>
									+ Thêm mới CLB
								</Button>
								<Input
									prefix={<SearchOutlined />}
									placeholder='Tìm tên CLB...'
									onChange={(e) => setSearchText(e.target.value)}
								/>
							</Space>
							<Table columns={clubColumns} dataSource={filteredClubs} rowKey='id' />

							<Modal
								title='Câu Lạc Bộ'
								open={isClubModalOpen}
								onOk={() => clubForm.submit()}
								onCancel={() => setIsClubModalOpen(false)}
							>
								<Form form={clubForm} onFinish={handleSaveClub} layout='vertical'>
									<Form.Item name='id' hidden>
										<Input />
									</Form.Item>
									<Form.Item name='avatar' label='Ảnh đại diện (Emoji/URL)'>
										<Input />
									</Form.Item>
									<Form.Item name='name' label='Tên CLB' rules={[{ required: true }]}>
										<Input />
									</Form.Item>
									<Form.Item name='foundedDate' label='Ngày thành lập' rules={[{ required: true }]}>
										<DatePicker style={{ width: '100%' }} />
									</Form.Item>
									<Form.Item name='president' label='Chủ nhiệm'>
										<Input />
									</Form.Item>
									<Form.Item name='description' label='Mô tả (HTML)'>
										<TextArea rows={3} />
									</Form.Item>
									<Form.Item name='isActive' label='Đang hoạt động' valuePropName='checked' initialValue={true}>
										<Switch />
									</Form.Item>
								</Form>
							</Modal>
						</Tabs.TabPane>

						<Tabs.TabPane tab='2. Đơn đăng ký' key='2'>
							<Space style={{ marginBottom: 16 }}>
								<Button
									type='primary'
									disabled={selectedAppKeys.length === 0}
									onClick={() => handleApprove(selectedAppKeys as string[])}
								>
									Duyệt {selectedAppKeys.length} đơn
								</Button>
								<Button danger disabled={selectedAppKeys.length === 0} onClick={() => setIsRejectModalOpen(true)}>
									Từ chối {selectedAppKeys.length} đơn
								</Button>
							</Space>
							<Table
								rowSelection={{
									selectedRowKeys: selectedAppKeys,
									onChange: setSelectedAppKeys,
									getCheckboxProps: (record) => ({ disabled: record.status !== 'Pending' }),
								}}
								columns={appColumns}
								dataSource={apps}
								rowKey='id'
							/>

							<Modal
								title='Lý do từ chối'
								open={isRejectModalOpen}
								onOk={handleReject}
								onCancel={() => setIsRejectModalOpen(false)}
							>
								<TextArea
									rows={4}
									placeholder='Nhập lý do bắt buộc...'
									value={rejectReason}
									onChange={(e) => setRejectReason(e.target.value)}
								/>
							</Modal>
						</Tabs.TabPane>

						<Tabs.TabPane tab='3. Thành viên' key='3'>
							<Space style={{ marginBottom: 16 }}>
								<Select value={filterClubId} onChange={setFilterClubId} style={{ width: 200 }}>
									<Option value='all'>-- Tất cả CLB --</Option>
									{clubs.map((c) => (
										<Option key={c.id} value={c.id}>
											{c.name}
										</Option>
									))}
								</Select>
								<Button
									type='primary'
									disabled={selectedMemberKeys.length === 0}
									onClick={() => setIsMoveModalOpen(true)}
								>
									Đổi CLB cho {selectedMemberKeys.length} người
								</Button>
							</Space>
							<Table
								rowSelection={{ selectedRowKeys: selectedMemberKeys, onChange: setSelectedMemberKeys }}
								columns={appColumns.slice(0, 4)}
								dataSource={approvedMembers}
								rowKey='id'
							/>

							<Modal
								title='Chuyển CLB'
								open={isMoveModalOpen}
								onOk={handleMoveClub}
								onCancel={() => setIsMoveModalOpen(false)}
							>
								<Select style={{ width: '100%' }} placeholder='Chọn CLB mới' onChange={setTargetClubId}>
									{clubs.map((c) => (
										<Option key={c.id} value={c.id}>
											{c.name}
										</Option>
									))}
								</Select>
							</Modal>
						</Tabs.TabPane>

						<Tabs.TabPane tab='4. Báo cáo' key='4'>
							<Row gutter={16} style={{ marginBottom: 24 }}>
								<Col span={6}>
									<Card>
										<Statistic title='Tổng CLB' value={clubs.length} />
									</Card>
								</Col>
								<Col span={6}>
									<Card>
										<Statistic
											title='Pending'
											value={apps.filter((a) => a.status === 'Pending').length}
											valueStyle={{ color: '#faad14' }}
										/>
									</Card>
								</Col>
								<Col span={6}>
									<Card>
										<Statistic
											title='Approved'
											value={apps.filter((a) => a.status === 'Approved').length}
											valueStyle={{ color: '#52c41a' }}
										/>
									</Card>
								</Col>
								<Col span={6}>
									<Card>
										<Statistic
											title='Rejected'
											value={apps.filter((a) => a.status === 'Rejected').length}
											valueStyle={{ color: '#ff4d4f' }}
										/>
									</Card>
								</Col>
							</Row>
							<Card title='Biểu đồ trạng thái đơn theo CLB'>
								<div style={{ height: 400 }}>
									<Column {...chartConfig} />
								</div>
							</Card>
						</Tabs.TabPane>
					</Tabs>
				</Card>
			</Content>
		</Layout>
	);
};

export default App;
