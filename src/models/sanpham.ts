import { useState, useMemo } from 'react';

export interface SanPham {
	id: number;
	name: string;
	price: number;
	quantity: number;
}

export default () => {
	const [danhSachSanPham, setDanhSachSanPham] = useState([
		{ id: 1, name: 'Laptop Dell XPS 13', price: 25000000, quantity: 10 },
		{ id: 2, name: 'iPhone 15 Pro Max', price: 30000000, quantity: 15 },
		{ id: 3, name: 'Samsung Galaxy S24', price: 22000000, quantity: 20 },
		{ id: 4, name: 'iPad Air M2', price: 18000000, quantity: 12 },
		{ id: 5, name: 'MacBook Air M3', price: 28000000, quantity: 8 },
	]);

	const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState<string>('');

	const danhSachHienThi = useMemo(() => {
		return danhSachSanPham.filter((sp) => sp.name.toLowerCase().includes(tuKhoaTimKiem.toLowerCase()));
	}, [danhSachSanPham, tuKhoaTimKiem]);

	const xoaSanPham = (id: number) => {
		const newData = danhSachSanPham.filter((sp) => sp.id !== id);
		setDanhSachSanPham(newData);
	};

	const themSanPham = (sanPham: Omit<SanPham, 'id'>) => {
		const newId = danhSachSanPham.length > 0 ? Math.max(...danhSachSanPham.map((sp) => sp.id)) + 1 : 1;
		const newSanPham = { ...sanPham, id: newId };
		setDanhSachSanPham([...danhSachSanPham, newSanPham]);
	};

	return {
		danhSachHienThi,
		tuKhoaTimKiem,
		setTuKhoaTimKiem,
		danhSachSanPham,
		xoaSanPham,
		themSanPham,
	};
};
