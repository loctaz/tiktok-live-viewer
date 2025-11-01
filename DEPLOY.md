# 🚀 Como Colocar o Site Online

Existem várias maneiras gratuitas de colocar seu site TikTok Live Viewer online. Aqui estão as opções mais simples:

## 🌐 Opção 1: Netlify (Recomendado)

### Método Drag & Drop (Mais Fácil)
1. Acesse [netlify.com](https://netlify.com)
2. Faça login ou crie uma conta gratuita
3. Na dashboard, clique em "Sites" → "Add new site" → "Deploy manually"
4. **Arraste toda a pasta `tiktok-live-viewer`** para a área de upload
5. Aguarde o deploy finalizar
6. Seu site estará online com uma URL como: `https://nome-aleatorio.netlify.app`

### Método GitHub (Automático)
1. Crie um repositório no GitHub
2. Faça upload dos arquivos do projeto
3. No Netlify, conecte com GitHub
4. Selecione o repositório
5. Deploy automático a cada mudança!

## 🌐 Opção 2: Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub, GitLab ou email
3. Clique em "New Project"
4. Faça upload da pasta ou conecte com GitHub
5. Deploy automático!

## 🌐 Opção 3: GitHub Pages

1. Crie um repositório no GitHub
2. Faça upload dos arquivos
3. Vá em Settings → Pages
4. Selecione "Deploy from a branch" → "main"
5. Seu site ficará em: `https://seuusuario.github.io/nome-do-repo`

## 🌐 Opção 4: Firebase Hosting

1. Instale Firebase CLI: `npm install -g firebase-tools`
2. Execute: `firebase login`
3. Execute: `firebase init hosting`
4. Execute: `firebase deploy`

## 📱 Opção 5: Surge.sh (Super Simples)

1. Instale: `npm install -g surge`
2. Na pasta do projeto, execute: `surge`
3. Siga as instruções
4. Site online em segundos!

## 🎯 Arquivos Necessários para Deploy

Certifique-se de que estes arquivos estão na pasta:
- ✅ `index.html`
- ✅ `styles.css` 
- ✅ `script.js`
- ✅ `netlify.toml` (para Netlify)
- ✅ `.gitignore` (para GitHub)

## 🔧 Configurações Importantes

### Para Netlify/Vercel:
- O arquivo `netlify.toml` já está configurado
- Não precisa de configuração adicional

### Para GitHub Pages:
- Certifique-se de que `index.html` está na raiz
- Pode demorar alguns minutos para ficar online

## 🚀 Recomendação Rápida

**Para colocar online AGORA mesmo:**

1. Vá em [netlify.com](https://netlify.com)
2. Arraste a pasta `tiktok-live-viewer` na área "Deploy manually"
3. Pronto! Seu site estará online em 30 segundos

## 🔗 Exemplo de URLs Finais

Depois do deploy, seu site ficará disponível em URLs como:
- `https://tiktok-live-viewer-abc123.netlify.app`
- `https://tiktok-live-viewer.vercel.app`
- `https://seuusuario.github.io/tiktok-live-viewer`

## 💡 Dicas Importantes

- **Gratuito**: Todos esses serviços têm planos gratuitos
- **HTTPS**: Todos fornecem HTTPS automaticamente
- **Rápido**: Deploy em menos de 1 minuto
- **Domínio próprio**: Você pode conectar seu próprio domínio depois

## 🆘 Precisa de Ajuda?

Se tiver dúvidas, me avise que posso ajudar com o processo específico de qualquer uma dessas plataformas!
