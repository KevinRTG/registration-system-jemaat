
export enum Gender {
  LakiLaki = 'Laki-laki',
  Perempuan = 'Perempuan'
}

export enum FamilyRelationship {
  KepalaKeluarga = 'Kepala Keluarga',
  Istri = 'Istri',
  Anak = 'Anak',
  OrangTua = 'Orang Tua',
  Lainnya = 'Lainnya'
}

export enum ChurchStatus {
  Baptis = 'Baptis',
  Sidi = 'Sidi',
  Keduanya = 'Baptis & Sidi',
  Belum = 'Belum'
}

export enum ServiceSector {
  A = 'Sektor A',
  B = 'Sektor B',
  C = 'Sektor C',
  D = 'Sektor D',
  E = 'Sektor E',
  Belum = 'Belum ada Sektor Wilayah'
}

export enum VerificationStatus {
  Pending = 'Pending',
  Verified = 'Verified',
  Rejected = 'Rejected'
}

export interface Jemaat {
  id: string;
  nama_lengkap: string;
  nik: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: Gender;
  hubungan_keluarga: FamilyRelationship;
  status_gerejawi: ChurchStatus;
}

export interface Keluarga {
  id: string;
  nomor_kk: string;
  alamat_kk: string;
  wilayah_pelayanan: ServiceSector;
  anggota: Jemaat[];
  registrationDate: string;
  status: VerificationStatus;
  verified_at?: string;
  verified_by?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  nik_kk?: string; // Optional karena admin mungkin tidak punya NIK KK di profile
  role: 'admin' | 'user';
}

export interface UserAccount {
  email: string;
  nik_kk: string;
  password: string;
  name: string;
}