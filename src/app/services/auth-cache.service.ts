import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserProfile {
  username: string;
  email: string;
}

const USER_PROFILES_KEY = 'user_profiles_cache'; // MUDANÇA: Agora é plural

@Injectable({
  providedIn: 'root'
})
export class AuthCacheService {
  private currentUserSubject: BehaviorSubject<UserProfile | null>;
  public currentUser: Observable<UserProfile | null>;

  constructor() {
    console.log('AuthCacheService constructor iniciado.');
    // Ao iniciar o serviço, tenta carregar o usuário atualmente logado (se houver)
    // O BehaviorSubject mantém APENAS o usuário logado no momento, não a lista completa.
    // A lista completa é gerenciada internamente nos métodos.
    this.currentUserSubject = new BehaviorSubject<UserProfile | null>(null); // Começa com null
    this.currentUser = this.currentUserSubject.asObservable();

    // Tentar restaurar o último usuário logado se ele existir na lista
    const storedLastLoggedInUser = localStorage.getItem('last_logged_in_user');
    if (storedLastLoggedInUser) {
      const allUsers = this.getAllStoredUsers();
      const lastUser = allUsers.find(u => u.username === storedLastLoggedInUser);
      if (lastUser) {
        this.currentUserSubject.next(lastUser);
      }
    }
    console.log('AuthCacheService constructor finalizado. Current user from cache:', this.currentUserValue);
  }

  // NOVO: Método auxiliar para obter TODOS os perfis armazenados
  private getAllStoredUsers(): UserProfile[] {
    const profilesString = localStorage.getItem(USER_PROFILES_KEY);
    if (profilesString) {
      try {
        return JSON.parse(profilesString) as UserProfile[];
      } catch (e) {
        console.error('Erro ao parsear a lista de perfis do cache. Cache corrompido?', e);
        localStorage.removeItem(USER_PROFILES_KEY); // Limpa lista corrompida
        return [];
      }
    }
    return [];
  }

  // NOVO: Método auxiliar para salvar TODOS os perfis
  private saveAllUsers(users: UserProfile[]): void {
    try {
      localStorage.setItem(USER_PROFILES_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Erro ao salvar a lista de perfis no localStorage:', e);
    }
  }

  public get currentUserValue(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  /**
   * Simula o registro/cadastro de um novo usuário no cache (adiciona à lista).
   * @param username O nome de usuário a ser registrado.
   * @param email O email a ser registrado.
   * @returns 'success' | 'username_taken' | 'email_taken'
   */
  register(username: string, email: string): 'success' | 'username_taken' | 'email_taken' {
    console.log('AuthCacheService.register iniciado para:', username);

    const allUsers = this.getAllStoredUsers();

    // Verificação de duplicidade na LISTA de usuários
    if (allUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      console.warn('Tentativa de registro com username já existente:', username);
      return 'username_taken';
    }
    if (allUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      console.warn('Tentativa de registro com email já existente:', email);
      return 'email_taken';
    }

    const newUser: UserProfile = { username, email };
    allUsers.push(newUser); // Adiciona o novo usuário à lista
    this.saveAllUsers(allUsers); // Salva a lista atualizada

    console.log('Usuário salvo na lista do localStorage para futuro login. NÃO logado automaticamente após o registro.');
    return 'success';
  }

  /**
   * Simula o login. Encontra o usuário na lista e define como atual.
   * @param username O nome de usuário a ser "logado".
   * @returns true se o login foi bem-sucedido, false caso contrário.
   */
  login(username: string): boolean {
    console.log('AuthCacheService.login iniciado para:', username);
    const allUsers = this.getAllStoredUsers();

    const foundUser = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (foundUser) {
      this.currentUserSubject.next(foundUser); // Define o usuário logado no BehaviorSubject
      localStorage.setItem('last_logged_in_user', foundUser.username); // Opcional: lembrar último usuário
      console.log('Login bem-sucedido via cache para:', username);
      return true;
    }

    console.warn('Usuário não encontrado na lista do cache ou username incorreto para login.');
    return false;
  }

  /**
   * Desloga o usuário atual, mas não remove seu perfil do cache (apenas da sessão).
   */
  logout(): void {
    console.log('AuthCacheService.logout iniciado.');
    this.currentUserSubject.next(null); // Define o usuário atual como null
    localStorage.removeItem('last_logged_in_user'); // Limpa o último usuário logado
    console.log('Usuário deslogado da sessão. Perfil ainda no cache.');
  }

  /**
   * Exclui um usuário específico da lista de perfis armazenados no cache.
   * Se o usuário a ser excluído for o usuário atualmente logado, ele também será deslogado.
   * @param usernameToDelete O nome de usuário do perfil a ser excluído.
   * @returns true se a exclusão foi bem-sucedida, false se o usuário não foi encontrado.
   */
  deleteAccount(usernameToDelete: string): boolean {
    console.log('AuthCacheService.deleteAccount iniciado para:', usernameToDelete);
    let allUsers = this.getAllStoredUsers();
    const initialLength = allUsers.length;

    allUsers = allUsers.filter(u => u.username.toLowerCase() !== usernameToDelete.toLowerCase());

    if (allUsers.length < initialLength) { // Se o comprimento diminuiu, significa que um usuário foi removido
      this.saveAllUsers(allUsers); // Salva a lista atualizada

      // Se o usuário excluído era o usuário logado atualmente, desloga-o.
      if (this.currentUserValue && this.currentUserValue.username.toLowerCase() === usernameToDelete.toLowerCase()) {
        this.logout(); // Chama logout para limpar o BehaviorSubject e 'last_logged_in_user'
      }
      console.log(`Usuário '${usernameToDelete}' excluído do cache.`);
      return true;
    }
    console.warn(`Usuário '${usernameToDelete}' não encontrado para exclusão.`);
    return false;
  }

  isLoggedIn(): boolean {
    return this.currentUserValue !== null;
  }
}
