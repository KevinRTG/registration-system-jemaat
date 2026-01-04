
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

export enum MaritalStatus {
  BelumMenikah = 'Belum Menikah',
  Menikah = 'Menikah',
  Janda = 'Janda',
  Duda = 'Duda'
}

export enum BloodType {
  A = 'A',
  B = 'B',
  AB = 'AB',
  O = 'O',
  Unknown = '-'
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
  nik: string; // Maps to "Nomor Induk"
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: Gender;
  hubungan_keluarga: FamilyRelationship; // Maps to "Status Dalam Keluarga"
  status_gerejawi: ChurchStatus;
  
  // New Fields
  alamat_domisili?: string; // Maps to "Alamat" (Member specific)
  status_pernikahan?: MaritalStatus; // Maps to "Status"
  nomor_telepon?: string; // Maps to "Nomor Telepon"
  email?: string; // Maps to "E-mail"
  pekerjaan?: string; // Maps to "Pekerjaan/Usaha"
  golongan_darah?: BloodType; // Maps to "Gol. Darah"
  catatan_pelayanan?: string; // Maps to "Catatan Pelayanan"
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
