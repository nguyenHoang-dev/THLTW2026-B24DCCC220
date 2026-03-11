import React, { useState } from 'react';
import { Button, List, Result } from 'antd';

function OanTuTiGame() {
	const choiceLabels: Record<string, string> = {
		KEO: 'KÉO',
		BUA: 'BÚA',
		BAO: 'BAO',
	};

	const [result, setResult] = useState('');
	const [userChoice, setUserChoice] = useState('');
	const [computerChoice, setComputerChoice] = useState('');
	const [history, setHistory] = useState<{ user: string; computer: string; result: string }[]>([]);

	const handleClick = (choice: string) => {
		const choices = ['KEO', 'BUA', 'BAO'];
		const computer = choices[Math.floor(Math.random() * choices.length)];
		let roundResult = '';
		if (choice === computer) {
			roundResult = 'Hòa!';
		} else if (
			(choice === 'KEO' && computer === 'BAO') ||
			(choice === 'BUA' && computer === 'KEO') ||
			(choice === 'BAO' && computer === 'BUA')
		) {
			roundResult = 'Bạn thắng!';
		} else {
			roundResult = 'Bạn thua!';
		}

		setUserChoice(choice);
		setComputerChoice(computer);
		setResult(roundResult);
		setHistory((prev) => [{ user: choice, computer, result: roundResult }, ...prev]);
	};

	return (
		<div className='OanTuTiGame' style={{ textAlign: 'center', marginTop: '50px' }}>
			<h1>Oẳn Tù Tì</h1>
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'flex-start',
					gap: 40,
					marginTop: 24,
					flexWrap: 'wrap',
				}}
			>
				<div style={{ minWidth: 320, maxWidth: 420, width: '100%', textAlign: 'center' }}>
					<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
						<Button onClick={() => handleClick('KEO')}>KÉO</Button>
						<Button onClick={() => handleClick('BUA')}>BÚA</Button>
						<Button onClick={() => handleClick('BAO')}>BAO</Button>
					</div>

					{result && (
						<Result
							title={result}
							subTitle={`Bạn: ${choiceLabels[userChoice] || userChoice} - Máy: ${
								choiceLabels[computerChoice] || computerChoice
							}`}
							extra={
								<Button
									type='primary'
									key='console'
									onClick={() => {
										setResult('');
										setUserChoice('');
										setComputerChoice('');
									}}
								>
									Trở lại
								</Button>
							}
						/>
					)}
				</div>

				{history.length > 0 && (
					<div style={{ minWidth: 280, maxWidth: 400, width: '100%', textAlign: 'left' }}>
						<h3>Lịch sử ván đấu</h3>
						<List
							size='small'
							bordered
							dataSource={history}
							renderItem={(item, idx) => (
								<List.Item key={idx} style={{ padding: '8px 12px' }}>
									<span style={{ width: '100%' }}>
										Bạn: <strong>{choiceLabels[item.user] || item.user}</strong> - Máy:{' '}
										<strong>{choiceLabels[item.computer] || item.computer}</strong> → <em>{item.result}</em>
									</span>
								</List.Item>
							)}
						/>
					</div>
				)}
			</div>
		</div>
	);
}

export default OanTuTiGame;
