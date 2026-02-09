interface Post {
    userId: number;    
    id: number;        
    title: string;     
    body: string;      
}

// Interface para um favorito salvo no LocalStorage
interface Favorite {
    id: number;
    title: string;
    savedAt: string;   // data em que foi salvo
}


// CLASSE PRINCIPAL 

class DestinationExplorer {
    
    private currentPost: Post | null = null;  
    private favorites: Favorite[] = [];       
    private readonly STORAGE_KEY = 'explorer_favorites'; // Chave para o LocalStorage
    private searchTerm: string =''; 

    
    constructor() {
        this.init();
    }

    // INICIAR APLICAÇÃO
    private init(): void {
        
        console.log('Aplicação iniciada');
        
        this.loadFavoritesFromStorage();
        this.setupEventListeners();
        this.fetchRandomDestination();
    }

    
    // Eventos dos botões
  
    
    private setupEventListeners(): void {
        // Botão: Obter Localização
        const btnLocation = document.getElementById('btnLocation');
        btnLocation?.addEventListener('click', () => {
            this.getUserLocation();
        });

        // Botão: Buscar Novo Destino
        const btnNewDestination = document.getElementById('btnNewDestination');
        btnNewDestination?.addEventListener('click', () => {
            this.fetchRandomDestination();
        });

        // Botão: Salvar Favorito
        const btnSaveFavorite = document.getElementById('btnSaveFavorite');
        btnSaveFavorite?.addEventListener('click', () => {
            this.saveFavorite();
        });

        const searchInput = document.getElementById('searchInput') as HTMLInputElement;

        if(searchInput){
            searchInput.addEventListener('input', (event) => {
                const target = event.target as HTMLInputElement;
                this.searchTerm = target.value.toLowerCase();
                console.log('🔍buscando por:', this.searchTerm);
                this.toggleClearButton();
                this.displayFavorites();
            });
        }

        const btnClearSearch = document.getElementById('btnClearSearch');

        if(btnClearSearch){
            btnClearSearch.addEventListener('click', () => {
                this.clearSearch();
        });
    }
}

    private toggleClearButton(): void {
        const btnClearSearch = document.getElementById('btnClearSearch');
    
        if (!btnClearSearch) return;
    
    //mostrar botao se tiver texto
        if (this.searchTerm.trim() !== '') {
        btnClearSearch.classList.remove('hidden');
        } else {
            // Se não há texto, esconder botão
         btnClearSearch.classList.add('hidden');
    }
}

private clearSearch(): void {
    // 1. Limpar a propriedade searchTerm
    this.searchTerm = '';
    
    // 2. Limpar o input visualmente
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    
    if (searchInput) {
        searchInput.value = '';
        searchInput.focus(); // Opcional: foca no input após limpar
    }
    
    // 3. Esconder o botão de limpar
    this.toggleClearButton();
    
    // 4. Atualizar a lista (mostra todos os favoritos)
    this.displayFavorites();
    
    console.log('🧹 Busca limpa!');
}
   
    // Buscar dados da API 
    private async fetchRandomDestination(): Promise<void> {
        
        try {
            const randomId = Math.floor(Math.random() * 100) + 1;
            const url = `https://jsonplaceholder.typicode.com/posts/${randomId}`;
            
            console.log(` Buscando post ID: ${randomId}`);
            
            const response = await fetch(url);
            
            // Verificar se deu certo
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            const post: Post = await response.json();
            
            console.log('✅ Post recebido:', post);
            
            // Salvar post atual e exibir
            this.currentPost = post;
            this.displayDestination(post);
            
        } catch (error) {
            // Capturar erros
            console.error('Erro ao buscar destino:', error);
            alert('Erro ao buscar destino. Tente novamente!');
        }
    }

  
    // EXIBIR DESTINO NO HTML
    
    private displayDestination(post: Post): void {
        
        const destinationDisplay = document.getElementById('destinationDisplay');
        const destinationTitle = document.getElementById('destinationTitle');
        const destinationId = document.getElementById('destinationId');
        const destinationBody = document.getElementById('destinationBody');

        
        // Verificar se elementos existem
        if (destinationDisplay && destinationTitle && destinationId) {
            
            destinationDisplay.classList.remove('hidden');
            
           
            destinationTitle.textContent = post.title;
            destinationId.textContent = post.id.toString();
            destinationBody.textContent = post.body;
        }
    }

   
    // GEOLOCATION - Obter localização do usuário
   
    
    private getUserLocation(): void {
        // Verificar se o navegador suporta Geolocation
        if (!navigator.geolocation) {
            alert('Seu navegador não suporta Geolocalização!');
            return;
        }

        console.log(' Solicitando localização...');
        navigator.geolocation.getCurrentPosition(
            // Callback de sucesso
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                
                console.log('Localização obtida:', { latitude, longitude });
                
                this.displayLocation(latitude, longitude);
            },
            // Callback de erro
            (error) => {
                console.error('Erro ao obter localização:', error);
                
                // Mensagens de erro específicas
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        alert('Você negou o acesso à localização.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert('Localização indisponível.');
                        break;
                    case error.TIMEOUT:
                        alert('Tempo esgotado ao buscar localização.');
                        break;
                }
            }
        );
    }

    
    // EXIBIR LOCALIZAÇÃO NO HTML

    
    private displayLocation(latitude: number, longitude: number): void {
        const locationDisplay = document.getElementById('locationDisplay');
        const latElement = document.getElementById('latitude');
        const lngElement = document.getElementById('longitude');
        
        if (locationDisplay && latElement && lngElement) {
            locationDisplay.classList.remove('hidden');
            
           
            latElement.textContent = latitude.toFixed(6);
            lngElement.textContent = longitude.toFixed(6);
        }
    }

    
    // LOCALSTORAGE - Salvar favorito
    
    
    private saveFavorite(): void {
        // Verificar se há um post carregado
        if (!this.currentPost) {
            alert('Nenhum destino carregado!');
            return;
        }

        // Verificar se já está nos favoritos
        const alreadyExists = this.favorites.some(
            fav => fav.id === this.currentPost!.id
        );

        if (alreadyExists) {
            alert('Este destino já está nos favoritos!');
            return;
        }

        // Criar objeto favorito
        const favorite: Favorite = {
            id: this.currentPost.id,
            title: this.currentPost.title,
            savedAt: new Date().toLocaleString('pt-BR') // Data/hora atual
        };

       
        this.favorites.push(favorite);
        
        console.log(' Favorito salvo:', favorite);

        // Salvar no LocalStorage
        this.saveFavoritesToStorage();

        // Atualizar exibição
        this.displayFavorites();

        alert('Destino salvo nos favoritos!');
    }

    
    
    
    
    private saveFavoritesToStorage(): void {
        try {
            
            const jsonString = JSON.stringify(this.favorites);
            localStorage.setItem(this.STORAGE_KEY, jsonString);
            console.log('Favoritos salvos no LocalStorage');
        } catch (error) {
            console.error('Erro ao salvar no LocalStorage:', error);
        }
    }


    // LOCALSTORAGE - Carregar do navegador

    
    private loadFavoritesFromStorage(): void {
        try {
            
            const jsonString = localStorage.getItem(this.STORAGE_KEY);
            if (jsonString) {
                this.favorites = JSON.parse(jsonString);
                
                console.log('Favoritos carregados:', this.favorites);
                
                this.displayFavorites();
            }
        } catch (error) {
            console.error(' Erro ao carregar do LocalStorage:', error);
            this.favorites = [];
        }
    }

    
    // EXIBIR FAVORITOS NO HTML   
    private displayFavorites(): void {
        const favoritesList = document.getElementById('favoritesList');
        
        if (!favoritesList) return;

        // Limpar lista atual
        favoritesList.innerHTML = '';

        //Filtrar Favoritos
        let favoritesToDisplay = this.favorites;

        if(this.searchTerm.trim() !== ''){
            favoritesToDisplay = this.favorites.filter(fav => {
                const titleLower = fav.title.toLowerCase();
                //const searchLower = this.searchTerm.toLowerCase();
                return titleLower.includes(this.searchTerm);
            });
            console.log(`Encontrados: ${favoritesToDisplay.length} de ${this.favorites.length}` );
            console.log(favoritesToDisplay);
            
            
            }

            this.updateCounter(favoritesToDisplay.length, this.favorites.length);
            
        if (this.favorites.length === 0) {
            favoritesList.innerHTML = '<p class="empty-message">Nenhum favorito salvo ainda.</p>';
            return;
        }

        if (favoritesToDisplay.length === 0) {
            favoritesList.innerHTML = `
                <p class="empty-message">
                    Nenhum favorito encontrado para "${this.searchTerm}"
                </p>
            `;
            return;
        }

       favoritesToDisplay.forEach((favorite) => {
            const originalIndex = this.favorites.indexOf(favorite);
            const favoriteItem = document.createElement('div');
            favoriteItem.className = 'favorite-item';

            favoriteItem.innerHTML = `
                <div class="favorite-content">
                    <h4>${favorite.title}</h4>
                    <p>ID: ${favorite.id} | Salvo em: ${favorite.savedAt}</p>
                </div>
                <button class="btn btn-danger" data-index="${originalIndex}">🗑️Remover</button>

              
                
            `;
            const removeBtn = favoriteItem.querySelector('.btn-danger');
            removeBtn?.addEventListener('click', () => {
                this.removeFavorite(originalIndex);
            });

            favoritesList.appendChild(favoriteItem);
            
            console.log(this.favorites.length);


        });

       
    }

    private updateCounter(displayed: number, total: number): void {
        
        const counterDiv = document.getElementById('favoritesCounter');
        const countDisplayed = document.getElementById('countDisplayed');
        const countTotal = document.getElementById('countTotal');
        
        if (!counterDiv || !countDisplayed || !countTotal) return;
        
        //mudando cor filtrados
        if(displayed === total){
            counterDiv.style.borderLeftColor = '#f59e0b';
            countDisplayed.style.color = '#f59e0b';
        }else{
            counterDiv.style.borderLeftColor = '#6b7280';
            countDisplayed.style.color = '#6b7280';
        }
        // Esconder contador
        if (total === 0) {
            counterDiv.classList.add('hidden');
            return;
        }
        
        counterDiv.classList.remove('hidden');
        countDisplayed.textContent = displayed.toString();
        countTotal.textContent = total.toString();
        
        console.log(`Contador atualizado: ${displayed}/${total}`);
    }
    
    private removeFavorite(index: number): void {
        // Remover do array (splice remove 1 elemento na posição 'index')
        this.favorites.splice(index, 1);
        
        console.log('🗑️ Favorito removido');

        // Atualizar LocalStorage
        this.saveFavoritesToStorage();

        // Atualizar exibição
        this.displayFavorites();
    }

    
}

// INICIAR APLICAÇÃO
document.addEventListener('DOMContentLoaded', () => {

    new DestinationExplorer();
});
