import React, { useState, useEffect } from 'react';
// @ts-ignore: Umi resolves react-router-dom to v5 at runtime, ignoring v6 type defs
import { BrowserRouter as Router, Switch, Route, Link, useParams, useHistory } from 'react-router-dom';
import {
	Layout,
	Menu,
	Card,
	List,
	Input,
	Tag,
	Table,
	Button,
	Space,
	Popconfirm,
	Modal,
	Form,
	Select,
	Typography,
	Row,
	Col,
	Avatar,
	message,
} from 'antd';
import {
	EditOutlined,
	DeleteOutlined,
	PlusOutlined,
	UserOutlined,
	GithubOutlined,
	LinkedinOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

interface TagType {
	id: string;
	name: string;
	usageCount: number;
}

interface PostType {
	id: string;
	title: string;
	slug: string;
	summary: string;
	content: string;
	thumbnail: string;
	author: string;
	createdAt: string;
	tags: TagType[];
	views: number;
	status: 'draft' | 'published';
}

const mockTags: TagType[] = [
	{ id: 't1', name: 'React', usageCount: 5 },
	{ id: 't2', name: 'TypeScript', usageCount: 3 },
	{ id: 't3', name: 'Frontend', usageCount: 8 },
];

const mockPosts: PostType[] = [
	{
		id: '1',
		title: 'Bắt đầu với React và TypeScript',
		slug: 'bat-dau-voi-react-typescript',
		summary: 'Hướng dẫn cơ bản cách thiết lập dự án React với TypeScript.',
		content:
			'### Chào mừng đến với bài viết\n\nĐây là nội dung được render bằng **Markdown**.\n\n- Dễ đọc\n- Dễ viết\n- Hỗ trợ code block:\n\n```tsx\nconst App = () => <div>Hello World</div>;\n```',
		thumbnail: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png',
		author: 'Admin',
		createdAt: '2023-10-25',
		tags: [mockTags[0], mockTags[1]],
		views: 120,
		status: 'published',
	},
	{
		id: '2',
		title: 'Tại sao nên dùng Ant Design?',
		slug: 'tai-sao-nen-dung-ant-design',
		summary: 'Ant Design giúp tăng tốc độ phát triển UI một cách đáng kể.',
		content: 'Nội dung bài viết về Ant Design...',
		thumbnail: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png',
		author: 'Admin',
		createdAt: '2023-10-26',
		tags: [mockTags[2]],
		views: 85,
		status: 'published',
	},
];

const HomePage: React.FC<{ posts: PostType[] }> = ({ posts }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [debouncedTerm, setDebouncedTerm] = useState('');

	useEffect(() => {
		const timerId = setTimeout(() => {
			setDebouncedTerm(searchTerm);
		}, 300);
		return () => clearTimeout(timerId);
	}, [searchTerm]);

	const filteredPosts = posts.filter(
		(post) => post.status === 'published' && post.title.toLowerCase().includes(debouncedTerm.toLowerCase()),
	);

	return (
		<div>
			<div style={{ marginBottom: 24 }}>
				<Input.Search
					placeholder='Tìm kiếm bài viết...'
					onChange={(e) => setSearchTerm(e.target.value)}
					style={{ maxWidth: 400 }}
					size='large'
				/>
			</div>

			<List
				grid={{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
				pagination={{ pageSize: 9 }}
				dataSource={filteredPosts}
				renderItem={(post) => (
					<List.Item>
						<Link to={`/post/${post.slug}`}>
							<Card
								hoverable
								cover={<img alt={post.title} src={post.thumbnail} style={{ height: 200, objectFit: 'cover' }} />}
							>
								<Meta title={post.title} description={post.summary} />
								<div style={{ marginTop: 16 }}>
									{post.tags.map((tag) => (
										<Tag key={tag.id} color='blue'>
											{tag.name}
										</Tag>
									))}
								</div>
								<div
									style={{
										marginTop: 12,
										display: 'flex',
										justifyContent: 'space-between',
										fontSize: '12px',
										color: '#888',
									}}
								>
									<span>{post.createdAt}</span>
									<span>{post.views} lượt xem</span>
								</div>
							</Card>
						</Link>
					</List.Item>
				)}
			/>
		</div>
	);
};

const PostDetail: React.FC<{ posts: PostType[] }> = ({ posts }) => {
	const { slug } = useParams<{ slug: string }>();
	const history = useHistory();
	const post = posts.find((p) => p.slug === slug);

	if (!post) return <div>Không tìm thấy bài viết!</div>;

	return (
		<div style={{ maxWidth: 800, margin: '0 auto', background: '#fff', padding: 32, borderRadius: 8 }}>
			<Button onClick={() => history.goBack()} style={{ marginBottom: 16 }}>
				Quay lại
			</Button>
			<Title level={2}>{post.title}</Title>
			<div style={{ marginBottom: 24, color: '#888' }}>
				<Space split={<Text type='secondary'>•</Text>}>
					<span>Tác giả: {post.author}</span>
					<span>{post.createdAt}</span>
					<span>Lượt xem: {post.views + 1} </span>
				</Space>
			</div>
			<div style={{ marginBottom: 24 }}>
				{post.tags.map((tag) => (
					<Tag key={tag.id} color='cyan'>
						{tag.name}
					</Tag>
				))}
			</div>
			<div className='markdown-body' style={{ fontSize: '16px', lineHeight: '1.8' }}>
				<ReactMarkdown>{post.content}</ReactMarkdown>
			</div>
		</div>
	);
};

const AboutPage: React.FC = () => {
	return (
		<Row justify='center' style={{ marginTop: 50 }}>
			<Col xs={24} md={12} style={{ textAlign: 'center', background: '#fff', padding: 40, borderRadius: 8 }}>
				<Avatar size={120} icon={<UserOutlined />} />
				<Title level={3} style={{ marginTop: 16 }}>
					Nguyễn Văn A
				</Title>
				<Paragraph type='secondary'>Frontend Developer | React Enthusiast</Paragraph>
				<Paragraph>
					Xin chào! Tôi là một lập trình viên đam mê xây dựng các ứng dụng web với trải nghiệm người dùng tuyệt vời.
					Blog này là nơi tôi chia sẻ kiến thức và hành trình học tập của mình.
				</Paragraph>
				<div style={{ marginTop: 20 }}>
					<Space size='large'>
						<Button type='link' icon={<GithubOutlined />} href='https://github.com' target='_blank'>
							GitHub
						</Button>
						<Button type='link' icon={<LinkedinOutlined />} href='https://linkedin.com' target='_blank'>
							LinkedIn
						</Button>
					</Space>
				</div>
			</Col>
		</Row>
	);
};

const ManagePosts: React.FC<{ posts: PostType[]; setPosts: React.Dispatch<React.SetStateAction<PostType[]>> }> = ({
	posts,
	setPosts,
}) => {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [form] = Form.useForm();

	const handleDelete = (id: string) => {
		setPosts(posts.filter((p) => p.id !== id));
		message.success('Đã xóa bài viết!');
	};

	const handleFinish = (values: any) => {
		message.success('Lưu bài viết thành công!');
		setIsModalVisible(false);
	};

	const columns = [
		{ title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			key: 'status',
			render: (status: string) => (
				<Tag color={status === 'published' ? 'green' : 'orange'}>{status === 'published' ? 'Đã đăng' : 'Bản nháp'}</Tag>
			),
		},
		{ title: 'Lượt xem', dataIndex: 'views', key: 'views' },
		{ title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt' },
		{
			title: 'Hành động',
			key: 'action',
			render: (_: any, record: PostType) => (
				<Space size='middle'>
					<Button
						icon={<EditOutlined />}
						onClick={() => {
							form.setFieldsValue(record);
							setIsModalVisible(true);
						}}
					/>
					<Popconfirm title='Xóa bài viết này?' onConfirm={() => handleDelete(record.id)} okText='Xóa' cancelText='Hủy'>
						<Button danger icon={<DeleteOutlined />} />
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div>
			<div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
				<Title level={3}>Quản lý bài viết</Title>
				<Button
					type='primary'
					icon={<PlusOutlined />}
					onClick={() => {
						form.resetFields();
						setIsModalVisible(true);
					}}
				>
					Thêm bài viết
				</Button>
			</div>
			<Table columns={columns} dataSource={posts} rowKey='id' />

			<Modal
				title='Thêm / Sửa bài viết'
				open={isModalVisible}
				onCancel={() => setIsModalVisible(false)}
				width={800}
				onOk={() => form.submit()}
			>
				<Form form={form} layout='vertical' onFinish={handleFinish}>
					<Form.Item name='title' label='Tiêu đề' rules={[{ required: true }]}>
						<Input />
					</Form.Item>
					<Form.Item name='slug' label='Slug' rules={[{ required: true }]}>
						<Input />
					</Form.Item>
					<Form.Item name='thumbnail' label='Ảnh đại diện (URL)'>
						<Input />
					</Form.Item>
					<Form.Item name='status' label='Trạng thái' initialValue='draft'>
						<Select>
							<Select.Option value='draft'>Bản nháp</Select.Option>
							<Select.Option value='published'>Đã đăng</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item name='content' label='Nội dung (Markdown)' rules={[{ required: true }]}>
						<Input.TextArea rows={10} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

const ManageTags: React.FC<{ tags: TagType[] }> = ({ tags }) => {
	const columns = [
		{ title: 'Tên Thẻ', dataIndex: 'name', key: 'name', render: (text: string) => <Tag color='blue'>{text}</Tag> },
		{ title: 'Số bài viết đang dùng', dataIndex: 'usageCount', key: 'usageCount' },
		{
			title: 'Hành động',
			key: 'action',
			render: () => (
				<Space size='middle'>
					<Button type='text' icon={<EditOutlined />} />
					<Button type='text' danger icon={<DeleteOutlined />} />
				</Space>
			),
		},
	];

	return (
		<div>
			<div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
				<Title level={3}>Quản lý Thẻ (Tags)</Title>
				<Button type='primary' icon={<PlusOutlined />}>
					Thêm Thẻ
				</Button>
			</div>
			<Table columns={columns} dataSource={tags} rowKey='id' />
		</div>
	);
};

const App: React.FC = () => {
	const [posts, setPosts] = useState<PostType[]>(mockPosts);
	const [tags] = useState<TagType[]>(mockTags);

	return (
		<Router>
			<Layout style={{ minHeight: '100vh' }}>
				<Header
					style={{ display: 'flex', alignItems: 'center', background: '#fff', borderBottom: '1px solid #f0f0f0' }}
				>
					<div style={{ fontSize: '24px', fontWeight: 'bold', marginRight: '40px' }}>
						<Link to='/' style={{ color: '#000' }}>
							MyBlog.
						</Link>
					</div>
					<Menu mode='horizontal' defaultSelectedKeys={['1']} style={{ flex: 1, border: 'none' }}>
						<Menu.Item key='1'>
							<Link to='/'>Trang chủ</Link>
						</Menu.Item>
						<Menu.Item key='2'>
							<Link to='/about'>Giới thiệu</Link>
						</Menu.Item>
						<Menu.SubMenu key='sub1' title='Quản lý (Admin)'>
							<Menu.Item key='3'>
								<Link to='/admin/posts'>Bài viết</Link>
							</Menu.Item>
							<Menu.Item key='4'>
								<Link to='/admin/tags'>Thẻ (Tags)</Link>
							</Menu.Item>
						</Menu.SubMenu>
					</Menu>
				</Header>

				<Content style={{ padding: '40px 50px', background: '#f5f5f5' }}>
					<Switch>
						<Route exact path='/'>
							<HomePage posts={posts} />
						</Route>
						<Route path='/post/:slug'>
							<PostDetail posts={posts} />
						</Route>
						<Route path='/about'>
							<AboutPage />
						</Route>
						<Route path='/admin/posts'>
							<ManagePosts posts={posts} setPosts={setPosts} />
						</Route>
						<Route path='/admin/tags'>
							<ManageTags tags={tags} />
						</Route>
					</Switch>
				</Content>

				<Footer style={{ textAlign: 'center' }}>
					MyBlog ©{new Date().getFullYear()} Created with React & Ant Design
				</Footer>
			</Layout>
		</Router>
	);
};

export default App;
