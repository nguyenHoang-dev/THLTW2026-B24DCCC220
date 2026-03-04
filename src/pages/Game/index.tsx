import { useState } from 'react';
import { Card, Space, Button, Typography, InputNumber, Alert } from 'antd';

const { Paragraph } = Typography;

const TH01 = () => {
	const [targetNumber, setTargetNumber] = useState(Math.floor(Math.random() * 100) + 1);
	const [guess, setGuess] = useState<number | null>(1);
	const [attempts, setAttempts] = useState(0);
	const [message, setMessage] = useState('');
	const [isGameOver, setIsGameOver] = useState(false);

	const handleGuess = () => {
		if (guess === null) return;

		const newAttempts = attempts + 1;
		setAttempts(newAttempts);

		if (guess === targetNumber) {
			setMessage('Chúc mừng! Bạn đã đoán đúng!');
			setIsGameOver(true);
		} else if (newAttempts >= 10) {
			setMessage(`Bạn đã hết lượt! Số đúng là ${targetNumber}.`);
			setIsGameOver(true);
		} else if (guess < targetNumber) {
			setMessage('Bạn đoán quá thấp!');
		} else {
			setMessage('Bạn đoán quá cao!');
		}
	};

	const handleReset = () => {
		setTargetNumber(Math.floor(Math.random() * 100) + 1);
		setAttempts(0);
		setMessage('');
		setIsGameOver(false);
		setGuess(1);
	};

	return (
		<Card title='Trò Chơi Đoán Số' style={{ width: 500, margin: '50px auto', textAlign: 'center' }}>
			<Space direction='vertical' size='middle' style={{ width: '100%' }}>
				<Paragraph>
					Hãy đoán số từ 1 đến 100. Lượt đã đoán: <strong>{attempts}/10</strong>
				</Paragraph>

				<Space>
					<InputNumber
						min={1}
						max={100}
						value={guess}
						onChange={setGuess}
						disabled={isGameOver}
						onPressEnter={handleGuess}
						style={{ width: '300px' }}
					/>
					<Button type='primary' onClick={handleGuess} disabled={isGameOver}>
						Đoán
					</Button>
					<Button type='primary' onClick={handleReset}>
						Đặt lại
					</Button>
				</Space>

				{message && (
					<Alert
						message={message}
						type={message.includes('Chúc mừng') ? 'success' : 'error'}
						showIcon
						style={{ marginTop: 20 }}
					/>
				)}

				{isGameOver && <Button onClick={handleReset}>Chơi lại ván mới</Button>}
			</Space>
		</Card>
	);
};

export default TH01;
