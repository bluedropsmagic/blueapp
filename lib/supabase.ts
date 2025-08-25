import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';

// Supabase credentials - suas novas credenciais
const supabaseUrl = 'https://pvjtvoefgprtvculhfpw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2anR2b2VmZ3BydHZjdWxoZnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MjYxOTEsImV4cCI6MjA3MTMwMjE5MX0.-fbr2wnhf6Ry6-4yUYfTqx4A5XNUBEBB4Awm2ciPME8';

// Validar credenciais
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Credenciais do Supabase estão faltando');
  throw new Error('Erro de configuração do Supabase');
}

console.log('🔧 Configurando Supabase para Expo...');
console.log('📍 Supabase URL:', supabaseUrl);
console.log('🔑 Supabase Key configurada:', supabaseAnonKey ? 'Sim' : 'Não');

// Adapter de storage compatível com Expo
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        return localStorage.getItem(key);
      } else if (Platform.OS === 'web') {
        // Contexto de server-side rendering
        return null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn('Erro no storage getItem:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.setItem(key, value);
        return Promise.resolve();
      } else if (Platform.OS === 'web') {
        // Contexto de server-side rendering
        return Promise.resolve();
      }
      return await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn('Erro no storage setItem:', error);
      return Promise.resolve();
    }
  },
  removeItem: async (key: string) => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.removeItem(key);
        return Promise.resolve();
      } else if (Platform.OS === 'web') {
        // Contexto de server-side rendering
        return Promise.resolve();
      }
      return await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn('Erro no storage removeItem:', error);
      return Promise.resolve();
    }
  },
};

// Criar cliente Supabase com configuração específica para Expo
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Importante para Expo
    flowType: 'pkce', // Usar PKCE para melhor segurança
    debug: __DEV__, // Habilitar debug em desenvolvimento
  },
  global: {
    headers: {
      'X-Client-Info': 'blueapp-expo@1.0.0',
      'apikey': supabaseAnonKey,
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Tipos do banco de dados
export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Dose {
  id: string;
  user_id: string;
  dose_type: string;
  taken_at: string;
  created_at: string;
}

// Função helper para obter ou criar perfil do usuário com segurança
export const getOrCreateProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log('🔍 Obtendo perfil para usuário:', userId);
    
    // Primeiro, verificar se a sessão do usuário ainda é válida
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Erro ao verificar sessão do usuário:', userError);
      
      // Se for erro de JWT, lançar para acionar limpeza da sessão
      if (userError.message?.includes('JWT') || 
          userError.message?.includes('user_not_found') || 
          userError.message?.includes('invalid_token')) {
        throw new Error('Sessão inválida detectada');
      }
      
      return null;
    }

    if (!user || user.id !== userId) {
      console.error('❌ ID do usuário não confere ou usuário não encontrado');
      throw new Error('Verificação do usuário falhou');
    }

    console.log('✅ Sessão do usuário verificada');

    // Tentar obter perfil existente usando a função segura
    const { data: profiles, error: functionError } = await supabase
      .rpc('get_or_create_profile', { user_uuid: userId });

    if (functionError) {
      console.warn('⚠️ Função RPC falhou, tentando consulta direta:', functionError);
      
      // Fallback para consulta direta
      const { data: directProfile, error: directError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (directError) {
        console.error('❌ Consulta direta do perfil falhou:', directError);
        return null;
      }

      if (directProfile) {
        console.log('✅ Perfil encontrado via consulta direta');
        return directProfile;
      }

      // Se não existe perfil, criar um
      console.log('📝 Criando novo perfil...');
      const newProfile = {
        user_id: userId,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
        email: user.email || '',
        avatar_url: user.user_metadata?.avatar_url || null,
      };

      const { data: createdProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro ao criar perfil:', insertError);
        return null;
      }

      console.log('✅ Perfil criado com sucesso');
      return createdProfile;
    }

    if (profiles && profiles.length > 0) {
      console.log('✅ Perfil obtido via função RPC');
      return profiles[0];
    }

    console.warn('⚠️ Nenhum perfil encontrado e função RPC retornou vazio');
    return null;
  } catch (error) {
    console.error('❌ Erro inesperado em getOrCreateProfile:', error);
    
    // Se for erro relacionado à sessão, relançar para acionar limpeza
    if (error?.message?.includes('Sessão inválida') || 
        error?.message?.includes('Verificação do usuário falhou')) {
      throw error;
    }
    
    return null;
  }
};

// Função helper para atualizar perfil do usuário
export const updateUserProfile = async (userId: string, updates: Partial<Profile>): Promise<boolean> => {
  try {
    console.log('📝 Atualizando perfil para usuário:', userId);
    
    // Verificar sessão antes de atualizar
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user || user.id !== userId) {
      console.error('❌ Verificação de sessão falhou para atualização do perfil');
      return false;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      return false;
    }

    console.log('✅ Perfil atualizado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro inesperado ao atualizar perfil:', error);
    return false;
  }
};

// Função helper para adicionar registro de dose
export const addDoseRecord = async (userId: string, doseType: string): Promise<boolean> => {
  try {
    console.log('💊 Adicionando registro de dose:', { userId, doseType });
    
    const { error } = await supabase
      .from('doses')
      .insert([{
        user_id: userId,
        dose_type: doseType,
        taken_at: new Date().toISOString(),
      }]);

    if (error) {
      console.error('❌ Erro ao adicionar registro de dose:', error);
      return false;
    }

    console.log('✅ Registro de dose adicionado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro inesperado ao adicionar dose:', error);
    return false;
  }
};

// Função helper para obter doses do usuário
export const getUserDoses = async (userId: string, limit = 100): Promise<Dose[]> => {
  try {
    console.log('📊 Buscando doses para usuário:', userId);
    
    const { data, error } = await supabase
      .from('doses')
      .select('*')
      .eq('user_id', userId)
      .order('taken_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Erro ao buscar doses:', error);
      return [];
    }

    console.log('✅ Doses buscadas com sucesso:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar doses:', error);
    return [];
  }
};

// Função helper para verificar se a sessão é válida
export const isSessionValid = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      console.log('❌ Nenhuma sessão válida encontrada');
      return false;
    }

    // Tentar verificar o usuário
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    const isValid = !userError && !!user;
    console.log(isValid ? '✅ Sessão é válida' : '❌ Sessão é inválida');
    return isValid;
  } catch (error) {
    console.error('❌ Erro ao verificar validade da sessão:', error);
    return false;
  }
};

// Função helper para limpar sessão inválida
export const clearInvalidSession = async (): Promise<void> => {
  try {
    console.log('🧹 Limpando sessão inválida...');
    
    await supabase.auth.signOut();
    
    // Limpar localStorage
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    console.log('✅ Sessão inválida limpa');
  } catch (error) {
    console.error('❌ Erro ao limpar sessão inválida:', error);
  }
};

// Teste de conexão aprimorado com diagnósticos detalhados
export const testConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 Testando conexão com Supabase...');
    console.log('📍 URL:', supabaseUrl);
    console.log('🔑 Tamanho da chave:', supabaseAnonKey.length);
    console.log('🌐 Plataforma:', Platform.OS);
    
    // Teste 1: Conexão básica
    console.log('🧪 Teste 1: Conexão básica...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (healthError) {
      console.error('❌ Conexão básica falhou:', healthError);
      console.error('📋 Detalhes do erro:', {
        message: healthError.message,
        details: healthError.details,
        hint: healthError.hint,
        code: healthError.code
      });
      
      // Verificar se é erro de tabela não encontrada
      if (healthError.code === '42P01') {
        console.error('🚨 TABELAS NÃO ENCONTRADAS! Você precisa executar as migrações do banco no Supabase.');
        console.error('📝 Vá para o dashboard do Supabase > SQL Editor e execute os arquivos de migração.');
        return false;
      }
      
      return false;
    }

    console.log('✅ Conexão básica bem-sucedida');

    // Teste 2: Conexão de autenticação
    console.log('🧪 Teste 2: Conexão de autenticação...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.warn('⚠️ Verificação de sessão falhou (normal se não estiver logado):', sessionError.message);
    } else {
      console.log('✅ Conexão de autenticação bem-sucedida');
      console.log('👤 Sessão atual:', session ? 'Ativa' : 'Nenhuma');
    }

    // Teste 3: Verificação do schema do banco
    console.log('🧪 Teste 3: Verificação do schema do banco...');
    const { data: tables, error: schemaError } = await supabase
      .rpc('get_or_create_profile', { user_uuid: '00000000-0000-0000-0000-000000000000' })
      .limit(0); // Não executar realmente, apenas testar se a função existe

    if (schemaError && schemaError.code === '42883') {
      console.warn('⚠️ Função do banco não encontrada - migrações podem não ter sido aplicadas');
    } else if (schemaError && schemaError.code !== '22P02') { // Ignorar erro de UUID inválido
      console.warn('⚠️ Aviso na verificação do schema:', schemaError.message);
    } else {
      console.log('✅ Schema do banco parece estar correto');
    }

    console.log('🎉 Teste de conexão com Supabase concluído com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro inesperado no teste de conexão:', error);
    console.error('🔍 Tipo do erro:', typeof error);
    console.error('📋 Detalhes do erro:', error);
    return false;
  }
};

// Inicializar teste de conexão no carregamento do módulo (apenas em desenvolvimento)
if (__DEV__) {
  // Executar teste de conexão após um pequeno delay para evitar bloquear o startup do app
  setTimeout(() => {
    testConnection().catch(error => {
      console.error('❌ Teste inicial de conexão falhou:', error);
    });
  }, 2000);
}