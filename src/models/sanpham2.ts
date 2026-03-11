import { useState, useMemo } from 'react';

export interface SanPham2 {
	id: number;
	name: string;
	price: number;
	quantity: number;
	category: string;
}

export interface ChiTietDonHang {
	id: number;
	name: string;
	price: number;
	soLuongDat: number;
	category: string;
}

export interface ChiTietDon {
	id: number;
	name: string;
	price: number;
	soLuongDat: number;
}

export interface DonHang {
	id: string;
	tenKhach: string;
	sdt: string;
	diaChi: string;
	sanPham: ChiTietDon[];
	tongTien: number;
	trangThai: 'ChoXuLy' | 'DangGiao' | 'HoanThanh' | 'DaHuy';
	daTruKho: boolean;
	ngayTao: string;
}

export default () => {
	const [danhSach2, setDanhSach2] = useState([
		{ id: 1, name: 'Laptop Dell XPS 13', category: 'Laptop', price: 25000000, quantity: 15 },
		{ id: 2, name: 'iPhone 15 Pro Max', category: 'Điện thoại', price: 30000000, quantity: 8 },
		{ id: 3, name: 'Samsung Galaxy S24', category: 'Điện thoại', price: 22000000, quantity: 20 },
		{ id: 4, name: 'iPad Air M2', category: 'Máy tính bảng', price: 18000000, quantity: 5 },
		{ id: 5, name: 'MacBook Air M3', category: 'Laptop', price: 28000000, quantity: 12 },
		{ id: 6, name: 'AirPods Pro 2', category: 'Phụ kiện', price: 6000000, quantity: 0 },
		{ id: 7, name: 'Samsung Galaxy Tab S9', category: 'Máy tính bảng', price: 15000000, quantity: 7 },
		{ id: 8, name: 'Logitech MX Master 3', category: 'Phụ kiện', price: 25, quantity: 25 },
	]);

	const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState<string>('');

	const danhSachHienThi = useMemo(() => {
		return danhSach2.filter((sp) => sp.name.toLowerCase().includes(tuKhoaTimKiem.toLowerCase()));
	}, [danhSach2, tuKhoaTimKiem]);

	const xoaSanPham = (id: number) => {
		const newData = danhSach2.filter((sp) => sp.id !== id);
		setDanhSach2(newData);
	};

	const themSanPham = (sanPham: Omit<SanPham2, 'id'>) => {
		const newId = danhSach2.length > 0 ? Math.max(...danhSach2.map((sp) => sp.id)) + 1 : 1;
		const newSanPham = { ...sanPham, id: newId };
		setDanhSach2([...danhSach2, newSanPham]);
	};
	const [dsDonHang, setDsDonHang] = useState<DonHang[]>([]);

	const taoDonHang = (values: any, gioHang: ChiTietDon[]) => {
		const tongTien = gioHang.reduce((a, b) => a + b.price * b.soLuongDat, 0);
		const donMoi: DonHang = {
			id: `DH${Date.now()}`,
			tenKhach: values.tenKhach,
			sdt: values.sdt,
			diaChi: values.diaChi,
			sanPham: gioHang,
			tongTien: tongTien,
			trangThai: 'ChoXuLy',
			daTruKho: false,
			ngayTao: new Date().toLocaleDateString('vi-VN'),
		};
		setDsDonHang([donMoi, ...dsDonHang]);
	};

	const capNhatTrangThai = (maDon: string, trangThaiMoi: DonHang['trangThai']) => {
		const donHang = dsDonHang.find((d) => d.id === maDon);
		if (!donHang) return;

		let daTruKho = donHang.daTruKho;
		const khoMoi = [...danhSach2];

		if (trangThaiMoi === 'HoanThanh' && !daTruKho) {
			donHang.sanPham.forEach((item) => {
				const sp = khoMoi.find((s) => s.id === item.id);
				if (sp) sp.quantity -= item.soLuongDat;
			});
			daTruKho = true;
		} else if (trangThaiMoi === 'DaHuy' && daTruKho) {
			donHang.sanPham.forEach((item) => {
				const sp = khoMoi.find((s) => s.id === item.id);
				if (sp) sp.quantity += item.soLuongDat;
			});
			daTruKho = false;
		}

		setDanhSach2(khoMoi);

		setDsDonHang(dsDonHang.map((d) => (d.id === maDon ? { ...d, trangThai: trangThaiMoi, daTruKho } : d)));
	};

	return {
		danhSachHienThi,
		tuKhoaTimKiem,
		setTuKhoaTimKiem,
		xoaSanPham,
		themSanPham,
		danhSach2,
		setDanhSach2,
		taoDonHang,
		dsDonHang,
		capNhatTrangThai,
	};
};
