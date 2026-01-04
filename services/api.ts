
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

export const apiService = {
  // --- AUTHENTICATION CONTROLLER ---
  auth: {
    syncSession: async (): Promise<User | null> => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          // Handle specific refresh token errors by clearing the session
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

        // Fetch current DB profile
        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        // Agresif: Jika email ada di whitelist tapi role di DB bukan admin, paksa update
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
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail, 
        password: data.password,
        options: { data: { name: data.name, nik_kk: cleanNik, role: 'user' } }
      });

      if (authError) throw new Error(authError.message);
      
      if (authData.user) {
        await supabase.from('profiles').upsert({
          id: authData.user.id,
          email: cleanEmail,
          name: data.name,
          nik_kk: cleanNik,
          role: 'user'
        });
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
      if (error) throw new Error(error.message);
    },

    updateAccount: async (params: { password?: string, name?: string }) => {
      const updates: any = {};
      if (params.password) updates.password = params.password;
      if (params.name) updates.data = { name: params.name };

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.auth.updateUser(updates);
        if (error) throw new Error(error.message);
      }
      
      // Sync profile table if name changed
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

      if (error) throw new Error(error.message);
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

      if (error) throw new Error(error.message);
      if (!data) return null;
      return { 
        ...data, 
        registrationDate: data.registration_date,
        status: data.status as VerificationStatus || VerificationStatus.Pending
      } as Keluarga;
    },

    create: async (family: Keluarga, initialStatus: VerificationStatus = VerificationStatus.Pending): Promise<Keluarga> => {
      // Cek duplikasi nomor KK
      const { data: existing } = await supabase
        .from('families')
        .select('id')
        .eq('nomor_kk', family.nomor_kk)
        .maybeSingle();

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

      if (familyError) throw new Error(familyError.message);

      if (family.anggota.length > 0) {
        const membersToInsert = family.anggota.map(m => ({
          family_id: familyData.id,
          nama_lengkap: m.nama_lengkap,
          nik: m.nik,
          tempat_lahir: m.tempat_lahir,
          tanggal_lahir: m.tanggal_lahir,
          jenis_kelamin: m.jenis_kelamin,
          hubungan_keluarga: m.hubungan_keluarga,
          status_gerejawi: m.status_gerejawi
        }));
        await supabase.from('members').insert(membersToInsert);
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
      
      if (error) throw new Error(`Gagal memperbarui data keluarga: ${error.message}`);
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

      if (error) {
        throw new Error(`Gagal update status: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        throw new Error("Update gagal. Pastikan Anda memiliki hak akses Admin.");
      }
    },

    delete: async (id: string): Promise<void> => {
      // Step 1: Hapus anggota secara eksplisit terlebih dahulu
      const { error: memberError } = await supabase
        .from('members')
        .delete()
        .eq('family_id', id);

      if (memberError) {
        console.error("Member deletion failed:", memberError);
        throw new Error(`Gagal menghapus data anggota keluarga: ${memberError.message}`);
      }

      // Step 2: Hapus keluarga tanpa .select() untuk menghindari error RLS RETURNING
      const { error: familyError } = await supabase
        .from('families')
        .delete()
        .eq('id', id);
      
      if (familyError) {
        console.error("Family deletion failed:", familyError);
        if (familyError.code === '42501') {
          throw new Error("Izin Ditolak (RLS): Anda tidak memiliki wewenang untuk menghapus data ini. Pastikan akun Anda terdaftar sebagai Admin di database.");
        }
        throw new Error(`Gagal menghapus data keluarga: ${familyError.message}`);
      }
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
          status_gerejawi: member.status_gerejawi
        }]).select().single();
      if (error) throw new Error(error.message);
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
          status_gerejawi: member.status_gerejawi
        }).eq('id', member.id);
      if (error) throw new Error(error.message);
    },

    deleteMember: async (familyId: string, memberId: string): Promise<void> => {
      // Sama seperti keluarga, hindari .select() untuk menghindari kendala RLS pada operasi DELETE
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId);

      if (error) {
        if (error.code === '42501') throw new Error("Izin Ditolak: Anda tidak memiliki akses untuk menghapus anggota keluarga.");
        throw new Error(`Gagal menghapus anggota: ${error.message}`);
      }
    }
  }
};
