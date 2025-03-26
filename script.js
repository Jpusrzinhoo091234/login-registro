document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const welcomePanel = document.getElementById('welcomePanel');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    
    const loginUsername = document.getElementById('loginUsername');
    const loginPassword = document.getElementById('loginPassword');
    const registerUsername = document.getElementById('registerUsername');
    const registerPassword = document.getElementById('registerPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    
    const loginSubmit = document.getElementById('loginSubmit');
    const registerSubmit = document.getElementById('registerSubmit');
    
    const loginMessage = document.getElementById('loginMessage');
    const registerMessage = document.getElementById('registerMessage');
    
    // Theme toggle elements
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Adicionar botões para exportar e importar dados
    const exportImportContainer = document.createElement('div');
    exportImportContainer.className = 'export-import-container';
    
    const exportBtn = document.createElement('button');
    exportBtn.id = 'exportBtn';
    exportBtn.className = 'export-btn';
    exportBtn.textContent = 'Exportar Dados';
    
    const importBtn = document.createElement('button');
    importBtn.id = 'importBtn';
    importBtn.className = 'import-btn';
    importBtn.textContent = 'Importar Dados';
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'fileInput';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    
    exportImportContainer.appendChild(exportBtn);
    exportImportContainer.appendChild(importBtn);
    exportImportContainer.appendChild(fileInput);
    
    document.querySelector('.form-container').appendChild(exportImportContainer);
    
    // Load data from logins.json and initialize app
    initializeApp();
    
    // Event Listeners
    loginBtn.addEventListener('click', () => {
        loginBtn.classList.add('active');
        registerBtn.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    });
    
    registerBtn.addEventListener('click', () => {
        registerBtn.classList.add('active');
        loginBtn.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });
    
    loginSubmit.addEventListener('click', handleLogin);
    registerSubmit.addEventListener('click', handleRegister);
    logoutBtn.addEventListener('click', handleLogout);
    exportBtn.addEventListener('click', exportUsers);
    importBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', importUsers);
    
    // Theme toggle event listener
    themeToggle.addEventListener('change', handleThemeToggle);
    
    // Functions
    async function initializeApp() {
        try {
            // Load data from logins.json
            const response = await fetch('logins.json');
            const data = await response.json();
            
            // Apply theme from saved settings
            if (data.theme === 'dark') {
                htmlElement.setAttribute('data-theme', 'dark');
                themeToggle.checked = true;
            } else {
                htmlElement.setAttribute('data-theme', 'light');
                themeToggle.checked = false;
            }
            
            // Check if user is already logged in
            checkLoginStatus();
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }
    
    function handleThemeToggle() {
        if (themeToggle.checked) {
            htmlElement.setAttribute('data-theme', 'dark');
            saveThemePreference('dark');
        } else {
            htmlElement.setAttribute('data-theme', 'light');
            saveThemePreference('light');
        }
    }
    
    async function saveThemePreference(theme) {
        try {
            // Load current data
            const response = await fetch('logins.json');
            const data = await response.json();
            
            // Update theme
            data.theme = theme;
            
            // Save back to logins.json
            await saveToLoginsJson(data);
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    }
    
    async function handleLogin() {
        // Reset message
        loginMessage.textContent = '';
        loginMessage.className = 'message';
        
        // Get input values
        const username = loginUsername.value.trim();
        const password = loginPassword.value;
        
        // Validate inputs
        if (!username || !password) {
            showMessage(loginMessage, 'Por favor, preencha todos os campos.', 'error');
            return;
        }
        
        try {
            // Get users from logins.json
            const response = await fetch('logins.json');
            const data = await response.json();
            const users = data.users || {};
            
            // Check if user exists and password matches
            if (!users[username]) {
                showMessage(loginMessage, 'Usuário não encontrado.', 'error');
                return;
            }
            
            if (users[username] !== password) {
                showMessage(loginMessage, 'Senha incorreta.', 'error');
                return;
            }
            
            // Login successful
            sessionStorage.setItem('currentUser', username);
            showMessage(loginMessage, 'Login realizado com sucesso!', 'success');
            
            // Show welcome panel
            setTimeout(() => {
                showWelcomePanel(username);
            }, 1000);
        } catch (error) {
            console.error('Error during login:', error);
            showMessage(loginMessage, 'Erro ao fazer login. Tente novamente.', 'error');
        }
    }
    
    async function handleRegister() {
        // Reset message
        registerMessage.textContent = '';
        registerMessage.className = 'message';
        
        // Get input values
        const username = registerUsername.value.trim();
        const password = registerPassword.value;
        const confirm = confirmPassword.value;
        
        // Validate inputs
        if (!username || !password || !confirm) {
            showMessage(registerMessage, 'Por favor, preencha todos os campos.', 'error');
            return;
        }
        
        if (password !== confirm) {
            showMessage(registerMessage, 'As senhas não coincidem.', 'error');
            return;
        }
        
        if (password.length < 6) {
            showMessage(registerMessage, 'A senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }
        
        try {
            // Get users from logins.json
            const response = await fetch('logins.json');
            const data = await response.json();
            const users = data.users || {};
            
            // Check if username already exists
            if (users[username]) {
                showMessage(registerMessage, 'Este nome de usuário já está em uso.', 'error');
                return;
            }
            
            // Add new user
            users[username] = password;
            data.users = users;
            
            // Save updated data to logins.json
            await saveToLoginsJson(data);
            
            // Registration successful
            showMessage(registerMessage, 'Cadastro realizado com sucesso!', 'success');
            
            // Clear form
            registerUsername.value = '';
            registerPassword.value = '';
            confirmPassword.value = '';
            
            // Switch to login form
            setTimeout(() => {
                loginBtn.click();
            }, 1500);
        } catch (error) {
            console.error('Error during registration:', error);
            showMessage(registerMessage, 'Erro ao cadastrar. Tente novamente.', 'error');
        }
    }
    
    function handleLogout() {
        sessionStorage.removeItem('currentUser');
        welcomePanel.classList.add('hidden');
        loginForm.classList.remove('hidden');
        loginBtn.classList.add('active');
        registerBtn.classList.remove('active');
        
        // Clear login form
        loginUsername.value = '';
        loginPassword.value = '';
        loginMessage.textContent = '';
        loginMessage.className = 'message';
    }
    
    function checkLoginStatus() {
        const currentUser = sessionStorage.getItem('currentUser');
        if (currentUser) {
            showWelcomePanel(currentUser);
        }
    }
    
    function showWelcomePanel(username) {
        usernameDisplay.textContent = username;
        loginForm.classList.add('hidden');
        registerForm.classList.add('hidden');
        welcomePanel.classList.remove('hidden');
        
        // Add the requested message
        const messageElement = document.createElement('p');
        messageElement.textContent = 'JHOST VAI TE COMER';
        messageElement.style.fontWeight = 'bold';
        messageElement.style.fontSize = '18px';
        messageElement.style.marginTop = '10px';
        messageElement.style.color = '#ff0000';
        
        // Remove any previous message if it exists
        const existingMessage = welcomePanel.querySelector('.jhost-message');
        if (existingMessage) {
            welcomePanel.removeChild(existingMessage);
        }
        
        messageElement.className = 'jhost-message';
        welcomePanel.insertBefore(messageElement, logoutBtn);
    }
    
    function showMessage(element, message, type) {
        element.textContent = message;
        element.className = `message ${type}`;
    }
    
    // Função para salvar dados no arquivo logins.json
    async function saveToLoginsJson(data) {
        try {
            const response = await fetch('logins.json', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data, null, 2)
            });
            
            if (!response.ok) {
                throw new Error('Failed to save data');
            }
            
            return true;
        } catch (error) {
            console.error('Error saving to logins.json:', error);
            return false;
        }
    }
    
    // Função para exportar usuários para um arquivo JSON
    async function exportUsers() {
        try {
            // Get users from logins.json
            const response = await fetch('logins.json');
            const data = await response.json();
            const users = data.users || {};
            
            if (Object.keys(users).length === 0) {
                alert('Não há usuários cadastrados para exportar.');
                return;
            }
            
            const dataStr = JSON.stringify(users, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            
            const exportFileDefaultName = 'usuarios.json';
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        } catch (error) {
            console.error('Error exporting users:', error);
            alert('Erro ao exportar usuários. Tente novamente.');
        }
    }
    
    // Função para importar usuários de um arquivo JSON
    function importUsers(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = async function(e) {
            try {
                const importedUsers = JSON.parse(e.target.result);
                
                // Verificar se o formato do arquivo é válido
                if (typeof importedUsers !== 'object' || importedUsers === null) {
                    throw new Error('Formato de arquivo inválido.');
                }
                
                // Get current data from logins.json
                const response = await fetch('logins.json');
                const data = await response.json();
                
                // Mesclar usuários importados com os atuais
                const mergedUsers = { ...data.users, ...importedUsers };
                data.users = mergedUsers;
                
                // Save updated data to logins.json
                const saveResult = await saveToLoginsJson(data);
                
                if (saveResult) {
                    alert(`Importação concluída com sucesso! ${Object.keys(importedUsers).length} usuários importados.`);
                } else {
                    alert('Erro ao salvar usuários importados.');
                }
                
                // Limpar o input de arquivo
                fileInput.value = '';
                
            } catch (error) {
                alert(`Erro ao importar usuários: ${error.message}`);
                fileInput.value = '';
            }
        };
        
        reader.readAsText(file);
    }
});