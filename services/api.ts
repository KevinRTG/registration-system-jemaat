
import { createClient } from '@supabase/supabase-js';
import { Keluarga, User, UserAccount, VerificationStatus, Jemaat } from '../types';

/**
 * SERVICE LAYER (CONTROLLER)
 * Handles communication between Frontend and Supabase.
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yrippsqfwktctzlstinx.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_PpK4nm-S_re2rr0Bc6wDew_dkiKpwpb';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Emergency Admin Whitelist - Hardcoded for immediate access
const ADMIN_WHITELIST = ['vinez6660@gmail.com', 'admin@gkojemaatcibitung'];

// Helper to handle Supabase errors specifically RLS
const handleSupabaseError = (error: any, context: string) => {
  if (!error) return;
  console.error(`Error in ${context}:`, error);
  if (error.code === '42501') {
    throw new Error(`Izin Ditolak (RLS): Anda tidak memiliki akses untuk ${context}. Pastikan Policy Database sudah dikonfigurasi.`);
  }
  throw new Error(error.message);
};

export const apiService = {
  // --- AUTHENTICATION CONTROLLER ---
  auth: {
    syncSession: async (): Promise<User | null> => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          if (sessionError.message && (
             sessionError.message.includes("Refresh Token") || 
             sessionError.message.includes("refresh_token")
          )) {
            console.warn("Invalid Refresh Token detected. Clearing Supabase session.");
            await supabase.auth.signOut();
          }
          return null;
        }
        
        if (!session?.user) return null;

        const email = session.user.email?.toLowerCase().trim() || '';
        const isWhitelisted = ADMIN_WHITELIST.includes(email);

        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (isWhitelisted && (!profile || profile.role !== 'admin')) {
          const profileUpdate = {
            id: session.user.id,
            email: email,
            name: profile?.name || session.user.user_metadata?.name || 'Admin',
            role: 'admin'
          };
          
          await supabase.from('profiles').upsert(profileUpdate);
          await supabase.auth.updateUser({ data: { role: 'admin' } });
          
          const { data: refreshedProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          profile = refreshedProfile;
        }

        const finalRole = (isWhitelisted || (profile && profile.role === 'admin')) ? 'admin' : 'user';

        return {
          id: session.user.id,
          name: profile?.name || session.user.user_metadata?.name || 'User',
          email: profile?.email || email,
          nik_kk: profile?.nik_kk,
          role: finalRole as 'admin' | 'user'
        };
      } catch (err) {
        console.error("Sync error:", err);
        return null;
      }
    },

    login: async (email: string, password: string): Promise<User> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw new Error(error.message);
      
      const user = await apiService.auth.syncSession();
      if (!user) throw new Error("Gagal menyinkronkan profil jemaat.");
      return user;
    },

    register: async (data: UserAccount): Promise<User> => {
      const cleanEmail = data.email.trim().toLowerCase();
      const cleanNik = data.nik_kk.replace(/\D/g, '');
      
      // VALIDASI 1: Cek apakah NIK KK sudah terdaftar di table profiles
      // Ini mencegah satu NIK KK didaftarkan oleh banyak akun email
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('nik_kk', cleanNik)
        .maybeSingle();

      if (existingProfile) {
        throw new Error('NIK KK ini sudah terdaftar. Silakan login jika Anda sudah memiliki akun.');
      }

      // VALIDASI 2: Registrasi Auth (Supabase otomatis cek Email Unik)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail, 
        password: data.password,
        options: { data: { name: data.name, nik_kk: cleanNik, role: 'user' } }
      });

      if (authError) {
        // Mapping pesan error Supabase agar lebih user friendly
        if (authError.message.includes("User already registered") || authError.status === 422) {
            throw new Error("Alamat Email ini sudah terdaftar. Silakan login.");
        }
        throw new Error(authError.message);
      }
      
      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: authData.user.id,
          email: cleanEmail,
          name: data.name,
          nik_kk: cleanNik,
          role: 'user'
        });

        // Double check constraint database jika terjadi race condition
        if (profileError) {
           if (profileError.code === '23505') { // Postgres Unique Violation
              throw new Error("Data NIK atau Email sudah ada dalam sistem.");
           }
           handleSupabaseError(profileError, 'pembuatan profil');
        }
      }

      return {
        id: authData.user?.id || '',
        name: data.name,
        email: cleanEmail,
        nik_kk: cleanNik,
        role: 'user'
      };
    },

    logout: async (): Promise<void> => {
      await supabase.auth.signOut();
    },

    resetPassword: async (email: string): Promise<void> => {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw new Error(error.message);
    },

    updateProfile: async (userId: string, updates: any) => {
      const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
      if (error) handleSupabaseError(error, 'update profil');
    },

    updateAccount: async (params: { password?: string, name?: string }) => {
      const updates: any = {};
      if (params.password) updates.password = params.password;
      if (params.name) updates.data = { name: params.name };

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.auth.updateUser(updates);
        if (error) throw new Error(error.message);
      }
      
      if (params.name) {
         const { data: { user } } = await supabase.auth.getUser();
         if (user) {
             await supabase.from('profiles').update({ name: params.name }).eq('id', user.id);
         }
      }
    }
  },

  // --- FAMILY DATA ---
  families: {
    getAll: async (): Promise<Keluarga[]> => {
      const { data, error } = await supabase
        .from('families')
        .select(`*, anggota:members(*)`)
        .order('registration_date', { ascending: false });

      if (error) handleSupabaseError(error, 'mengambil data keluarga');
      return (data || []).map(f => ({ 
        ...f, 
        registrationDate: f.registration_date,
        status: f.status as VerificationStatus || VerificationStatus.Pending
      })) as Keluarga[];
    },

    getByKK: async (nomor_kk: string): Promise<Keluarga | null> => {
      const { data, error } = await supabase
        .from('families')
        .select(`*, anggota:members(*)`)
        .eq('nomor_kk', nomor_kk)
        .maybeSingle();

      if (error) handleSupabaseError(error, 'mencari data KK');
      if (!data) return null;
      return { 
        ...data, 
        registrationDate: data.registration_date,
        status: data.status as VerificationStatus || VerificationStatus.Pending
      } as Keluarga;
    },

    create: async (family: Keluarga, initialStatus: VerificationStatus = VerificationStatus.Pending): Promise<Keluarga> => {
      // Cek duplikasi nomor KK
      const { data: existing, error: checkError } = await supabase
        .from('families')
        .select('id')
        .eq('nomor_kk', family.nomor_kk)
        .maybeSingle();

      if (checkError) handleSupabaseError(checkError, 'cek duplikasi KK');
      if (existing) {
        throw new Error(`Nomor KK ${family.nomor_kk} sudah terdaftar di sistem.`);
      }

      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .insert([{
          nomor_kk: family.nomor_kk,
          alamat_kk: family.alamat_kk,
          wilayah_pelayanan: family.wilayah_pelayanan,
          status: initialStatus,
          registration_date: new Date().toISOString(),
          verified_at: initialStatus === VerificationStatus.Verified ? new Date().toISOString() : null
        }])
        .select().single();

      if (familyError) handleSupabaseError(familyError, 'menyimpan data keluarga');

      if (family.anggota.length > 0) {
        const membersToInsert = family.anggota.map(m => ({
          family_id: familyData.id,
          nama_lengkap: m.nama_lengkap,
          nik: m.nik,
          tempat_lahir: m.tempat_lahir,
          tanggal_lahir: m.tanggal_lahir,
          jenis_kelamin: m.jenis_kelamin,
          hubungan_keluarga: m.hubungan_keluarga,
          status_gerejawi: m.status_gerejawi,
          alamat_domisili: m.alamat_domisili || family.alamat_kk,
          status_pernikahan: m.status_pernikahan,
          nomor_telepon: m.nomor_telepon,
          email: m.email,
          pekerjaan: m.pekerjaan,
          golongan_darah: m.golongan_darah,
          catatan_pelayanan: m.catatan_pelayanan
        }));
        
        const { error: memberError } = await supabase.from('members').insert(membersToInsert);
        if (memberError) handleSupabaseError(memberError, 'menyimpan anggota keluarga');
      }
      return { ...familyData, registrationDate: familyData.registration_date };
    },

    update: async (id: string, updates: Partial<Keluarga>): Promise<void> => {
      const { error } = await supabase
        .from('families')
        .update({
          nomor_kk: updates.nomor_kk,
          alamat_kk: updates.alamat_kk,
          wilayah_pelayanan: updates.wilayah_pelayanan,
          status: updates.status
        })
        .eq('id', id);
      
      if (error) handleSupabaseError(error, 'memperbarui keluarga');
    },

    updateStatus: async (id: string, status: VerificationStatus, adminId?: string): Promise<void> => {
      const updateData: any = { status };
      
      if (status === VerificationStatus.Verified) {
        updateData.verified_at = new Date().toISOString();
        updateData.verified_by = adminId; 
      } else {
        updateData.verified_at = null;
        updateData.verified_by = null;
      }
      
      const { data, error } = await supabase
        .from('families')
        .update(updateData)
        .eq('id', id)
        .select('id, status');

      if (error) handleSupabaseError(error, 'memperbarui status');
      
      if (!data || data.length === 0) {
        throw new Error("Update gagal. Pastikan Anda memiliki hak akses Admin.");
      }
    },

    delete: async (id: string): Promise<void> => {
      const { error: memberError } = await supabase
        .from('members')
        .delete()
        .eq('family_id', id);

      if (memberError) handleSupabaseError(memberError, 'menghapus anggota');

      const { error: familyError } = await supabase
        .from('families')
        .delete()
        .eq('id', id);
      
      if (familyError) handleSupabaseError(familyError, 'menghapus keluarga');
    },

    addMember: async (familyId: string, member: Jemaat): Promise<Jemaat> => {
      const { data, error } = await supabase.from('members').insert([{
          family_id: familyId,
          nama_lengkap: member.nama_lengkap,
          nik: member.nik,
          tempat_lahir: member.tempat_lahir,
          tanggal_lahir: member.tanggal_lahir,
          jenis_kelamin: member.jenis_kelamin,
          hubungan_keluarga: member.hubungan_keluarga,
          status_gerejawi: member.status_gerejawi,
          alamat_domisili: member.alamat_domisili,
          status_pernikahan: member.status_pernikahan,
          nomor_telepon: member.nomor_telepon,
          email: member.email,
          pekerjaan: member.pekerjaan,
          golongan_darah: member.golongan_darah,
          catatan_pelayanan: member.catatan_pelayanan
        }]).select().single();
      
      if (error) handleSupabaseError(error, 'menambah anggota');
      return data as Jemaat;
    },
    
    updateMember: async (familyId: string, member: Jemaat): Promise<void> => {
      const { error } = await supabase.from('members').update({
          nama_lengkap: member.nama_lengkap,
          nik: member.nik,
          tempat_lahir: member.tempat_lahir,
          tanggal_lahir: member.tanggal_lahir,
          jenis_kelamin: member.jenis_kelamin,
          hubungan_keluarga: member.hubungan_keluarga,
          status_gerejawi: member.status_gerejawi,
          alamat_domisili: member.alamat_domisili,
          status_pernikahan: member.status_pernikahan,
          nomor_telepon: member.nomor_telepon,
          email: member.email,
          pekerjaan: member.pekerjaan,
          golongan_darah: member.golongan_darah,
          catatan_pelayanan: member.catatan_pelayanan
        }).eq('id', member.id);
      
      if (error) handleSupabaseError(error, 'memperbarui anggota');
    },

    deleteMember: async (familyId: string, memberId: string): Promise<void> => {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId);

      if (error) handleSupabaseError(error, 'menghapus anggota');
    }
  }
};
